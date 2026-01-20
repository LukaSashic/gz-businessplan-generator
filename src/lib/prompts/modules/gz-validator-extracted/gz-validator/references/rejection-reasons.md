# Häufige Ablehnungsgründe und Korrekturen

Detaillierte Analyse typischer Fehler und wie man sie behebt.

## Ablehnungsstatistik

### Häufigste Ablehnungsgründe (geschätzt)

| Rang | Grund | Häufigkeit | Vermeidbar |
|------|-------|------------|------------|
| 1 | Unrealistische Finanzplanung | 25-30% | JA |
| 2 | Fehlende Selbsttragfähigkeit ab M6 | 20-25% | JA |
| 3 | Unzureichende Qualifikation | 15-20% | TEILWEISE |
| 4 | Fehlende/schwache Marktanalyse | 10-15% | JA |
| 5 | Inkonsistente Zahlen | 10-15% | JA |
| 6 | Formale Fehler/Unvollständigkeit | 5-10% | JA |
| 7 | Keine Finanzierungslücke | 5% | JA |

**→ 80%+ der Ablehnungen sind durch gute Validierung vermeidbar!**

---

## Detaillierte Ablehnungsgründe und Korrekturen

### 1. Unrealistische Finanzplanung

#### Symptome
- Umsatz M1 = Umsatz M12 (keine Anlaufphase)
- Umsatz J1 > SOM aus Marktanalyse
- Keine variablen Kosten
- Gewinnmarge > 70% ohne Begründung
- Steuern nicht berücksichtigt

#### Korrektur
```
Umsatz-Korrektur:
M1: 20-30% des Ziel-Monatsumsatzes
M2: 40-50%
M3: 60-70%
M4: 70-80%
M5: 80-90%
M6+: 90-110%

Kosten-Korrektur:
+ Variable Kosten (mind. 10-30% je nach Branche)
+ 30-40% Steuer-/Sozialabgaben-Reserve
+ Puffer 10% auf alle Fixkosten
```

#### Beispiel
❌ VORHER:
| Monat | 1 | 2 | 3 | ... | 12 |
|-------|---|---|---|-----|-----|
| Umsatz | 8.000 | 8.000 | 8.000 | ... | 8.000 |

✅ NACHHER:
| Monat | 1 | 2 | 3 | 4 | 5 | 6 | 12 |
|-------|---|---|---|---|---|---|-----|
| Umsatz | 2.000 | 3.500 | 5.000 | 6.000 | 7.000 | 7.500 | 8.000 |

---

### 2. Fehlende Selbsttragfähigkeit ab M6

#### Symptome
- Gewinn M6 < Privatentnahme
- Keine Privatentnahme kalkuliert
- Break-Even erst M9+

#### Korrektur-Optionen

**Option A: Kosten senken**
- Marketing-Budget reduzieren (aber nicht auf 0!)
- Büro → Homeoffice
- Outsourcing reduzieren
- Privatentnahme temporär senken

**Option B: Umsatz erhöhen**
- Preise erhöhen (wenn marktfähig)
- Schnellere Akquise durch Netzwerk
- Zusätzliches Angebot (z.B. Workshops)

**Option C: Finanzierung anpassen**
- Mehr Eigenkapital einbringen
- Kredit für Betriebsmittel
- Längere Anlaufphase mit GZ begründen

#### Formel
```
Mindest-Umsatz M6 = (Fixkosten + Privatentnahme) ÷ (1 - Variable Kosten%)

Beispiel:
Fixkosten: 1.500€
Privatentnahme: 2.200€
Variable Kosten: 20%

Mindest-Umsatz M6 = (1.500 + 2.200) ÷ 0,8 = 4.625€
```

---

### 3. Unzureichende Qualifikation

#### Symptome
- Keine formale Ausbildung im Gründungsbereich
- Keine Berufserfahrung
- Keine Weiterbildungsnachweise

#### Korrektur-Optionen

**Wenn Qualifikation vorhanden:**
- Alle Zertifikate/Zeugnisse anhängen
- Berufserfahrung detailliert beschreiben
- Referenzen/Empfehlungen beifügen

**Wenn Qualifikation fehlt:**
- Weiterbildung VOR Gründung absolvieren
- Coaching-Qualifikation nachholen
- Branchenerfahrung durch Praktikum/Nebenjob
- Partner mit Qualifikation einbinden

**Kompensation durch:**
- Langjährige praktische Erfahrung
- Nachweisbare Erfolge (z.B. Projekte)
- Branchenkontakte und Netzwerk

---

### 4. Fehlende/schwache Marktanalyse

#### Symptome
- Keine TAM/SAM/SOM-Zahlen
- Keine Quellenangaben
- "Der Markt ist groß" ohne Daten
- Keine Wettbewerbsanalyse

#### Korrektur

**Quellen finden:**
```
1. Statista (kostenpflichtig, aber IHK oft Zugang)
2. Branchenverbände (oft kostenlose Studien)
3. Destatis (offizielle Statistiken)
4. IHK-Branchenberichte
5. Google Scholar (akademische Studien)
```

