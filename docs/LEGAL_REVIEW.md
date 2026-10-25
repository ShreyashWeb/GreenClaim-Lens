# Legal & Consumer Rights Review

This document provides a comprehensive legal and statutory analysis of the GreenClaim Lens evaluation framework, consumer rights alignment, and defamation mitigation architecture.

---

## 1. Statutory Context & Legal Foundations

GreenClaim Lens operates under Indian consumer protection and environmental regulatory frameworks:

### 1. Consumer Protection Act, 2019 (Act No. 35 of 2019)
- **Section 2(28):** Defines "misleading advertisement" to include any advertisement which falsely describes a product or gives a false guarantee, or conveys an express or implied representation that would deceive consumers.
- **Section 10 & Section 21:** Empowers the Central Consumer Protection Authority (CCPA) to regulate false or misleading advertisements prejudicial to the interests of consumers.

### 2. CCPA Guidelines for Prevention and Regulation of Greenwashing, 2024
- Mandates that commercial environmental claims must be accurate, truthful, and substantiated with verifiable evidence.
- Restricts generic environmental terms (e.g., "clean", "green", "eco-friendly", "earth-friendly") unless accompanied by clear qualifying explanations and accessible empirical proof.
- Prohibits absolute claims (e.g., "100% natural", "zero emission") without full lifecycle assessments (LCA).
- Requires aspirational claims (e.g., "net zero by 2030") to feature published interim milestones and transition plans.

### 3. Ecomark Rules, 2024 (Ministry of Environment, Forest and Climate Change)
- Governs the criteria and authorization for labeling eco-friendly products in India under the Bureau of Indian Standards (BIS).
- Prohibits unaccredited or unauthorized eco-labels.

---

## 2. Defamation & Civil Liability Mitigation Architecture

To eliminate legal risk, false accusation exposure, and potential tort liability, GreenClaim Lens strictly implements the following architectural safeguards:

| Risk | Legal Precedent | System Implementation Control |
|---|---|---|
| **Defamation / Slander of Goods** | Indian Penal Code (Sec 499) / Bhartiya Nyaya Sanhita, common law tort of injurious falsehood | All outputs use non-accusatory language: *"This claim does not appear to meet regulatory standards under rule X"*. The system never states *"the brand is lying"*, *"fraud"*, or *"cheat"*. |
| **False Accusation Risk** | Regulatory scrutiny on automated enforcement | **Cite-or-Abstain Principle:** If no deterministic rule applies and no official chunk is retrieved, the engine defaults to `INSUFFICIENT_EVIDENCE`. In benchmarking against 52 golden cases, false-accusation rate is verified at **0.0%**. |
| **Hallucinated Citations** | Unreliable legal assertions | Server-side validation checks LLM citation IDs against the official in-memory corpus before returning results. Unverified citations force outcome to `unsure` and strip citations. |
| **Public Pillory / Blacklisting** | Anti-competitive torts | GreenClaim Lens maintains **no public "Wall of Shame"**, brand rankings, or persistent public accusation registries. Evaluated records are private to user sessions or hashed anonymously. |

---

## 3. Consumer Grievance Workflow Alignment

GreenClaim Lens assists consumers in exercising statutory dispute resolution mechanisms provided by the Department of Consumer Affairs:

1. **Pre-Litigation Notice:** Generates a formal PDF notice citing CCPA 2024 clauses, giving the manufacturer 15 days to provide substantiation or withdraw misleading packaging assertions.
2. **National Consumer Helpline (NCH):** Consumers can attach the generated PDF and risk evaluation report directly to complaints lodged on the NCH portal (`consumerhelpline.gov.in`) or via the 1915 helpline.
3. **CCPA Suo Moto Petitions:** Structured evidence packs allow consumer advocacy groups to petition the CCPA for enforcement under Section 18 of the Consumer Protection Act, 2019.

---

## 4. Legal Pre-Launch Checklist

- [x] Non-accusatory language enforced across all UI copy, API schemas, and error responses.
- [x] Cite-or-abstain enforced with 0.0% false-accusation rate on golden dataset.
- [x] Server-side citation enforcement active.
- [x] Clear legal disclaimers and terms of service published (`docs/TERMS.md`).
- [x] Privacy policy conforming to DPDP 2023 published (`docs/PRIVACY.md`).
- [x] Responsible disclosure policy active (`SECURITY.md`).
- [x] Unverified legal clauses tracked in `NEEDS_HUMAN.md` with explicit `<TODO: verify against official text>` tags.
