import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const palettes = [
  { "--legacy-bg": "#ddd8ce", "--legacy-panel": "#f6f1e7", "--legacy-nav": "#d2cabd", "--legacy-grid-head": "#d8d0c3", "--legacy-active": "#7a4b1d" },
  { "--legacy-bg": "#d4d8df", "--legacy-panel": "#eef1f6", "--legacy-nav": "#c7cfdb", "--legacy-grid-head": "#cfd8e5", "--legacy-active": "#2c4e77" },
  { "--legacy-bg": "#dadade", "--legacy-panel": "#f2f2f6", "--legacy-nav": "#cecee0", "--legacy-grid-head": "#d6d6e7", "--legacy-active": "#5f4d88" },
  { "--legacy-bg": "#d6ddd6", "--legacy-panel": "#eef4ee", "--legacy-nav": "#c7d3c7", "--legacy-grid-head": "#cedccb", "--legacy-active": "#3c6f3a" },
  { "--legacy-bg": "#ddd6cc", "--legacy-panel": "#f5eee4", "--legacy-nav": "#d5cab9", "--legacy-grid-head": "#dfd2be", "--legacy-active": "#8a5a1f" },
  { "--legacy-bg": "#d5dce2", "--legacy-panel": "#edf2f7", "--legacy-nav": "#c7d2df", "--legacy-grid-head": "#d0dbe8", "--legacy-active": "#375f89" },
  { "--legacy-bg": "#d8d3cd", "--legacy-panel": "#f1ece6", "--legacy-nav": "#cbc1b8", "--legacy-grid-head": "#d8cbbd", "--legacy-active": "#6f402d" },
  { "--legacy-bg": "#d5d9d5", "--legacy-panel": "#edf1ed", "--legacy-nav": "#c5cec4", "--legacy-grid-head": "#d0d8cf", "--legacy-active": "#466645" },
  { "--legacy-bg": "#d4d8dc", "--legacy-panel": "#edf2f6", "--legacy-nav": "#c6ced7", "--legacy-grid-head": "#cfd8e2", "--legacy-active": "#2f5c73" },
  { "--legacy-bg": "#d8d8d2", "--legacy-panel": "#f1f1eb", "--legacy-nav": "#ccccbe", "--legacy-grid-head": "#d8d8c8", "--legacy-active": "#6d6b30" }
];