**TAM/SAM/SOM berechnen:**
```
TAM = Gesamtmarkt Deutschland
      Quelle: Statista, Branchenstudie

SAM = TAM × Zielgruppen-Anteil × Region
      Berechnung: Eigene Ableitung mit Begründung

SOM = SAM × Erreichbarer Anteil (meist 0,1-2%)
      Berechnung: Kundenanzahl × Ø Umsatz
```

**Wettbewerbsanalyse:**
- Mind. 3 direkte Wettbewerber
- Stärken/Schwächen-Vergleich
- USP klar herausarbeiten

---

### 5. Inkonsistente Zahlen

#### Symptome
- Umsatz in Summary ≠ Umsatz in Finanzplan
- Kapitalbedarf unterschiedlich angegeben
- Break-Even-Monat variiert

#### Korrektur

**Prüf-Checkliste:**
```
□ Umsatz J1 (Summary) = Umsatz J1 (Finanzplan)
□ Umsatz J1 (KPIs) = Umsatz J1 (Finanzplan)
□ Kapitalbedarf (Summary) = Kapitalbedarf (Finanzplan)
□ Finanzierungslücke (Summary) = Lücke (Finanzplan)
□ Break-Even (Meilensteine) = Break-Even (Finanzplan)
□ Kundenanzahl (Marketing) = Kundenanzahl (Finanzplan)
```

**Workflow:**
1. Finanzplan als "Single Source of Truth"
2. Alle anderen Dokumente daraus ableiten
3. Summary ZULETZT schreiben
4. Finale Kontrolle aller Zahlen

---

### 6. Formale Fehler/Unvollständigkeit

#### Häufige Fehler
- Fehlende Unterschrift
- Kein Datum
- Lebenslauf fehlt
- Rechtschreibfehler (besonders Firmenname!)
- Falsche Rechtsform angegeben
- Seiten nicht nummeriert

#### Korrektur-Checkliste
```
□ Deckblatt mit Name, Adresse, Datum
□ Inhaltsverzeichnis
□ Seitenzahlen
□ Unterschrift auf Summary
□ Lebenslauf (tabellarisch, aktuell)
□ Alle Anlagen vollständig
□ Rechtschreibprüfung durchgeführt
□ Firmennamen konsistent geschrieben
□ Rechtsform korrekt (Freiberufler vs. Gewerbe)
```

---

### 7. Keine Finanzierungslücke

#### Problem
Wenn Kapitalbedarf = Eigenkapital → keine Lücke → kein GZ!

#### Lösung
```
Kapitalbedarf realistisch kalkulieren:
+ Einmalige Investitionen
+ Gründungskosten
+ Betriebsmittelreserve (3-6 Monate!)
+ Privatentnahme während Anlaufphase
= Gesamter Kapitalbedarf

Wenn Kapitalbedarf > Eigenkapital:
→ Finanzierungslücke = Kapitalbedarf - Eigenkapital
→ GZ schließt (Teil der) Lücke
```

**Achtung:**
- Lücke muss glaubwürdig sein
- Nicht künstlich aufblähen
- Privatentnahme-Reserve oft vergessen!

---

## Branchen-spezifische Fallstricke

### Coaching/Beratung
- ❌ Keine Zertifizierung → Qualifikation fraglich
- ❌ Stundensatz unrealistisch hoch → Marktvergleich fehlt
- ✅ Referenzen, Zertifikate, Branchenerfahrung

### IT/Freelancer
- ❌ Kein Portfolio → Keine Nachweise
- ❌ Auslastung 100% → Unrealistisch
- ✅ GitHub, Referenzprojekte, realistische 60-70%

### Handwerk
- ❌ Kein Meisterbrief (wo erforderlich)
- ❌ Werkzeug/Fahrzeug nicht kalkuliert
- ✅ Vollständige Investitionsplanung

### E-Commerce
- ❌ Conversion Rate 10% → Unrealistisch (normal: 1-3%)
- ❌ Keine Retouren kalkuliert
- ✅ Realistische Benchmarks, Retouren 15-20%

### Gastronomie
- ❌ Wareneinsatz 15% → Unrealistisch (normal: 25-35%)
- ❌ Keine Anlaufzeit → Sofort volle Auslastung
- ✅ 3-6 Monate Anlauf, realistische Kosten

---

## Schnell-Check vor Einreichung

### 5-Minuten-Validierung

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ SCHNELL-CHECK (5 Fragen)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Gewinn M6 ≥ Privatentnahme?
   JA □  NEIN □ → STOPP!

2. Liquidität immer positiv?
   JA □  NEIN □ → STOPP!

3. Finanzierungslücke vorhanden?
   JA □  NEIN □ → STOPP!

4. Alle Zahlen konsistent?
   JA □  NEIN □ → Prüfen!

5. Quellen für Marktdaten?
   JA □  NEIN □ → Ergänzen!

Alle JA? → Bereit für Einreichung!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Iterations-Workflow

### Nach Validierung

```
1. Rote Flaggen identifiziert
   ↓
2. Prioritäten setzen (Kritisch zuerst)
   ↓
3. Betroffene Module öffnen
   ↓
4. Korrekturen durchführen
   ↓
5. Konsistenz-Check wiederholen
   ↓
6. Zusammenfassung aktualisieren
   ↓
7. Erneute Validierung
   ↓
8. Alle grün? → Document Generator
```
