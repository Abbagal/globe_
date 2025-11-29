import React, { useState } from 'react';

interface Official {
  name: string;
  title: string;
  role: string;
  country: 'pakistan' | 'china';
  imageFileName: string;
}

interface Document {
  filename: string;
  type: 'MEMO' | 'WIRE' | 'REPORT' | 'BRIEF' | 'INTEL';
  date: string;
  description: string;
  tag: string;
  tagColor: string;
  decryptedContent: string; // Content shown after decryption
}

interface OfficialModalProps {
  official: Official | null;
  isVisible: boolean;
  onClose: () => void;
}

// Documents for Prof. Ahsan Iqbal
const AHSAN_IQBAL_DOCUMENTS: Document[] = [
  {
    filename: 'CONFIDENTIAL_13th_JCC_Minutes_Signed.pdf',
    type: 'MEMO',
    date: '2025-01-15',
    description: 'Classified minutes from 13th Joint Cooperation Committee meeting with signed agreements.',
    tag: 'JCC',
    tagColor: '#00ffff',
    decryptedContent: '📋 KEY POINTS: Agreement on ML-1 cost revision from $6.8B to $5.2B. Chinese side committed to 90% financing. New SEZ locations approved: Rashakai, Dhabeji, Bostan. Next JCC scheduled for Beijing, March 2025.'
  },
  {
    filename: 'ML-1_Railway_Cost_Rationalization_Final_v3.xlsx',
    type: 'REPORT',
    date: '2025-01-14',
    description: 'Final cost breakdown and rationalization report for ML-1 Railway upgradation project.',
    tag: 'Infrastructure',
    tagColor: '#ff6600',
    decryptedContent: '🚂 SUMMARY: Total revised cost: PKR 1.53 Trillion. Phase-I (Karachi-Multan): $2.7B. Phase-II (Multan-Lahore-Peshawar): $2.5B. Local component: 10%. Completion target: 2030. 171 stations to be upgraded.'
  },
  {
    filename: 'CPEC_2.0_Concept_Paper_Agri_and_IT_Focus.docx',
    type: 'BRIEF',
    date: '2025-01-12',
    description: 'Strategic concept paper outlining CPEC Phase 2 with focus on agriculture and IT sectors.',
    tag: 'Strategy',
    tagColor: '#00ff00',
    decryptedContent: '🌾 CPEC 2.0 PILLARS: 1) Agricultural cooperation - seed technology transfer, cold chain logistics. 2) IT Parks in 5 cities. 3) Tech skill development for 50,000 youth. 4) E-commerce corridor integration with Alibaba.'
  },
  {
    filename: 'Talking_Points_Press_Conference_Nov_26.pdf',
    type: 'MEMO',
    date: '2025-01-10',
    description: 'Prepared talking points for ministerial press conference on CPEC progress.',
    tag: 'Media',
    tagColor: '#ffff00',
    decryptedContent: '🎤 APPROVED MESSAGING: Emphasize $25B completed projects. Avoid debt trap narrative - highlight concessional loans. Do NOT discuss Thar coal delays. Redirect Gwadar questions to development narrative.'
  },
  {
    filename: 'Letter_to_NDRC_Chairman_Re_Debt_Restructuring.pdf',
    type: 'WIRE',
    date: '2025-01-08',
    description: 'Official correspondence to NDRC Chairman regarding debt restructuring proposals.',
    tag: 'Finance',
    tagColor: '#ff4444',
    decryptedContent: '💰 REQUEST: Extension of repayment timeline for IPP loans from 10 to 20 years. Reduction of interest rate from 5.2% to 2.5%. Conversion of $4.2B debt to equity stake in power projects. Response pending.'
  },
  {
    filename: 'Gwadar_Smart_Port_City_Masterplan_Update_2025.pptx',
    type: 'BRIEF',
    date: '2025-01-06',
    description: 'Updated masterplan presentation for Gwadar Smart Port City development.',
    tag: 'Gwadar',
    tagColor: '#00ffff',
    decryptedContent: '🏗️ PLAN: 2,292 acres allocated for Smart City. New airport operational by Q3 2025. Desalination plant capacity: 5 MGD. Hospital, university, and vocational center under construction. Population target: 500,000 by 2035.'
  },
  {
    filename: 'PSDP_2025-26_CPEC_Allocation_Summary.xlsx',
    type: 'REPORT',
    date: '2025-01-05',
    description: 'Public Sector Development Programme allocation summary for CPEC projects FY 2025-26.',
    tag: 'Budget',
    tagColor: '#ff6600',
    decryptedContent: '📊 ALLOCATIONS: Total PSDP for CPEC: PKR 89.5B. Roads & Highways: 42%. Rail: 28%. Power: 18%. SEZs: 7%. Gwadar: 5%. Shortfall from previous year: PKR 23B (to be covered by supplementary grant).'
  },
  {
    filename: 'Security_Protocols_Chinese_Engineers_Dasu_Review.pdf',
    type: 'INTEL',
    date: '2025-01-03',
    description: 'Security protocol review for Chinese engineers at Dasu Hydropower Project.',
    tag: 'Security',
    tagColor: '#ff4444',
    decryptedContent: '🔒 THREAT LEVEL: ELEVATED. Current deployment: 2 SSG battalions, 500 FC personnel. Recommended: Additional sniper teams, drone surveillance expansion. Chinese workers restricted to compound. Convoy protocols updated post-2021 incident.'
  },
  {
    filename: 'Transition_Plan_Post_CPEC_Authority_Dissolution.docx',
    type: 'MEMO',
    date: '2025-01-02',
    description: 'Internal transition plan following dissolution of CPEC Authority.',
    tag: 'Admin',
    tagColor: '#888888',
    decryptedContent: '⚙️ RESTRUCTURING: All functions transferred to Planning Ministry. Staff retention: 65%. New CPEC Wing established. Budget reallocated. Chinese counterparts notified. PM directive: Ensure zero disruption to ongoing projects.'
  },
  {
    filename: 'Meeting_Brief_PM_Shehbaz_Visit_Beijing.pdf',
    type: 'BRIEF',
    date: '2025-01-01',
    description: 'Classified briefing document for PM visit to Beijing bilateral meetings.',
    tag: 'Diplomatic',
    tagColor: '#00ff00',
    decryptedContent: '🤝 AGENDA: 1) Request $2B emergency loan. 2) ML-1 groundbreaking ceremony. 3) New energy projects (Kohala, Azad Pattan). 4) Discuss Xinjiang security cooperation. 5) BRI summit invitation. Meeting with Xi Jinping confirmed.'
  }
];