const apps = [
  {
    slug: "vendor-onboarding-desk",
    title: "Vendor Onboarding Desk 2008",
    summary: "W-9 intake, tax validation, bank setup checks, and ERP vendor master onboarding.",
    modules: [
      ["intake", "Intake", ["requestId", "vendorName", "taxId", "owner", "status"], { requestId: "VO-1001", vendorName: "Atlas Supply", taxId: "94-1022231", owner: "AP Ops", status: "New" }],
      ["validation", "Tax Validation", ["taxCase", "vendorName", "tinMatch", "jurisdiction", "status"], { taxCase: "TV-229", vendorName: "Atlas Supply", tinMatch: "Pass", jurisdiction: "US", status: "Cleared" }],
      ["banking", "Banking", ["bankCase", "vendorName", "accountType", "verification", "status"], { bankCase: "BK-81", vendorName: "Atlas Supply", accountType: "ACH", verification: "Micro-deposit", status: "Pending" }],
      ["master", "Vendor Master", ["vendorCode", "vendorName", "erpSystem", "owner", "status"], { vendorCode: "V-9098", vendorName: "Atlas Supply", erpSystem: "SAP ECC", owner: "MDM", status: "Queued" }],
      ["approvals", "Approvals", ["approvalId", "requestId", "approver", "slaDate", "status"], { approvalId: "APR-991", requestId: "VO-1001", approver: "Controller", slaDate: "2008-05-12", status: "Open" }]
    ]
  },
  {
    slug: "contract-renewal-tracker",
    title: "Contract Renewal Tracker 2007",
    summary: "Renewal deadlines, clause review packets, approval routing, and reminder workflows.",
    modules: [
      ["contracts", "Contracts", ["contractId", "counterparty", "renewalDate", "owner", "status"], { contractId: "CTR-780", counterparty: "Northwind Freight", renewalDate: "2007-10-02", owner: "Legal Ops", status: "Watch" }],
      ["clauses", "Clause Review", ["reviewId", "contractId", "riskClause", "reviewer", "status"], { reviewId: "CR-42", contractId: "CTR-780", riskClause: "Auto-renew", reviewer: "Counsel", status: "Open" }],
      ["reminders", "Reminders", ["reminderId", "contractId", "channel", "sendDate", "status"], { reminderId: "REM-88", contractId: "CTR-780", channel: "Email", sendDate: "2007-09-10", status: "Scheduled" }],
      ["approvals", "Approvals", ["approvalId", "contractId", "approver", "dueDate", "status"], { approvalId: "APR-650", contractId: "CTR-780", approver: "VP Legal", dueDate: "2007-09-22", status: "Pending" }],
      ["archives", "Archive", ["archiveId", "contractId", "location", "retention", "status"], { archiveId: "ARC-19", contractId: "CTR-552", location: "SharePoint", retention: "7y", status: "Stored" }]
    ]
  },
  {
    slug: "customer-refund-processing",
    title: "Customer Refund Processing 2009",
    summary: "Refund eligibility checks, payment reversals, GL adjustments, and customer notices.",
    modules: [
      ["requests", "Requests", ["refundId", "customer", "orderNo", "amount", "status"], { refundId: "RF-1102", customer: "Beacon Retail", orderNo: "SO-78110", amount: "219.00", status: "New" }],
      ["eligibility", "Eligibility", ["caseId", "refundId", "policyRule", "reviewer", "status"], { caseId: "EL-67", refundId: "RF-1102", policyRule: "30-day return", reviewer: "CS Lead", status: "Pass" }],
      ["payments", "Payment Reversal", ["paymentId", "refundId", "gateway", "postedDate", "status"], { paymentId: "PM-551", refundId: "RF-1102", gateway: "Chase Paymentech", postedDate: "2009-03-18", status: "Queued" }],
      ["gl", "GL Adjustments", ["journalId", "refundId", "account", "owner", "status"], { journalId: "JRN-312", refundId: "RF-1102", account: "402200", owner: "AR Ops", status: "Open" }],
      ["notices", "Customer Notices", ["noticeId", "refundId", "template", "channel", "status"], { noticeId: "NT-90", refundId: "RF-1102", template: "Refund Approved", channel: "Email", status: "Pending" }]
    ]
  },
  {
    slug: "utility-bill-reconciliation",
    title: "Utility Bill Reconciliation 2006",
    summary: "Invoice extraction, meter usage checks, variance matching, and payment batch preparation.",
    modules: [
      ["invoices", "Invoices", ["invoiceId", "provider", "billingPeriod", "amount", "status"], { invoiceId: "UT-9901", provider: "City Electric", billingPeriod: "2006-04", amount: "44,220", status: "Imported" }],
      ["meters", "Meter Reads", ["meterId", "site", "kwh", "readDate", "status"], { meterId: "MTR-41", site: "Plant 2", kwh: "191220", readDate: "2006-04-30", status: "Captured" }],
      ["variance", "Variance", ["varianceId", "invoiceId", "threshold", "analyst", "status"], { varianceId: "VAR-77", invoiceId: "UT-9901", threshold: "5%", analyst: "Energy Ops", status: "Review" }],
      ["batches", "Payment Batch", ["batchId", "invoiceCount", "runDate", "owner", "status"], { batchId: "BAT-12", invoiceCount: "8", runDate: "2006-05-02", owner: "AP", status: "Ready" }],
      ["audit", "Audit Trail", ["auditId", "event", "source", "timestamp", "status"], { auditId: "AUD-332", event: "Meter mismatch", source: "OCR", timestamp: "2006-05-01 08:42", status: "Open" }]
    ]
  },
  {
    slug: "timesheet-exception-resolver",
    title: "Timesheet Exception Resolver 2010",
    summary: "Missing punches, overtime rules, manager follow-ups, and payroll correction workflows.",
    modules: [
      ["exceptions", "Exceptions", ["exceptionId", "employee", "weekEnding", "type", "status"], { exceptionId: "TS-401", employee: "L. Price", weekEnding: "2010-07-16", type: "Missing OUT", status: "New" }],
      ["overtime", "Overtime Rules", ["ruleCase", "employee", "hours", "policy", "status"], { ruleCase: "OT-77", employee: "L. Price", hours: "46", policy: "Union A", status: "Flagged" }],
      ["manager", "Manager Follow-up", ["followupId", "employee", "manager", "dueDate", "status"], { followupId: "FU-93", employee: "L. Price", manager: "R. Kim", dueDate: "2010-07-19", status: "Pending" }],
      ["payroll", "Payroll Corrections", ["correctionId", "employee", "deltaHours", "owner", "status"], { correctionId: "PC-12", employee: "L. Price", deltaHours: "-2", owner: "Payroll", status: "Open" }],
      ["reports", "Exception Report", ["reportId", "period", "exceptions", "generatedBy", "status"], { reportId: "RPT-TS-9", period: "2010-W28", exceptions: "14", generatedBy: "BOT-TS", status: "Ready" }]
    ]
  },
  {
    slug: "travel-expense-audit",
    title: "Travel Expense Audit 2009",
    summary: "Receipt matching, policy flags, per diem checks, and escalation queue handling.",
    modules: [
      ["reports", "Expense Reports", ["reportId", "employee", "submittedOn", "amount", "status"], { reportId: "EXP-288", employee: "A. Singh", submittedOn: "2009-11-03", amount: "1,842", status: "Queued" }],
      ["receipts", "Receipt Match", ["matchId", "reportId", "lineItem", "matchScore", "status"], { matchId: "RC-12", reportId: "EXP-288", lineItem: "Hotel", matchScore: "98%", status: "Pass" }],
      ["policy", "Policy Flags", ["flagId", "reportId", "rule", "auditor", "status"], { flagId: "PF-61", reportId: "EXP-288", rule: "Meal cap", auditor: "T&E", status: "Open" }],
      ["perdiem", "Per Diem", ["calcId", "reportId", "cityBand", "variance", "status"], { calcId: "PD-10", reportId: "EXP-288", cityBand: "Tier 2", variance: "+35", status: "Review" }],
      ["escalations", "Escalations", ["escId", "reportId", "approver", "slaDate", "status"], { escId: "ESC-88", reportId: "EXP-288", approver: "Finance Mgr", slaDate: "2009-11-06", status: "Pending" }]
    ]
  },
  {
    slug: "freight-invoice-match",
    title: "Freight Invoice Match 2008",
    summary: "PO-BOL-invoice matching, accessorial validation, and freight dispute initiation.",
    modules: [
      ["invoices", "Carrier Invoices", ["invoiceId", "carrier", "proNo", "amount", "status"], { invoiceId: "FR-2201", carrier: "RoadEx", proNo: "PRO-9181", amount: "3,820", status: "Imported" }],
      ["match", "3-Way Match", ["matchId", "invoiceId", "poNo", "bolNo", "status"], { matchId: "MW-44", invoiceId: "FR-2201", poNo: "PO-77120", bolNo: "BOL-902", status: "Mismatch" }],
      ["accessorial", "Accessorial", ["chargeId", "invoiceId", "chargeType", "reviewer", "status"], { chargeId: "AC-72", invoiceId: "FR-2201", chargeType: "Fuel Surcharge", reviewer: "Logistics", status: "Open" }],
      ["disputes", "Disputes", ["disputeId", "invoiceId", "reason", "owner", "status"], { disputeId: "DSP-FR-7", invoiceId: "FR-2201", reason: "Weight delta", owner: "Freight AP", status: "Draft" }],
      ["settlement", "Settlement", ["settlementId", "invoiceId", "approvedAmount", "postDate", "status"], { settlementId: "SET-14", invoiceId: "FR-2201", approvedAmount: "3,510", postDate: "2008-09-02", status: "Pending" }]
    ]
  },
  {
    slug: "coi-monitor",
    title: "COI Monitor 2011",
    summary: "Certificate expiry tracking, collection reminders, and vendor compliance locks.",
    modules: [
      ["certificates", "Certificates", ["certificateId", "vendor", "expiryDate", "coverage", "status"], { certificateId: "COI-771", vendor: "Skyline Electric", expiryDate: "2011-12-01", coverage: "2M GL", status: "Expiring" }],
      ["reminders", "Reminders", ["reminderId", "certificateId", "daysBefore", "channel", "status"], { reminderId: "REM-COI-2", certificateId: "COI-771", daysBefore: "30", channel: "Email", status: "Scheduled" }],
      ["collection", "Document Collection", ["collectionId", "vendor", "requestedOn", "owner", "status"], { collectionId: "COL-50", vendor: "Skyline Electric", requestedOn: "2011-11-01", owner: "Risk", status: "Open" }],
      ["compliance", "Compliance", ["complianceId", "vendor", "rule", "decision", "status"], { complianceId: "CMP-20", vendor: "Skyline Electric", rule: "COI current", decision: "Lock", status: "Applied" }],
      ["exceptions", "Exceptions", ["exceptionId", "vendor", "exceptionType", "approver", "status"], { exceptionId: "EX-COI-1", vendor: "Skyline Electric", exceptionType: "Grace period", approver: "Risk VP", status: "Pending" }]
    ]
  },
  {
    slug: "new-hire-provisioning",
    title: "New Hire Provisioning 2010",
    summary: "Identity setup, access tickets, hardware checklists, and onboarding completion.",
    modules: [
      ["intake", "Hire Intake", ["hireId", "employeeName", "startDate", "department", "status"], { hireId: "NH-602", employeeName: "C. Watts", startDate: "2010-09-13", department: "Finance", status: "New" }],
      ["identity", "Identity", ["identityId", "hireId", "adAccount", "owner", "status"], { identityId: "ID-44", hireId: "NH-602", adAccount: "cwatts", owner: "IAM", status: "Queued" }],
      ["access", "Application Access", ["ticketId", "hireId", "application", "approver", "status"], { ticketId: "ACC-91", hireId: "NH-602", application: "SAP ECC", approver: "Dept Mgr", status: "Open" }],
      ["hardware", "Hardware", ["requestId", "hireId", "deviceType", "assignee", "status"], { requestId: "HW-38", hireId: "NH-602", deviceType: "Laptop", assignee: "IT Depot", status: "Allocated" }],
      ["completion", "Completion", ["checklistId", "hireId", "itemsDone", "owner", "status"], { checklistId: "CHK-77", hireId: "NH-602", itemsDone: "6/9", owner: "HRIS", status: "In Progress" }]
    ]
  },
  {
    slug: "license-permit-renewal",
    title: "License Permit Renewal 2007",
    summary: "Jurisdictional filing calendars, package preparation, and renewal submission tracking.",
    modules: [
      ["registry", "License Registry", ["licenseId", "entity", "jurisdiction", "renewalDate", "status"], { licenseId: "LIC-414", entity: "Plant 4", jurisdiction: "TX", renewalDate: "2007-12-15", status: "Due" }],
      ["packages", "Filing Packages", ["packageId", "licenseId", "documentSet", "owner", "status"], { packageId: "PKG-11", licenseId: "LIC-414", documentSet: "Annual", owner: "Compliance", status: "Draft" }],
      ["submissions", "Submissions", ["submissionId", "licenseId", "channel", "submittedOn", "status"], { submissionId: "SUB-98", licenseId: "LIC-414", channel: "Portal", submittedOn: "2007-12-02", status: "Sent" }],
      ["receipts", "Receipts", ["receiptId", "submissionId", "receiptNo", "receivedOn", "status"], { receiptId: "RCT-30", submissionId: "SUB-98", receiptNo: "TX-88211", receivedOn: "2007-12-03", status: "Posted" }],
      ["calendar", "Deadline Calendar", ["calendarId", "licenseId", "milestone", "dueDate", "status"], { calendarId: "CAL-71", licenseId: "LIC-414", milestone: "Final approval", dueDate: "2007-12-15", status: "Watch" }]
    ]
  },
  {
    slug: "collections-ptp-monitor",
    title: "Collections PTP Monitor 2011",
    summary: "Promise-to-pay schedules, follow-ups, status letters, and default escalation triggers.",
    modules: [
      ["promises", "Promises", ["promiseId", "customer", "promiseDate", "amount", "status"], { promiseId: "PTP-221", customer: "Metro Foods", promiseDate: "2011-08-20", amount: "9,000", status: "Active" }],
      ["followups", "Follow-ups", ["followupId", "promiseId", "collector", "dueDate", "status"], { followupId: "FU-PTP-8", promiseId: "PTP-221", collector: "R. James", dueDate: "2011-08-21", status: "Open" }],
      ["letters", "Letters", ["letterId", "customer", "template", "sendDate", "status"], { letterId: "LTR-18", customer: "Metro Foods", template: "Reminder", sendDate: "2011-08-19", status: "Queued" }],
      ["defaults", "Defaults", ["defaultId", "promiseId", "daysLate", "owner", "status"], { defaultId: "DF-10", promiseId: "PTP-199", daysLate: "5", owner: "Collections", status: "Escalate" }],
      ["queues", "Work Queues", ["queueId", "collector", "items", "region", "status"], { queueId: "Q-AR-2", collector: "R. James", items: "23", region: "Midwest", status: "Open" }]
    ]
  },
  {
    slug: "chargeback-response-workbench",
    title: "Chargeback Response Workbench 2010",
    summary: "Dispute evidence assembly, submission deadlines, and acquirer portal updates.",
    modules: [
      ["cases", "Cases", ["caseId", "cardNetwork", "receivedOn", "amount", "status"], { caseId: "CB-901", cardNetwork: "Visa", receivedOn: "2010-06-10", amount: "122.00", status: "Open" }],
      ["evidence", "Evidence", ["evidenceId", "caseId", "artifactType", "owner", "status"], { evidenceId: "EV-41", caseId: "CB-901", artifactType: "Delivery POD", owner: "Risk Ops", status: "Missing" }],
      ["deadlines", "Deadlines", ["deadlineId", "caseId", "responseBy", "bufferDays", "status"], { deadlineId: "DL-22", caseId: "CB-901", responseBy: "2010-06-18", bufferDays: "2", status: "Urgent" }],
      ["submissions", "Submissions", ["submissionId", "caseId", "portal", "submittedOn", "status"], { submissionId: "SUB-CB-5", caseId: "CB-901", portal: "Chase Orbital", submittedOn: "", status: "Draft" }],
      ["outcomes", "Outcomes", ["outcomeId", "caseId", "decision", "postedOn", "status"], { outcomeId: "OUT-13", caseId: "CB-801", decision: "Won", postedOn: "2010-05-30", status: "Closed" }]
    ]
  },
  {
    slug: "product-data-syndication",
    title: "Product Data Syndication 2011",
    summary: "Catalog normalization, channel mapping, batch exports, and upload retry management.",
    modules: [
      ["catalog", "Catalog", ["sku", "productName", "category", "owner", "status"], { sku: "SKU-8011", productName: "Valve Kit A", category: "Industrial", owner: "MDM", status: "Ready" }],
      ["mapping", "Channel Mapping", ["mappingId", "sku", "channel", "template", "status"], { mappingId: "MAP-72", sku: "SKU-8011", channel: "Amazon", template: "A-Flatfile", status: "Mapped" }],
      ["batches", "Export Batches", ["batchId", "channel", "recordCount", "runDate", "status"], { batchId: "BAT-SYN-2", channel: "Amazon", recordCount: "422", runDate: "2011-04-11", status: "Running" }],
      ["errors", "Error Queue", ["errorId", "batchId", "errorType", "assignee", "status"], { errorId: "ERR-29", batchId: "BAT-SYN-2", errorType: "Missing UPC", assignee: "Catalog Ops", status: "Open" }],
      ["retries", "Retry Queue", ["retryId", "errorId", "attempt", "nextRun", "status"], { retryId: "RT-99", errorId: "ERR-29", attempt: "2", nextRun: "2011-04-11 18:00", status: "Scheduled" }]
    ]
  },
  {
    slug: "supplier-scorecard-consolidator",
    title: "Supplier Scorecard Consolidator 2009",
    summary: "KPI file intake, normalization rules, score generation, and monthly distribution.",
    modules: [
      ["feeds", "KPI Feeds", ["feedId", "supplier", "period", "source", "status"], { feedId: "FD-901", supplier: "Prime Metals", period: "2009-08", source: "CSV", status: "Loaded" }],
      ["rules", "Normalization", ["ruleId", "metric", "formula", "owner", "status"], { ruleId: "NR-11", metric: "On-time", formula: "z-score", owner: "Procurement", status: "Active" }],
      ["scores", "Scores", ["scoreId", "supplier", "overall", "tier", "status"], { scoreId: "SC-771", supplier: "Prime Metals", overall: "82", tier: "B", status: "Published" }],
      ["exceptions", "Exceptions", ["exceptionId", "supplier", "metric", "analyst", "status"], { exceptionId: "SX-15", supplier: "Prime Metals", metric: "Defect rate", analyst: "Sourcing", status: "Review" }],
      ["distribution", "Distribution", ["distributionId", "period", "audience", "sentOn", "status"], { distributionId: "DST-44", period: "2009-08", audience: "Ops + Sourcing", sentOn: "2009-09-02", status: "Sent" }]
    ]
  },
  {
    slug: "warranty-claim-triage",
    title: "Warranty Claim Triage 2011",
    summary: "Claim intake validation, serial entitlement checks, and service assignment routing.",
    modules: [
      ["claims", "Claims", ["claimId", "customer", "productSerial", "submittedOn", "status"], { claimId: "WC-188", customer: "Hilltop Gas", productSerial: "SN-7711", submittedOn: "2011-10-08", status: "New" }],
      ["entitlement", "Entitlement", ["entitlementId", "claimId", "coverageType", "reviewer", "status"], { entitlementId: "EN-24", claimId: "WC-188", coverageType: "Standard", reviewer: "Warranty Ops", status: "Pass" }],
      ["triage", "Triage", ["triageId", "claimId", "failureType", "priority", "status"], { triageId: "TR-33", claimId: "WC-188", failureType: "Seal leak", priority: "High", status: "Assigned" }],
      ["service", "Service Assignment", ["assignmentId", "claimId", "provider", "targetDate", "status"], { assignmentId: "SV-71", claimId: "WC-188", provider: "Field West", targetDate: "2011-10-11", status: "Open" }],
      ["settlement", "Settlement", ["settlementId", "claimId", "settlementType", "owner", "status"], { settlementId: "ST-10", claimId: "WC-177", settlementType: "Credit", owner: "Claims", status: "Closed" }]
    ]
  },
  {
    slug: "training-attestation-hub",
    title: "Training Attestation Hub 2010",
    summary: "Training completion attestations, overdue reminders, and exception approvals.",
    modules: [
      ["learners", "Learners", ["learnerId", "employee", "org", "assignedCourses", "status"], { learnerId: "LR-118", employee: "N. Patel", org: "IT Ops", assignedCourses: "6", status: "Active" }],
      ["completions", "Completions", ["completionId", "learnerId", "course", "completedOn", "status"], { completionId: "CP-66", learnerId: "LR-118", course: "SOX Basics", completedOn: "2010-02-04", status: "Recorded" }],
      ["attestations", "Attestations", ["attestationId", "learnerId", "period", "result", "status"], { attestationId: "AT-200", learnerId: "LR-118", period: "2010-Q1", result: "Pending", status: "Open" }],
      ["overdue", "Overdue", ["overdueId", "learnerId", "daysLate", "manager", "status"], { overdueId: "OV-17", learnerId: "LR-102", daysLate: "9", manager: "D. Chen", status: "Escalated" }],
      ["exceptions", "Exceptions", ["exceptionId", "learnerId", "reason", "approver", "status"], { exceptionId: "EX-TR-4", learnerId: "LR-102", reason: "LOA", approver: "HR", status: "Pending" }]
    ]
  },
  {
    slug: "ap-statement-reconciliation",
    title: "AP Statement Reconciliation 2008",
    summary: "Vendor statement ingestion, open-item matching, and discrepancy case handling.",
    modules: [
      ["statements", "Statements", ["statementId", "vendor", "period", "balance", "status"], { statementId: "STMT-88", vendor: "Summit Travel", period: "2008-08", balance: "18,770", status: "Loaded" }],
      ["openitems", "Open Items", ["itemId", "statementId", "invoiceNo", "amount", "status"], { itemId: "OI-421", statementId: "STMT-88", invoiceNo: "INV-77102", amount: "1,220", status: "Unmatched" }],
      ["matching", "Matching", ["matchId", "itemId", "erpDoc", "analyst", "status"], { matchId: "MT-18", itemId: "OI-421", erpDoc: "51000881", analyst: "AP Recon", status: "Open" }],
      ["discrepancies", "Discrepancies", ["caseId", "vendor", "reason", "owner", "status"], { caseId: "DS-12", vendor: "Summit Travel", reason: "Price variance", owner: "AP", status: "Investigate" }],
      ["closures", "Closures", ["closureId", "caseId", "resolvedOn", "resolver", "status"], { closureId: "CL-77", caseId: "DS-09", resolvedOn: "2008-08-21", resolver: "AP Lead", status: "Closed" }]
    ]
  },
  {
    slug: "order-hold-release",
    title: "Order Hold Release 2011",
    summary: "Credit holds, fraud review handoffs, release approvals, and ERP hold updates.",
    modules: [
      ["orders", "Held Orders", ["orderNo", "customer", "holdType", "orderValue", "status"], { orderNo: "SO-99122", customer: "Apex Retail", holdType: "Credit", orderValue: "44,900", status: "On Hold" }],
      ["credit", "Credit Review", ["reviewId", "orderNo", "exposure", "analyst", "status"], { reviewId: "CR-291", orderNo: "SO-99122", exposure: "120,000", analyst: "Credit Ops", status: "Open" }],
      ["fraud", "Fraud Handoff", ["fraudCase", "orderNo", "riskScore", "owner", "status"], { fraudCase: "FRD-11", orderNo: "SO-99122", riskScore: "0.22", owner: "Risk Desk", status: "Clear" }],
      ["approvals", "Release Approvals", ["approvalId", "orderNo", "approver", "dueDate", "status"], { approvalId: "APR-H-4", orderNo: "SO-99122", approver: "Sales Mgr", dueDate: "2011-05-20", status: "Pending" }],
      ["erp", "ERP Updates", ["updateId", "orderNo", "transaction", "postedOn", "status"], { updateId: "UPD-60", orderNo: "SO-99011", transaction: "VKM3", postedOn: "2011-05-14", status: "Done" }]
    ]
  }
];

