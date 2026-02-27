# SENTINEL v3.0: AUDIT EXECUTION & REPORTING

## 1. The Execution Flow
1.  **Scoping:** Auditor selects processes from the Universe.
2.  **Snapshot:** System creates a JSONB snapshot of the RKM (Immutability).
3.  **Fieldwork:** Auditor tests controls (Pass/Fail) and raises Findings.
4.  **Grading:** System auto-calculates the grade based on the "Methodology Settings".

## 2. Dynamic Workpapers (JSONB)
* Unlike v2's rigid SQL tables, v3 uses a Hybrid Schema.
* **Standard Fields:** ID, Title, Status (SQL Columns).
* **Flexible Fields:** "Evidence Links", "Custom Ratings", "Specific Questionnaires" (JSONB).
* **Benefit:** Different audit types (IT vs. Branch) can have completely different data structures without database migration.

## 3. Reporting
* **Real-time:** The Dashboard is the report. No need to "Generate PDF" to see the status.
* **Export:** PDF generation is done via a server-side rendering service (Puppeteer) preserving the visual fidelity of the React components.
