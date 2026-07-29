// Demo data for Agrofeed Global Sukuk Data Room — Phase 1 MVP
// Realistic seed data across all modules so the platform is fully demonstrable.

export const READINESS = {
  overall: 68,
  breakdown: [
    { key: "Corporate", value: 72 },
    { key: "Financial", value: 74 },
    { key: "Legal", value: 58 },
    { key: "Operational", value: 66 },
    { key: "Sharia", value: 62 },
    { key: "Regulatory", value: 64 },
    { key: "ESG", value: 71 },
    { key: "Documentation", value: 65 },
    { key: "Investor", value: 60 },
    { key: "SPV", value: 55 },
  ],
};

export const KPIS = {
  totalDocuments: 342,
  pendingReview: 18,
  approved: 264,
  missing: 27,
  overdueMilestones: 4,
  openCompliance: 12,
  highRisk: 4,
  pendingApprovals: 9,
  activeUsers: 34,
  estimatedSizeUsdM: 110,
  expectedIssuance: "Q2 2026",
  overallCompletion: 68,
  investorPackage: 60,
};

export type MilestoneStatus = "completed" | "in_progress" | "blocked" | "overdue" | "not_started";

export const MILESTONES: {
  id: string;
  name: string;
  owner: string;
  due: string;
  status: MilestoneStatus;
  progress: number;
}[] = [
  { id: "M-01", name: "Corporate documents completed", owner: "Agrofeed", due: "2025-08-15", status: "completed", progress: 100 },
  { id: "M-02", name: "Land ownership verified", owner: "Agrofeed", due: "2025-09-01", status: "completed", progress: 100 },
  { id: "M-03", name: "Independent valuation completed", owner: "Tesserant", due: "2025-10-20", status: "completed", progress: 100 },
  { id: "M-04", name: "SPV established", owner: "Al Huda", due: "2025-11-30", status: "in_progress", progress: 55 },
  { id: "M-05", name: "Environmental approval obtained", owner: "Agrofeed", due: "2025-12-15", status: "in_progress", progress: 70 },
  { id: "M-06", name: "Financial model approved", owner: "Tesserant", due: "2025-11-10", status: "in_progress", progress: 80 },
  { id: "M-07", name: "Feasibility study approved", owner: "Tesserant", due: "2025-10-05", status: "completed", progress: 100 },
  { id: "M-08", name: "Legal due diligence completed", owner: "Al Huda", due: "2026-01-20", status: "in_progress", progress: 40 },
  { id: "M-09", name: "Tax review completed", owner: "Tesserant", due: "2025-12-01", status: "overdue", progress: 25 },
  { id: "M-10", name: "Sharia advisor appointed", owner: "Al Huda", due: "2025-09-15", status: "completed", progress: 100 },
  { id: "M-11", name: "Sharia review completed", owner: "Sharia Board", due: "2026-02-01", status: "in_progress", progress: 45 },
  { id: "M-12", name: "Sukuk structure approved", owner: "Al Huda", due: "2026-02-15", status: "in_progress", progress: 30 },
  { id: "M-13", name: "Legal counsel appointed", owner: "Agrofeed", due: "2025-10-30", status: "completed", progress: 100 },
  { id: "M-14", name: "Draft prospectus prepared", owner: "Al Huda", due: "2026-03-10", status: "not_started", progress: 0 },
  { id: "M-15", name: "Regulatory submission completed", owner: "Al Huda", due: "2026-04-01", status: "not_started", progress: 0 },
  { id: "M-16", name: "Investor presentation completed", owner: "Tesserant", due: "2026-04-15", status: "not_started", progress: 0 },
  { id: "M-17", name: "Roadshow completed", owner: "Tesserant", due: "2026-05-10", status: "not_started", progress: 0 },
  { id: "M-18", name: "Subscription completed", owner: "Al Huda", due: "2026-06-01", status: "not_started", progress: 0 },
  { id: "M-19", name: "Sukuk issuance approved", owner: "Regulator", due: "2026-06-15", status: "not_started", progress: 0 },
  { id: "M-20", name: "Settlement completed", owner: "Al Huda", due: "2026-06-30", status: "not_started", progress: 0 },
];

