---
name: gz-validator
description: Overall validation module for Gründungszuschuss workshop. Performs comprehensive consistency checks across all modules, identifies red flags, validates against BA requirements, and provides actionable corrections. Ensures Tragfähigkeitsbescheinigung readiness with module-by-module scoring.
---

# Gründungszuschuss Gesamtvalidierung

Prüfe den kompletten Businessplan auf Konsistenz, Realismus und BA-Konformität.

## ⚠️ KRITISCH: Letzte Prüfung vor Abgabe!

**20-40% der GZ-Anträge scheitern an vermeidbaren Fehlern.**

Häufigste Ablehnungsgründe:
- Inkonsistente Zahlen zwischen Abschnitten
- Fehlende oder unglaubwürdige Quellenangaben
- Unrealistische Umsatzprognosen
- Selbsttragfähigkeit nicht ab Monat 6
- Finanzierungslücke nicht nachgewiesen

**Diese Validierung simuliert die Prüfung durch BA und fachkundige Stelle!**

## Ziele dieses Moduls

1. Vollständigkeit aller Abschnitte prüfen
2. Cross-Module-Konsistenz validieren
3. Rote Flaggen identifizieren
4. Tragfähigkeitskriterien checken
5. Quellenqualität bewerten
6. Optimierungen vorschlagen
7. Gesamtbewertung erstellen

---

## Ablauf

### Sektion 11.1: Vollständigkeitsprüfung

**Ziel**: Sind alle erforderlichen Abschnitte vorhanden?

#### Pflicht-Abschnitte Checkliste

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 VOLLSTÄNDIGKEITS-CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUSINESSPLAN-ABSCHNITTE:
□ Executive Summary (gz-zusammenfassung)
□ Geschäftsidee & Angebot (gz-geschaeftsmodell)
□ Gründerprofil & Qualifikationen (gz-unternehmen)
□ Rechtsform & Organisation (gz-unternehmen)
□ Marktanalyse (gz-markt-wettbewerb)
□ Wettbewerbsanalyse (gz-markt-wettbewerb)
□ Marketing & Vertrieb (gz-marketing)
□ Finanzplanung (gz-finanzplanung)
  □ Kapitalbedarf
  □ Finanzierung
  □ Umsatzprognose
  □ Rentabilitätsvorschau
  □ Liquiditätsplanung
□ SWOT-Analyse (gz-swot)
□ Meilensteine (gz-meilensteine)

ANLAGEN:
□ Lebenslauf
□ Qualifikationsnachweise
□ Tragfähigkeitsbescheinigung (extern)
□ Stellungnahme fachkundige Stelle

GZ-SPEZIFISCH:
□ ALG-Restanspruch dokumentiert (≥150 Tage)
□ Finanzierungslücke beziffert
□ GZ-Beitrag berechnet

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Vollständigkeits-Tabelle

| Abschnitt | Vorhanden | Vollständig | Status |
|-----------|-----------|-------------|--------|
| Executive Summary | ⬚ | ⬚ | 🟢🟡🔴 |
| Geschäftsidee | ⬚ | ⬚ | 🟢🟡🔴 |
| Gründerprofil | ⬚ | ⬚ | 🟢🟡🔴 |
| Marktanalyse | ⬚ | ⬚ | 🟢🟡🔴 |
| Wettbewerb | ⬚ | ⬚ | 🟢🟡🔴 |
| Marketing | ⬚ | ⬚ | 🟢🟡🔴 |
| Finanzplanung | ⬚ | ⬚ | 🟢🟡🔴 |
| SWOT | ⬚ | ⬚ | 🟢🟡🔴 |
| Meilensteine | ⬚ | ⬚ | 🟢🟡🔴 |
| KPIs | ⬚ | ⬚ | 🟢🟡🔴 |

---

### Sektion 11.2: Cross-Module-Konsistenz

**Ziel**: Stimmen die Zahlen zwischen den Modulen überein?

#### Automatische Konsistenz-Checks

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 KONSISTENZ-REGELN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MARKT → FINANZEN:
□ Umsatz J1 ≤ SOM (aus Marktanalyse)
□ Kundenanzahl × Ø Umsatz/Kunde = Umsatz
□ Stundensatz × Stunden × Auslastung = Umsatz

FINANZEN → ZUSAMMENFASSUNG:
□ Umsatzzahlen identisch
□ Kapitalbedarf identisch
□ Finanzierungslücke identisch
□ Break-Even identisch

MARKETING → FINANZEN:
□ Marketing-Budget in Kostenplan enthalten
□ CAC × Neukunden ≤ Marketing-Budget

UNTERNEHMEN → FINANZEN:
□ Versicherungskosten übernommen
□ Standortkosten übernommen
□ Gründungskosten berücksichtigt

MEILENSTEINE → FINANZEN:
□ Selbsttragfähigkeit-Monat konsistent
□ Break-Even-Monat konsistent
□ Umsatz-Ramp-Up plausibel