// Documents for Zheng Shanjie (China Co-Chair)
const ZHENG_SHANJIE_DOCUMENTS: Document[] = [
  {
    filename: 'Audit_Report_CPEC_Energy_Arrears_Optimization.xlsx',
    type: 'REPORT',
    date: '2025-11-20',
    description: 'Comprehensive audit report on billions owed to Chinese power producers under CPEC energy projects.',
    tag: 'Finance',
    tagColor: '#ff4444',
    decryptedContent: '💰 ARREARS AUDIT: Total owed to Chinese IPPs: $2.47B. Breakdown: Huaneng Sahiwal ($412M), Port Qasim ($389M), China Power Hub ($298M), SPIC Thar ($267M), Others ($1.1B). Payment delays: Avg 14 months. Interest accrued: $187M. Recommendation: Immediate settlement of 40% via sovereign bonds, remaining via tariff surcharge. Risk: Project suspension threats from 3 IPPs.'
  },
  {
    filename: 'List_of_Industries_for_Relocation_to_Rashakai_SEZ.xls',
    type: 'INTEL',
    date: '2025-11-18',
    description: 'Master list of Chinese industries approved for relocation to Rashakai Special Economic Zone, KP.',
    tag: 'SEZ',
    tagColor: '#00ff00',
    decryptedContent: '🏭 RASHAKAI RELOCATION LIST: Total approved: 38 enterprises. Textiles: 14 (Zhejiang cluster). Steel processing: 8 (Hebei relocations). Electronics assembly: 6. Pharmaceuticals: 4. Ceramics: 3. Auto parts: 3. Total investment: $1.8B. Jobs: 28,000. Status: 12 operational, 18 under construction, 8 pending utilities. Key bottleneck: Gas supply (only 15 MMCFD available vs 50 needed).'
  },
  {
    filename: 'ML-1_Railway_Financing_Model_RMB_vs_USD.pptx',
    type: 'BRIEF',
    date: '2025-11-15',
    description: 'Comparative financing model analysis for ML-1 Railway in RMB vs USD denomination.',
    tag: 'Infrastructure',
    tagColor: '#00ffff',
    decryptedContent: '🚂 FINANCING ANALYSIS: Option A (USD): $5.2B at 2.5% LIBOR+spread, 20yr tenure. Risk: PKR depreciation (projected 8% annual). Option B (RMB): ¥37.4B at 2.0% fixed. Benefit: Shields from USD volatility, aligns with bilateral swap. NDRC preference: RMB (60/40 split). Pakistan concern: RMB convertibility. Recommendation: Hybrid model with 60% RMB, 40% USD. Savings estimate: $340M over project life.'
  },
  {
    filename: 'Feasibility_Review_Cross_Border_Fiber_Optic_Phase2.pdf',
    type: 'REPORT',
    date: '2025-11-12',
    description: 'Feasibility review for Phase 2 of China-Pakistan cross-border fiber optic cable project.',
    tag: 'Digital',
    tagColor: '#ffff00',
    decryptedContent: '📡 FIBER OPTIC PHASE-2: Route: Kashgar-Khunjerab-Islamabad-Karachi (2,950km). Capacity: 100 Tbps (upgrade from 40 Tbps). Investment: $285M. Chinese stake: 70% (China Telecom). Strategic value: Alternative to submarine cables (India bypass). Completion: 2027. Side benefit: 5G backbone for northern Pakistan. Security: Dedicated military channel (encrypted).'
  },
  {
    filename: 'Meeting_Minutes_Ahsan_Iqbal_Beijing_Visit_Oct2025.docx',
    type: 'MEMO',
    date: '2025-11-10',
    description: 'Official minutes from Planning Minister Ahsan Iqbal bilateral meetings in Beijing.',
    tag: 'Diplomatic',
    tagColor: '#00ff00',
    decryptedContent: '📝 MEETING MINUTES (Oct 15-18, 2025): Attendees: Min. Ahsan Iqbal, Chairman Zheng Shanjie + delegations. Key outcomes: 1) ML-1 groundbreaking confirmed Q1 2026. 2) $800M immediate disbursement approved. 3) SEZ gas supply escalated to State Council. 4) Debt restructuring: Partial acceptance ($4.2B eligible). 5) New MOU on agricultural cooperation signed. Pakistani ask (deferred): Interest rate reduction on IPP loans. Next meeting: JCC-14, Beijing, March 2026.'
  },
  {
    filename: 'Risk_Assessment_Thar_Coal_Gasification_Project.pdf',
    type: 'INTEL',
    date: '2025-11-08',
    description: 'Risk assessment for proposed Thar coal-to-gas conversion project.',
    tag: 'Energy',
    tagColor: '#ff6600',
    decryptedContent: '⚠️ RISK ASSESSMENT: Project: Thar Coal Gasification (Block VI). Capacity: 1.2 BCF/day synthetic gas. Investment: $3.8B. Technology: Shanghai Electric (licensed). Risks: HIGH - Environmental (carbon capture cost +40%), Technical (coal quality variability), Financial (competing LNG prices). Water requirement: 50 MGD (critical in desert). Chinese recommendation: Defer to 2028, prioritize solar/wind instead. Pakistan position: Proceed (energy security).'
  },
  {
    filename: 'NDRC_Opinion_on_Mainline-1_Cost_Rationalization.doc',
    type: 'MEMO',
    date: '2025-11-05',
    description: 'NDRC internal opinion document on ML-1 Railway cost rationalization proposal.',
    tag: 'Rail',
    tagColor: '#00ffff',
    decryptedContent: '🏛️ NDRC OPINION: Subject: ML-1 Cost Reduction ($6.8B → $5.2B). Assessment: ACCEPTABLE with conditions. Scope changes approved: Design speed 160km/h (from 200), 3 phases (from 4), simplified stations. Concerns: Pakistan Railways O&M capacity, traffic projections optimistic. Conditions: 1) Phase-wise disbursement tied to milestones. 2) Chinese contractor mandatory for civil works. 3) Technology transfer limited to operations only. Approval: Vice Chairman signed Nov 3, 2025.'
  },
  {
    filename: 'Map_Industrial_Cooperation_Zones_Punjab_Sindh.jpg',
    type: 'INTEL',
    date: '2025-11-02',
    description: 'Strategic map showing planned industrial cooperation zones across Punjab and Sindh provinces.',
    tag: 'SEZ',
    tagColor: '#00ff00',
    decryptedContent: '🗺️ INDUSTRIAL ZONES MAP: Punjab: 1) Allama Iqbal (Faisalabad) - Textiles, 420 acres, 65% occupied. 2) M-3 Industrial City - Mixed, 1,500 acres, 30% developed. 3) Quaid-e-Azam Apparel Park - Garments, 200 acres. Sindh: 1) Dhabeji SEZ - Heavy industry, 1,530 acres, utilities pending. 2) Bin Qasim Industrial Park - Petrochemicals, 350 acres. Chinese investment committed: $4.2B across zones. Employment target: 150,000 by 2030.'
  },
  {
    filename: 'Report_on_Gwadar_Free_Zone_Tax_Exemptions_Status.pdf',
    type: 'REPORT',
    date: '2025-10-28',
    description: 'Status report on tax exemptions and incentives implementation in Gwadar Free Zone.',
    tag: 'Gwadar',
    tagColor: '#00ffff',
    decryptedContent: '📋 TAX EXEMPTION STATUS: Gwadar Free Zone incentives: 23-year tax holiday (income tax, customs, sales tax). Implementation: PARTIAL. Issues: 1) Provincial vs Federal jurisdiction disputes (3 cases pending). 2) Customs clearance delays (avg 12 days vs promised 48 hrs). 3) Banking restrictions (forex controls). Chinese enterprises affected: 18 (operations delayed). COPHC complaint: Formal note submitted. Resolution: Task force formed, PM directive issued. Target: Full compliance by March 2026.'
  },
  {
    filename: 'Comparison_CPEC_vs_China_Myanmar_Corridor_ROI.xlsx',
    type: 'REPORT',
    date: '2025-10-25',
    description: 'Comparative ROI analysis between CPEC and China-Myanmar Economic Corridor investments.',
    tag: 'Strategy',
    tagColor: '#ff6600',
    decryptedContent: '📊 CORRIDOR COMPARISON: CPEC - Investment: $62B (committed), $28B (disbursed). ROI: 3.8% (projected). Completion: 67%. Risk: MODERATE-HIGH (security, debt). Strategic value: VERY HIGH (Indian Ocean access). CMEC - Investment: $24B (committed), $9B (disbursed). ROI: 4.5% (projected). Completion: 45%. Risk: HIGH (political instability, sanctions). Strategic value: HIGH (Bay of Bengal access). NDRC assessment: CPEC remains priority corridor despite higher costs. Recommendation: Maintain CPEC flagship status, accelerate CMEC selectively.'
  }
];

// Documents for PM Shehbaz Sharif
const SHEHBAZ_SHARIF_DOCUMENTS: Document[] = [
  {
    filename: 'CPEC_Financing_Restructuring_Proposal_PM_Briefing.pdf',
    type: 'BRIEF',
    date: '2025-01-18',
    description: 'Prime Minister briefing on proposed restructuring of CPEC financing arrangements with Chinese counterparts.',
    tag: 'Finance',
    tagColor: '#ff4444',
    decryptedContent: '💰 PM BRIEF: Seeking $8.5B debt restructuring. Proposed: 10-year extension on IPP loans, interest rate reduction to 2%. Chinese response: Partial acceptance ($4.2B eligible). Condition: No sovereign default. IMF coordination required. Cabinet approval pending.'
  },
  {
    filename: 'PM_Xi_Jinping_Call_Summary_Jan_2025.docx',
    type: 'WIRE',
    date: '2025-01-16',
    description: 'Summary of PM telephonic conversation with President Xi Jinping on CPEC progress and bilateral ties.',
    tag: 'Diplomatic',
    tagColor: '#00ff00',
    decryptedContent: '📞 CALL SUMMARY: Duration: 35 minutes. Topics: ML-1 groundbreaking (confirmed Q1 2025), Gwadar development, security cooperation. Xi expressed concern on project delays. PM assured expedited land acquisition. Invitation to visit Beijing: Accepted for March 2025.'
  },
  {
    filename: 'Cabinet_Decision_CPEC_Authority_Dissolution.pdf',
    type: 'MEMO',
    date: '2025-01-14',
    description: 'Official cabinet decision document dissolving CPEC Authority and transferring functions.',
    tag: 'Admin',
    tagColor: '#ffff00',
    decryptedContent: '📋 CABINET DECISION: CPEC Authority dissolved effective Feb 1, 2025. Functions transferred to Planning Ministry. Reason: Streamlining, cost-cutting. Chinese side notified. Key staff retained. New CPEC Wing under Ahsan Iqbal. Budget: PKR 450M (reduced from 1.2B).'
  },
  {
    filename: 'SIFC_CPEC_Integration_Framework_Draft.pptx',
    type: 'BRIEF',
    date: '2025-01-12',
    description: 'Draft framework for integrating CPEC projects under Special Investment Facilitation Council oversight.',
    tag: 'SIFC',
    tagColor: '#00ffff',
    decryptedContent: '🏛️ SIFC-CPEC INTEGRATION: Army-led facilitation for Chinese investors. Fast-track approvals: 72 hours. Security guarantees enhanced. SEZ land allocation: SIFC priority. Chinese Ambassador briefed. Goal: Restore investor confidence post-2023 incidents.'
  },
  {
    filename: 'Emergency_Loan_Request_to_China_Development_Bank.pdf',
    type: 'WIRE',
    date: '2025-01-10',
    description: 'Official request for emergency loan from China Development Bank to support forex reserves.',
    tag: 'Finance',
    tagColor: '#ff4444',
    decryptedContent: '🚨 EMERGENCY REQUEST: Amount: $2B. Purpose: Forex reserve support (current: $8.1B). Terms requested: 1-year rollover, 3% interest. Collateral: Future Gwadar revenue. Status: Under CDB review. Finance Ministry coordination. IMF notification: Required within 7 days.'
  },
  {
    filename: 'PM_Directive_ML1_Land_Acquisition_Priority.pdf',
    type: 'MEMO',
    date: '2025-01-08',
    description: 'Prime Minister directive to provincial governments on expediting ML-1 railway land acquisition.',
    tag: 'Infrastructure',
    tagColor: '#ff6600',
    decryptedContent: '🚂 PM DIRECTIVE: All provinces to complete ML-1 land acquisition by March 2025. Punjab: 340km (65% done). Sindh: 280km (45% done). Compensation: Market rate + 25%. Legal challenges to be resolved via ordinance. Weekly progress reports mandatory.'
  },
  {
    filename: 'National_Security_Committee_CPEC_Security_Review.pdf',
    type: 'INTEL',
    date: '2025-01-06',
    description: 'National Security Committee review of security arrangements for CPEC projects and Chinese personnel.',
    tag: 'Security',
    tagColor: '#ff4444',
    decryptedContent: '🔒 NSC REVIEW: Chinese personnel: 7,850 in-country. Threat level: ELEVATED (Balochistan), MODERATE (elsewhere). SSG deployment: 4 battalions dedicated. Drone surveillance: Expanded to 12 sites. Chinese request: Joint security operations. Decision: Approved for Gwadar only.'
  },
  {
    filename: 'Strategic_Talking_Points_SCO_Summit_CPEC.docx',
    type: 'BRIEF',
    date: '2025-01-04',
    description: 'Strategic talking points for PM regarding CPEC discussions at upcoming SCO Summit.',
    tag: 'Strategy',
    tagColor: '#00ff00',
    decryptedContent: '🌐 SCO TALKING POINTS: Highlight CPEC as BRI flagship. Counter Indian narrative on debt trap. Emphasize: $25B completed, 100K jobs created. Avoid: Circular debt discussion, security incidents. Push: Regional connectivity via CPEC extension to Central Asia.'
  },
  {
    filename: 'PM_Visit_Gwadar_Briefing_Package_Complete.pdf',
    type: 'BRIEF',
    date: '2025-01-02',
    description: 'Complete briefing package for PM official visit to Gwadar Port and Free Zone.',
    tag: 'Gwadar',
    tagColor: '#00ffff',
    decryptedContent: '🏗️ VISIT BRIEF: Date: Jan 15, 2025. Itinerary: Port facility, New Airport (95% complete), Desalination Plant, Free Zone. Inaugurations: Vocational Center, 300-bed Hospital. Meetings: Chinese Ambassador, COPHC CEO. Media: Controlled access. Security: Red Zone protocols.'
  },
  {
    filename: 'Bilateral_Agreement_Draft_CPEC_Phase2_Framework.pdf',
    type: 'MEMO',
    date: '2025-01-01',
    description: 'Draft bilateral agreement framework for CPEC Phase 2 covering agriculture, IT, and science cooperation.',
    tag: 'Agreement',
    tagColor: '#00ff00',
    decryptedContent: '📝 PHASE 2 FRAMEWORK: Pillars: Agriculture ($5B), IT Parks ($2B), Science & Tech ($1.5B). New corridors: Green CPEC (renewables), Digital CPEC. Timeline: 2025-2030. Signing target: PM Beijing visit March 2025. Legal review: Complete. Chinese draft: Received and aligned.'
  }
];

