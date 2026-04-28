-- Run this in Supabase SQL Editor after applying schema.sql migration.
-- It marks existing categories as homepage top categories.

update categories
set
  show_on_home = true,
  home_description = case
    when lower(name) = 'geysers' then 'Instant gas, electric storage, and hybrid geysers.'
    when lower(name) = 'heaters' then 'Oil, fan, and sun heaters for winter comfort.'
    when lower(name) = 'air conditioners' then 'Wall mounted, floor standing, and cassette ACs.'
    when lower(name) = 'refrigerators' then 'Single door, side-by-side, and top mount models.'
    when lower(name) = 'home appliances' then 'Kitchen essentials and smart household appliances.'
    else coalesce(home_description, description)
  end
where lower(name) in (
  'geysers',
  'heaters',
  'air conditioners',
  'refrigerators',
  'home appliances'
);