export const DOCUMENTS = [
  { id: "D-1001", name: "Certificate of Incorporation.pdf", folder: "Corporate Documents", owner: "Agrofeed", version: "v2", status: "approved", confidentiality: "High", updated: "2025-10-12" },
  { id: "D-1002", name: "Shareholder Register 2025.xlsx", folder: "Shareholding", owner: "Agrofeed", version: "v1", status: "approved", confidentiality: "High", updated: "2025-09-30" },
  { id: "D-1003", name: "Business Plan 2025-2030.pdf", folder: "Business Plan", owner: "Agrofeed", version: "v3", status: "in_review", confidentiality: "High", updated: "2025-11-02" },
  { id: "D-1004", name: "Feasibility Study - Feed Mill.pdf", folder: "Feasibility Study", owner: "Tesserant", version: "v2", status: "approved", confidentiality: "Medium", updated: "2025-10-05" },
  { id: "D-1005", name: "Audited Financial Statements 2024.pdf", folder: "Financial Statements", owner: "Agrofeed", version: "v1", status: "approved", confidentiality: "High", updated: "2025-08-20" },
  { id: "D-1006", name: "Financial Model v4.xlsx", folder: "Financial Model", owner: "Tesserant", version: "v4", status: "in_review", confidentiality: "High", updated: "2025-11-10" },
  { id: "D-1007", name: "Land Title Deed - Morogoro.pdf", folder: "Land Documents", owner: "Agrofeed", version: "v1", status: "approved", confidentiality: "High", updated: "2025-09-14" },
  { id: "D-1008", name: "Property Valuation Report.pdf", folder: "Property Valuations", owner: "Tesserant", version: "v1", status: "approved", confidentiality: "High", updated: "2025-10-20" },
  { id: "D-1009", name: "Environmental Impact Assessment.pdf", folder: "Environmental Reports", owner: "Agrofeed", version: "v2", status: "in_review", confidentiality: "Medium", updated: "2025-11-08" },
  { id: "D-1010", name: "Offtake Agreement - Kilimanjaro Foods.pdf", folder: "Offtake Agreements", owner: "Agrofeed", version: "v1", status: "approved", confidentiality: "High", updated: "2025-09-25" },
  { id: "D-1011", name: "Sharia Advisor Engagement Letter.pdf", folder: "Sharia Documents", owner: "Al Huda", version: "v1", status: "approved", confidentiality: "High", updated: "2025-09-15" },
  { id: "D-1012", name: "Draft Sukuk Term Sheet.pdf", folder: "Sukuk Structure", owner: "Al Huda", version: "v2", status: "in_review", confidentiality: "High", updated: "2025-11-12" },
  { id: "D-1013", name: "SPV Constitutional Documents.pdf", folder: "SPV Documents", owner: "Al Huda", version: "v1", status: "pending", confidentiality: "High", updated: "2025-11-14" },
  { id: "D-1014", name: "AML/KYC Policy.pdf", folder: "Regulatory Compliance", owner: "Agrofeed", version: "v1", status: "approved", confidentiality: "Medium", updated: "2025-08-01" },
  { id: "D-1015", name: "Insurance Policy - Assets.pdf", folder: "Insurance", owner: "Agrofeed", version: "v1", status: "expired", confidentiality: "Medium", updated: "2024-12-31" },
];