// Documents for Awais Manzur Sumra (Additional Secretary CPEC)
const AWAIS_SUMRA_DOCUMENTS: Document[] = [
  {
    filename: 'PSDP_Releases_Q3_2025_CPEC_Projects.xlsx',
    type: 'REPORT',
    date: '2025-10-15',
    description: 'Quarterly PSDP release statement for CPEC projects showing disbursement status and utilization.',
    tag: 'Budget',
    tagColor: '#ff6600',
    decryptedContent: '📊 Q3 RELEASES: Total allocated: PKR 89.5B. Released: PKR 52.3B (58%). Utilization: 71%. Top performers: KKH Phase-II (92%), Gwadar Airport (88%). Lagging: SEZ Infrastructure (34%), ML-1 Land (28%). Recommendation: Expedite releases for priority projects.'
  },
  {
    filename: 'PC-1_Approval_Thakot_Raikot_KKH_Phase_2.pdf',
    type: 'MEMO',
    date: '2025-10-12',
    description: 'PC-1 approval document for Thakot-Raikot section of Karakoram Highway Phase 2 upgradation.',
    tag: 'Infrastructure',
    tagColor: '#00ffff',
    decryptedContent: '🛣️ PC-1 APPROVED: Project: KKH Thakot-Raikot (136km). Total cost: PKR 198B ($710M). Chinese financing: 85%. Timeline: 4 years. Contractor: CRBC. Key features: 4-lane dual carriageway, 12 tunnels, 36 bridges. ECNEC approval: Pending.'
  },
  {
    filename: 'Summary_for_ECNEC_ML1_Revised_Cost.doc',
    type: 'BRIEF',
    date: '2025-10-08',
    description: 'Summary prepared for ECNEC consideration on ML-1 Railway revised cost estimates.',
    tag: 'Rail',
    tagColor: '#00ff00',
    decryptedContent: '🚂 ECNEC SUMMARY: Original cost (2017): $8.2B. Current estimate: $5.2B (-36%). Scope reduction: 4 sections to 3. Design speed: 160 km/h (reduced from 200). Chinese concessional loan: 90%. Local component: PKR 115B. ECNEC decision: APPROVED with conditions.'
  },
  {
    filename: 'Internal_Memo_CPEC_Secretariat_Staffing_Reorganization.pdf',
    type: 'MEMO',
    date: '2025-10-05',
    description: 'Internal memo on CPEC Secretariat staffing changes following Authority dissolution.',
    tag: 'Admin',
    tagColor: '#888888',
    decryptedContent: '⚙️ REORGANIZATION: Total positions: 87 → 54. Retained: 62%. Key transfers: 12 to Planning Division, 8 to BOI, 6 to Finance. Redundancies: 21 (VRS offered). New structure: 4 wings (Infrastructure, Energy, SEZ, Coordination). Effective: Feb 2025.'
  },
  {
    filename: 'Audit_Objections_Orange_Line_Subsidy_Draft_Reply.docx',
    type: 'REPORT',
    date: '2025-10-02',
    description: 'Draft reply to AGP audit objections on Orange Line Metro operational subsidy payments.',
    tag: 'Audit',
    tagColor: '#ff4444',
    decryptedContent: '⚠️ AUDIT RESPONSE: Objections: 14 (PKR 8.2B subsidy questioned). Key issues: No competitive bidding for O&M, excess fare subsidy, non-recovery of penalties. Defense: Emergency procurement justified, ridership below projection (65K vs 250K target). Status: PAC hearing scheduled.'
  },
  {
    filename: 'Meeting_Notice_Central_Development_Working_Party_CDWP.pdf',
    type: 'MEMO',
    date: '2025-09-28',
    description: 'CDWP meeting notice for review of CPEC infrastructure projects requiring approval.',
    tag: 'Approval',
    tagColor: '#ffff00',
    decryptedContent: '📋 CDWP AGENDA (Oct 2025): 1) Gwadar Eastbay Expressway Phase-II (PKR 28B). 2) Rashakai SEZ Utilities (PKR 12B). 3) Thar Coal Rail Link (PKR 45B). 4) Kohala Hydropower (revised PC-I). Quorum: Deputy Chairman + 8 members. Venue: Planning Commission.'
  },
  {
    filename: 'Funds_Surrender_Reappropriation_Statement_FY25.xls',
    type: 'REPORT',
    date: '2025-09-25',
    description: 'Statement of surrendered and reappropriated funds for CPEC projects FY 2024-25.',
    tag: 'Finance',
    tagColor: '#ff6600',
    decryptedContent: '💸 SURRENDER STATEMENT: Total surrendered: PKR 18.7B. Reasons: Land acquisition delays (42%), contractor issues (28%), security (18%), approvals pending (12%). Reappropriation: PKR 11.2B to priority projects. Net lapse: PKR 7.5B. Finance Ministry notification: Submitted.'
  },
  {
    filename: 'Circular_Debt_Payment_Priority_List_Chinese_IPPs.xlsx',
    type: 'INTEL',
    date: '2025-09-20',
    description: 'Priority list for circular debt payments to Chinese Independent Power Producers.',
    tag: 'Energy',
    tagColor: '#ff4444',
    decryptedContent: '⚡ PAYMENT PRIORITY: Total owed to Chinese IPPs: PKR 485B ($1.74B). Priority 1: Port Qasim (PKR 89B). Priority 2: Sahiwal (PKR 72B). Priority 3: Hub Power (PKR 65B). Payment schedule: 6 tranches over 18 months. Chinese condition: No new arrears accumulation.'
  },
  {
    filename: 'Scan_Letter_Ministry_Finance_Sovereign_Guarantees.jpg',
    type: 'WIRE',
    date: '2025-09-15',
    description: 'Scanned letter from Ministry of Finance regarding sovereign guarantee issuance for new CPEC loans.',
    tag: 'Guarantee',
    tagColor: '#00ff00',
    decryptedContent: '✍️ MOF POSITION: New sovereign guarantees: RESTRICTED (IMF conditionality). Existing guarantees: $12.4B (CPEC only). Proposed ML-1 guarantee: $4.7B (requires Cabinet approval). Finance Secretary recommendation: Partial guarantee with provincial co-guarantee. Timeline: 45 days for processing.'
  },
  {
    filename: 'Presentation_Planning_Commission_Annual_Review.pptx',
    type: 'BRIEF',
    date: '2025-09-10',
    description: 'Annual review presentation on CPEC progress for Planning Commission leadership.',
    tag: 'Review',
    tagColor: '#00ffff',
    decryptedContent: '📈 ANNUAL REVIEW: Projects completed: 32 ($19.5B). Ongoing: 18 ($8.7B). Pipeline: 24 ($33.8B). Employment generated: 236,000 (direct + indirect). Power added: 5,320 MW. Roads: 886 km. Challenges: Debt servicing, security, land acquisition. Outlook: Phase-2 acceleration required.'
  }
];

