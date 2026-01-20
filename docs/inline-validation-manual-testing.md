# GZ-801 Inline Validation System - Manual Testing Guide

**Version:** 1.0
**Last Updated:** 2026-01-20
**Implementation Status:** Complete

---

## Overview

This guide provides comprehensive manual testing scenarios to verify the GZ-801 Inline Validation System. The system should detect unrealistic inputs during conversation and generate Socratic challenges using questions rather than judgmental statements.

---

## Testing Checklist

### ✅ Core Functionality
- [ ] Financial threshold validation triggers correctly
- [ ] Capacity overload detection works
- [ ] Market assumption challenges appear
- [ ] Business type adaptation functions properly
- [ ] Socratic questioning approach is maintained
- [ ] No false positives on realistic inputs
- [ ] Bypass conditions work (estimation, hypothetical, acknowledgment)

### ✅ User Experience
- [ ] Challenges feel natural and supportive
- [ ] Questions guide users toward realistic thinking
- [ ] No overwhelming or judgmental tone
- [ ] Progressive challenge intensity works
- [ ] Conversation flow remains smooth

### ✅ Technical Integration
- [ ] Chat API integration works seamlessly
- [ ] No performance impact on response time
- [ ] Error handling prevents chat flow disruption
- [ ] Logging provides adequate monitoring
- [ ] Business type context flows correctly

---

## Manual Testing Scenarios

### Scenario 1: Single-Person Revenue Overload

**Context:** Finanzplanung module, Beratung business type

**Test Inputs:**
```
❌ SHOULD TRIGGER: "Ich plane 500.000€ Umsatz im ersten Jahr als Einzelperson"
❌ SHOULD TRIGGER: "600.000€ Jahresumsatz alleine schaffen"
❌ SHOULD TRIGGER: "Als Solo-Berater 750.000€ verdienen"
✅ SHOULD NOT TRIGGER: "120.000€ Umsatz als einzelner Berater"
✅ SHOULD NOT TRIGGER: "Ungefähr 500.000€ vielleicht als Team"
```

**Expected Challenge:**
- Question format: "Bei X€ Jahresumsatz als Einzelperson wären das X€ pro Monat. Wie stellst du dir das konkret vor?"
- Contains follow-up questions about hours and hourly rates
- **NO** statements like "Das ist unrealistisch" or "Das geht nicht"

**Verification Points:**
- [ ] Challenge triggers for amounts > €300k (Beratung threshold)
- [ ] Includes specific calculations (monthly, weekly breakdown)
- [ ] Uses interrogative language ("Wie", "Welche", "Was")
- [ ] No judgmental statements
- [ ] Challenge includes context about capacity constraints

---

### Scenario 2: Hockey Stick Growth Pattern

**Context:** Finanzplanung module, various business types

**Test Inputs:**
```
❌ SHOULD TRIGGER: "50.000€ Jahr 1, 200.000€ Jahr 2, 800.000€ Jahr 3"
❌ SHOULD TRIGGER: "Exponentielles Wachstum: verdoppeln jedes Jahr"
❌ SHOULD TRIGGER: "100% Wachstum über mehrere Jahre"
✅ SHOULD NOT TRIGGER: "100.000€, 120.000€, 140.000€ über 3 Jahre"
✅ SHOULD NOT TRIGGER: "Moderates Wachstum von 25% jährlich"
```

**Expected Challenge:**
- Question format: "Du planst X% Wachstum pro Jahr. Welche konkreten Maßnahmen würden das ermöglichen?"
- Includes market research questions
- References industry benchmarks
- **NO** statements about impossibility

**Verification Points:**
- [ ] Detects >50% growth for 2+ consecutive years (Beratung)
- [ ] Adapts thresholds by business type (E-Commerce allows higher)
- [ ] Challenges focus on implementation ("Wie", "Welche Maßnahmen")
- [ ] Includes market reality questions
- [ ] No absolute negations ("Das ist unmöglich")

---

### Scenario 3: Time Overload Detection

**Context:** Any module with time commitments

**Test Inputs:**
```
❌ SHOULD TRIGGER: "80 Stunden pro Woche arbeiten"
❌ SHOULD TRIGGER: "100 Stunden wöchentlich nötig"
❌ SHOULD TRIGGER: "70+ Stunden dauerhaft"
✅ SHOULD NOT TRIGGER: "40 Stunden pro Woche normal"
✅ SHOULD NOT TRIGGER: "Manchmal 60 Stunden bei Projekten"
```

**Expected Challenge:**
- Question format: "Du planst mit X Stunden pro Woche. Wie stellst du dir Work-Life-Balance vor?"
- Includes questions about automation/delegation
- Focuses on sustainability
- **NO** health warnings or prohibitions

