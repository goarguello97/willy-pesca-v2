-- Willy Pesca y Camping: categorías en dos niveles (madre → subcategoría).
-- Correr una vez en Supabase → SQL Editor, después de 01 y 02. Se puede volver
-- a correr sin duplicar nada.
--
-- Cada producto pertenece a una subcategoría (Pesca › Cañas). Las categorías se
-- administran desde el panel (/admin/categorias): nombre, dirección, orden y
-- visibilidad.

-- ── Tabla ─────────────────────────────────────────────────────────────────
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  -- null = categoría madre (Pesca, Camping); si no, la madre de esta subcategoría.
  padre_id uuid references public.categorias (id) on delete restrict,
  nombre text not null check (length(trim(nombre)) > 0),
  -- Cómo se nombra un producto suelto: "Caña" Okuma Telescópica. Null = solo marca y modelo.
  singular text,
  -- Parte de la dirección: /pesca/canas
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  descripcion text,
  -- Qué ficha técnica llevan sus productos (solo subcategorías).
  ficha text check (ficha in ('reel', 'cana')),
  orden integer not null default 0,
  visible boolean not null default true,
  creado_en timestamptz not null default now(),
  check (padre_id is null or padre_id <> id),
  check (padre_id is not null or ficha is null)
);

-- La dirección no se repite entre madres ni entre hermanas.
create unique index if not exists categorias_slug_idx
  on public.categorias (coalesce(padre_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);

create index if not exists categorias_padre_idx on public.categorias (padre_id, orden);

-- Solo dos niveles, y direcciones de madre que no choquen con otras páginas.
create or replace function public.validar_categoria()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.padre_id is null then
    if new.slug in ('admin', 'producto', 'assets', 'api', 'inicio', 'catalogo', 'buscar', 'como-comprar', 'ubicacion') then
      raise exception 'La dirección "%" está reservada, elegí otra.', new.slug;
    end if;
  elsif exists (select 1 from public.categorias m where m.id = new.padre_id and m.padre_id is not null) then
    raise exception 'Solo hay dos niveles: una subcategoría no puede tener subcategorías.';
  end if;
  if tg_op = 'UPDATE' and new.padre_id is not null
     and exists (select 1 from public.categorias h where h.padre_id = new.id) then
    raise exception 'Esta categoría tiene subcategorías: no puede pasar a ser una de ellas.';
  end if;
  return new;
end;
$$;

drop trigger if exists categorias_validar on public.categorias;
create trigger categorias_validar
  before insert or update on public.categorias
  for each row execute function public.validar_categoria();

-- ── Permisos (RLS) ────────────────────────────────────────────────────────
grant select on public.categorias to anon, authenticated;
grant insert, update, delete on public.categorias to authenticated;

alter table public.categorias enable row level security;

drop policy if exists "categorias: leer visibles" on public.categorias;
create policy "categorias: leer visibles" on public.categorias
  for select to anon, authenticated
  using (visible or public.es_admin());

drop policy if exists "categorias: crear (admin)" on public.categorias;
create policy "categorias: crear (admin)" on public.categorias
  for insert to authenticated
  with check (public.es_admin());

drop policy if exists "categorias: editar (admin)" on public.categorias;
create policy "categorias: editar (admin)" on public.categorias
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

drop policy if exists "categorias: borrar (admin)" on public.categorias;
create policy "categorias: borrar (admin)" on public.categorias
  for delete to authenticated
  using (public.es_admin());

-- ── Categorías iniciales ──────────────────────────────────────────────────
insert into public.categorias (nombre, slug, orden, descripcion)
select v.nombre, v.slug, v.orden, v.descripcion
from (values
  ('Pesca', 'pesca', 1, 'Reels, cañas y accesorios de pesca para cualquier especie y cualquier salida.'),
  ('Camping', 'camping', 2, 'Todo para acampar y completar la salida de pesca.')
) as v (nombre, slug, orden, descripcion)
where not exists (
  select 1 from public.categorias c where c.padre_id is null and c.slug = v.slug
);

insert into public.categorias (padre_id, nombre, singular, slug, ficha, orden)
select m.id, v.nombre, v.singular, v.slug, v.ficha, v.orden
from (values
  ('pesca',   'Reels',               'Reel',            'reels',               'reel', 1),
  ('pesca',   'Cañas',               'Caña',            'canas',               'cana', 2),
  ('pesca',   'Señuelos',            'Señuelo',         'senuelos',            null,   3),
  ('pesca',   'Líneas y tanzas',     null,              'lineas-y-tanzas',     null,   4),
  ('pesca',   'Anzuelos y plomadas', null,              'anzuelos-y-plomadas', null,   5),
  ('pesca',   'Accesorios',          'Accesorio',       'accesorios',          null,   6),
  ('pesca',   'Varios',              null,              'varios',              null,   7),
  ('camping', 'Carpas',              'Carpa',           'carpas',              null,   1),
  ('camping', 'Reposeras',           'Reposera',        'reposeras',           null,   2),
  ('camping', 'Mesas',               'Mesa',            'mesas',               null,   3),
  ('camping', 'Gazebos',             'Gazebo',          'gazebos',             null,   4),
  ('camping', 'Bolsas de dormir',    'Bolsa de dormir', 'bolsas-de-dormir',    null,   5),
  ('camping', 'Conservadoras',       'Conservadora',    'conservadoras',       null,   6),
  ('camping', 'Iluminación',         null,              'iluminacion',         null,   7),
  ('camping', 'Varios',              null,              'varios',              null,   8)
) as v (madre, nombre, singular, slug, ficha, orden)
join public.categorias m on m.padre_id is null and m.slug = v.madre
where not exists (
  select 1 from public.categorias c where c.padre_id = m.id and c.slug = v.slug
);

-- ── Productos: de la categoría vieja a la subcategoría ────────────────────
alter table public.productos
  add column if not exists categoria_id uuid references public.categorias (id) on delete restrict;

create index if not exists productos_categoria_idx on public.productos (categoria_id);

update public.productos p
set categoria_id = c.id
from (values
  ('reel',      'pesca',   'reels'),
  ('cana',      'pesca',   'canas'),
  ('accesorio', 'pesca',   'accesorios'),
  ('camping',   'camping', 'varios'),
  ('otro',      'pesca',   'varios')
) as v (vieja, madre, sub)
join public.categorias m on m.padre_id is null and m.slug = v.madre
join public.categorias c on c.padre_id = m.id and c.slug = v.sub
where p.categoria_id is null and p.categoria = v.vieja;

alter table public.productos alter column categoria_id set not null;

-- La columna vieja queda solo para que el sitio anterior siga andando hasta
-- publicar el nuevo; ya no se usa.
alter table public.productos alter column categoria drop not null;

-- Un producto va siempre en una subcategoría, nunca directo en la madre.
create or replace function public.validar_categoria_producto()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.categorias c where c.id = new.categoria_id and c.padre_id is not null
  ) then
    raise exception 'El producto tiene que estar en una subcategoría (por ejemplo Pesca › Cañas).';
  end if;
  return new;
end;
$$;

drop trigger if exists productos_validar_categoria on public.productos;
create trigger productos_validar_categoria
  before insert or update of categoria_id on public.productos
  for each row execute function public.validar_categoria_producto();

-- Paso final, después de publicar el sitio nuevo (opcional):
-- alter table public.productos drop column if exists categoria;
