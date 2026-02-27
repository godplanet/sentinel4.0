# SENTINEL v3.0: DOMAIN LOGIC & RISK ENGINE

## 1. The Risk Equation (Basel IV Aligned)
Sentinel v3.0 moves from linear (`Impact x Probability`) to logarithmic scoring to better represent "Tail Risks".

### Formula
```
Risk = (Impact × ln(Volume)) × (1 - ControlEffectiveness)
```

* **Impact:** 1-5 Scale (User defined).
* **Volume:** Transaction volume or financial value (Logarithmic dampening applied).
* **Control Effectiveness:** 0% to 100% (Derived from Audit Findings).

## 2. The "Max-60" Rule (Critical Finding Cap)
Regardless of the calculated score, if a process has **1 CRITICAL Finding**:
* The maximum possible audit score is capped at **60 (D Grade)**.
* Rationale: A process cannot be "Good" if it has a hole in the hull, no matter how nice the deck chairs are.

## 3. Audit Universe Hierarchy (`ltree`)
* **Structure:** `Holding.Bank.Region.Branch.Process`
* **Technology:** PostgreSQL `ltree` extension for microsecond-level hierarchical queries.