function appMainTemplate(app, palette) {
  const modules = app.modules.map(([id, label]) => ({ id, label }));
  const columns = Object.fromEntries(app.modules.map(([id, , col]) => [id, col]));
  const seed = Object.fromEntries(app.modules.map(([id, , , row]) => [id, [row]]));

  return `import "@legacy/shared-legacy-styles/legacy.css";
import { ensureSeed, loadSeed, saveSeed, makeId } from "@legacy/shared-mock-data";
import { appShell, dataGrid, panel } from "@legacy/shared-ui";

const namespace = "${app.slug}";
const modules = ${JSON.stringify(modules, null, 2)};
const columns = ${JSON.stringify(columns, null, 2)};
const palette = ${JSON.stringify(palette, null, 2)};

let activeModule = modules[0].id;

ensureSeed(namespace, () => (${JSON.stringify(seed, null, 2)}));

function applyPalette() {
  const root = document.documentElement;
  Object.entries(palette).forEach(([name, value]) => root.style.setProperty(name, value));
}

function render() {
  applyPalette();
  const data = loadSeed(namespace, () => ({}));
  const moduleColumns = columns[activeModule];
  const rows = data[activeModule].map((row) => moduleColumns.map((key) => row[key]));
  const grid = dataGrid(moduleColumns, rows);

  const formFields = moduleColumns
    .map((field) => \`<label>\${field}</label><input class="legacy-field" name="\${field}" />\`)
    .join("");

  const contentHtml =
    panel("${app.summary}", grid) +
    panel("Entry Form", \`<form id="entry-form" data-module="\${activeModule}"><div class="legacy-form-grid">\${formFields}</div><div style="margin-top:8px; display:flex; gap:4px;"><button class="legacy-btn" type="submit">Save</button></div></form>\`);

  document.getElementById("app").innerHTML = appShell({
    title: "${app.title}",
    modules,
    activeModule,
    toolbarButtons: [
      { id: "toggle-first", label: "Toggle First" },
      { id: "delete-last", label: "Delete Last" },
      { id: "seed-reset", label: "Reset Seed" }
    ],
    statusText: \`System: \${namespace.toUpperCase()} | Session: OPERATOR-01\`,
    contentHtml
  });

  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.getAttribute("data-module");
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      const latest = loadSeed(namespace, () => ({}));

      if (action === "toggle-first" && latest[activeModule][0]) {
        const first = latest[activeModule][0];
        if (first.status) {
          first.status = first.status === "Open" ? "Closed" : first.status === "Pending" ? "Approved" : "Open";
        }
        saveSeed(namespace, latest);
      }

      if (action === "delete-last" && latest[activeModule].length > 0) {
        latest[activeModule].pop();
        saveSeed(namespace, latest);
      }

      if (action === "seed-reset") {
        localStorage.removeItem(\`legacy-demo:\${namespace}\`);
      }

      render();
    });
  });

  const form = document.getElementById("entry-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const moduleName = form.getAttribute("data-module");
    const moduleKeys = columns[moduleName];
    const row = {};
    const keyField = moduleKeys[0];

    moduleKeys.forEach((field) => {
      row[field] = formData.get(field)?.toString() || "";
    });

    if (!row[keyField]) {
      row[keyField] = makeId(moduleName.slice(0, 3).toUpperCase());
    }

    const latest = loadSeed(namespace, () => ({}));
    const index = latest[moduleName].findIndex((item) => item[keyField] === row[keyField]);
    if (index >= 0) {
      latest[moduleName][index] = row;
    } else {
      latest[moduleName].push(row);
    }

    saveSeed(namespace, latest);
    render();
  });
}

render();
`;
}