export const FOLDERS = [
  "Corporate Documents", "Shareholding", "Management and Governance", "Business Plan",
  "Feasibility Study", "Financial Statements", "Financial Model", "Bank Statements",
  "Tax Documents", "Land Documents", "Property Valuations", "Legal Documents",
  "Licences", "Government Approvals", "Environmental Reports", "ESG Documents",
  "Insurance", "Engineering", "Construction", "Equipment",
  "Supply Contracts", "Offtake Agreements", "Customer Contracts", "Operational Reports",
  "Photos", "Videos", "Meeting Minutes", "Investor Materials",
  "Sukuk Structure", "Sharia Documents", "AAOIFI Compliance", "IFSB Compliance",
  "Regulatory Compliance", "Due Diligence", "Risk Management", "SPV Documents",
  "Prospectus", "Legal Opinions", "Closing Documents", "Post-Issuance Monitoring",
];

export const TASKS = [
  { id: "T-1", title: "Upload latest audited financials", org: "Agrofeed", assignee: "F. Mwakasege", due: "2025-11-25", priority: "High", status: "in_progress" },
  { id: "T-2", title: "Review Financial Model v4 assumptions", org: "Tesserant", assignee: "J. Al-Rashid", due: "2025-11-22", priority: "High", status: "in_progress" },
  { id: "T-3", title: "Confirm SPV jurisdiction (DIFC vs ADGM)", org: "Al Huda", assignee: "M. Siddiqui", due: "2025-11-30", priority: "Critical", status: "in_progress" },
  { id: "T-4", title: "Complete AAOIFI checklist for Ijarah Sukuk", org: "Al Huda", assignee: "Sharia Board", due: "2025-12-05", priority: "High", status: "not_started" },
  { id: "T-5", title: "Provide 3-year cash flow forecast", org: "Agrofeed", assignee: "A. Njau", due: "2025-11-28", priority: "Medium", status: "in_progress" },
  { id: "T-6", title: "Sanctions & PEP screening — directors", org: "Tesserant", assignee: "Compliance", due: "2025-11-20", priority: "High", status: "overdue" },
  { id: "T-7", title: "Draft investor teaser (5-page)", org: "Tesserant", assignee: "S. Karim", due: "2025-12-10", priority: "Medium", status: "not_started" },
  { id: "T-8", title: "Prepare Sharia FAQ for roadshow", org: "Al Huda", assignee: "Sharia Board", due: "2025-12-15", priority: "Medium", status: "not_started" },
];

export const RISKS = [
  { id: "R-1", title: "Delay in SPV establishment", category: "Legal", probability: "Medium", impact: "High", rating: "High", owner: "Al Huda" },
  { id: "R-2", title: "FX volatility (TZS/USD)", category: "Foreign Exchange", probability: "High", impact: "Medium", rating: "High", owner: "Agrofeed" },
  { id: "R-3", title: "Feed grain price shock", category: "Market", probability: "Medium", impact: "High", rating: "High", owner: "Agrofeed" },
  { id: "R-4", title: "Sharia non-compliance in offtake terms", category: "Sharia", probability: "Low", impact: "High", rating: "Medium", owner: "Al Huda" },
  { id: "R-5", title: "Regulatory delay — CMSA Tanzania", category: "Regulatory", probability: "Medium", impact: "Medium", rating: "Medium", owner: "Tesserant" },
  { id: "R-6", title: "Environmental permit conditions", category: "Environmental", probability: "Low", impact: "Medium", rating: "Low", owner: "Agrofeed" },
  { id: "R-7", title: "Construction cost overrun (>10%)", category: "Construction", probability: "Medium", impact: "High", rating: "High", owner: "Agrofeed" },
  { id: "R-8", title: "Key-person dependency", category: "Operational", probability: "Medium", impact: "Medium", rating: "Medium", owner: "Agrofeed" },
  { id: "R-9", title: "Cybersecurity — data room access", category: "Cybersecurity", probability: "Low", impact: "High", rating: "Medium", owner: "Tesserant" },
  { id: "R-10", title: "Counterparty risk — top offtaker", category: "Counterparty", probability: "Low", impact: "High", rating: "Medium", owner: "Agrofeed" },
];