// Documents for Dr. M. Muzammil Zia (Director General CPEC)
const MUZAMMIL_ZIA_DOCUMENTS: Document[] = [
  {
    filename: 'Master_Tracker_CPEC_Projects_Status_Nov_2025.xlsx',
    type: 'REPORT',
    date: '2025-11-25',
    description: 'Master tracker spreadsheet showing status of all 74 CPEC projects with completion percentages.',
    tag: 'Tracker',
    tagColor: '#00ffff',
    decryptedContent: '📊 PROJECT STATUS: Total projects: 74. Completed: 32 (43%). Ongoing: 26 (35%). Pipeline: 16 (22%). On track: 18. Delayed: 8. Critical: Kohala HPP (land issues), ML-1 (financing), Gwadar Airport (commissioning). Overall health: AMBER. Next review: Dec 15.'
  },
  {
    filename: 'Site_Visit_Report_Suki_Kinari_Hydropower_Progress_98%.pdf',
    type: 'REPORT',
    date: '2025-11-22',
    description: 'Site visit report on Suki Kinari Hydropower Project showing 98% physical progress.',
    tag: 'Energy',
    tagColor: '#00ff00',
    decryptedContent: '⚡ SITE REPORT: Project: Suki Kinari HPP (884 MW). Progress: 98%. Location: Kaghan Valley, KP. Contractor: CGGC. Investment: $1.96B. Commissioning: Q1 2026. Issues: Transmission line (NTDC delay). Recommendation: Expedite grid connectivity. Chinese team: Satisfied with progress.'
  },
  {
    filename: 'Feasibility_Study_Dhabeji_SEZ_Water_Supply.pdf',
    type: 'BRIEF',
    date: '2025-11-18',
    description: 'Feasibility study for water supply infrastructure to Dhabeji Special Economic Zone.',
    tag: 'SEZ',
    tagColor: '#ffff00',
    decryptedContent: '💧 FEASIBILITY: Dhabeji SEZ water demand: 15 MGD (Phase-1), 40 MGD (full build-out). Source: Hub Dam + desalination. Cost: PKR 8.5B. Timeline: 24 months. Sindh Govt contribution: 40%. Federal: 60%. Status: PC-1 under preparation. Chinese investor concern: Water availability critical for textile units.'
  },
  {
    filename: 'Meeting_Minutes_Joint_Working_Group_Transport_Infrastructure.docx',
    type: 'MEMO',
    date: '2025-11-15',
    description: 'Minutes from Joint Working Group meeting on transport infrastructure projects.',
    tag: 'JWG',
    tagColor: '#00ffff',
    decryptedContent: '📝 JWG MINUTES: Attendees: 12 (PK: 7, CN: 5). Agenda: ML-1 progress, KKH Phase-II, Gwadar-Quetta road. Decisions: ML-1 groundbreaking confirmed Dec 2025. KKH contractor mobilization: Jan 2026. Gwadar road: Feasibility revision requested. Next JWG: Beijing, Feb 2026.'
  },
  {
    filename: 'Data_Sheet_Gwadar_Port_Throughput_Cargo_Stats.xls',
    type: 'REPORT',
    date: '2025-11-12',
    description: 'Data sheet with Gwadar Port cargo throughput statistics and vessel movement data.',
    tag: 'Gwadar',
    tagColor: '#00ffff',
    decryptedContent: '🚢 PORT DATA: YTD throughput: 1.4M tons. Containers: 52,000 TEUs. Vessel calls: 165. Bulk cargo: 78%. Afghan transit: 22% (growing). Top commodities: Fertilizer, wheat, vehicles. Utilization: 28%. Target 2026: 2.5M tons. Constraint: Hinterland connectivity.'
  },
  {
    filename: 'Map_Route_Alignment_DI_Khan_Zhob_Road.png',
    type: 'INTEL',
    date: '2025-11-08',
    description: 'Route alignment map for DI Khan-Zhob road section of Western Route.',
    tag: 'Western Route',
    tagColor: '#ff6600',
    decryptedContent: '🗺️ ROUTE DETAILS: DI Khan-Zhob section: 210 km. Terrain: Mountainous (Sulaiman Range). Key features: 8 tunnels, 22 bridges. Estimated cost: $1.2B. Security assessment: HIGH RISK (TTP activity). Contractor: CSCEC (shortlisted). Timeline: 5 years. Land acquisition: 35% complete.'
  },
  {
    filename: 'Pending_Issues_Log_Rashakai_SEZ_Gas_Connection.docx',
    type: 'MEMO',
    date: '2025-11-05',
    description: 'Issues log tracking pending gas connection for Rashakai Special Economic Zone.',
    tag: 'SEZ',
    tagColor: '#ff4444',
    decryptedContent: '⚠️ PENDING ISSUES: Rashakai SEZ gas supply: CRITICAL. SNGPL commitment: 50 MMCFD. Current availability: 0. Bottleneck: 12km pipeline from Nowshera. Cost: PKR 2.8B (unfunded). Chinese investors: 8 units on hold pending gas. Escalation: PM level required. Deadline: March 2026.'
  },
  {
    filename: 'Presentation_Progress_Review_Meeting_PM_Office.pptx',
    type: 'BRIEF',
    date: '2025-11-02',
    description: 'Progress review presentation prepared for PM Office monthly review meeting.',
    tag: 'Review',
    tagColor: '#00ff00',
    decryptedContent: '📈 PM REVIEW: Key highlights: Suki Kinari 98%, Gwadar Airport 95%, KKH-II 72%. Concerns: ML-1 land (45%), SEZ utilities (delayed), circular debt (PKR 485B). Achievements: 5,320 MW added, 236K jobs. Ask: PKR 23B supplementary grant, gas for Rashakai. PM directive: Weekly monitoring.'
  },
  {
    filename: 'List_Chinese_Experts_Visa_Extension_Request.xlsx',
    type: 'INTEL',
    date: '2025-10-28',
    description: 'List of Chinese technical experts requiring visa extensions for CPEC projects.',
    tag: 'Personnel',
    tagColor: '#ffff00',
    decryptedContent: '👥 VISA REQUESTS: Total experts: 342. Projects: 18. Extensions needed: 287 (6-month). New visas: 55. Priority projects: ML-1 (89), Suki Kinari (45), Kohala (67). Processing time: 15-20 days. Interior Ministry coordination: Ongoing. Security clearance: 98% approved.'
  },
  {
    filename: 'Brief_B2B_Matchmaking_Textile_Sector.pdf',
    type: 'BRIEF',
    date: '2025-10-25',
    description: 'Brief on B2B matchmaking event for textile sector relocation to Pakistan SEZs.',
    tag: 'Investment',
    tagColor: '#00ff00',
    decryptedContent: '🏭 B2B EVENT: Venue: Shenzhen, Dec 2025. Pakistani delegation: 45 companies. Chinese participants: 120+ textile manufacturers. Target: $500M investment commitments. SEZs promoted: Rashakai, Dhabeji, M-3 Faisalabad. Incentives: 10-year tax holiday, subsidized utilities. Follow-up: Site visits Jan 2026.'
  }
];

// Documents for Khalil Hashmi (Ambassador to China)
const KHALIL_HASHMI_DOCUMENTS: Document[] = [
  {
    filename: 'Diplomatic_Cypher_Meeting_with_Vice_Foreign_Minister_Sun_Weidong.pdf',
    type: 'WIRE',
    date: '2025-11-26',
    description: 'Encrypted diplomatic cable summarizing meeting with Chinese Vice Foreign Minister Sun Weidong.',
    tag: 'Diplomatic',
    tagColor: '#ff4444',
    decryptedContent: '🔐 CYPHER SUMMARY: Meeting duration: 90 mins. Topics: Security cooperation, Uyghur repatriation requests, CPEC Phase-2. Chinese concerns: BLA attacks, slow project delivery. Pakistani ask: $2B loan, ML-1 financing. Outcome: Positive signals on loan, security MOU draft shared. Follow-up: FM level meeting Jan 2026.'
  },
  {
    filename: 'Briefing_Note_Debt_Profiling_Request_Exim_Bank.docx',
    type: 'BRIEF',
    date: '2025-11-24',
    description: 'Briefing note on Exim Bank request for comprehensive debt profiling of Pakistani CPEC loans.',
    tag: 'Finance',
    tagColor: '#ff6600',
    decryptedContent: '💰 DEBT PROFILE: Exim Bank request: Full disclosure of Pakistan debt obligations. Total CPEC debt: $19.3B. Exim Bank exposure: $12.1B. Repayment schedule: 2024-2040. Current arrears: $340M (IPPs). Pakistan response: Partial disclosure (citing IMF confidentiality). Exim concern: Debt sustainability.'
  },
  {
    filename: 'Schedule_Minister_Planning_Visit_Beijing_Dec2025.xlsx',
    type: 'MEMO',
    date: '2025-11-22',
    description: 'Detailed schedule for Planning Minister visit to Beijing in December 2025.',
    tag: 'Visit',
    tagColor: '#00ffff',
    decryptedContent: '📅 VISIT SCHEDULE: Dec 8-12, 2025. Day 1: Arrival, Embassy dinner. Day 2: NDRC meetings (ML-1, SEZs). Day 3: Exim Bank, China Development Bank. Day 4: Industrial park tours (Suzhou). Day 5: Signing ceremony, departure. Delegation: 12 officials. Accommodation: St. Regis Beijing.'
  },
  {
    filename: 'Report_Chinese_Social_Media_Sentiment_Pakistan_Security.pdf',
    type: 'INTEL',
    date: '2025-11-20',
    description: 'Intelligence report on Chinese social media sentiment regarding Pakistan security situation.',
    tag: 'OSINT',
    tagColor: '#ff4444',
    decryptedContent: '📱 SENTIMENT ANALYSIS: Platform: Weibo, WeChat. Period: Oct-Nov 2025. Mentions: 45,000+. Sentiment: 62% negative (security), 28% neutral, 10% positive. Key concerns: Worker safety, BLA attacks, Karachi incident. Trending hashtags: #巴基斯坦安全 (Pakistan Security). Recommendation: Proactive messaging campaign.'
  },
  {
    filename: 'Invitation_Belt_and_Road_Forum_2026.jpg',
    type: 'MEMO',
    date: '2025-11-18',
    description: 'Scanned official invitation for Belt and Road Forum 2026 addressed to PM Pakistan.',
    tag: 'BRI',
    tagColor: '#00ff00',
    decryptedContent: '📜 INVITATION: Event: 4th Belt and Road Forum. Date: May 14-16, 2026. Venue: Beijing National Convention Center. Invitee: PM Shehbaz Sharif (Head of State level). Theme: "High-Quality BRI Development". Pakistan slot: Keynote address (Day 2). RSVP deadline: Feb 2026. Protocol: Red carpet reception.'
  },
  {
    filename: 'List_Pakistani_Students_stranded_Wuhan_Scholarships.xls',
    type: 'REPORT',
    date: '2025-11-15',
    description: 'List of Pakistani scholarship students facing issues in Wuhan universities.',
    tag: 'Consular',
    tagColor: '#ffff00',
    decryptedContent: '🎓 STUDENT ISSUES: Total students (Wuhan): 2,340. Issues reported: 187. Categories: Scholarship delays (89), accommodation (45), visa renewal (32), medical (21). Universities: Wuhan University, HUST, CCNU. Embassy action: Note verbal sent to MFA. Resolution timeline: 30 days. Escalation: HEC coordination.'
  },
  {
    filename: 'Note_Verbal_Ministry_Foreign_Affairs_China_Security_Assurance.pdf',
    type: 'WIRE',
    date: '2025-11-12',
    description: 'Note verbal from Chinese MFA requesting enhanced security assurances for Chinese nationals.',
    tag: 'Security',
    tagColor: '#ff4444',
    decryptedContent: '📋 MFA NOTE VERBAL: Reference: 2025/BJ/4521. Subject: Security of Chinese nationals. Chinese demands: 1) Dedicated protection force expansion. 2) Real-time threat sharing. 3) Compensation framework for incidents. 4) Quarterly security reviews. Pakistan response: Draft under preparation. Deadline: Dec 15, 2025.'
  },
  {
    filename: 'Event_Plan_Pakistan_Culture_Week_Beijing.pptx',
    type: 'BRIEF',
    date: '2025-11-08',
    description: 'Event plan for Pakistan Culture Week celebration in Beijing.',
    tag: 'Cultural',
    tagColor: '#00ff00',
    decryptedContent: '🎭 CULTURE WEEK: Dates: Jan 20-26, 2026. Venue: National Art Museum of China. Events: Art exhibition, food festival, fashion show, music concert. Budget: $180,000 (HQ approved). Expected attendance: 15,000+. VIP: Vice Premier (invited). Media coverage: CCTV, Xinhua confirmed. Theme: "75 Years of Friendship".'
  },
  {
    filename: 'Profile_New_Chairman_China_Energy_Engineering_Corp.docx',
    type: 'INTEL',
    date: '2025-11-05',
    description: 'Intelligence profile on newly appointed Chairman of China Energy Engineering Corporation.',
    tag: 'Profile',
    tagColor: '#00ffff',
    decryptedContent: '👤 PROFILE: Name: Wang Jianguo. Position: Chairman, CEEC (Nov 2025). Age: 58. Background: SASAC, State Grid. Education: Tsinghua (Engineering). Pakistan exposure: Led Sahiwal Coal project (2015-2017). Assessment: Pro-Pakistan, pragmatic. Opportunity: Direct engagement on Thar Coal Phase-III. Meeting request: Submitted.'
  },
  {
    filename: 'Urgent_Cable_Coal_Import_Restrictions_Impact.pdf',
    type: 'WIRE',
    date: '2025-11-02',
    description: 'Urgent diplomatic cable on impact of Chinese coal import restrictions on Pakistani exports.',
    tag: 'Trade',
    tagColor: '#ff6600',
    decryptedContent: '🚨 URGENT: China carbon policy restricting coal imports. Impact on Pakistan: $120M annual exports at risk. Affected: Thar coal (planned exports). Chinese position: Environmental commitments non-negotiable. Mitigation: Request exemption for "clean coal" category. Lobbying: Commerce Ministry, NDRC. Timeline: Policy effective Jan 2026.'
  }
];

