-- Willy Pesca y Camping: datos iniciales.
-- Correr después de 01_esquema.sql, en Supabase → SQL Editor.

-- 1) Cuentas de Google que pueden administrar el catálogo (en minúsculas).
--    Para sumar la de Willy, descomentá la segunda línea con su Gmail.
insert into public.admins (email) values
  ('arguellogonzalo97@gmail.com')
  -- , ('gmail-de-willy@gmail.com')
on conflict (email) do nothing;

-- 2) Los 10 equipos que ya muestra el sitio, publicados y destacados.
--    creado_en escalonado: dentro de cada categoría se muestran del más nuevo al
--    más viejo, así se conserva el orden actual.
--    Sus fotos son las que vienen con el sitio (ruta null = no están en Storage).
with nuevos as (
  insert into public.productos
    (categoria, marca, nombre, reel_tipo, rulemanes, largo_m, cana_armado, destacado, publicado, creado_en)
  values
    ('reel', 'Spinit',   'SB 301',        'frontal', 1,    null, null,          true, true, now() + interval '10 seconds'),
    ('reel', 'Mystix',   'Lake 4003',     'frontal', 3,    null, null,          true, true, now() + interval '9 seconds'),
    ('reel', 'Albatros', 'Siberiano 500', 'frontal', 2,    null, null,          true, true, now() + interval '8 seconds'),
    ('reel', 'Spinit',   'LBR 402',       'frontal', 2,    null, null,          true, true, now() + interval '7 seconds'),
    ('reel', 'Albatros', 'Ares 5000',     'frontal', 2,    null, null,          true, true, now() + interval '6 seconds'),
    ('cana', 'Okuma',    'Telescópica',   null,      null, 1.80, 'telescópica', true, true, now() + interval '5 seconds'),
    ('cana', 'Spinit',   'Telescópica',   null,      null, 2.40, 'telescópica', true, true, now() + interval '4 seconds'),
    ('cana', 'Xfish',    'Dos tramos',    null,      null, 2.70, '2 tramos',    true, true, now() + interval '3 seconds'),
    ('cana', 'Spinit',   'Dos tramos',    null,      null, 2.40, '2 tramos',    true, true, now() + interval '2 seconds'),
    ('cana', 'Waterdog', 'Dos tramos',    null,      null, 2.40, '2 tramos',    true, true, now() + interval '1 seconds')
  returning id, marca, nombre, largo_m
)
insert into public.producto_imagenes (producto_id, url, ruta, orden)
select n.id, f.url, null, 0
from nuevos n
join (values
  ('Spinit',   'SB 301',        null::numeric, '/assets/fotos/reel-spinit-sb301.jpg'),
  ('Mystix',   'Lake 4003',     null,          '/assets/fotos/reel-mystix-lake.jpg'),
  ('Albatros', 'Siberiano 500', null,          '/assets/fotos/reel-albatros-seriano.jpg'),
  ('Spinit',   'LBR 402',       null,          '/assets/fotos/reel-spinit-rul2.jpg'),
  ('Albatros', 'Ares 5000',     null,          '/assets/fotos/reel-albatros-rul2.jpg'),
  ('Okuma',    'Telescópica',   1.80,          '/assets/fotos/cana-okuma-telescopica.jpg'),
  ('Spinit',   'Telescópica',   2.40,          '/assets/fotos/cana-spinit-telescopica.jpg'),
  ('Xfish',    'Dos tramos',    2.70,          '/assets/fotos/cana-xfish.jpg'),
  ('Spinit',   'Dos tramos',    2.40,          '/assets/fotos/cana-spinit-2tramos.jpg'),
  ('Waterdog', 'Dos tramos',    2.40,          '/assets/fotos/cana-waterdog.jpg')
) as f (marca, nombre, largo_m, url)
  on f.marca = n.marca
 and f.nombre = n.nombre
 and f.largo_m is not distinct from n.largo_m;