for (const [index, app] of apps.entries()) {
  const appRoot = join(root, "apps", app.slug);
  mkdirSync(join(appRoot, "src"), { recursive: true });

  const packageJson = {
    name: `@legacy/${app.slug}`,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build --base ./",
      test: `node -e \"console.log('${app.slug}: no tests yet')\"`
    },
    dependencies: {
      "@legacy/shared-legacy-styles": "workspace:*",
      "@legacy/shared-mock-data": "workspace:*",
      "@legacy/shared-ui": "workspace:*"
    },
    devDependencies: {
      vite: "^6.0.0"
    }
  };

  const readme = `# ${app.slug}\n\n${app.summary}\n\nRun:\n\n\`\`\`bash\ncorepack pnpm --filter @legacy/${app.slug} dev\n\`\`\`\n`;

  const indexHtml = `<!doctype html>\n<html>\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${app.title}</title>\n  </head>\n  <body>\n    <div id="app"></div>\n    <script type="module" src="./src/main.js"></script>\n  </body>\n</html>\n`;

  writeFileSync(join(appRoot, "package.json"), JSON.stringify(packageJson, null, 2) + "\n");
  writeFileSync(join(appRoot, "README.md"), readme);
  writeFileSync(join(appRoot, "index.html"), indexHtml);
  writeFileSync(join(appRoot, "src", "main.js"), appMainTemplate(app, palettes[index % palettes.length]));
}

console.log(`Generated ${apps.length} RPA-focused legacy app scaffolds.`);