// Documents for Li Qiang (Premier of China)
const LI_QIANG_DOCUMENTS: Document[] = [
  {
    filename: 'Directive_State_Council_Security_of_Overseas_Personnel_Pakistan.pdf',
    type: 'WIRE',
    date: '2025-11-27',
    description: 'State Council directive on enhanced security measures for Chinese personnel working on CPEC projects in Pakistan.',
    tag: 'Security',
    tagColor: '#ff4444',
    decryptedContent: '🔴 STATE COUNCIL DIRECTIVE: Classification: TOP SECRET. Subject: Protection of overseas personnel (Pakistan). Mandates: 1) Double security budget for Balochistan projects. 2) Restrict new deployments to "secure zones" only. 3) Establish rapid extraction protocols. 4) Monthly security briefings to Politburo Standing Committee. Effective: Immediate.'
  },
  {
    filename: 'Briefing_Meeting_PM_Shehbaz_Sharif_Nov_2025.docx',
    type: 'BRIEF',
    date: '2025-11-25',
    description: 'Briefing document prepared for Premier Li Qiang meeting with PM Shehbaz Sharif.',
    tag: 'Diplomatic',
    tagColor: '#00ff00',
    decryptedContent: '🤝 MEETING BRIEF: Date: Nov 28, 2025. Duration: 60 mins. Pakistani asks: $2B emergency loan, ML-1 financing, debt restructuring. Chinese position: Conditional approval ($800M), security guarantees required. Talking points: Praise CPEC progress, express security concerns diplomatically, announce Gwadar development package.'
  },
  {
    filename: 'Strategic_Review_BRI_South_Asia_Corridor_vs_IMEC.pptx',
    type: 'INTEL',
    date: '2025-11-22',
    description: 'Strategic intelligence review comparing BRI South Asia Corridor with competing India-Middle East-Europe Corridor (IMEC).',
    tag: 'Geostrategy',
    tagColor: '#ff6600',
    decryptedContent: '⚔️ IMEC THREAT ASSESSMENT: IMEC partners: India, UAE, Saudi Arabia, EU, USA. Investment: $20B announced. Timeline: 2030 operational. CPEC advantage: Already operational, China-controlled. IMEC weakness: Geopolitical tensions, funding gaps. Counter-strategy: Accelerate CPEC Phase-2, Gwadar-Xinjiang rail link priority. Recommendation: Outpace IMEC delivery.'
  },
  {
    filename: 'Approval_Sovereign_Loan_Rollover_Pakistan_FY2025.pdf',
    type: 'MEMO',
    date: '2025-11-20',
    description: 'State Council approval document for rolling over Pakistani sovereign loans for FY2025.',
    tag: 'Finance',
    tagColor: '#ffff00',
    decryptedContent: '💰 LOAN ROLLOVER APPROVED: Amount: $4.5B. Original maturity: Dec 2025. New maturity: Dec 2026. Interest rate: Unchanged (2.5%). Conditions: 1) No default on IPP payments. 2) ML-1 groundbreaking by Q1 2026. 3) Enhanced security protocols. Signatories: Finance Ministry, PBOC, State Council. IMF notification: Not required (bilateral).'
  },
  {
    filename: 'Summary_Report_Gwadar_Port_Naval_Access_Potential.secret',
    type: 'INTEL',
    date: '2025-11-18',
    description: 'Classified summary report on potential naval access arrangements at Gwadar Port.',
    tag: 'Naval',
    tagColor: '#ff4444',
    decryptedContent: '🚢 TOP SECRET: Subject: PLA Navy access to Gwadar. Assessment: Port infrastructure sufficient for destroyer-class vessels. Pakistani position: Unofficial support, public denial required. US/India response: Expected strong opposition. Recommendation: Gradual approach - start with "logistics support facility". Timeline: 2028-2030. Risk: HIGH (regional escalation).'
  },
  {
    filename: 'Letter_to_President_Xi_Jinping_Re_CPEC_Phase_II_Priorities.jpg',
    type: 'WIRE',
    date: '2025-11-15',
    description: 'Scanned letter to President Xi Jinping outlining Premier Li Qiang recommendations on CPEC Phase II priorities.',
    tag: 'Strategy',
    tagColor: '#00ffff',
    decryptedContent: '📜 LETTER TO PRESIDENT XI: Subject: CPEC Phase-II Strategic Direction. Recommendations: 1) Prioritize industrial relocation over new infrastructure. 2) Condition new loans on security improvements. 3) Accelerate Gwadar development (strategic value). 4) Balance IMF concerns with bilateral priorities. Request: Politburo review at Dec 2025 meeting.'
  },
  {
    filename: 'Economic_Stability_Assessment_Pakistan_Post_IMF.xlsx',
    type: 'REPORT',
    date: '2025-11-12',
    description: 'Economic stability assessment of Pakistan following IMF program implementation.',
    tag: 'Economy',
    tagColor: '#ff6600',
    decryptedContent: '📊 ASSESSMENT: GDP growth: 2.8% (recovering). Inflation: 12% (declining). Forex reserves: $9.2B (improving). IMF compliance: 82%. Debt-to-GDP: 78% (concerning). Risk rating: MODERATE. Outlook: Stable if IMF program continues. CPEC impact: Positive (infrastructure, jobs). Recommendation: Continue measured support, avoid overexposure.'
  },
  {
    filename: 'Speech_Draft_Boao_Forum_2026_BRI_Integration.doc',
    type: 'BRIEF',
    date: '2025-11-08',
    description: 'Draft speech for Premier Li Qiang at Boao Forum 2026 on BRI regional integration.',
    tag: 'Speech',
    tagColor: '#00ff00',
    decryptedContent: '🎤 SPEECH DRAFT: Theme: "BRI: Connecting Continents, Building Futures". Key messages: 1) CPEC as flagship success. 2) $62B investment in Pakistan. 3) 100,000+ jobs created. 4) Counter "debt trap" narrative. 5) Announce CPEC Phase-2 framework. Duration: 25 mins. Audience: 2,000 delegates from 60 countries.'
  },
  {
    filename: 'Action_Plan_China_Pakistan_Community_Shared_Future_2025-2029.pdf',
    type: 'MEMO',
    date: '2025-11-05',
    description: 'Five-year action plan for building China-Pakistan Community of Shared Future.',
    tag: 'Bilateral',
    tagColor: '#00ffff',
    decryptedContent: '📋 ACTION PLAN 2025-2029: Pillars: 1) Economic (CPEC Phase-2, $15B). 2) Security (counter-terrorism cooperation). 3) Cultural (student exchanges, 10,000/year). 4) Political (annual summits). 5) Regional (Afghanistan stability). Targets: Trade $30B by 2029, 50 industrial units in SEZs. Review: Annual bilateral summit.'
  },
  {
    filename: 'Invitation_List_Belt_and_Road_Summit_Heads_of_State.xlsx',
    type: 'INTEL',
    date: '2025-11-02',
    description: 'Classified invitation list for Belt and Road Summit 2026 showing confirmed heads of state.',
    tag: 'Summit',
    tagColor: '#ffff00',
    decryptedContent: '👥 BRF 2026 CONFIRMED: Total invitations: 140 countries. Heads of State confirmed: 38. Key attendees: Russia (Putin), Pakistan (Shehbaz), Saudi Arabia (MBS - tentative), Indonesia, Malaysia, Thailand. Notable declines: India, Japan, Australia. US: Observer status (downgrade). Pakistan slot: Day 1 plenary, bilateral with Xi Jinping.'
  }
];

