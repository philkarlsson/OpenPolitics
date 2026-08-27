# OpenPolitics — Clickdummy

Interaktiver Prototyp der mobile-first App (Issues [#6](../../../..), [#7](../../../..)).
Öffne **[`index.html`](./index.html)** im Browser und klick dich durch — kein statisches Bild:

- **Onboarding-Flow**:
  - *Ort*: **eine** Adresszeile (Adresse / PLZ / Stadt) mit Vorschlägen **oder** Standort-Button → danach erscheinen die **wählbaren politischen Ebenen** (International immer aktiv → EU → Land → Bundesland → Kommune), einzeln an-/abwählbar.
  - *Interessen*: politische Fachrichtungen (Mobilität, Klima, Bildung …) als Mehrfachauswahl → schaltet „Fertig" frei.
- **Tab-Bar** wechselt zwischen Start, Entdecken, Abstimmen, Profil; zentraler „Neu"-FAB öffnet Erstellen-Sheet.
- **Abstimmen**: In einem Antrag Pro/Enthalten/Contra tippen → Balken & Zähler aktualisieren live → „Stimme bestätigen".
- **Konto & Datenschutz**: Profil → Zahnrad → Einstellungen mit *Abmelden*, *Meine Daten herunterladen* (DSGVO), *Konto löschen* (mit Bestätigung), *Privatsphäre* (Sichtbarkeit öffentlich/Follower/privat + Datenfreigabe-Toggles), Datenschutzerklärung, Impressum.
- **Navigation**: Karten öffnen Detail-Screens, Zurück-Button, Diskussions-Thread, Toaster-Feedback.
- Theme-Umschalter oben rechts zeigt Light & Dark.

## Warum ein neuer Look

Das aktuelle Frontend (`apps/web`) nutzt eine warme Creme-Palette (`#F4F1EA` + Teal + Terrakotta).
Das wirkt generisch und austauschbar. Die Vorgabe war: **frisch, jung, aber politisch,
barrierefrei, einfach, intuitiv – und nicht wie eine Standard-App aussehen.**

Deshalb bewusst die Gegenrichtung:

| Ziel | Umsetzung |
|------|-----------|
| **Frisch & jung** | Kühle, klare Neutrals + ein energetischer Lime-Akzent (`#C4F82A`) als Wiedererkennung |
| **Politisch, aber überparteilich** | Violett-Blau (`#4B3BE8`) als Marke — liegt bewusst zwischen Rot & Blau, gehört keiner Partei |
| **Vertrauenswürdig** | Tiefes Ink-Navy, ruhige Flächen, klare Hierarchie statt Verspieltheit |
| **Barrierefrei** | WCAG 2.2 AA Kontraste, sichtbarer Fokus, ≥44 px Ziele, Farbe nie als einziger Träger |
| **Einfach & intuitiv** | Eine klare Aktion pro Screen, feste Tab-Bar mit zentraler „Neu"-Aktion |

## Design-Tokens

Direkt übertragbar nach `apps/web/tailwind.config.ts`:

```ts
colors: {
  brand:   "#4B3BE8",  // primär interaktiv (Buttons, Links, aktiver Tab)
  pop:     "#C4F82A",  // sparsamer Energie-Akzent (Live-Badges, Highlights)
  ink:     "#14172B",  // Text
  paper:   "#F6F7FB",  // App-Hintergrund (kühl, kein Creme)
  surface: "#FFFFFF",  // Karten
  line:    "#E1E4F0",  // Rahmen/Trenner
  // Abstimmungs-Semantik (getrennt vom Marken-Akzent):
  pro:      "#0E9F6E",
  contra:   "#E5484D",
  enthalten:"#C77A00",
}
```

Dark-Mode-Werte, Abstände und Radien stehen als CSS-Custom-Properties oben in `index.html`
(`:root`, `@media (prefers-color-scheme: dark)`, `[data-theme]`). Die App sollte Tokens
identisch light/dark führen und Komponenten nur über die Tokens stylen — nie Farben direkt im
Media-Query.

## Typografie

- **Display / Titel**: Grotesk, 800 / 700, enges Tracking (−3 % bei großen Titeln).
- **Body**: ~15 px, Zeilenlänge ~65 Zeichen.
- **Micro-Label**: 11 px, uppercase, `letter-spacing: .08em`.
- **Zahlen** (Stimmen, Quoren): Mono mit `font-variant-numeric: tabular-nums`.

Das Mockup nutzt System-Grotesk, weil die Artefakt-CSP CDN-Fonts blockt. **Für die App
empfohlen** (open-source, self-hosted `@font-face`, Behörden-tauglich):
[Public Sans](https://public-sans.digital.gov/), [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk)
oder [Geist](https://vercel.com/font).

## Gezeigte Screens

1. **Onboarding nach Ort** — Land → Bundesland → Gemeinde, mit automatischer Scope-Verknüpfung (Bund/Land/Kommune).
2. **Start-Feed** — Ort-Chip, Themen-Filter, Live-Abstimmungen, Entwürfe.
3. **Antrag & Abstimmung** — Pro / Enthalten / Contra mit Balken, Quorum und Deadline.
4. **Diskussion** — sachlicher Thread mit verifizierten Stimmen.
5. **Profil** — Ort-Scopes, Aktivität, Verifizierungs-Badge.

Plus ein Design-System-Panel (Farb-Swatches, Typo-Skala, Barrierefreiheits-Checkliste).

## Nächste Schritte (Vorschlag)

- Tokens in `tailwind.config.ts` ersetzen und `styles.css`-Komponenten (`.input`, `.primary-button`) angleichen.
- Bottom-Tab-Bar-Komponente + „Neu"-FAB als App-Shell einführen (ersetzt die aktuelle Sidebar aus `App.tsx`).
- Vote-Widget, Karten und Location-Chip als wiederverwendbare Komponenten mit stabilen `data-component`-Selektoren.