KPIs → FINANZEN:
□ Umsatz-KPIs = Finanzplan-Zahlen
□ Kundenanzahl-KPIs nachvollziehbar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Konsistenz-Prüfmatrix

| Prüfung | Wert A | Wert B | Match? | Status |
|---------|--------|--------|--------|--------|
| Umsatz J1 (Summary) vs. (Finanz) | €___ | €___ | ⬚ | 🟢🔴 |
| Umsatz J1 vs. SOM | €___ | €___ | ⬚ | 🟢🔴 |
| Kapitalbedarf (Summary) vs. (Finanz) | €___ | €___ | ⬚ | 🟢🔴 |
| Finanzierungslücke (Summary) vs. (Finanz) | €___ | €___ | ⬚ | 🟢🔴 |
| Break-Even (Meilensteine) vs. (Finanz) | M___ | M___ | ⬚ | 🟢🔴 |
| Selbsttragfähigkeit (Summary) vs. (Finanz) | M___ | M___ | ⬚ | 🟢🔴 |
| Marketing-Budget (Marketing) vs. (Finanz) | €___ | €___ | ⬚ | 🟢🔴 |
| Versicherungen (Unternehmen) vs. (Finanz) | €___ | €___ | ⬚ | 🟢🔴 |

**Bei Inkonsistenz: Module korrigieren und Zahlen angleichen!**

---

### Sektion 11.3: Tragfähigkeitsprüfung

**Ziel**: Erfüllt der Plan die BA-Kriterien für Tragfähigkeit?

#### Kritische Tragfähigkeits-Checks

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ TRAGFÄHIGKEITS-KRITERIEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MUSS erfüllt sein:

1. SELBSTTRAGFÄHIGKEIT AB MONAT 6
   Prüfung: Gewinn M6 ≥ Privatentnahme
   Wert: €___ ≥ €___
   Status: 🟢🔴

2. POSITIVE LIQUIDITÄT DURCHGEHEND
   Prüfung: Kontostand nie negativ
   Kritischer Monat: M___
   Niedrigster Stand: €___
   Status: 🟢🔴

3. FINANZIERUNGSLÜCKE VORHANDEN
   Prüfung: Kapitalbedarf > Eigenkapital
   Lücke: €___
   Status: 🟢🔴

4. ALG-RESTANSPRUCH ≥ 150 TAGE
   Prüfung: Restanspruch bei Gründung
   Tage: ___
   Status: 🟢🔴

5. REALISTISCHE UMSATZPROGNOSE
   Prüfung: Umsatz J1 ≤ SOM
   Verhältnis: ___% des SOM
   Status: 🟢🔴

6. QUALIFIKATION NACHGEWIESEN
   Prüfung: Fachliche Eignung dokumentiert
   Nachweise: ___
   Status: 🟢🔴

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Tragfähigkeits-Scorecard

| Kriterium | Erfüllt | Kritisch | Aktion bei Rot |
|-----------|---------|----------|----------------|
| Selbsttragfähigkeit M6 | ⬚ | JA | Kosten senken oder Umsatz erhöhen |
| Positive Liquidität | ⬚ | JA | Finanzierung anpassen |
| Finanzierungslücke | ⬚ | JA | Ohne Lücke kein GZ! |
| ALG ≥ 150 Tage | ⬚ | JA | GZ nicht möglich |
| Umsatz ≤ SOM | ⬚ | JA | Prognose reduzieren |
| Qualifikation | ⬚ | JA | Nachweise ergänzen |

---

### Sektion 11.4: Rote Flaggen

**Ziel**: Kritische Probleme identifizieren, die zur Ablehnung führen.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚩 ROTE FLAGGEN - SOFORT BEHEBEN!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINANZEN:
□ Gewinn M6 < Privatentnahme
□ Liquidität negativ in irgendeinem Monat
□ Keine Finanzierungslücke (= kein GZ!)
□ Kapitalbedarf unrealistisch niedrig
□ Umsatz J1 > SOM (Marktanalyse)
□ Umsatz M1-3 = Umsatz M12 (keine Anlaufphase)
□ Variable Kosten = 0
□ Steuern nicht berücksichtigt

MARKT:
□ Keine Quellenangaben für TAM/SAM/SOM
□ SOM > 5% SAM (zu optimistisch)
□ Keine Wettbewerbsanalyse
□ Marktdaten älter als 2 Jahre

MARKETING:
□ Marketing-Budget = 0
□ Keine konkrete Akquise-Strategie
□ CAC nicht berechnet

SWOT:
□ Keine Schwächen genannt
□ Keine Risiken genannt
□ Risiken ohne Maßnahmen

MEILENSTEINE:
□ Weniger als 5 Meilensteine
□ Keine Fristen
□ Selbsttragfähigkeit > M6

ALLGEMEIN:
□ Zahlen inkonsistent zwischen Modulen
□ Rechtschreibfehler im Firmennamen
□ Fehlende Unterschrift/Datum

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Rote-Flaggen-Protokoll

