
-- Helper: can_write returns true for admin or advisor
CREATE OR REPLACE FUNCTION public.can_write(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
      OR public.has_role(_user_id, 'advisor'::app_role);
$$;

-- Generic updated_at trigger function already exists as public.set_updated_at()

-- =========================================================
-- DOCUMENTS
-- =========================================================
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  folder text NOT NULL DEFAULT '/',
  category text,
  size_bytes bigint DEFAULT 0,
  mime_type text,
  storage_path text,
  confidentiality text NOT NULL DEFAULT 'confidential',
  sharia_relevant boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_select_auth" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "documents_write_admin_advisor" ON public.documents FOR ALL TO authenticated
  USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE TRIGGER documents_set_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- MILESTONES
-- =========================================================
CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text,
  phase text,
  title text NOT NULL,
  owner_org text,
  due_date date,
  progress integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'not_started',
  critical_path boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestones TO authenticated;
GRANT ALL ON public.milestones TO service_role;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_select_auth" ON public.milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "milestones_write_admin_advisor" ON public.milestones FOR ALL TO authenticated
  USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE TRIGGER milestones_set_updated_at BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- TASKS
-- =========================================================
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assignee text,
  assignee_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  org text,
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'not_started',
  due_date date,
  milestone_id uuid REFERENCES public.milestones(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select_auth" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "tasks_write_admin_advisor" ON public.tasks FOR ALL TO authenticated
  USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE TRIGGER tasks_set_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- SUKUK STRUCTURES
-- =========================================================
CREATE TABLE public.sukuk_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_type text NOT NULL,
  name text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  size_musd numeric(14,2),
  tenor_years numeric(5,2),
  profit_rate numeric(6,3),
  status text NOT NULL DEFAULT 'draft',
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sukuk_structures TO authenticated;
GRANT ALL ON public.sukuk_structures TO service_role;
ALTER TABLE public.sukuk_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "structures_select_auth" ON public.sukuk_structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "structures_write_admin_advisor" ON public.sukuk_structures FOR ALL TO authenticated
  USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE TRIGGER structures_set_updated_at BEFORE UPDATE ON public.sukuk_structures
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- COMPLIANCE ITEMS
-- =========================================================
CREATE TABLE public.compliance_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework text NOT NULL,
  requirement text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  severity text NOT NULL DEFAULT 'medium',
  owner_org text,
  evidence_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_items TO authenticated;
GRANT ALL ON public.compliance_items TO service_role;
ALTER TABLE public.compliance_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compliance_select_auth" ON public.compliance_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "compliance_write_admin_advisor" ON public.compliance_items FOR ALL TO authenticated
  USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE TRIGGER compliance_set_updated_at BEFORE UPDATE ON public.compliance_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- RISKS
-- =========================================================
CREATE TABLE public.risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  likelihood integer NOT NULL DEFAULT 3,
  impact integer NOT NULL DEFAULT 3,
  mitigation text,
  owner_org text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.risks TO authenticated;
GRANT ALL ON public.risks TO service_role;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "risks_select_auth" ON public.risks FOR SELECT TO authenticated USING (true);
CREATE POLICY "risks_write_admin_advisor" ON public.risks FOR ALL TO authenticated
  USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE TRIGGER risks_set_updated_at BEFORE UPDATE ON public.risks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- FINANCIAL METRICS
-- =========================================================
CREATE TABLE public.financial_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric text NOT NULL,
  category text,
  period text,
  value numeric(18,2),
  currency text DEFAULT 'USD',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_metrics TO authenticated;
GRANT ALL ON public.financial_metrics TO service_role;
ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_select_auth" ON public.financial_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "fin_write_admin_advisor" ON public.financial_metrics FOR ALL TO authenticated
  USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE TRIGGER fin_set_updated_at BEFORE UPDATE ON public.financial_metrics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- REPORTS
-- =========================================================
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  report_type text,
  file_url text,
  status text NOT NULL DEFAULT 'ready',
  generated_at timestamptz NOT NULL DEFAULT now(),
  generated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_select_auth" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "reports_write_admin_advisor" ON public.reports FOR ALL TO authenticated
  USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE TRIGGER reports_set_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- STAKEHOLDERS
-- =========================================================
CREATE TABLE public.stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org text NOT NULL,
  role text,
  contact_email text,
  users_count integer NOT NULL DEFAULT 0,
  pending integer NOT NULL DEFAULT 0,
  completed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stakeholders TO authenticated;
GRANT ALL ON public.stakeholders TO service_role;
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stakeholders_select_auth" ON public.stakeholders FOR SELECT TO authenticated USING (true);
CREATE POLICY "stakeholders_write_admin_advisor" ON public.stakeholders FOR ALL TO authenticated
  USING (public.can_write(auth.uid())) WITH CHECK (public.can_write(auth.uid()));
CREATE TRIGGER stakeholders_set_updated_at BEFORE UPDATE ON public.stakeholders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- AUDIT LOG (immutable)
-- =========================================================
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name text,
  action text NOT NULL,
  target text,
  target_type text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_select_auth" ON public.audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "audit_insert_auth" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

-- =========================================================
-- SEED DATA (idempotent-ish; only inserts if empty)
-- =========================================================
INSERT INTO public.milestones (code, phase, title, owner_org, due_date, progress, status, critical_path)
SELECT * FROM (VALUES
  ('M-01','Preparation','Appoint Sukuk Advisor','Agrofeed','2026-01-15'::date,100,'completed',true),
  ('M-02','Preparation','Legal counsel engaged','Agrofeed','2026-02-01'::date,100,'completed',true),
  ('M-03','Structuring','Sukuk structure selection','Tesserant','2026-03-15'::date,80,'in_progress',true),
  ('M-04','Structuring','Sharia Board pre-approval','Al Huda CIBE','2026-04-01'::date,45,'in_progress',true),
  ('M-05','Diligence','Financial due diligence','Advisor','2026-04-30'::date,60,'in_progress',false),
  ('M-06','Diligence','Legal due diligence','Legal','2026-05-15'::date,20,'in_progress',false),
  ('M-07','Documentation','Offering Circular draft','Legal','2026-06-01'::date,0,'not_started',true),
  ('M-08','Documentation','SPV incorporation','Legal','2026-06-15'::date,0,'not_started',true),
  ('M-09','Regulatory','SECP filing','Agrofeed','2026-07-15'::date,0,'not_started',true),
  ('M-10','Listing','PSX listing approval','Advisor','2026-08-01'::date,0,'not_started',false),
  ('M-11','Marketing','Investor roadshow','Advisor','2026-08-15'::date,0,'not_started',false),
  ('M-12','Closing','Subscription and settlement','Advisor','2026-09-15'::date,0,'not_started',true)
) AS t(code, phase, title, owner_org, due_date, progress, status, critical_path)
WHERE NOT EXISTS (SELECT 1 FROM public.milestones);

INSERT INTO public.stakeholders (org, role, contact_email, users_count, pending, completed)
SELECT * FROM (VALUES
  ('Agrofeed Global','Issuer','sukuk@agrofeedglobal.com',12,4,28),
  ('Tesserant Capital','Lead Advisor','advisory@tesserant.com',6,3,19),
  ('Al Huda CIBE','Sharia Advisor','sharia@alhudacibe.com',4,2,11),
  ('Sharia Supervisory Board','Sharia Board',NULL,3,1,7),
  ('External Legal Counsel','Legal',NULL,5,2,9)
) AS t(org, role, contact_email, users_count, pending, completed)
WHERE NOT EXISTS (SELECT 1 FROM public.stakeholders);

INSERT INTO public.sukuk_structures (structure_type, name, score, size_musd, tenor_years, profit_rate, status, notes)
SELECT * FROM (VALUES
  ('Ijarah','Ijarah — Warehouse Assets',92,110.00,5.0,10.500,'recommended','Asset-backed lease of grain warehouses; strong sharia acceptance.'),
  ('Wakalah','Wakalah — Managed Portfolio',86,110.00,5.0,10.750,'shortlisted','Investment agency across feed operations.'),
  ('Murabaha','Murabaha — Commodity Trade',78,110.00,3.0,10.250,'shortlisted','Working-capital cost-plus sales.'),
  ('Musharakah','Musharakah — JV Equity',74,110.00,7.0,11.000,'evaluating','Profit-loss sharing in agri-JV.'),
  ('Mudarabah','Mudarabah — Trustee Financing',70,110.00,5.0,10.900,'evaluating','Silent-partner model.'),
  ('Istisna','Istisna — Facility Build',66,60.00,4.0,10.400,'draft','Construction of feed processing plant.'),
  ('Salam','Salam — Forward Sales',58,40.00,2.0,9.900,'draft','Forward purchase of grain output.'),
  ('Hybrid','Ijarah + Wakalah Hybrid',88,110.00,5.0,10.600,'shortlisted','Blended asset + agency structure.'),
  ('Sukuk-al-Manafi''','Manafi'' — Usufruct',54,50.00,4.0,10.200,'draft','Usufruct rights over warehouse capacity.')
) AS t(structure_type, name, score, size_musd, tenor_years, profit_rate, status, notes)
WHERE NOT EXISTS (SELECT 1 FROM public.sukuk_structures);

INSERT INTO public.compliance_items (framework, requirement, status, severity, owner_org)
SELECT * FROM (VALUES
  ('AAOIFI','Sharia Standard No. 17 — Investment Sukuk','open','high','Al Huda CIBE'),
  ('AAOIFI','Sharia Standard No. 21 — Financial Papers','open','medium','Al Huda CIBE'),
  ('IFSB','IFSB-2 Capital Adequacy disclosure','open','medium','Advisor'),
  ('SECP','Debt Securities Trustee Regulations, 2017','open','high','Legal'),
  ('SECP','Public Offering Regulations, 2017','open','high','Legal'),
  ('SECP','Sukuk Regulations, 2015','in_review','high','Advisor'),
  ('Sharia','Underlying asset sharia screening','in_review','high','Al Huda CIBE'),
  ('Sharia','Purification calculation methodology','open','medium','Al Huda CIBE'),
  ('AML','KYC/AML for investors','open','high','Advisor'),
  ('IFRS','IFRS 9 impairment disclosure','open','low','Auditor'),
  ('ESG','Halal-supply-chain attestation','open','medium','Agrofeed'),
  ('Governance','Board approval of programme','completed','high','Agrofeed')
) AS t(framework, requirement, status, severity, owner_org)
WHERE NOT EXISTS (SELECT 1 FROM public.compliance_items);

INSERT INTO public.risks (title, category, likelihood, impact, mitigation, owner_org, status)
SELECT * FROM (VALUES
  ('Sharia non-compliance of underlying assets','Sharia',3,5,'Independent Sharia Board pre-approval and quarterly audit','Al Huda CIBE','open'),
  ('Regulatory delay at SECP','Regulatory',3,4,'Pre-filing consultation and dedicated liaison','Legal','open'),
  ('FX volatility (PKR/USD)','Market',4,4,'Natural hedge via export revenues; forward cover','Agrofeed','open'),
  ('Commodity price shocks (grain)','Market',4,3,'Diversified sourcing; supplier contracts','Agrofeed','open'),
  ('Counterparty default','Credit',2,4,'Concentration limits and collateral','Advisor','open'),
  ('Operational disruption at warehouses','Operational',2,4,'Insurance and BCP','Agrofeed','open'),
  ('Cybersecurity incident on data room','Technology',2,3,'ISO 27001, MFA, SOC 2 controls','Agrofeed','mitigated'),
  ('Adverse ESG finding','ESG',2,3,'Independent ESG review','Advisor','open'),
  ('Legal enforceability across jurisdictions','Legal',2,4,'Dual-counsel review','Legal','open'),
  ('Reputational risk from investor complaint','Reputational',1,3,'Investor relations desk and grievance process','Advisor','open')
) AS t(title, category, likelihood, impact, mitigation, owner_org, status)
WHERE NOT EXISTS (SELECT 1 FROM public.risks);

INSERT INTO public.financial_metrics (metric, category, period, value, currency)
SELECT * FROM (VALUES
  ('Revenue','Income','FY2025',245000000::numeric,'USD'),
  ('EBITDA','Income','FY2025',48500000::numeric,'USD'),
  ('Net Income','Income','FY2025',22300000::numeric,'USD'),
  ('Total Assets','Balance','FY2025',312000000::numeric,'USD'),
  ('Total Debt','Balance','FY2025',86000000::numeric,'USD'),
  ('Equity','Balance','FY2025',148000000::numeric,'USD'),
  ('Debt / EBITDA','Ratio','FY2025',1.77,'x'),
  ('Interest Coverage','Ratio','FY2025',5.20,'x'),
  ('Current Ratio','Ratio','FY2025',1.85,'x'),
  ('Sukuk Size','Programme','2026',110000000::numeric,'USD'),
  ('Target Profit Rate','Programme','2026',10.500,'%'),
  ('Tenor','Programme','2026',5.00,'yrs')
) AS t(metric, category, period, value, currency)
WHERE NOT EXISTS (SELECT 1 FROM public.financial_metrics);

INSERT INTO public.reports (name, report_type, status)
SELECT * FROM (VALUES
  ('Executive Dashboard Report','executive','ready'),
  ('Board Report','board','ready'),
  ('Sukuk Readiness Report','readiness','ready'),
  ('Due Diligence Report','diligence','ready'),
  ('Compliance Report','compliance','ready'),
  ('Sharia Compliance Report','sharia','ready'),
  ('Risk Report','risk','ready'),
  ('Financial Analysis Report','financial','ready'),
  ('Investor Readiness Report','investor','ready'),
  ('Milestone Report','milestone','ready'),
  ('Document Inventory','inventory','ready'),
  ('Missing Documents Report','gap','ready'),
  ('Audit Trail Report','audit','ready'),
  ('Stakeholder Activity Report','stakeholder','ready'),
  ('SPV Readiness Report','spv','ready'),
  ('ESG Report','esg','ready')
) AS t(name, report_type, status)
WHERE NOT EXISTS (SELECT 1 FROM public.reports);

INSERT INTO public.documents (name, folder, category, size_bytes, mime_type, confidentiality, sharia_relevant, status)
SELECT * FROM (VALUES
  ('Sukuk Programme Term Sheet.pdf','/01-Structuring','Structuring',482000,'application/pdf','confidential',true,'final'),
  ('Ijarah Asset Schedule.xlsx','/01-Structuring','Structuring',124000,'application/vnd.ms-excel','confidential',true,'draft'),
  ('Audited Financials FY2024.pdf','/02-Financials','Financials',2100000,'application/pdf','confidential',false,'final'),
  ('Management Accounts Q1-2026.xlsx','/02-Financials','Financials',310000,'application/vnd.ms-excel','confidential',false,'draft'),
  ('SECP Sukuk Regulations 2015.pdf','/03-Regulatory','Regulatory',890000,'application/pdf','internal',false,'reference'),
  ('AAOIFI Standard 17.pdf','/04-Sharia','Sharia',640000,'application/pdf','internal',true,'reference'),
  ('Sharia Board Pre-approval Letter.pdf','/04-Sharia','Sharia',210000,'application/pdf','confidential',true,'draft'),
  ('SPV Incorporation Draft.docx','/05-Legal','Legal',180000,'application/msword','confidential',false,'draft'),
  ('Trust Deed Draft.docx','/05-Legal','Legal',260000,'application/msword','confidential',true,'draft'),
  ('Investor Presentation Deck.pptx','/06-Marketing','Marketing',3800000,'application/vnd.ms-powerpoint','internal',false,'draft'),
  ('Warehouse Valuation Report.pdf','/07-Assets','Assets',540000,'application/pdf','confidential',true,'final'),
  ('ESG Screening Report.pdf','/08-ESG','ESG',420000,'application/pdf','internal',false,'draft')
) AS t(name, folder, category, size_bytes, mime_type, confidentiality, sharia_relevant, status)
WHERE NOT EXISTS (SELECT 1 FROM public.documents);

INSERT INTO public.tasks (title, description, assignee, org, priority, status, due_date)
SELECT * FROM (VALUES
  ('Finalise Ijarah asset schedule','Consolidate warehouse assets for lease structure','Ayesha Rahman','Agrofeed','High','in_progress','2026-04-30'::date),
  ('Submit AAOIFI-17 mapping','Map programme to AAOIFI Sharia Standard 17','Dr. Imran Farooq','Al Huda CIBE','Critical','in_progress','2026-04-15'::date),
  ('SECP pre-filing memo','Prepare and submit pre-filing memo to SECP','Sadia Malik','Legal','High','not_started','2026-05-05'::date),
  ('FY2024 audit sign-off','Auditor sign-off on FY2024 financials','Zain Auditor','Auditor','Medium','completed','2026-02-20'::date),
  ('Investor deck v2','Update deck with structuring update','Hassan Ali','Tesserant','Medium','in_progress','2026-05-10'::date),
  ('SPV name reservation','Reserve SPV name at SECP','Sadia Malik','Legal','Medium','overdue','2026-04-01'::date),
  ('KYC pack for anchor investor','Prepare KYC pack','Hassan Ali','Tesserant','High','not_started','2026-05-20'::date),
  ('ESG screening interview','Interview ESG assessor','Ayesha Rahman','Agrofeed','Low','not_started','2026-06-01'::date)
) AS t(title, description, assignee, org, priority, status, due_date)
WHERE NOT EXISTS (SELECT 1 FROM public.tasks);
