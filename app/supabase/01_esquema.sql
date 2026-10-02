-- Willy Pesca y Camping: catálogo de productos.
-- Se corre una sola vez en Supabase → SQL Editor.
--
-- Seguridad: el sitio solo usa la clave pública. Lo que protege los datos son
-- las políticas RLS de abajo: cualquiera puede LEER lo publicado y solo las
-- cuentas de Google listadas en public.admins pueden crear, editar o borrar.

-- ── Administradores ───────────────────────────────────────────────────────
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);

alter table public.admins enable row level security;
-- Sin políticas a propósito: nadie la lee desde la API, solo es_admin().
revoke all on public.admins from anon, authenticated;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.es_admin() to anon, authenticated;

-- ── Productos ─────────────────────────────────────────────────────────────
create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  categoria text not null
    check (categoria in ('reel', 'cana', 'accesorio', 'camping', 'otro')),
  marca text,
  nombre text not null check (length(trim(nombre)) > 0),
  precio numeric(12, 2) check (precio is null or precio >= 0),
  descripcion text,
  -- Ficha técnica: reels
  reel_tipo text,
  rulemanes smallint check (rulemanes is null or rulemanes >= 0),
  -- Ficha técnica: cañas
  largo_m numeric(4, 2) check (largo_m is null or largo_m > 0),
  cana_armado text,
  destacado boolean not null default false,
  publicado boolean not null default false,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.producto_imagenes (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos (id) on delete cascade,
  url text not null,
  -- Ruta dentro del bucket "productos"; null en las fotos que vienen con el sitio.
  ruta text,
  orden smallint not null default 0,
  creado_en timestamptz not null default now()
);

create index if not exists producto_imagenes_producto_idx
  on public.producto_imagenes (producto_id, orden);

create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists productos_actualizado_en on public.productos;
create trigger productos_actualizado_en
  before update on public.productos
  for each row execute function public.tocar_actualizado_en();

-- ── Permisos (RLS) ────────────────────────────────────────────────────────
grant select on public.productos, public.producto_imagenes to anon, authenticated;
grant insert, update, delete on public.productos, public.producto_imagenes to authenticated;

alter table public.productos enable row level security;
alter table public.producto_imagenes enable row level security;

drop policy if exists "productos: leer publicados" on public.productos;
create policy "productos: leer publicados" on public.productos
  for select to anon, authenticated
  using (publicado or public.es_admin());

drop policy if exists "productos: crear (admin)" on public.productos;
create policy "productos: crear (admin)" on public.productos
  for insert to authenticated
  with check (public.es_admin());

drop policy if exists "productos: editar (admin)" on public.productos;
create policy "productos: editar (admin)" on public.productos
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

drop policy if exists "productos: borrar (admin)" on public.productos;
create policy "productos: borrar (admin)" on public.productos
  for delete to authenticated
  using (public.es_admin());

drop policy if exists "imagenes: leer" on public.producto_imagenes;
create policy "imagenes: leer" on public.producto_imagenes
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.productos p
      where p.id = producto_id and (p.publicado or public.es_admin())
    )
  );

drop policy if exists "imagenes: crear (admin)" on public.producto_imagenes;
create policy "imagenes: crear (admin)" on public.producto_imagenes
  for insert to authenticated
  with check (public.es_admin());

drop policy if exists "imagenes: editar (admin)" on public.producto_imagenes;
create policy "imagenes: editar (admin)" on public.producto_imagenes
  for update to authenticated
  using (public.es_admin())
  with check (public.es_admin());

drop policy if exists "imagenes: borrar (admin)" on public.producto_imagenes;
create policy "imagenes: borrar (admin)" on public.producto_imagenes
  for delete to authenticated
  using (public.es_admin());

-- ── Storage: bucket público "productos" ───────────────────────────────────
-- Público para servir las fotos por URL; solo los admins suben o borran.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "fotos productos: ver (admin)" on storage.objects;
create policy "fotos productos: ver (admin)" on storage.objects
  for select to authenticated
  using (bucket_id = 'productos' and public.es_admin());

drop policy if exists "fotos productos: subir (admin)" on storage.objects;
create policy "fotos productos: subir (admin)" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'productos' and public.es_admin());

drop policy if exists "fotos productos: reemplazar (admin)" on storage.objects;
create policy "fotos productos: reemplazar (admin)" on storage.objects
  for update to authenticated
  using (bucket_id = 'productos' and public.es_admin())
  with check (bucket_id = 'productos' and public.es_admin());

drop policy if exists "fotos productos: borrar (admin)" on storage.objects;
create policy "fotos productos: borrar (admin)" on storage.objects
  for delete to authenticated
  using (bucket_id = 'productos' and public.es_admin());