export const COMPLIANCE = [
  { id: "C-1", req: "AAOIFI FAS 34 disclosures", source: "AAOIFI", status: "in_progress", owner: "Al Huda", risk: "High" },
  { id: "C-2", req: "IFSB-19 disclosure for Sukuk", source: "IFSB", status: "gap", owner: "Al Huda", risk: "High" },
  { id: "C-3", req: "Sharia Governance Framework", source: "Sharia", status: "in_progress", owner: "Sharia Board", risk: "Medium" },
  { id: "C-4", req: "IFRS 9 impairment assessment", source: "IFRS", status: "complete", owner: "Tesserant", risk: "Low" },
  { id: "C-5", req: "AML / CFT policy", source: "AML", status: "complete", owner: "Agrofeed", risk: "Low" },
  { id: "C-6", req: "KYC on ultimate beneficial owners", source: "KYC", status: "in_progress", owner: "Tesserant", risk: "Medium" },
  { id: "C-7", req: "OFAC / UN sanctions screening", source: "Sanctions", status: "complete", owner: "Tesserant", risk: "Low" },
  { id: "C-8", req: "ESG disclosure — climate risk", source: "ESG", status: "in_progress", owner: "Agrofeed", risk: "Medium" },
  { id: "C-9", req: "CMSA Tanzania prospectus rules", source: "Regulatory", status: "gap", owner: "Al Huda", risk: "High" },
  { id: "C-10", req: "SPV governance charter", source: "SPV", status: "gap", owner: "Al Huda", risk: "High" },
  { id: "C-11", req: "Investor disclosure — related parties", source: "Regulatory", status: "in_progress", owner: "Tesserant", risk: "Medium" },
  { id: "C-12", req: "Beneficial ownership register", source: "AML", status: "in_progress", owner: "Agrofeed", risk: "Medium" },
];

export const SUKUK_STRUCTURES = [
  { name: "Ijarah Sukuk", suitability: 88, confidence: 82, note: "Strong asset base (land, mills, equipment) enables asset-backed leasing structure." },
  { name: "Wakalah Sukuk", suitability: 82, confidence: 78, note: "Diversified revenue enables agency-based investment pool with target return." },
  { name: "Hybrid (Ijarah + Murabaha)", suitability: 78, confidence: 74, note: "Combines lease income with tangible working capital financing." },
  { name: "Musharakah Sukuk", suitability: 65, confidence: 60, note: "Feasible but requires stronger partnership governance and profit-share clarity." },
  { name: "Istisna Sukuk", suitability: 60, confidence: 58, note: "Applicable to construction phase; limited investor base." },
  { name: "Green / Sustainability Sukuk", suitability: 72, confidence: 66, note: "ESG profile supports labelled issuance if ICMA framework is adopted." },
  { name: "Murabaha Sukuk", suitability: 55, confidence: 62, note: "Suitable for short-dated tranche; not ideal as primary structure." },
  { name: "Mudarabah Sukuk", suitability: 50, confidence: 55, note: "Profit-share complexity given multi-asset revenue mix." },
  { name: "Salam Sukuk", suitability: 42, confidence: 50, note: "Limited applicability outside pure agricultural produce financing." },
];

export const FINANCIALS = {
  revenue: [
    { year: "2022", value: 18.2 },
    { year: "2023", value: 24.5 },
    { year: "2024", value: 31.8 },
    { year: "2025E", value: 42.4 },
    { year: "2026F", value: 58.0 },
    { year: "2027F", value: 71.5 },
  ],
  ebitda: [
    { year: "2022", value: 3.1 },
    { year: "2023", value: 5.2 },
    { year: "2024", value: 8.4 },
    { year: "2025E", value: 12.7 },
    { year: "2026F", value: 19.2 },
    { year: "2027F", value: 25.8 },
  ],
  ratios: {
    dscr: 1.62, icr: 3.8, ltv: 0.58, currentRatio: 1.9, quickRatio: 1.2,
    debtEquity: 0.85, assetCoverage: 1.42, irr: 0.184, npvUsdM: 42.6,
  },
  scenarios: [
    { name: "Base", revenue: 42.4, ebitda: 12.7, dscr: 1.62 },
    { name: "Downside", revenue: 34.0, ebitda: 8.2, dscr: 1.18 },
    { name: "Upside", revenue: 49.6, ebitda: 16.4, dscr: 2.05 },
    { name: "Delayed Construction", revenue: 30.1, ebitda: 6.4, dscr: 0.98 },
    { name: "FX Shock (-15%)", revenue: 36.1, ebitda: 9.5, dscr: 1.32 },
  ],
};

