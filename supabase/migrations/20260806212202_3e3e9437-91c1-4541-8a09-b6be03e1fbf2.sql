INSERT INTO public.folder_access (org, folder)
SELECT 'Agrofeed Global', f
FROM (VALUES
  ('Dashboard'),
  ('Corporate Documents'),
  ('Shareholders & Governance'),
  ('Financial Information'),
  ('Banking'),
  ('Land & Assets'),
  ('Project Documents'),
  ('Technical Studies'),
  ('ESG & Sustainability'),
  ('Operations'),
  ('Procurement'),
  ('Suppliers'),
  ('Offtakers & Customers'),
  ('Human Resources'),
  ('Legal & Compliance'),
  ('Government Relations'),
  ('Insurance'),
  ('Funding & Investment'),
  ('Sukuk Transaction'),
  ('Due Diligence'),
  ('Correspondence'),
  ('Deliverables'),
  ('Media & Branding'),
  ('Board Documents'),
  ('Confidential Management'),
  ('Archive')
) AS t(f)
WHERE NOT EXISTS (
  SELECT 1 FROM public.folder_access fa
  WHERE fa.folder = t.f AND fa.org = 'Agrofeed Global'
);