// Documents for Zhou Haibing (MOFCOM Director General)
const ZHOU_HAIBING_DOCUMENTS: Document[] = [
  {
    filename: 'Update_Karot_Hydropower_Station_Operational_Data.xls',
    type: 'REPORT',
    date: '2025-11-25',
    description: 'Operational performance data update for Karot Hydropower Station since commercial operations began.',
    tag: 'Energy',
    tagColor: '#00ff00',
    decryptedContent: '⚡ KAROT HPP DATA: Capacity: 720 MW. Commercial operation: Jun 2022. YTD generation: 3.2 TWh. Capacity factor: 52%. Revenue: $185M. Issues: Sedimentation (7% above design), turbine blade erosion (Unit 2). Maintenance: Scheduled outage Feb 2026. Chinese O&M staff: 45. Transfer to Pakistan: 2052. Debt servicing: On track.'
  },
  {
    filename: 'Logistics_Bottlenecks_Report_Khunjerab_Pass.pdf',
    type: 'REPORT',
    date: '2025-11-22',
    description: 'Analysis of logistics bottlenecks at Khunjerab Pass affecting China-Pakistan trade flow.',
    tag: 'Logistics',
    tagColor: '#ff6600',
    decryptedContent: '🚛 KHUNJERAB BOTTLENECKS: Annual capacity: 15,000 trucks. Actual throughput: 8,200 (55%). Closure days: 120 (weather). Issues: 1) Single-lane sections (23km). 2) Customs processing: 8 hrs avg. 3) No cold storage. 4) Altitude sickness (workers). Recommendations: Tunnel feasibility study, 24/7 customs, bonded warehouse at Sost. Investment needed: $340M.'
  },
  {
    filename: 'Technical_Spec_ML-1_Rolling_Stock_Procurement.pptx',
    type: 'BRIEF',
    date: '2025-11-20',
    description: 'Technical specifications for rolling stock procurement under ML-1 Railway project.',
    tag: 'Rail',
    tagColor: '#00ffff',
    decryptedContent: '🚂 ROLLING STOCK SPECS: Locomotives: 75 units (CRRC Qingdao). Type: HXD3D electric (160 km/h). Passenger coaches: 230 (air-conditioned). Freight wagons: 800 (container-compatible). Total cost: $1.1B. Delivery: 2027-2030. Local assembly: 20% (Risalpur). Training: 500 Pakistan Railways staff. Warranty: 5 years. Spare parts depot: Lahore.'
  },
  {
    filename: 'Site_Inspection_Gwadar_Desalination_Plant_Defects.docx',
    type: 'MEMO',
    date: '2025-11-18',
    description: 'Site inspection report documenting defects found at Gwadar desalination plant.',
    tag: 'Gwadar',
    tagColor: '#ff4444',
    decryptedContent: '⚠️ DEFECTS REPORT: Facility: Gwadar Desalination (5 MGD). Inspection date: Nov 12, 2025. Defects: 1) RO membrane fouling (3 of 8 trains). 2) Brine discharge non-compliant (salinity 48 ppt vs 42 limit). 3) Power backup failure (2 incidents). 4) Corrosion on intake pipes. Contractor: CSCEC. Rectification cost: $4.2M. Timeline: 90 days. Warranty claim: Filed.'
  },
  {
    filename: 'Meeting_Record_Pakistan_Railways_Chairman_Nov_15.pdf',
    type: 'MEMO',
    date: '2025-11-15',
    description: 'Official meeting record with Pakistan Railways Chairman on ML-1 implementation coordination.',
    tag: 'Coordination',
    tagColor: '#00ff00',
    decryptedContent: '📝 MEETING RECORD: Date: Nov 15, 2025. Attendees: PR Chairman, MOFCOM DG Zhou, CREC VP. Agenda: ML-1 Phase-1 timeline. Outcomes: 1) Land handover: 85% by Dec 2025. 2) Station design: 12 finalized, 8 pending. 3) Signaling: ETCS Level 2 confirmed. 4) O&M training: 200 staff to China Q1 2026. Concerns: Pension liability for displaced PR staff. Next meeting: Dec 20.'
  },
  {
    filename: 'Route_Map_China_Europe_Railway_Express_Pakistan_Link.png',
    type: 'INTEL',
    date: '2025-11-12',
    description: 'Strategic route map for proposed China-Europe Railway Express link via Pakistan corridor.',
    tag: 'Strategy',
    tagColor: '#ffff00',
    decryptedContent: '🗺️ CRE PAKISTAN LINK: Proposed route: Kashgar → Khunjerab → Islamabad → Karachi → Gwadar (sea link to Middle East). Distance: 2,800 km. Transit time: 8 days (vs 45 days sea). Connectivity: Iran rail (Gwadar-Chabahar), Turkey (future). Cargo potential: 500,000 TEUs/year. Investment: $12B (integrated). Status: Pre-feasibility. Strategic value: VERY HIGH (BRI diversification).'
  },
  {
    filename: 'Proposal_Cold_Chain_Logistics_Network_CPEC_Route.pdf',
    type: 'BRIEF',
    date: '2025-11-10',
    description: 'Investment proposal for cold chain logistics network along CPEC route for agricultural exports.',
    tag: 'Agriculture',
    tagColor: '#00ff00',
    decryptedContent: '🥶 COLD CHAIN PROPOSAL: Investment: $280M. Facilities: 8 cold storage hubs (Gilgit, Peshawar, Lahore, Multan, Sukkur, Karachi, Gwadar, Kashgar). Capacity: 200,000 MT total. Products: Fruits (mango, cherry), seafood, dairy. Chinese partner: Sinotrans. Pakistan benefit: 40% reduction in post-harvest loss. Export potential: $500M/year to China. Timeline: 3 years. ROI: 12%.'
  },
  {
    filename: 'Orange_Line_Metro_Spare_Parts_Supply_Chain_Issues.xlsx',
    type: 'REPORT',
    date: '2025-11-08',
    description: 'Analysis of spare parts supply chain issues affecting Orange Line Metro operations.',
    tag: 'Metro',
    tagColor: '#ff6600',
    decryptedContent: '🚇 SUPPLY CHAIN ISSUES: System: Lahore Orange Line (27 km). Operator: Punjab Masstransit Authority. Issues: 1) Lead time for CRRC parts: 180 days (vs 45 contract). 2) Inventory stockout: 23 SKUs. 3) Forex delays (LC opening). 4) Customs clearance: 15 days avg. Impact: 3 trains grounded. Solution: Local warehousing, advance ordering. Cost: $8M for 2-year inventory.'
  },
  {
    filename: 'Security_Measures_Dasu_Dam_Construction_Site_Review.doc',
    type: 'INTEL',
    date: '2025-11-05',
    description: 'Review of security measures at Dasu Dam construction site following threat assessments.',
    tag: 'Security',
    tagColor: '#ff4444',
    decryptedContent: '🔒 DASU SECURITY REVIEW: Project: Dasu HPP (4,320 MW). Chinese workers: 1,200. Security forces: 2 SSG companies, 400 FC, 150 police. Measures: Biometric access, drone surveillance (4 units), blast-proof accommodation. Threat level: HIGH (TTP, local insurgents). Post-2021 upgrades: Armored vehicles (8), safe rooms (12), medevac protocol. Assessment: ADEQUATE but recommend helicopter QRF.'
  },
  {
    filename: 'Visa_Processing_Delays_Chinese_Technicians_List.xls',
    type: 'REPORT',
    date: '2025-11-02',
    description: 'List of Chinese technicians facing visa processing delays affecting CPEC project timelines.',
    tag: 'Personnel',
    tagColor: '#ffff00',
    decryptedContent: '👥 VISA DELAYS: Total applications pending: 487. Duration: 45-90 days (target: 15 days). Projects affected: ML-1 (156), Dasu (89), Kohala (78), SEZs (164). Bottlenecks: 1) Security clearance (ISI). 2) Work permit (BOI). 3) Provincial NOC (Balochistan, KP). Impact: $12M delay costs. MOFCOM intervention: Note to Foreign Ministry. Resolution target: Dec 15, 2025.'
  }
];