export const NOTIFICATIONS = [
  { id: "N-1", text: "Tesserant approved 'Feasibility Study - Feed Mill.pdf'", time: "12m ago", type: "approval" },
  { id: "N-2", text: "New comment on 'Financial Model v4.xlsx' from J. Al-Rashid", time: "1h ago", type: "comment" },
  { id: "N-3", text: "AI flagged inconsistency: 2024 revenue in Business Plan vs Audited FS", time: "3h ago", type: "risk" },
  { id: "N-4", text: "Milestone overdue: 'Tax review completed'", time: "5h ago", type: "milestone" },
  { id: "N-5", text: "Al Huda uploaded 'Draft Sukuk Term Sheet.pdf' (v2)", time: "1d ago", type: "upload" },
  { id: "N-6", text: "Compliance gap detected: IFSB-19 Sukuk disclosure", time: "1d ago", type: "compliance" },
];

export const AUDIT = [
  { id: "A-1", at: "2025-11-14 10:22", user: "F. Mwakasege (Agrofeed)", action: "Uploaded", target: "SPV Constitutional Documents.pdf" },
  { id: "A-2", at: "2025-11-14 09:48", user: "J. Al-Rashid (Tesserant)", action: "Approved", target: "Feasibility Study - Feed Mill.pdf" },
  { id: "A-3", at: "2025-11-14 09:31", user: "M. Siddiqui (Al Huda)", action: "Commented", target: "Financial Model v4.xlsx" },
  { id: "A-4", at: "2025-11-13 18:04", user: "System AI", action: "Analyzed", target: "Environmental Impact Assessment.pdf" },
  { id: "A-5", at: "2025-11-13 16:22", user: "A. Njau (Agrofeed)", action: "Downloaded", target: "Property Valuation Report.pdf" },
  { id: "A-6", at: "2025-11-13 14:10", user: "S. Karim (Tesserant)", action: "Assigned Task", target: "Draft investor teaser (5-page)" },
  { id: "A-7", at: "2025-11-13 11:45", user: "Sharia Board", action: "Approved", target: "Sharia Advisor Engagement Letter.pdf" },
  { id: "A-8", at: "2025-11-12 17:20", user: "F. Mwakasege (Agrofeed)", action: "Logged in", target: "IP 41.86.x.x" },
];

export const STAKEHOLDERS = [
  { org: "Agrofeed Global", role: "Issuer", pending: 7, completed: 42, users: 12 },
  { org: "Tesserant", role: "Financial Advisor", pending: 5, completed: 28, users: 8 },
  { org: "Al Huda CIBE", role: "Sukuk Structurer", pending: 6, completed: 24, users: 9 },
  { org: "Sharia Board", role: "Sharia Advisor", pending: 3, completed: 11, users: 3 },
  { org: "External Legal", role: "Legal Counsel", pending: 2, completed: 8, users: 2 },
];

export const GAP_ANALYSIS = [
  { item: "SPV Constitutional Documents (final)", severity: "High", owner: "Al Huda" },
  { item: "IFSB-19 Sukuk disclosure package", severity: "High", owner: "Al Huda" },
  { item: "Updated insurance policy (2025)", severity: "Medium", owner: "Agrofeed" },
  { item: "Independent 3-year cash flow forecast", severity: "High", owner: "Agrofeed" },
  { item: "AAOIFI FAS 34 disclosure mapping", severity: "Medium", owner: "Al Huda" },
  { item: "Beneficial ownership register (final)", severity: "Medium", owner: "Agrofeed" },
];
