INSERT INTO public.geographic_scopes (country_code, scope_type, slug, name, local_name)
VALUES ('DE', 'country', 'deutschland', 'Germany', 'Deutschland')
ON CONFLICT (country_code, scope_type, slug) DO NOTHING;

WITH country AS (
  SELECT id FROM public.geographic_scopes
  WHERE country_code = 'DE' AND scope_type = 'country' AND slug = 'deutschland'
)
INSERT INTO public.geographic_scopes (parent_id, country_code, scope_type, slug, name, local_name)
SELECT country.id, 'DE', 'region', region.slug, region.name, region.local_name
FROM country
CROSS JOIN (
  VALUES
    ('baden-wuerttemberg', 'Baden-Wuerttemberg', 'Baden-Wuerttemberg'),
    ('bayern', 'Bavaria', 'Bayern'),
    ('berlin', 'Berlin', 'Berlin'),
    ('brandenburg', 'Brandenburg', 'Brandenburg'),
    ('bremen', 'Bremen', 'Bremen'),
    ('hamburg', 'Hamburg', 'Hamburg'),
    ('hessen', 'Hesse', 'Hessen'),
    ('mecklenburg-vorpommern', 'Mecklenburg-Western Pomerania', 'Mecklenburg-Vorpommern'),
    ('niedersachsen', 'Lower Saxony', 'Niedersachsen'),
    ('nordrhein-westfalen', 'North Rhine-Westphalia', 'Nordrhein-Westfalen'),
    ('rheinland-pfalz', 'Rhineland-Palatinate', 'Rheinland-Pfalz'),
    ('saarland', 'Saarland', 'Saarland'),
    ('sachsen', 'Saxony', 'Sachsen'),
    ('sachsen-anhalt', 'Saxony-Anhalt', 'Sachsen-Anhalt'),
    ('schleswig-holstein', 'Schleswig-Holstein', 'Schleswig-Holstein'),
    ('thueringen', 'Thuringia', 'Thueringen')
) AS region(slug, name, local_name)
ON CONFLICT (country_code, scope_type, slug) DO NOTHING;
