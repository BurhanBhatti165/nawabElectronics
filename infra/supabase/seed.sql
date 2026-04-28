insert into brands (name, logo)
select v.name, v.logo
from (
  values
    ('Gree', 'https://res.cloudinary.com/demo/image/upload/v1/brands/gree.png'),
    ('Haier', 'https://res.cloudinary.com/demo/image/upload/v1/brands/haier.png'),
    ('Dawlance', 'https://res.cloudinary.com/demo/image/upload/v1/brands/dawlance.png')
) as v(name, logo)
where not exists (
  select 1 from brands b where b.name = v.name
);

insert into categories (name, description)
select v.name, v.description
from (
  values
    ('Air Conditioner', 'Premium cooling range'),
    ('Refrigerator', 'Energy efficient refrigeration'),
    ('Washing Machine', 'Smart laundry collection')
) as v(name, description)
where not exists (
  select 1 from categories c where c.name = v.name
);

insert into products (name, description, price, discount_price, stock, images, category_id, brand_id)
select
  v.name,
  v.description,
  v.price,
  v.discount_price,
  v.stock,
  v.images,
  c.id,
  b.id
from (
  values
    ('Gree 1.5 Ton Inverter AC', 'T3-grade inverter AC with rapid cooling and intelligent power control.', 148000, 141000, 15, '["https://images.unsplash.com/photo-1621905252507-b354bcadc0e2","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"]', 'Air Conditioner', 'Gree'),
    ('Haier Digital Refrigerator HRF-306', 'Elegant refrigerator with efficient compressor and digital temperature control.', 87000, null, 11, '["https://images.unsplash.com/photo-1571172964276-91faaa704e1a","https://images.unsplash.com/photo-1584568694244-14fbdf83bd30"]', 'Refrigerator', 'Haier'),
    ('Dawlance DW 7500 Top Load', 'Reliable top load washer with efficient water and power use.', 63800, 61200, 19, '["https://images.unsplash.com/photo-1626806787461-102c1bfaaea1","https://images.unsplash.com/photo-1621447504864-d8686e12698c"]', 'Washing Machine', 'Dawlance')
) as v(name, description, price, discount_price, stock, images, category_name, brand_name)
join categories c on c.name = v.category_name
join brands b on b.name = v.brand_name
where not exists (
  select 1 from products p where p.name = v.name
);
