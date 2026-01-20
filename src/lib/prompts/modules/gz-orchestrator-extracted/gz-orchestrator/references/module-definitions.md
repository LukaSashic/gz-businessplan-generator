# Modul-Definitionen & Geschäftstyp-Relevanz

## Geschäftstypen

Klassifiziere das Geschäft in eine dieser Kategorien:

| Typ | Beschreibung | Beispiele |
|-----|--------------|-----------|
| `DIGITAL_SERVICE` | Rein digitale Dienstleistungen, ortsunabhängig | Beratung, Coaching, Freelancing, SaaS |
| `LOCAL_SERVICE` | Ortsgebundene Dienstleistungen | Friseur, Handwerk, Gastronomie, Einzelhandel |
| `HYBRID_SERVICE` | Mix aus digital und lokal | Agentur mit Büro, lokale Beratung |
| `PRODUCT_DIGITAL` | Digitale Produkte | Software, Apps, Online-Kurse |
| `PRODUCT_PHYSICAL` | Physische Produkte | E-Commerce, Manufaktur, Handel |
| `FRANCHISE` | Franchise-Konzept | Systemgastronomie, Retail-Franchise |

## Modul-Relevanz-Matrix

### Unternehmen (Modul 3) — Subsektionen

| Subsektion | DIGITAL_SERVICE | LOCAL_SERVICE | HYBRID_SERVICE | PRODUCT_DIGITAL | PRODUCT_PHYSICAL | FRANCHISE |
|------------|-----------------|---------------|----------------|-----------------|------------------|-----------|
| 3.1 Unternehmensführung | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht |
| 3.2 Partner | ⚪ Optional | ⚪ Optional | ⚪ Optional | ⚪ Optional | ⚪ Optional | ✅ Pflicht |
| 3.3 Gründungsvoraussetzungen | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht |
| 3.4 Rechtsform | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht |
| 3.5 Versicherung | ⚪ Optional | ✅ Pflicht | ✅ Pflicht | ⚪ Optional | ✅ Pflicht | ✅ Pflicht |
| 3.6 Standortanalyse | ❌ Nicht relevant | ✅ Pflicht | ✅ Pflicht | ❌ Nicht relevant | ⚪ Optional | ✅ Pflicht |

### Marketing (Modul 5) — Subsektionen

| Subsektion | DIGITAL_SERVICE | LOCAL_SERVICE | HYBRID_SERVICE | PRODUCT_DIGITAL | PRODUCT_PHYSICAL | FRANCHISE |
|------------|-----------------|---------------|----------------|-----------------|------------------|-----------|
| 5.3.1 Offline-Marketing | ⚪ Optional | ✅ Pflicht | ✅ Pflicht | ❌ Nicht relevant | ⚪ Optional | ✅ Pflicht |
| 5.3.2 Online-Marketing | ✅ Pflicht | ⚪ Optional | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht | ✅ Pflicht |

### Finanzplanung (Modul 6) — Spezifische Anpassungen

| Geschäftstyp | Besondere Kostenpositionen |
|--------------|---------------------------|
| `DIGITAL_SERVICE` | Software-Abos, Marketing, Weiterbildung |
| `LOCAL_SERVICE` | Miete, Ausstattung, Material, Personal |
| `HYBRID_SERVICE` | Büro + digitale Infrastruktur |
| `PRODUCT_DIGITAL` | Entwicklung, Hosting, Marketing |
| `PRODUCT_PHYSICAL` | Lager, Logistik, Einkauf, Verpackung |
| `FRANCHISE` | Franchise-Gebühren, Einrichtung nach Vorgabe |

## Modul-Beschreibungen

### 1. Intake & Assessment (gz-intake)
**Ziel**: Gründer kennenlernen, Geschäftsidee verstehen, Geschäftstyp klassifizieren

**Erfasst**:
- Persönliche Daten und Qualifikationen
- Berufserfahrung und Branchenkenntnisse
- Geschäftsidee und Problemstellung
- Verfügbare Ressourcen (Zeit, Geld, Netzwerk)
- Motivation und Ziele

**Output**: Gründerprofil, Geschäftstyp-Klassifizierung, Modul-Relevanz-Flags

### 2. Geschäftsmodell (gz-geschaeftsmodell)
**Ziel**: Klares Geschäftsmodell mit Angebot, Zielgruppe und Wertversprechen

**Subsektionen**:
- 2.1 Angebotsbeschreibung — Was genau wird angeboten?
- 2.2 Zielgruppe — Wer kauft und warum?
- 2.3 Kundennutzen — Welches Problem wird gelöst? Welcher Wert entsteht?

### 3. Unternehmen (gz-unternehmen)
**Ziel**: Rechtliche und organisatorische Grundlagen

**Subsektionen**:
- 3.1 Unternehmensführung — Wer führt? Welche Kompetenzen?
- 3.2 Partner — Gibt es Mitgründer, strategische Partner?
- 3.3 Gründungsvoraussetzungen — Erlaubnisse, Zulassungen, Qualifikationen
- 3.4 Rechtsform — GbR, Einzelunternehmen, UG, GmbH?
- 3.5 Versicherung — Berufshaftpflicht, Betriebshaftpflicht, etc.
- 3.6 Standortanalyse — Standortwahl und -bewertung (wenn relevant)

### 4. Markt & Wettbewerb (gz-markt-wettbewerb)
**Ziel**: Marktverständnis und Wettbewerbspositionierung

**Subsektionen**:
- 4.1 Marktanalyse — Marktgröße, Trends, Potenzial
- 4.2 Wettbewerbsanalyse — Wettbewerber, Differenzierung, Positionierung

### 5. Marketingkonzept (gz-marketing)
**Ziel**: Kundengewinnung und -bindung planen

**Subsektionen**:
- 5.1 Vertriebswege — Wie erreiche ich Kunden?
- 5.2 Preiskalkulation — Wie setze ich Preise?
- 5.3 Marketing-Mix — Welche Kanäle nutze ich?
  - 5.3.1 Offline-Marketing
  - 5.3.2 Online-Marketing

### 6. Finanzplanung (gz-finanzplanung)
**Ziel**: Tragfähigkeit nachweisen

**Subsektionen**:
- 6.1 Kapitalbedarfsplanung — Was brauche ich zum Start?
- 6.2 Umsatz- und Rentabilitätsplanung — Wann wird es profitabel?
- 6.3 Kostenplanung — Welche laufenden Kosten entstehen?
- 6.4 Liquiditätsplanung — Kann ich Zahlungen leisten?

### 7. SWOT-Analyse (gz-swot)
**Ziel**: Stärken, Schwächen, Chancen, Risiken systematisch erfassen

### 8. Meilensteine (gz-meilensteine)
**Ziel**: Konkrete Ziele mit Zeitplan definieren

### 9. KPIs (gz-kpi)
**Ziel**: Messbare Erfolgskennzahlen festlegen

### 10. Zusammenfassung (gz-zusammenfassung)
**Ziel**: Executive Summary für den Businessplan erstellen
**Hinweis**: Wird ZULETZT erstellt, wenn alle anderen Module abgeschlossen sind