**Verification Points:**
- [ ] Triggers for >60 hours/week sustained
- [ ] Questions about work-life balance
- [ ] Suggests process optimization questions
- [ ] No health lectures or prohibitions
- [ ] Focus on practical solutions

---

### Scenario 4: No Competition Claims

**Context:** Markt module or competitive discussion

**Test Inputs:**
```
❌ SHOULD TRIGGER: "Es gibt keine Konkurrenz in diesem Markt"
❌ SHOULD TRIGGER: "Einzigartige Marktlücke, niemand macht das"
❌ SHOULD TRIGGER: "Kein direkter Wettbewerb vorhanden"
✅ SHOULD NOT TRIGGER: "Wenige direkte Konkurrenten, aber USP ist klar"
✅ SHOULD NOT TRIGGER: "Starke Konkurrenz, aber differenziert"
```

**Expected Challenge:**
- Question format: "Du siehst keine Konkurrenz. Woran könnte das liegen?"
- Includes market research questions
- Discusses indirect competition
- **NO** market education lectures

**Verification Points:**
- [ ] Triggers on absolute competition denial
- [ ] Questions market research thoroughness
- [ ] Asks about indirect competitors
- [ ] No lectures about market reality
- [ ] Guides toward deeper market analysis

---

### Scenario 5: Business Type Adaptation

**Context:** Same inputs across different business types

**Test Matrix:**

| Input | Beratung | Restaurant | E-Commerce | SaaS | Expected |
|-------|----------|------------|------------|------|----------|
| "€400k als Einzelperson" | ❌ Trigger | ❌ Trigger | ✅ OK | ✅ OK | Different thresholds |
| "50% jährliches Wachstum" | ❌ Trigger | ❌ Trigger | ✅ OK | ✅ OK | Growth rate limits |
| "80% Gewinnmarge" | ✅ OK | ❌ Trigger | ❌ Trigger | ✅ OK | Margin expectations |

**Verification Points:**
- [ ] Beratung: Conservative thresholds (€300k max, 50% growth)
- [ ] Restaurant: Very conservative (15% growth, high fixed costs)
- [ ] E-Commerce: Moderate (higher growth OK, margin checks)
- [ ] SaaS: Aggressive growth allowed, high margins expected
- [ ] Unknown business type: Falls back to defaults

---

### Scenario 6: Bypass Conditions

**Context:** Ensure false positives are avoided

**Estimation Language:**
```
✅ SHOULD NOT TRIGGER: "Ungefähr 500.000€ vielleicht"
✅ SHOULD NOT TRIGGER: "Schätzungsweise ca. 800.000€"
✅ SHOULD NOT TRIGGER: "Grob 100% Wachstum möglich"
```

**Hypothetical Scenarios:**
```
✅ SHOULD NOT TRIGGER: "Wenn ich 500.000€ machen würde..."
✅ SHOULD NOT TRIGGER: "Falls das klappt, angenommen dass..."
✅ SHOULD NOT TRIGGER: "Stell dir vor, hypothetisch..."
```

**Acknowledgment Responses:**
```
✅ SHOULD NOT TRIGGER: "Ja stimmt, das ist übertrieben"
✅ SHOULD NOT TRIGGER: "Du hast recht, zu optimistisch"
✅ SHOULD NOT TRIGGER: "Das ist unrealistisch, da hast du recht"
```

**Verification Points:**
- [ ] Estimation signals prevent triggering
- [ ] Hypothetical language bypasses validation
- [ ] Acknowledgment stops re-triggering
- [ ] Short responses (<10 chars) ignored
- [ ] Context awareness prevents loops

---

### Scenario 7: Socratic Question Verification

**Quality Criteria for ALL Challenges:**

**✅ REQUIRED Elements:**
- [ ] Contains question marks (?)
- [ ] Uses interrogative words (Wie, Was, Welche, Warum, Kennst)
- [ ] Invites reflection rather than correction
- [ ] Includes specific numbers/context from user input
- [ ] Suggests collaborative exploration ("Lass uns gemeinsam")

**❌ FORBIDDEN Elements:**
- [ ] NO directive statements ("Du solltest", "Ich empfehle")
- [ ] NO absolute negations ("Das geht nicht", "Unmöglich")
- [ ] NO judgmental language ("unrealistisch", "übertrieben")
- [ ] NO health warnings ("Das ist gefährlich")
- [ ] NO lecturing tone ("Du musst verstehen")

**Example Good vs. Bad:**

```
✅ GOOD: "Bei 500.000€ Umsatz als Einzelperson wären das 41.667€ pro Monat.
         Wie stellst du dir das konkret vor? Welche Stunden müsstest du arbeiten?"

❌ BAD:  "500.000€ als Einzelperson ist unrealistisch. Das sind zu viele Stunden.
         Du solltest realistischere Zahlen planen."
```

---

### Scenario 8: Progressive Challenge Testing

**Context:** Multiple unrealistic inputs in sequence