| # | Rote Flagge | Gefunden in | Korrektur | Status |
|---|-------------|-------------|-----------|--------|
| 1 | ___ | ___ | ___ | ⬚ |
| 2 | ___ | ___ | ___ | ⬚ |
| 3 | ___ | ___ | ___ | ⬚ |

---

### Sektion 11.5: Quellenvalidierung

**Ziel**: Sind alle Zahlen belegt?

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 QUELLENPRÜFUNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MINDESTANFORDERUNGEN:
□ TAM mit Quelle (Statista, Branchenverband)
□ SAM mit Quelle oder nachvollziehbarer Berechnung
□ Markttrends mit Quelle
□ Wettbewerbsdaten mit Quelle
□ Branchenbenchmarks mit Quelle

QUELLENQUALITÄT:
✓ Gut: Statista, Destatis, IHK, Branchenverbände
✓ Akzeptabel: Fachpublikationen, seriöse Studien
✗ Schlecht: Wikipedia, Blogs ohne Quellenangabe
✗ Inakzeptabel: "Eigene Schätzung" ohne Begründung

AKTUALITÄT:
□ Alle Quellen ≤ 2 Jahre alt
□ Abrufdatum dokumentiert

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Quellen-Inventar

| Datentyp | Quelle | Jahr | Akzeptabel |
|----------|--------|------|------------|
| TAM | ___ | ___ | 🟢🔴 |
| SAM | ___ | ___ | 🟢🔴 |
| Markttrend | ___ | ___ | 🟢🔴 |
| Wettbewerb | ___ | ___ | 🟢🔴 |
| Benchmarks | ___ | ___ | 🟢🔴 |

---

### Sektion 11.6: Modul-Bewertung

**Ziel**: Jedes Modul einzeln bewerten.

#### Bewertungs-Matrix

| Modul | Vollständig | Konsistent | Realistisch | Belegt | Gesamt |
|-------|-------------|------------|-------------|--------|--------|
| Zusammenfassung | /10 | /10 | /10 | /10 | /40 |
| Geschäftsmodell | /10 | /10 | /10 | /10 | /40 |
| Unternehmen | /10 | /10 | /10 | /10 | /40 |
| Markt | /10 | /10 | /10 | /10 | /40 |
| Marketing | /10 | /10 | /10 | /10 | /40 |
| Finanzen | /10 | /10 | /10 | /10 | /40 |
| SWOT | /10 | /10 | /10 | /10 | /40 |
| Meilensteine | /10 | /10 | /10 | /10 | /40 |
| KPIs | /10 | /10 | /10 | /10 | /40 |
| **GESAMT** | | | | | **/360** |

#### Gesamt-Bewertung

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 GESAMT-BEWERTUNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORE: ___/360 Punkte

🟢 GRÜN (≥300): Bereit für Einreichung
🟡 GELB (200-299): Überarbeitung empfohlen
🔴 ROT (<200): Nicht einreichen!

STATUS: 🟢🟡🔴

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Sektion 11.7: Optimierungsvorschläge

**Ziel**: Konkrete Verbesserungen empfehlen.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 OPTIMIERUNGEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIORITÄT 1 (Kritisch - muss behoben werden):
1. ___
2. ___
3. ___

PRIORITÄT 2 (Wichtig - sollte behoben werden):
1. ___
2. ___
3. ___

PRIORITÄT 3 (Nice-to-have):
1. ___
2. ___

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Modul-Abschluss

### Validierungsbericht

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 VALIDIERUNGSBERICHT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GESAMTSTATUS: 🟢🟡🔴

VOLLSTÄNDIGKEIT:
• Pflichtabschnitte: ___/10 vorhanden
• Anlagen: ___/4 vorhanden

KONSISTENZ:
• Cross-Checks: ___/___ bestanden
• Inkonsistenzen gefunden: ___

TRAGFÄHIGKEIT:
• Kritische Kriterien: ___/6 erfüllt
• Selbsttragfähigkeit: Ab Monat ___
• Finanzierungslücke: €___

ROTE FLAGGEN:
• Gefunden: ___
• Behoben: ___
• Offen: ___

QUELLEN:
• Dokumentiert: ___
• Akzeptable Qualität: ___/___ 

GESAMT-SCORE: ___/360

EMPFEHLUNG:
□ Bereit für Einreichung
□ Überarbeitung nötig (siehe Optimierungen)
□ Grundlegende Überarbeitung erforderlich

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Validierungs-Checkliste

| Kriterium | Status |
|-----------|--------|
| Alle Pflichtabschnitte vorhanden | ⬚ |
| Alle Konsistenz-Checks bestanden | ⬚ |
| Alle Tragfähigkeits-Kriterien erfüllt | ⬚ |
| Keine offenen Roten Flaggen | ⬚ |
| Alle Quellen dokumentiert und aktuell | ⬚ |
| Gesamt-Score ≥ 300/360 | ⬚ |

### Speichern in Memory

Speichere für spätere Module:
- Validierungsbericht (für gz-document-generator)
- Offene Optimierungen (für Iteration)
- Gesamt-Score (für Entscheidung)
