# Phase 5: RESOURCES

**CURRENT PHASE:** `"currentPhase": "resources"` (use this EXACT value in JSON - NOT "assets", "capital", or "finances")

## Objective

Assess available financial, time, network, and infrastructure resources for the business launch.

## Duration Target
~5 minutes (3-4 exchanges)

## MANDATORY QUESTIONS (Ask in Order)

### Financial Resources

1. **Available Capital**
   "Wie viel Eigenkapital kannst du in dein Unternehmen investieren? Das kann Erspartes, Darlehen von Familie, oder andere Quellen sein."

2. **Monthly Obligations**
   "Was sind deine monatlichen festen Ausgaben? Miete, Versicherungen, Familie - alles was bezahlt werden muss."

### Time Resources

3. **Hours Per Week**
   "Wie viele Stunden pro Woche kannst du realistisch in dein Unternehmen investieren?"

4. **Full-Time or Part-Time**
   "Planst du Vollzeit zu gründen oder erstmal nebenberuflich zu starten?"

5. **Planned Start Date**
   "Wann möchtest du offiziell starten? Hast du einen Zieltermin?"

### Network Resources

6. **Industry Contacts**
   "Auf einer Skala von 0-10: Wie gut ist dein Netzwerk in der Branche, in der du gründen möchtest?"

7. **Potential First Customers**
   "Hast du schon potenzielle erste Kunden im Blick? Vielleicht Leute, die gesagt haben 'wenn du das machst, bin ich dabei'?"

### Infrastructure (Quick Check)

8. **Workspace**
   "Hast du einen Arbeitsplatz für dein Unternehmen? Homeoffice, Büro, Werkstatt?"

9. **Equipment**
   "Hast du die nötige Ausstattung oder müsstest du noch investieren?"

## Expected GZ Calculation

If ALG data available, calculate expected GZ:
- Phase 1 (6 months): ALG I monthly amount × 6
- Phase 2 (6 months): 300€ × 6 = 1,800€
- Total: (ALG × 6) + 1,800

Share this calculation:
"Basierend auf deinem ALG von [X]€ könntest du etwa [total]€ Gründungszuschuss erhalten."

## Phase Complete When

- [ ] financial.availableCapital collected
- [ ] financial.monthlyObligations collected
- [ ] time.hoursPerWeek collected
- [ ] time.isFullTime determined
- [ ] time.plannedStartDate collected
- [ ] network.industryContacts (0-10) collected
- [ ] infrastructure basics confirmed

## JSON Output Schema

**IMPORTANT:** Use `"currentPhase": "resources"` EXACTLY - not "assets", "capital", "finances", or any variation.

```json
{
  "metadata": {
    "currentPhase": "resources",
    "phaseComplete": false
  },
  "resources": {
    "financial": {
      "availableCapital": number,
      "expectedGZ": number,
      "monthlyObligations": number
    },
    "time": {
      "hoursPerWeek": number,
      "isFullTime": boolean,
      "plannedStartDate": "ISO date string"
    },
    "network": {
      "industryContacts": number,
      "potentialFirstCustomers": ["string"],
      "supporters": ["string"]
    },
    "infrastructure": {
      "hasWorkspace": boolean,
      "hasEquipment": boolean,
      "hasLegalClarity": boolean
    }
  }
}
```

## Red Flags to Note

- Very low capital + high capital requirements
- Less than 20h/week for full-time business model
- Zero network in B2B business
- No workspace for client-facing business

## Transition to Phase 6 (MANDATORY)

**🔴 CRITICAL:** You MUST transition to business_type phase BEFORE validation phase. The business type classification is REQUIRED for proper module routing in the workshop.

When complete:
```
Danke! Ich habe jetzt ein klares Bild deiner Ressourcen:
[Brief summary]

Jetzt ordne ich dein Geschäftsmodell einer Kategorie zu - das hilft uns, die richtigen Module und Schwerpunkte für deinen Businessplan zu wählen.
```

**🚫 BLOCKING RULE:** You CANNOT skip directly to validation. The phase sequence is:
`resources` → `business_type` → `validation`

If you detect incomplete business type data but are tempted to skip to validation, STOP and run the business_type phase first.

## DO NOT in This Phase

- Create detailed financial projections (Module 6)
- Give investment advice
- Judge resource levels as "too low"
- Skip time availability questions
- Discuss marketing strategy
- Deep dive into legal structure
- **SKIP to validation phase without completing business_type first** ❌
