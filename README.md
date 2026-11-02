# Claude

## code-app/ — BLS/ACLS/PALS code timer + fever med dosing

An installable web app (PWA). Once it's hosted, open the link on your phone and add it to the home screen. It gets its own icon, opens full screen, and works with no signal.

- **Code tab** — BLS / ACLS / PALS modes. Code clock, 2-min CPR cycle with pulse/rhythm check alert,
  epi timer (due at 3 min, overdue at 5), shock / amiodarone / lidocaine tracking, 110/min metronome,
  H's & T's, timestamped event log (military time) you can copy.
  PALS mode: enter weight once and every dose and shock energy is calculated, plus a full PALS dose table.
- **Fever meds tab** — acetaminophen and ibuprofen in mg and mL from weight (kg or lb). Shares the weight with PALS.
- **Reference tab** — BLS, ACLS, PALS numbers and post-ROSC targets.

### What each file does
| File | Job |
|---|---|
| `code-app/index.html` | The whole app — screens, timers, math |
| `code-app/manifest.json` | Tells the phone it's an app: name, icon, open full screen |
| `code-app/sw.js` | Saves a copy on the phone so it works offline |
| `code-app/icon-*.png` | Home-screen icons |
| `.github/workflows/pages.yml` | Publishes `code-app/` as a website whenever `main` changes |

Memory aid only. Verify against the current AHA manuals and facility protocol.