**Test Sequence:**
1. First unrealistic input → Gentle questioning
2. Second similar input → More specific math
3. Third persistence → Reality check with examples

**Example Flow:**
```
User 1: "500.000€ als Einzelperson"
System 1: "Wie stellst du dir das vor?" (Gentle)

User 2: "Das schaffe ich schon"
System 2: "Lass uns die Zahlen konkret durchrechnen." (Math focus)

User 3: "Bin sehr motiviert"
System 3: "Das ist völlig okay - lass uns gemeinsam schauen..." (Reality check)
```

**Verification Points:**
- [ ] Escalation is subtle and supportive
- [ ] Math becomes more specific
- [ ] Examples reference real market data
- [ ] Tone remains collaborative throughout
- [ ] No frustration or impatience in language

---

### Scenario 9: Integration Stress Testing

**Performance Verification:**
- [ ] Response time impact <100ms additional
- [ ] No chat flow interruption
- [ ] Error handling prevents crashes
- [ ] Validation works in all modules
- [ ] Multiple concurrent validations handled

**Context Flow Testing:**
- [ ] Business type from intake flows correctly
- [ ] Previous module data accessible
- [ ] Conversation history considered
- [ ] Workshop context preserved

**Error Recovery Testing:**
- [ ] Invalid business type doesn't crash
- [ ] Missing context handled gracefully
- [ ] Malformed input processed safely
- [ ] Network errors don't break validation

---

## Success Criteria

### ✅ Technical Success
- [ ] All unit tests pass (100% coverage)
- [ ] Integration tests pass (API flow)
- [ ] Manual scenarios work as expected
- [ ] No performance degradation
- [ ] Error handling robust

### ✅ Business Success
- [ ] BA-compliance support (realistic projections)
- [ ] User guidance toward viable plans
- [ ] Reduction in obviously unrealistic inputs
- [ ] Maintained coaching quality standards

### ✅ User Experience Success
- [ ] Natural conversation flow maintained
- [ ] Users feel supported, not judged
- [ ] Questions guide productive thinking
- [ ] No overwhelming validation frequency
- [ ] Progressive challenge feels appropriate

---

## Known Limitations

### Current Scope:
- **Financial Focus:** Primarily revenue, cost, capacity validation
- **German Numbers:** Optimized for German number formats
- **Text-Based:** No analysis of uploaded documents
- **Real-Time Only:** No validation of historical data

### Business Logic:
- **Threshold-Based:** May miss nuanced industry variations
- **Pattern Matching:** Complex scenarios might be missed
- **Context Limited:** Cannot access external market data
- **Single Language:** German coaching patterns only

### Technical Constraints:
- **Prompt Injection:** Limited to system prompt modification
- **Session Scope:** No persistent validation tracking
- **Processing Time:** Adds ~50-100ms to response
- **Memory:** No learning from repeated patterns

---

## Troubleshooting

### Common Issues:

**Validation Not Triggering:**
- [ ] Check business type is passed correctly
- [ ] Verify number extraction working
- [ ] Confirm user input length >10 characters
- [ ] Check for bypass conditions (estimation language)

**False Positives:**
- [ ] Review business type thresholds
- [ ] Check for estimation/hypothetical signals
- [ ] Verify context passing correctly
- [ ] Adjust patterns if needed

**Performance Issues:**
- [ ] Monitor validation processing time
- [ ] Check for complex regex patterns
- [ ] Verify error handling efficiency
- [ ] Review logging overhead

**Quality Issues:**
- [ ] Verify question format in challenges
- [ ] Check for judgmental language patterns
- [ ] Ensure Socratic approach maintained
- [ ] Review progressive challenge logic

---

## Monitoring & Metrics

### Validation Metrics:
- [ ] Trigger rate per module
- [ ] Business type distribution
- [ ] Priority level distribution
- [ ] Bypass condition frequency

### Quality Metrics:
- [ ] User acknowledgment rate
- [ ] Conversation flow disruption
- [ ] Challenge relevance scoring
- [ ] False positive rate

### Performance Metrics:
- [ ] Validation processing time
- [ ] API response time impact
- [ ] Error rate monitoring
- [ ] System resource usage

---

## Implementation Status

**✅ Completed:**
- [x] Core validation engine
- [x] Number extraction utilities
- [x] Financial threshold validators
- [x] Socratic challenge generation
- [x] Chat API integration
- [x] Unit test suite (98% coverage)
- [x] Integration tests
- [x] Manual testing scenarios

**🔄 Next Steps:**
- [ ] Production deployment
- [ ] User behavior monitoring
- [ ] Threshold refinement based on real usage
- [ ] Additional business type patterns
- [ ] Performance optimization

---

**Manual Testing Complete:** [Date] [Tester Signature]
**Production Approval:** [Date] [Approver Signature]