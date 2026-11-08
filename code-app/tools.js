// IV mixing cards + hemodynamics and ABG calculators.
// Separate from index.html so the code timer stays easy to read. No patient data is stored.
(() => {
  const $ = id => document.getElementById(id);
  const num = id => { const v = parseFloat($(id).value); return isNaN(v) ? null : v; };
  const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
  const f0 = x => Math.round(x).toLocaleString();
  const f2 = x => (Math.round(x * 100) / 100).toFixed(2);

  // =====================================================================
  // IV MIXING CARDS (adult). push: 'yes' | 'no' | 'cau' (special cases only)
  // =====================================================================
  const IV = [
    { n: 'Piperacillin-tazobactam', b: 'Zosyn', push: 'no',
      mix: '3.375 g or 4.5 g in 50–100 mL NS or D5W',
      rate: 'Over 30 min. Extended infusion over 4 hr if your protocol uses it.',
      pushTxt: 'No IV push.' },
    { n: 'Cefazolin', b: 'Ancef', push: 'yes',
      mix: '1–2 g in 50–100 mL NS or D5W',
      rate: 'Over 30 min',
      pushTxt: 'Yes. Reconstitute in 10 mL sterile water, push over 3–5 min. 3 g doses go IVPB.' },
    { n: 'Ceftriaxone', b: 'Rocephin', push: 'cau',
      mix: '1–2 g in 50–100 mL NS or D5W',
      rate: 'Over 30 min',
      pushTxt: 'Many facilities allow slow push in adults (over about 5 min). Check policy.',
      note: 'Neonates: never with calcium-containing IV fluids.' },
    { n: 'Cefepime', b: 'Maxipime', push: 'yes',
      mix: '1–2 g in 50–100 mL NS or D5W',
      rate: 'Over 30 min',
      pushTxt: 'Yes, over 3–5 min (where policy allows).',
      note: 'Can cause confusion or seizures if kidney dosing is missed.' },
    { n: 'Meropenem', b: 'Merrem', push: 'yes',
      mix: '1 g in 50–100 mL NS',
      rate: 'Over 15–30 min',
      pushTxt: 'Yes, over 3–5 min.',
      note: 'Drops valproic acid levels. Flag it if the patient is on Depakote.' },
    { n: 'Ampicillin-sulbactam', b: 'Unasyn', push: 'yes',
      mix: '1.5–3 g in 50–100 mL NS',
      rate: 'Over 15–30 min',
      pushTxt: 'Yes, slowly over at least 10–15 min.' },
    { n: 'Vancomycin', b: 'Vanco', push: 'no',
      mix: 'Max 5 mg/mL: 1 g in 200–250 mL · 1.5 g in 300 mL · 2 g in 400–500 mL',
      rate: 'No faster than 1 g per hour: 1 g over 60 min · 1.5 g over 90 · 2 g over 120',
      pushTxt: 'Never push.',
      note: 'Flushing and itching = infusion too fast. Slow it down; it\'s not a true allergy.' },
    { n: 'Metronidazole', b: 'Flagyl', push: 'no',
      mix: '500 mg premixed in 100 mL',
      rate: 'Over 30–60 min',
      pushTxt: 'No IV push.' },
    { n: 'Levofloxacin', b: 'Levaquin', push: 'no',
      mix: '500 mg / 100 mL or 750 mg / 150 mL premixed',
      rate: '500 mg over 60 min · 750 mg over 90 min',
      pushTxt: 'No. Fast infusion drops BP.',
      note: 'Prolongs QT.' },
    { n: 'Azithromycin', b: 'Zithromax', push: 'no',
      mix: '500 mg in 250 mL (2 mg/mL)',
      rate: 'Over 60 min (or 500 mL over 3 hr)',
      pushTxt: 'Never push or bolus.' },
    { n: 'Potassium chloride', b: 'KCl', push: 'no',
      mix: '10 mEq / 100 mL (peripheral) · 20 mEq / 50–100 mL (central)',
      rate: 'Typical max 10 mEq/hr peripheral, 20 mEq/hr central. Check your policy.',
      pushTxt: 'NEVER push. Always on a pump.',
      note: 'Burns peripherally. Cardiac monitor for faster rates.' },
    { n: 'Magnesium sulfate', b: 'Mag', push: 'cau',
      mix: '1–2 g in 50–100 mL',
      rate: 'Replacement: over 1–2 hr',
      pushTxt: 'Only for torsades or arrest: 1–2 g diluted in 10 mL over 5–20 min.',
      note: 'Watch BP, reflexes and breathing.' },
    { n: 'Calcium gluconate', b: 'Ca gluc', push: 'cau',
      mix: '1–2 g in 50–100 mL',
      rate: 'Replacement: over 30–60 min',
      pushTxt: 'Hyperkalemia with ECG changes: 1 g slow IV over 5–10 min on a monitor.',
      note: 'Calcium chloride is about 3× stronger; central line preferred.' },
    { n: 'Amiodarone drip', b: 'Cordarone', push: 'cau',
      mix: 'Load: 150 mg in 100 mL D5W · Drip: 900 mg in 500 mL D5W (1.8 mg/mL)',
      rate: 'Load over 10 min → 1 mg/min (33.3 mL/hr) × 6 hr → 0.5 mg/min (16.7 mL/hr) × 18 hr',
      pushTxt: 'Push only in pulseless arrest (300 mg, then 150 mg).',
      note: 'D5W only. Non-PVC bag if running over 2 hr. In-line filter. Over 2 mg/mL needs a central line.' },
    { n: 'Norepinephrine', b: 'Levophed', push: 'no',
      mix: '4 mg in 250 mL D5W or NS (16 mcg/mL). Some use 8 mg / 250 mL.',
      rate: 'Start 2–5 mcg/min (5 mcg/min = 18.8 mL/hr at 16 mcg/mL). Titrate to MAP ≥ 65.',
      pushTxt: 'No.',
      note: 'Central line preferred; short-term peripheral in a large vein per protocol. Extravasation: phentolamine.' },
    { n: 'Diltiazem', b: 'Cardizem', push: 'yes',
      mix: 'Drip: 125 mg in 125 mL (1 mg/mL)',
      rate: 'Drip 5–15 mg/hr',
      pushTxt: 'Yes. 0.25 mg/kg (about 20 mg) over 2 min; may repeat 0.35 mg/kg after 15 min.',
      note: 'Avoid in heart failure with low EF and in WPW.' },
    { n: 'Adenosine', b: 'Adenocard', push: 'yes',
      mix: 'Undiluted, 3 mg/mL',
      rate: '6 mg, then 12 mg if needed',
      pushTxt: 'Rapid push at the port closest to the heart, then 20 mL NS flush right away.',
      note: 'Warn the patient. Use 3 mg if central line, heart transplant, or on dipyridamole/carbamazepine.' },
    { n: 'Furosemide', b: 'Lasix', push: 'yes',
      mix: 'Undiluted 10 mg/mL for push',
      rate: 'Large doses (over 120 mg): no faster than 4 mg/min',
      pushTxt: 'Yes. 20–40 mg over 1–2 min.',
      note: 'Fast high doses can cause hearing loss.' },
    { n: 'Pantoprazole', b: 'Protonix', push: 'yes',
      mix: '40 mg in 10 mL NS (push) or 100 mL (IVPB)',
      rate: 'IVPB over 15 min',
      pushTxt: 'Yes, over at least 2 min.' },
    { n: 'Ondansetron', b: 'Zofran', push: 'yes',
      mix: 'Undiluted 2 mg/mL for push, or 4 mg in 50 mL',
      rate: 'IVPB over 15 min',
      pushTxt: 'Yes. 4 mg over at least 30 sec (2–5 min is gentler).',
      note: 'Prolongs QT.' },
  ];
  // IM route for each IV card: [yes | no | cau, what to know]
  const IM = {
    'Piperacillin-tazobactam': ['no', 'No. IV only.'],
    'Cefazolin': ['yes', 'Yes, deep IM into a large muscle.'],
    'Ceftriaxone': ['yes', 'Yes, deep IM. Often mixed with 1% lidocaine (no epi) for pain. Split doses over 1 g between sites. Never give the lidocaine mix IV.'],
    'Cefepime': ['yes', 'Yes, deep IM (mainly mild UTI dosing).'],
    'Meropenem': ['no', 'No. IV only.'],
    'Ampicillin-sulbactam': ['yes', 'Yes, deep IM.'],
    'Vancomycin': ['no', 'Never. Causes tissue necrosis.'],
    'Metronidazole': ['no', 'No. IV only.'],
    'Levofloxacin': ['no', 'No. IV only.'],
    'Azithromycin': ['no', 'Never IM.'],
    'Potassium chloride': ['no', 'Never.'],
    'Magnesium sulfate': ['cau', 'OB protocols only (e.g. preeclampsia): 50% solution, deep IM. Very painful.'],
    'Calcium gluconate': ['no', 'No. Causes tissue necrosis.'],
    'Amiodarone drip': ['no', 'No.'],
    'Norepinephrine': ['no', 'No.'],
    'Diltiazem': ['no', 'No.'],
    'Adenosine': ['no', 'No.'],
    'Furosemide': ['yes', 'Yes, when IV access isn\'t available.'],
    'Pantoprazole': ['no', 'No. IV only.'],
    'Ondansetron': ['yes', 'Yes. 4 mg undiluted, single injection.'],
  };
  const IMPILL = { yes: '<span class="pill p-yes">IM OK</span>', no: '<span class="pill p-no">No IM</span>',
    cau: '<span class="pill p-cau">IM: special cases</span>' };
  const PILL = { yes: '<span class="pill p-yes">Push OK</span>', no: '<span class="pill p-no">No push</span>',
    cau: '<span class="pill p-cau">Push: special cases</span>' };
  function renderIV() {
    const q = $('ivSearch').value.trim().toLowerCase();
    // typing "im" or "push" filters to drugs that can go that way
    const list = q === 'im' ? IV.filter(d => IM[d.n][0] !== 'no') : q === 'push' ? IV.filter(d => d.push !== 'no')
      : IV.filter(d => !q || (d.n + ' ' + d.b).toLowerCase().includes(q));
    $('ivList').innerHTML = list.length ? list.map(d => `
      <div class="card ivcard">
        <div class="hd"><div><b>${d.n}</b> <span class="label">(${d.b})</span></div><div class="pills">${PILL[d.push]}${IMPILL[IM[d.n][0]]}</div></div>
        <div class="r"><span>Mix</span><span>${d.mix}</span></div>
        <div class="r"><span>Rate</span><span>${d.rate}</span></div>
        <div class="r"><span>Push</span><span>${d.pushTxt}</span></div>
        <div class="r"><span>IM</span><span>${IM[d.n][1]}</span></div>
        ${d.note ? `<div class="r"><span>Note</span><span>${d.note}</span></div>` : ''}
      </div>`).join('') : '<p class="note">No match.</p>';
  }
  $('ivSearch').addEventListener('input', renderIV);
  renderIV();

  // =====================================================================
  // CALC TAB SWITCH
  // =====================================================================
  const showCalc = w => {
    $('calcHemoBtn').classList.toggle('sel', w === 'hemo'); $('calcAbgBtn').classList.toggle('sel', w === 'abg');
    $('calcHemo').classList.toggle('hidden', w !== 'hemo'); $('calcAbg').classList.toggle('hidden', w !== 'abg');
  };
  $('calcHemoBtn').onclick = () => showCalc('hemo');
  $('calcAbgBtn').onclick = () => showCalc('abg');

  const field = (id, label, ph, extra = '') =>
    `<div class="fld"><label for="${id}">${label}${extra}</label><input type="number" inputmode="decimal" id="${id}" placeholder="${ph}"></div>`;

  // =====================================================================
  // HEMODYNAMICS
  // =====================================================================
  $('calcHemo').innerHTML = `
    <div class="card">
      <h2>Inputs <span style="text-transform:none;letter-spacing:0">(leave blank what you don't have)</span></h2>
      <div class="grid2">
        ${field('hSBP', 'Systolic BP', '120')}${field('hDBP', 'Diastolic BP', '70')}
        ${field('hMAP', 'MAP (or from BP)', 'auto')}${field('hHR', 'Heart rate', '80')}
        ${field('hCVP', 'CVP / RAP', '2–8')}${field('hCO', 'CO (L/min)', '4–8')}
        ${field('hPAS', 'PA systolic', '15–30')}${field('hPAD', 'PA diastolic', '4–12')}
        ${field('hMPAP', 'Mean PA (or from PA)', 'auto')}${field('hPCWP', 'Wedge (PCWP)', '6–12')}
        <div class="fld"><label for="hHt">Height <select id="hHtU"><option>cm</option><option>in</option></select></label><input type="number" inputmode="decimal" id="hHt" placeholder="for CI"></div>
        <div class="fld"><label for="hWt">Weight <select id="hWtU"><option>kg</option><option>lb</option></select></label><input type="number" inputmode="decimal" id="hWt" placeholder="for CI"></div>
      </div>
      <button class="small" id="hClear" style="margin-top:12px;width:100%">Clear</button>
    </div>
    <div class="status s-neutral" id="hShock">Enter MAP (or BP), CVP and CO to start.</div>
    <div class="card"><h2>Results</h2><table id="hOut"></table></div>
    <p class="note">SVR = 80 × (MAP − CVP) ÷ CO. PVR = (mean PA − wedge) ÷ CO, in Wood units (× 80 for dyn). CI uses Mosteller BSA. The shock pattern is a textbook match, not a diagnosis: read it with the patient, the echo and the trend.</p>`;

  function hemo() {
    const hr = num('hHR'), sbp = num('hSBP'), dbp = num('hDBP'), cvp = num('hCVP'), co = num('hCO');
    const pas = num('hPAS'), pad = num('hPAD'), wedge = num('hPCWP');
    let ht = num('hHt'), wt = num('hWt');
    if (ht != null && $('hHtU').value === 'in') ht *= 2.54;
    if (wt != null && $('hWtU').value === 'lb') wt /= 2.20462;
    const map = num('hMAP') ?? (sbp != null && dbp != null ? (sbp + 2 * dbp) / 3 : null);
    const mpap = num('hMPAP') ?? (pas != null && pad != null ? (pas + 2 * pad) / 3 : null);
    const bsa = ht && wt ? Math.sqrt(ht * wt / 3600) : null;
    const ci = co && bsa ? co / bsa : null;
    const sv = co && hr ? co * 1000 / hr : null;
    const svr = map != null && cvp != null && co ? 80 * (map - cvp) / co : null;
    const pvr = mpap != null && wedge != null && co ? (mpap - wedge) / co : null;
    const tpg = mpap != null && wedge != null ? mpap - wedge : null;
    const cpo = map != null && co ? map * co / 451 : null;
    const papi = pas != null && pad != null && cvp ? (pas - pad) / cvp : null;
    const rapw = cvp != null && wedge ? cvp / wedge : null;

    // [label, value, normal, flag]
    const fl = (v, lo, hi) => v == null ? '' : (lo != null && v < lo) ? 'lo' : (hi != null && v > hi) ? 'hi' : 'ok';
    const rows = [
      ['MAP', map != null ? `${f0(map)} mmHg` : null, '70–100 (goal ≥ 65)', fl(map, 65, null)],
      ['Cardiac output', co != null ? `${f1(co)} L/min` : null, '4–8', fl(co, 4, 8)],
      ['Cardiac index', ci != null ? `${f1(ci)} L/min/m²` : null, '2.5–4.0 (shock < 2.2)', fl(ci, 2.2, null)],
      ['Stroke volume', sv != null ? `${f0(sv)} mL` : null, '60–100', fl(sv, 60, 100)],
      ['SVR', svr != null ? `${f0(svr)} dyn·s/cm⁵` : null, '800–1,200', fl(svr, 800, 1200)],
      ['CVP / RAP', cvp != null ? `${f0(cvp)} mmHg` : null, '2–8', fl(cvp, 2, 8)],
      ['Wedge (PCWP)', wedge != null ? `${f0(wedge)} mmHg` : null, '6–12 (high > 15)', fl(wedge, 6, 15)],
      ['Mean PA', mpap != null ? `${f0(mpap)} mmHg` : null, '≤ 20', fl(mpap, null, 20)],
      ['PVR', pvr != null ? `${f1(pvr)} WU · ${f0(pvr * 80)} dyn` : null, '≤ 2 WU (≤ 160 dyn)', fl(pvr, null, 2)],
      ['Transpulmonary gradient', tpg != null ? `${f0(tpg)} mmHg` : null, '< 12', fl(tpg, null, 12)],
      ['Cardiac power output', cpo != null ? `${f2(cpo)} W` : null, '≥ 0.6 (worse outcomes below)', fl(cpo, 0.6, null)],
      ['PAPi (RV function)', papi != null ? f2(papi) : null, '> 0.9 (lower = RV failure)', fl(papi, 0.9, null)],
      ['RA ÷ wedge', rapw != null ? f2(rapw) : null, '< 0.63 (higher = RV-heavy)', fl(rapw, null, 0.63)],
    ].filter(r => r[1] != null);
    const mark = { lo: '<span class="flag-lo">↓ low</span>', hi: '<span class="flag-hi">↑ high</span>', ok: '<span class="flag-ok">ok</span>', '': '' };
    $('hOut').innerHTML = rows.length ? rows.map(r =>
      `<tr><td><b style="color:var(--ink)">${r[0]}</b><br><span style="font-size:13px">normal ${r[2]}</span></td><td><b>${r[1]}</b><br>${mark[r[3]]}</td></tr>`).join('')
      : '<tr><td colspan="2">Nothing to show yet.</td></tr>';

    // ---- shock pattern ----
    const el = $('hShock');
    const set = (cls, txt) => { el.className = 'status ' + cls; el.innerHTML = txt; };
    const lowFlow = ci != null ? ci < 2.2 : co != null ? co < 4 : null;
    if (lowFlow == null || svr == null) return set('s-neutral', 'Enter MAP (or BP), CVP and CO to see a shock pattern. Add wedge to tell cardiogenic from hypovolemic.');
    const flowTxt = ci != null ? `CI ${f1(ci)}` : `CO ${f1(co)}`;
    const hiW = wedge != null && wedge > 15, hiC = cvp > 8;
    const noW = wedge == null ? '<br><span style="font-weight:400">Add wedge to firm this up.</span>' : '';
    if (svr < 800 && !lowFlow) return set('s-over', `Pattern: <b>DISTRIBUTIVE</b> (septic, anaphylactic, neurogenic)<br><span style="font-weight:400">Low SVR (${f0(svr)}) with normal/high flow (${flowTxt}).</span>`);
    if (svr < 800 && lowFlow) return set('s-over', `Pattern: <b>MIXED</b> — low SVR and low flow<br><span style="font-weight:400">E.g. late sepsis with a depressed heart. SVR ${f0(svr)}, ${flowTxt}.</span>`);
    if (!lowFlow) return set('s-ok', `No shock pattern by these numbers. Flow ${flowTxt}, SVR ${f0(svr)}.`);
    if (hiW && cvp > 12 && Math.abs(cvp - wedge) <= 5)
      return set('s-over', `Pattern: <b>OBSTRUCTIVE — possible TAMPONADE</b><br><span style="font-weight:400">CVP (${f0(cvp)}) and wedge (${f0(wedge)}) high and nearly equal, low flow. Biventricular failure can look the same: get an echo.</span>`);
    if (hiW) return set('s-over', `Pattern: <b>CARDIOGENIC</b>${hiC ? ' (LV + RV — CVP high too)' : ' (LV)'}<br><span style="font-weight:400">Low flow (${flowTxt}), high wedge (${f0(wedge)}), SVR ${f0(svr)}.</span>`);
    if (hiC) return set('s-over', `Pattern: <b>RV FAILURE or OBSTRUCTIVE (PE)</b><br><span style="font-weight:400">High CVP (${f0(cvp)}) without high wedge, low flow (${flowTxt}).</span>${noW}`);
    return set('s-over', `Pattern: <b>HYPOVOLEMIC</b><br><span style="font-weight:400">Low flow (${flowTxt}), low filling pressures (CVP ${f0(cvp)}${wedge != null ? `, wedge ${f0(wedge)}` : ''}), SVR ${f0(svr)}.</span>${noW}`);
  }
  $('calcHemo').addEventListener('input', hemo);
  $('hClear').onclick = () => { $('calcHemo').querySelectorAll('input').forEach(i => i.value = ''); hemo(); };
  hemo();

  // =====================================================================
  // ABG INTERPRETER
  // =====================================================================
  $('calcAbg').innerHTML = `
    <div class="card">
      <h2>Inputs</h2>
      <div class="grid2">
        ${field('aPH', 'pH', '7.40')}${field('aCO2', 'PaCO₂', '40')}
        ${field('aHCO3', 'HCO₃⁻', '24')}${field('aNa', 'Na⁺', '140')}
        ${field('aCl', 'Cl⁻', '104')}${field('aAlb', 'Albumin (g/dL)', '4.0')}
        ${field('aPO2', 'PaO₂ (optional)', '90')}${field('aFiO2', 'FiO₂ % (optional)', '21')}
        ${field('aAge', 'Age (optional)', 'for A-a')}
      </div>
      <button class="small" id="aClear" style="margin-top:12px;width:100%">Clear</button>
    </div>
    <div class="status s-neutral" id="aSum">Enter pH, PaCO₂ and HCO₃⁻ to start.</div>
    <div class="card"><h2>Step by step</h2><ol class="steps" id="aSteps"></ol></div>
    <p class="note">Assumes an arterial sample at sea level. Normal anion gap varies by lab (about 8–12). Use with the clinical picture.</p>`;

  function abg() {
    const pH = num('aPH'), co2 = num('aCO2'), hco3 = num('aHCO3'), na = num('aNa'), cl = num('aCl'), alb = num('aAlb');
    const po2 = num('aPO2'), age = num('aAge'); let fio2 = num('aFiO2');
    const steps = [], add = (lbl, txt) => steps.push(`<li><div class="lbl">${lbl}</div>${txt}</li>`);
    const sum = $('aSum'); const setSum = (cls, t) => { sum.className = 'status ' + cls; sum.innerHTML = t; };
    if (pH == null || co2 == null || hco3 == null) { $('aSteps').innerHTML = ''; return setSum('s-neutral', 'Enter pH, PaCO₂ and HCO₃⁻ to start.'); }
    const dx = [];

    // 0. internal consistency
    const pHcalc = 6.1 + Math.log10(hco3 / (0.03 * co2));
    const bad = Math.abs(pHcalc - pH) > 0.05;
    if (bad)
      add('Check first', `<span class="flag-hi">These numbers don't fit together.</span> PaCO₂ ${co2} and HCO₃⁻ ${hco3} predict pH ${f2(pHcalc)}. Look for a typo, a venous sample, or a stale BMP.`);

    // 1. pH
    const state = pH < 7.35 ? 'acid' : pH > 7.45 ? 'alk' : 'norm';
    add('1 · pH', state === 'acid' ? `${pH} → <b>acidemia</b> (below 7.35)` : state === 'alk' ? `${pH} → <b>alkalemia</b> (above 7.45)` : `${pH} → normal range (7.35–7.45)`);

    // 2. primary process
    let primary = null;
    const metA = hco3 < 22, respA = co2 > 45, metK = hco3 > 26, respK = co2 < 35;
    if (state === 'acid') primary = metA && respA ? 'mixedAcid' : metA ? 'metAcid' : respA ? 'respAcid' : null;
    if (state === 'alk') primary = metK && respK ? 'mixedAlk' : metK ? 'metAlk' : respK ? 'respAlk' : null;
    const P = { metAcid: 'Metabolic acidosis', respAcid: 'Respiratory acidosis', metAlk: 'Metabolic alkalosis', respAlk: 'Respiratory alkalosis',
      mixedAcid: 'Mixed respiratory + metabolic acidosis', mixedAlk: 'Mixed respiratory + metabolic alkalosis' };
    if (primary) {
      add('2 · Primary problem', `PaCO₂ ${co2} (35–45), HCO₃⁻ ${hco3} (22–26) → <b>${P[primary]}</b>`);
      dx.push(P[primary]);
    } else if (state === 'norm') {
      const t = co2 > 45 && hco3 > 26 ? 'Respiratory acidosis + metabolic alkalosis (or one fully compensating the other)'
        : co2 < 35 && hco3 < 22 ? 'Respiratory alkalosis + metabolic acidosis (or one fully compensating the other)'
        : (co2 < 35 || co2 > 45 || hco3 < 22 || hco3 > 26) ? 'Normal pH with abnormal values: suspect a mixed disorder' : 'PaCO₂ and HCO₃⁻ normal';
      add('2 · Primary problem', `PaCO₂ ${co2}, HCO₃⁻ ${hco3} → <b>${t}</b>`);
      if (t !== 'PaCO₂ and HCO₃⁻ normal') dx.push(t);
    } else {
      add('2 · Primary problem', `pH is off but PaCO₂ ${co2} and HCO₃⁻ ${hco3} don't explain it. Recheck the values.`);
    }

    // 3. compensation
    const rng = (e) => `${f0(e - 2)}–${f0(e + 2)}`;
    if (primary === 'metAcid') {
      const e = 1.5 * hco3 + 8;
      const r = co2 > e + 2 ? ['<b>plus respiratory acidosis</b> (not blowing off enough CO₂ — tiring?)', 'plus respiratory acidosis']
        : co2 < e - 2 ? ['<b>plus respiratory alkalosis</b>', 'plus respiratory alkalosis'] : ['appropriately compensated', null];
      add('3 · Compensation (Winter\'s)', `Expected PaCO₂ = 1.5 × ${hco3} + 8 ± 2 = <b>${rng(e)}</b>. Actual ${co2} → ${r[0]}`);
      if (r[1]) dx.push(r[1]);
    } else if (primary === 'metAlk') {
      const e = 0.7 * hco3 + 21;
      const r = co2 > e + 2 ? ['<b>plus respiratory acidosis</b>', 'plus respiratory acidosis'] : co2 < e - 2 ? ['<b>plus respiratory alkalosis</b>', 'plus respiratory alkalosis'] : ['appropriately compensated', null];
      add('3 · Compensation', `Expected PaCO₂ = 0.7 × ${hco3} + 21 ± 2 = <b>${rng(e)}</b>. Actual ${co2} → ${r[0]}`);
      if (r[1]) dx.push(r[1]);
    } else if (primary === 'respAcid') {
      const d = (co2 - 40) / 10, ac = 24 + d, ch = 24 + 3.5 * d;
      const r = hco3 < ac - 2 ? ['<b>plus metabolic acidosis</b>', 'plus metabolic acidosis'] : hco3 > ch + 2 ? ['<b>plus metabolic alkalosis</b>', 'plus metabolic alkalosis']
        : Math.abs(hco3 - ac) <= 2 ? ['fits <b>acute</b>', 'acute'] : Math.abs(hco3 - ch) <= 2 ? ['fits <b>chronic</b> (kidneys have caught up)', 'chronic'] : ['in between: <b>acute on chronic</b>', 'acute on chronic'];
      add('3 · Compensation', `Expected HCO₃⁻: acute ≈ <b>${f0(ac)}</b> (+1 per 10), chronic ≈ <b>${f0(ch)}</b> (+3.5 per 10). Actual ${hco3} → ${r[0]}`);
      dx[dx.length - 1] = r[1].startsWith('plus') ? dx[dx.length - 1] + ' ' + r[1] : `${r[1][0].toUpperCase() + r[1].slice(1)} respiratory acidosis`;
    } else if (primary === 'respAlk') {
      const d = (40 - co2) / 10, ac = 24 - 2 * d, ch = 24 - 4 * d;
      const r = hco3 > ac + 2 ? ['<b>plus metabolic alkalosis</b>', 'plus metabolic alkalosis'] : hco3 < ch - 2 ? ['<b>plus metabolic acidosis</b>', 'plus metabolic acidosis']
        : Math.abs(hco3 - ac) <= 2 ? ['fits <b>acute</b>', 'acute'] : ['fits <b>chronic</b>', 'chronic'];
      add('3 · Compensation', `Expected HCO₃⁻: acute ≈ <b>${f0(ac)}</b> (−2 per 10), chronic ≈ <b>${f0(ch)}</b> (−4 per 10). Actual ${hco3} → ${r[0]}`);
      dx[dx.length - 1] = r[1].startsWith('plus') ? dx[dx.length - 1] + ' ' + r[1] : `${r[1][0].toUpperCase() + r[1].slice(1)} respiratory alkalosis`;
    } else if (primary) {
      add('3 · Compensation', 'Both systems push the same way, so nothing is compensating. This is the dangerous kind.');
    }

    // 4. anion gap
    if (na != null && cl != null) {
      const ag = na - cl - hco3, agC = alb != null ? ag + 2.5 * (4 - alb) : null, use = agC ?? ag, high = use > 12;
      add('4 · Anion gap', `Na − (Cl + HCO₃⁻) = ${na} − (${cl} + ${hco3}) = <b>${f0(ag)}</b>` +
        (agC != null ? `<br>Albumin-corrected: ${f0(ag)} + 2.5 × (4.0 − ${alb}) = <b>${f1(agC)}</b>` : '<br><span class="label">Add albumin to correct it. Low albumin hides a gap.</span>') +
        `<br>→ ${high ? '<b class="flag-hi">HIGH</b> (over 12). Think GOLDMARK: glycols, oxoproline, L-lactate, D-lactate, methanol, aspirin, renal failure, ketoacidosis.' : 'normal (12 or less)'}`);
      if (high) {
        if (!dx.some(d => /metabolic acidosis/i.test(d))) dx.push('hidden anion gap metabolic acidosis');
        else dx[dx.findIndex(d => /metabolic acidosis/i.test(d))] = dx.find(d => /metabolic acidosis/i.test(d)).replace(/metabolic acidosis/i, 'anion gap metabolic acidosis');
        // 5. delta-delta
        if (hco3 < 24) {
          const r = (use - 12) / (24 - hco3);
          const t = r < 0.8 ? ['<b>plus a non-gap acidosis</b> (HCO₃⁻ fell more than the gap rose)', 'plus non-gap metabolic acidosis']
            : r > 2 ? ['<b>plus metabolic alkalosis</b> (HCO₃⁻ fell less than expected)', 'plus metabolic alkalosis'] : ['pure gap acidosis', null];
          add('5 · Delta ratio', `(gap − 12) ÷ (24 − HCO₃⁻) = ${f1(use - 12)} ÷ ${f1(24 - hco3)} = <b>${f1(r)}</b> → ${t[0]}<br><span class="label">Under 0.8: extra non-gap acidosis · 0.8–2: pure gap · over 2: extra alkalosis</span>`);
          if (t[1]) dx.push(t[1]);
        } else {
          add('5 · Delta ratio', `High gap with HCO₃⁻ ${hco3}: a <b>metabolic alkalosis is hiding the acidosis</b>.`);
          dx.push('plus metabolic alkalosis');
        }
      } else if (primary === 'metAcid' || primary === 'mixedAcid') {
        add('5 · Normal-gap acidosis', 'Gap is normal, so this is a <b>non-gap (hyperchloremic) acidosis</b>. Think diarrhea, lots of normal saline, RTA, early kidney injury.');
        const i = dx.findIndex(d => /metabolic acidosis/i.test(d)); if (i >= 0) dx[i] = dx[i].replace(/metabolic acidosis/i, 'non-gap metabolic acidosis');
      }
    } else {
      add('4 · Anion gap', '<span class="label">Add Na⁺ and Cl⁻ (and albumin) to check the gap.</span>');
    }

    // 6. oxygenation
    if (po2 != null && fio2 != null) {
      if (fio2 > 1) fio2 /= 100;
      const pf = po2 / fio2, pA = fio2 * 713 - co2 / 0.8, aa = pA - po2;
      const pfT = pf >= 300 ? 'normal (300 or more)' : pf >= 200 ? '<b>mild</b> impairment (200–300)' : pf >= 100 ? '<b>moderate</b> (100–200)' : '<b>severe</b> (under 100)';
      const exp = age != null ? age / 4 + 4 : null;
      add('6 · Oxygenation', `P/F ratio = ${po2} ÷ ${f2(fio2)} = <b>${f0(pf)}</b> → ${pfT}` +
        `<br>A-a gradient = ${f0(pA)} − ${po2} = <b>${f0(aa)}</b>` + (exp != null ? ` (expected about ${f0(exp)} for age ${age})` : ' (normal under about 15 on room air; add age for a better estimate)') +
        (fio2 > 0.21 ? '<br><span class="label">A-a is less reliable on supplemental oxygen; trust P/F more.</span>' : '') +
        '<br><span class="label">P/F grades match ARDS severity only with bilateral infiltrates and PEEP ≥ 5.</span>');
    }

    $('aSteps').innerHTML = steps.join('');
    if (bad) return setSum('s-due', `<b>Recheck the values</b> — pH, PaCO₂ and HCO₃⁻ don't agree. See step 1.`);
    if (!dx.length) return setSum('s-ok', 'No acid-base disorder found.');
    const txt = dx.join(', ').replace(/, plus/g, ' plus');
    setSum(state === 'norm' ? 's-due' : 's-over', `<b>${txt[0].toUpperCase() + txt.slice(1)}</b>`);
  }
  $('calcAbg').addEventListener('input', abg);
  $('aClear').onclick = () => { $('calcAbg').querySelectorAll('input').forEach(i => i.value = ''); abg(); };
  abg();
})();