// Documents for Sun Weidong (Vice Foreign Minister)
const SUN_WEIDONG_DOCUMENTS: Document[] = [
  {
    filename: 'Diplomatic_Cable_Islamabad_Political_Stability_Forecast.pdf',
    type: 'WIRE',
    date: '2025-11-26',
    description: 'Classified diplomatic cable assessing political stability forecast for Pakistan and implications for CPEC.',
    tag: 'Political',
    tagColor: '#ff4444',
    decryptedContent: '🔐 STABILITY FORECAST: Assessment period: 2025-2027. Political risk: MODERATE-HIGH. Factors: Coalition fragility (PML-N + PPP), PTI agitation, IMF conditionalities. Military stance: Supportive of CPEC. Scenarios: 1) Status quo (60%). 2) Early elections (25%). 3) Technocrat govt (15%). Recommendation: Maintain engagement with all stakeholders. CPEC impact: Projects continue regardless of govt change.'
  },
  {
    filename: 'Talking_Points_for_Meeting_Foreign_Secretary_Amna_Baloch.docx',
    type: 'BRIEF',
    date: '2025-11-24',
    description: 'Prepared talking points for Vice Foreign Minister meeting with Pakistan Foreign Secretary.',
    tag: 'Diplomatic',
    tagColor: '#00ff00',
    decryptedContent: '🎤 TALKING POINTS: Meeting: VFM Sun - FS Amna Baloch. Date: Nov 26, 2025. Topics: 1) Security of Chinese nationals (express concern, request action plan). 2) CPEC Phase-2 (reaffirm commitment). 3) Kashmir (support Pakistan position). 4) Afghanistan (joint approach). 5) UN coordination. Avoid: Uyghur topic, IMF discussions. Tone: Warm but firm on security.'
  },
  {
    filename: 'Report_on_Anti-China_Sentiment_in_Balochistan_Media.pptx',
    type: 'INTEL',
    date: '2025-11-22',
    description: 'Intelligence report analyzing anti-China sentiment trends in Balochistan media and social networks.',
    tag: 'OSINT',
    tagColor: '#ff4444',
    decryptedContent: '📊 SENTIMENT ANALYSIS: Region: Balochistan. Period: Sep-Nov 2025. Sources: 45 media outlets, social media. Findings: 1) Negative sentiment: 68% (up 12%). 2) Key narratives: Resource exploitation, Gwadar fishermen displacement, jobs for locals. 3) BLA propaganda: 15 videos (500K+ views). 4) Influencers: 8 identified (diaspora-linked). Recommendation: Counter-narrative campaign, local CSR increase.'
  },
  {
    filename: 'Consular_Protection_Protocols_Karachi_Consulate.pdf',
    type: 'MEMO',
    date: '2025-11-20',
    description: 'Updated consular protection protocols for Chinese Consulate General in Karachi.',
    tag: 'Consular',
    tagColor: '#00ffff',
    decryptedContent: '🏛️ CONSULAR PROTOCOLS: Post-2018 attack upgrades: Perimeter wall (12ft), blast barriers, CCTV (48 cameras), armed guards (24/7). Emergency procedures: 1) Shelter-in-place protocol. 2) Evacuation route (3 options). 3) Safe haven: Naval base (10 min). 4) Medevac: Aga Khan Hospital MOU. Staff: 45 diplomatic, 120 local. Drill frequency: Quarterly. Last drill: Oct 2025 (satisfactory).'
  },
  {
    filename: 'Joint_Working_Group_International_Cooperation_Agenda.doc',
    type: 'MEMO',
    date: '2025-11-18',
    description: 'Agenda for Joint Working Group on International Cooperation between China and Pakistan foreign ministries.',
    tag: 'JWG',
    tagColor: '#00ff00',
    decryptedContent: '📋 JWG AGENDA: Date: Dec 5, 2025. Venue: Beijing. Co-chairs: VFM Sun, Addl FS Pakistan. Agenda: 1) UN voting coordination (UNGA 2026). 2) SCO summit prep. 3) OIC engagement. 4) Afghanistan policy alignment. 5) Climate cooperation (COP31). 6) Counter-terrorism intel sharing. Deliverables: Joint statement, 3 MOUs. Delegation size: 8 each.'
  },
  {
    filename: 'Press_Statement_Re_Terror_Attack_Prevention.pdf',
    type: 'WIRE',
    date: '2025-11-15',
    description: 'Draft press statement following prevention of terror attack targeting Chinese engineers.',
    tag: 'Security',
    tagColor: '#ff4444',
    decryptedContent: '📰 PRESS STATEMENT (DRAFT): "China commends Pakistan security forces for preventing attack on Chinese personnel in [LOCATION]. We appreciate Pakistan\'s commitment to protecting our citizens. Both nations remain united against terrorism. Enhanced security cooperation discussed at highest levels." Note: Release only if media reports. Coordinate with ISPR. Avoid: Specifics on target, casualties, methods.'
  },
  {
    filename: 'Profile_New_Pakistani_Corps_Commanders_2025.docx',
    type: 'INTEL',
    date: '2025-11-12',
    description: 'Intelligence profiles on newly appointed Pakistani Corps Commanders relevant to CPEC security.',
    tag: 'Profile',
    tagColor: '#ffff00',
    decryptedContent: '👤 CORPS COMMANDERS 2025: 1) Quetta Corps: Lt Gen Faiz Hameed - Pro-China, visited Beijing 2023. 2) Peshawar Corps: Lt Gen Ahmed Khan - CT specialist, neutral on CPEC. 3) Karachi Corps: Lt Gen Naveed Mukhtar - Intel background, security-focused. Assessment: Overall positive for CPEC security. Engagement recommendation: Host delegation to China, PLA-PA exercises. Watch: KP corps for TTP coordination.'
  },
  {
    filename: 'Event_Schedule_75th_Anniversary_Diplomatic_Ties.xlsx',
    type: 'REPORT',
    date: '2025-11-10',
    description: 'Event schedule for 75th anniversary celebrations of China-Pakistan diplomatic relations in 2026.',
    tag: 'Cultural',
    tagColor: '#00ff00',
    decryptedContent: '🎉 75TH ANNIVERSARY EVENTS (2026): Jan: Launch ceremony (Beijing + Islamabad). Mar: Art exchange. May: Trade expo (Shanghai). Jul: Youth delegation (500 students). Aug: Film festival. Oct: Sports games. Dec: State banquet. Budget: $12M (shared). VIP participation: Presidents, PMs. Media coverage: CCTV, PTV joint broadcast. Theme: "Iron Brothers: 75 Years".'
  },
  {
    filename: 'Briefing_US_Influence_on_Pakistan_CPEC_Policy.secret',
    type: 'INTEL',
    date: '2025-11-08',
    description: 'Classified briefing on US influence operations affecting Pakistan CPEC policy decisions.',
    tag: 'Geopolitics',
    tagColor: '#ff6600',
    decryptedContent: '🇺🇸 US INFLUENCE ASSESSMENT: Activities: 1) USAID "alternative development" in Gwadar ($50M). 2) Think tank funding (RAND, Hudson - anti-CPEC narratives). 3) IMF conditionalities (restrict Chinese loans). 4) Defense cooperation expansion (F-16 package). Impact: Moderate - slowing not stopping CPEC. Pakistan stance: Balancing act. Counter-measures: Increase soft power, media engagement, scholarship expansion.'
  },
  {
    filename: 'Emergency_Contact_List_Chinese_Embassy_Islamabad.xls',
    type: 'REPORT',
    date: '2025-11-05',
    description: 'Updated emergency contact list for Chinese Embassy Islamabad and key Pakistani counterparts.',
    tag: 'Admin',
    tagColor: '#888888',
    decryptedContent: '📞 EMERGENCY CONTACTS: Ambassador: [REDACTED]. DCM: [REDACTED]. Defense Attaché: [REDACTED]. Pakistan contacts: NSA office (direct line), ISI DG (secure), Foreign Secretary (mobile), NDMA Chairman. Hospitals: PIMS, Shifa. Evacuation: PIA priority, PLAAF standby (Kashgar). Media: Xinhua bureau, APP. Protocol: 3-tier escalation. Update frequency: Monthly.'
  }
];

// Documents for Jiang Zaidong (Chinese Ambassador to Pakistan)
const JIANG_ZAIDONG_DOCUMENTS: Document[] = [
  {
    filename: 'Daily_SitRep_Security_Threats_Chinese_Nationals.pdf',
    type: 'INTEL',
    date: '2025-11-28',
    description: 'Daily situation report on security threats to Chinese nationals across Pakistan.',
    tag: 'Security',
    tagColor: '#ff4444',
    decryptedContent: '🔴 DAILY SITREP (Nov 28): Threat level: ELEVATED. Active threats: 3 (Balochistan-2, KP-1). Chinese nationals in-country: 7,847. Incidents (24hr): 0. Near-misses: 1 (suspicious vehicle near Sahiwal plant - cleared). Travel advisories: Gwadar (restricted), Turbat (no-go), Peshawar (escort required). ISI coordination: Active. Next briefing: 0800 Nov 29.'
  },
  {
    filename: 'Guest_List_New_Gwadar_Intl_Airport_Handover_Ceremony.xlsx',
    type: 'MEMO',
    date: '2025-11-26',
    description: 'VIP guest list for New Gwadar International Airport handover ceremony.',
    tag: 'Event',
    tagColor: '#00ffff',
    decryptedContent: '✈️ AIRPORT HANDOVER CEREMONY: Date: Dec 15, 2025. Venue: NGIA Terminal. Chinese delegation: Ambassador Jiang, CACC Chairman, CSCEC VP (28 total). Pakistan VIPs: PM Shehbaz, CM Balochistan, Aviation Minister. International: UAE Ambassador, Saudi chargé. Media: 45 accredited. Security: SSG perimeter, Chinese PSO for Ambassador. Gifts: Aircraft model (gold-plated). Reception: 200 guests.'
  },
  {
    filename: 'Photos_Visit_to_Confucius_Institute_Punjab_University.zip',
    type: 'REPORT',
    date: '2025-11-24',
    description: 'Photo documentation of Ambassador visit to Confucius Institute at Punjab University.',
    tag: 'Cultural',
    tagColor: '#00ff00',
    decryptedContent: '📸 VISIT DOCUMENTATION: Date: Nov 22, 2025. Location: CI Punjab University, Lahore. Activities: Classroom visit, calligraphy demo, student interaction. Students enrolled: 1,200 (up 15% YoY). Scholarships announced: 50 (CSC 2026). Media: Dawn, Express covered. Social media reach: 45K. Ambassador remarks: "Bridge of friendship". Follow-up: HSK exam center expansion proposal.'
  },
  {
    filename: 'Report_Local_Labor_Issues_Suki_Kinari_Dam.docx',
    type: 'REPORT',
    date: '2025-11-22',
    description: 'Report on local labor disputes and community issues at Suki Kinari Dam project.',
    tag: 'Labor',
    tagColor: '#ff6600',
    decryptedContent: '👷 LABOR ISSUES: Project: Suki Kinari HPP. Incidents: 2 (Nov 2025). Issue 1: Wage dispute (local vs Chinese differential). Resolution: 15% local wage increase. Issue 2: Land compensation (3 families). Status: Provincial govt mediating. Contractor response: CGGC HR director deployed. Community relations: Deteriorating (4.2/10 survey). Recommendation: Increase local hiring (target 60%), CSR fund expansion.'
  },
  {
    filename: 'Media_Monitoring_Dawn_Geo_Express_Nov_26.pdf',
    type: 'INTEL',
    date: '2025-11-26',
    description: 'Daily media monitoring report covering CPEC and China-related coverage in major Pakistani outlets.',
    tag: 'Media',
    tagColor: '#ffff00',
    decryptedContent: '📰 MEDIA MONITORING (Nov 26): Dawn: 3 articles (2 neutral, 1 negative - debt concerns). Geo: 2 segments (positive - ML-1 progress). Express Tribune: Op-ed critical of SEZ delays. The News: Gwadar airport feature (positive). Social media: #CPEC trending (45K mentions). Negative narratives: Debt trap (23%), job displacement (18%). Response needed: Op-ed placement on Phase-2 benefits.'
  },
  {
    filename: 'Visa_Issuance_Stats_Pakistani_Students_2025.xls',
    type: 'REPORT',
    date: '2025-11-20',
    description: 'Statistics on student visa issuances to Pakistani nationals for Chinese universities in 2025.',
    tag: 'Education',
    tagColor: '#00ff00',
    decryptedContent: '🎓 STUDENT VISAS 2025: Total issued: 8,450 (YTD). Scholarships: CSC (2,100), Provincial (1,200), University (5,150). Top destinations: Beijing (1,800), Shanghai (1,200), Wuhan (980). Fields: Engineering (42%), Medicine (28%), Business (18%). Processing time: 12 days avg. Rejection rate: 3.2%. Trend: +18% vs 2024. Target 2026: 10,000. Embassy recommendation: Expand Mandarin pre-departure training.'
  },
  {
    filename: 'Proposal_Ramadan_Food_Aid_Packages_Gwadar.pptx',
    type: 'BRIEF',
    date: '2025-11-18',
    description: 'Soft power initiative proposal for Ramadan food aid distribution in Gwadar communities.',
    tag: 'Soft Power',
    tagColor: '#00ffff',
    decryptedContent: '🌙 RAMADAN AID PROPOSAL: Target: 5,000 families (Gwadar, Turbat, Pasni). Package: Rice (10kg), flour (10kg), oil (5L), dates, sugar. Cost: $180,000. Partners: COPHC, Chinese companies, Pakistan Red Crescent. Distribution: Local mosques (coordinated with clerics). Media: Low-key (avoid "buying loyalty" narrative). Timeline: Ramadan 2026 (Feb-Mar). Objective: Improve local sentiment, counter BLA narrative. Ambassador approval: Pending.'
  },
  {
    filename: 'Scan_Letter_Interior_Ministry_Bulletproof_Vehicles_Permit.jpg',
    type: 'MEMO',
    date: '2025-11-15',
    description: 'Scanned permit letter from Interior Ministry for bulletproof vehicles for Embassy use.',
    tag: 'Security',
    tagColor: '#ff4444',
    decryptedContent: '🚗 VEHICLE PERMIT: Reference: MOI/SEC/2025/4521. Approval: 8 additional armored vehicles (B6+ rating). Vehicles: Toyota Land Cruiser (4), Mercedes S-Class (2), BMW X5 (2). Import duty: Waived (diplomatic). Registration: Islamabad (CD plates). Deployment: Ambassador (2), DCM (1), Security (3), Pool (2). Validity: 5 years. Condition: Route notification to SSU for movements outside Islamabad.'
  },
  {
    filename: 'Evaluation_Pak_China_Friendship_Hospital_Staffing.pdf',
    type: 'REPORT',
    date: '2025-11-12',
    description: 'Staffing evaluation report for Pak-China Friendship Hospital in Gwadar.',
    tag: 'Healthcare',
    tagColor: '#00ff00',
    decryptedContent: '🏥 HOSPITAL EVALUATION: Facility: PCF Hospital Gwadar (300 beds). Current staff: 45 doctors (12 Chinese, 33 Pakistani), 120 nurses, 80 support. Occupancy: 42%. Services: General, surgery, OB-GYN, pediatrics. Issues: 1) Specialist shortage (cardio, neuro). 2) Equipment maintenance delays. 3) Local doctor retention (salaries). Chinese medical team rotation: 6-month cycles. Recommendation: Increase stipends, add telemedicine link to Shanghai.'
  },
  {
    filename: 'Embassy_Budget_Security_Upgrades_2026.xlsx',
    type: 'REPORT',
    date: '2025-11-10',
    description: 'Proposed budget for Embassy security infrastructure upgrades in 2026.',
    tag: 'Budget',
    tagColor: '#ff6600',
    decryptedContent: '💰 SECURITY BUDGET 2026: Total request: $4.8M. Breakdown: Perimeter upgrade ($1.2M), CCTV expansion ($450K), Drone detection ($380K), Safe room construction ($650K), Armored vehicles ($1.5M), Personnel training ($280K), Contingency ($340K). Comparison: +45% vs 2025. Justification: Elevated threat environment, post-Karachi consulate review. MFA approval: Submitted Nov 5. Expected decision: Dec 2025.'
  }
];

