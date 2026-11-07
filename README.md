# Claude

## code-app/ — BLS/ACLS/PALS code timer + fever med dosing

An installable web app (PWA). Once it's hosted, open the link on your phone and add it to the home screen. It gets its own icon, opens full screen, and works with no signal.

- **Code tab** — BLS / ACLS / PALS modes. Code clock, 2-min CPR cycle with pulse/rhythm check alert,
  epi timer (due at 3 min, overdue at 5), shock / amiodarone / lidocaine tracking, 110/min metronome,
  H's & T's, timestamped event log (military time) you can copy.
  PALS mode: enter weight once and every dose and shock energy is calculated, plus a full PALS dose table.
- **Peds tab** — enter weight (kg or lb) once: Tylenol and Motrin (mL, teaspoons, chewables, tablets), Zofran,
  Decadron, Benadryl, IM epi for anaphylaxis, and the PALS code doses. Shares the weight with PALS mode.
- **IV mix tab** — searchable cards: how to mix, how fast, and whether it can be pushed (adult standard mixes).
- **Calc tab** — hemodynamics (SVR, PVR, CI, CPO, PAPi, shock pattern) and a step-by-step ABG interpreter
  (Winter's formula, albumin-corrected anion gap, delta ratio, P/F and A-a).
- **Reference tab** — BLS, ACLS, PALS numbers and post-ROSC targets.

### What each file does
| File | Job |
|---|---|
| `code-app/index.html` | Screens, code timer, peds dosing |
| `code-app/tools.js` | IV mixing cards, hemodynamics and ABG calculators |
| `code-app/manifest.json` | Tells the phone it's an app: name, icon, open full screen |
| `code-app/sw.js` | Saves a copy on the phone so it works offline |
| `code-app/icon-*.png` | Home-screen icons |
| `.github/workflows/pages.yml` | Publishes `code-app/` as a website whenever `main` changes |

Memory aid only. Verify against the current AHA manuals and facility protocol.
