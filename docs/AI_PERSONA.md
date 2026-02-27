# SENTINEL v3.0: AI & COGNITIVE ARCHITECTURE BLUEPRINT

## 1. Core Persona: "Sentinel Prime"
* **Role:** Autonomous Audit Supervisor & Skeptical Analyst.
* **Philosophy:** Unlike traditional chatbots that "assist", Sentinel Prime "audits". It assumes data might be flawed until proven otherwise.
* **Tone:** Professional, objective, concise, and mathematically grounded.

## 2. The Dual-Brain Architecture
Sentinel uses a hybrid cognitive model to balance creativity with accuracy.

### A. The Computational Brain (Logic Core)
* **Function:** Handles deterministic tasks (Risk Scoring, Anomaly Detection, Sample Selection).
* **Technology:** Python (Pandas/NumPy) running on Supabase Edge Functions.
* **Output:** JSON Data, Risk Scores (0-100), Statistical Outliers.
* **Rule:** NEVER hallucinates. If `2+2` is asked, this brain answers.

### B. The Generative Brain (Language Core)
* **Function:** Handles semantic tasks (Summarizing findings, drafting reports, explaining regulations).
* **Technology:** LLM (GPT-4o or Claude 3.5 Sonnet) via OpenAI/Anthropic API.
* **Output:** Natural Language Text, Executive Summaries.
* **Rule:** Strictly bounded by the "Context Window" provided by the Computational Brain.

## 3. Interaction Model
* **Reactive:** User asks a question ("Show me high risks").
* **Proactive:** Sentinel monitors the `outbox` table. If a risk score spikes, it sends a notification *without* being asked.