// Function to get documents for a specific official
const getDocumentsForOfficial = (officialName: string): Document[] => {
  if (officialName.toLowerCase().includes('ahsan')) {
    return AHSAN_IQBAL_DOCUMENTS;
  }
  if (officialName.toLowerCase().includes('zheng')) {
    return ZHENG_SHANJIE_DOCUMENTS;
  }
  if (officialName.toLowerCase().includes('shehbaz') || officialName.toLowerCase().includes('sharif')) {
    return SHEHBAZ_SHARIF_DOCUMENTS;
  }
  if (officialName.toLowerCase().includes('awais') || officialName.toLowerCase().includes('sumra')) {
    return AWAIS_SUMRA_DOCUMENTS;
  }
  if (officialName.toLowerCase().includes('muzammil') || officialName.toLowerCase().includes('zia')) {
    return MUZAMMIL_ZIA_DOCUMENTS;
  }
  if (officialName.toLowerCase().includes('khalil') || officialName.toLowerCase().includes('hashmi')) {
    return KHALIL_HASHMI_DOCUMENTS;
  }
  if (officialName.toLowerCase().includes('li qiang') || officialName.toLowerCase().includes('li') && officialName.toLowerCase().includes('qiang')) {
    return LI_QIANG_DOCUMENTS;
  }
  if (officialName.toLowerCase().includes('zhou') || officialName.toLowerCase().includes('haibing')) {
    return ZHOU_HAIBING_DOCUMENTS;
  }
  if (officialName.toLowerCase().includes('sun') || officialName.toLowerCase().includes('weidong')) {
    return SUN_WEIDONG_DOCUMENTS;
  }
  if (officialName.toLowerCase().includes('jiang') || officialName.toLowerCase().includes('zaidong')) {
    return JIANG_ZAIDONG_DOCUMENTS;
  }
  // Return empty array for other officials (can be expanded later)
  return [];
};

const OfficialModal: React.FC<OfficialModalProps> = ({ official, isVisible, onClose }) => {
  const [decryptedDocs, setDecryptedDocs] = useState<Set<string>>(new Set());
  const [decryptingDoc, setDecryptingDoc] = useState<string | null>(null);

  if (!isVisible || !official) return null;

  const documents = getDocumentsForOfficial(official.name);

  const handleDecrypt = async (filename: string) => {
    setDecryptingDoc(filename);
    
    // Simulate decryption process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setDecryptedDocs(prev => new Set([...prev, filename]));
    setDecryptingDoc(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      fontFamily: 'monospace'
    }}>
      <div style={{
        width: '900px',
        maxHeight: '90vh',
        background: 'rgba(0, 0, 0, 0.95)',
        border: '2px solid #00ffff',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            background: 'none',
            border: 'none',
            color: '#00ffff',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px',
            zIndex: 1
          }}
        >
          ✕
        </button>

        {/* Top section - Official info */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #333',
          padding: '25px 20px',
          minHeight: '220px'
        }}>
          {/* Left side - Image */}
          <div style={{
            width: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '25px'
          }}>
            <div style={{
              width: '160px',
              height: '200px',
              background: '#1a1a1a',
              border: '2px solid #00ffff',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img
                src={`/assets/${official.imageFileName}`}
                alt={official.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `
                    <div style="color: #666; font-size: 10px; text-align: center; padding: 10px;">
                      IMAGE<br/>NOT AVAILABLE
                    </div>
                  `;
                }}
              />
            </div>
          </div>

          {/* Right side - Details */}
          <div style={{
            flex: 1,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '12px'
          }}>
            {/* Country flag and name */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '5px'
            }}>
              <span style={{ fontSize: '20px', marginRight: '12px' }}>
                {official.country === 'pakistan' ? '🇵🇰' : '🇨🇳'}
              </span>
              <h3 style={{
                color: official.country === 'pakistan' ? '#00ff00' : '#ffff00',
                fontSize: '24px',
                margin: 0,
                fontWeight: 'bold'
              }}>
                {official.name}
              </h3>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#00ffff', fontSize: '12px', letterSpacing: '1px' }}>POSITION: </span>
              <span style={{ color: '#ccc', fontSize: '14px' }}>{official.title}</span>
            </div>

            {/* Role */}
            {official.role && (
              <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#00ffff', fontSize: '12px', letterSpacing: '1px' }}>ROLE: </span>
                <span style={{ color: '#ccc', fontSize: '14px', fontStyle: 'italic' }}>{official.role}</span>
              </div>
            )}

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#00ff00',
                animation: 'pulse 1.5s ease-in-out infinite alternate'
              }}></div>
              <span style={{ color: '#00ff00', fontSize: '10px', letterSpacing: '1px' }}>
                ACTIVE OFFICIAL
              </span>
            </div>
          </div>
        </div>

        {/* Documents section */}
        {documents.length > 0 && (
          <div style={{
            maxHeight: '350px',
            overflow: 'auto',
            padding: '15px 20px'
          }}>
            {/* Section header */}
            <div style={{
              color: '#ff4444',
              fontSize: '12px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              marginBottom: '12px',
              textTransform: 'uppercase'
            }}>
              INTERCEPTED INTEL
            </div>

            {/* Documents list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {documents.map((doc, index) => (
                <div key={index} style={{
                  background: 'rgba(0, 50, 50, 0.3)',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  padding: '10px 12px',
                  borderLeft: '3px solid #00ffff'
                }}>
                  {/* Document header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '6px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: '3px'
                      }}>
                        {doc.filename.replace(/_/g, ' ').replace(/\.[^/.]+$/, '').toUpperCase().substring(0, 35)}
                        {doc.filename.length > 35 ? '...' : ''} // STATUS RPT
                      </div>
                      <div style={{
                        color: '#00ffff',
                        fontSize: '10px'
                      }}>
                        {doc.type} | {doc.date}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDecrypt(doc.filename)}
                      disabled={decryptedDocs.has(doc.filename) || decryptingDoc === doc.filename}
                      style={{
                        background: decryptedDocs.has(doc.filename) 
                          ? 'rgba(0, 255, 0, 0.2)' 
                          : 'transparent',
                        border: `1px solid ${decryptedDocs.has(doc.filename) ? '#00ff00' : '#00ffff'}`,
                        color: decryptedDocs.has(doc.filename) ? '#00ff00' : '#00ffff',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: decryptedDocs.has(doc.filename) ? 'default' : 'pointer',
                        fontFamily: 'monospace',
                        letterSpacing: '1px',
                        minWidth: '80px'
                      }}
                    >
                      {decryptingDoc === doc.filename 
                        ? 'DECRYPTING...' 
                        : decryptedDocs.has(doc.filename) 
                          ? '✓ DECRYPTED' 
                          : 'DECRYPT'}
                    </button>
                  </div>

                  {/* Document description */}
                  <div style={{
                    color: '#999',
                    fontSize: '11px',
                    lineHeight: '1.3',
                    marginBottom: '6px'
                  }}>
                    {doc.description}
                  </div>

                  {/* Tag */}
                  <div style={{
                    display: 'inline-block',
                    background: doc.tagColor,
                    color: '#000',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '9px',
                    fontWeight: 'bold'
                  }}>
                    {doc.tag}
                  </div>

                  {/* Decrypted content - shown after decrypt */}
                  {decryptedDocs.has(doc.filename) && (
                    <div style={{
                      marginTop: '8px',
                      padding: '10px',
                      background: 'rgba(0, 255, 0, 0.1)',
                      border: '1px solid rgba(0, 255, 0, 0.3)',
                      borderRadius: '4px'
                    }}>
                      <div style={{
                        color: '#00ff00',
                        fontSize: '9px',
                        letterSpacing: '1px',
                        marginBottom: '6px',
                        fontWeight: 'bold'
                      }}>
                        🔓 DECRYPTED CONTENT
                      </div>
                      <div style={{
                        color: '#ccc',
                        fontSize: '11px',
                        lineHeight: '1.5'
                      }}>
                        {doc.decryptedContent}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No documents message */}
        {documents.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '14px', marginBottom: '10px' }}>NO INTERCEPTED INTEL AVAILABLE</div>
            <div style={{ fontSize: '11px' }}>Intelligence gathering in progress...</div>
          </div>
        )}

        {/* CSS Animation */}
        <style>
          {`
            @keyframes pulse {
              from { opacity: 1; }
              to { opacity: 0.3; }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default OfficialModal;
