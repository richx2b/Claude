// Ventilator tab: ideal body weight, tidal volumes, starting settings, "what to change" from vent + ABG numbers.
// Adult only. Rules follow ARDSNet lung-protective ventilation. Nothing is saved.
(() => {
  const $ = id => document.getElementById(id);
  const num = id => { const v = parseFloat($(id).value); return isNaN(v) ? null : v; };
  const f0 = x => Math.round(x).toLocaleString();
  const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
  const st = { sex: 'M', unit: 'ftin', lung: 'normal' };

  // ARDSNet lower PEEP / higher FiO2 table
  const TBL = [[30, 5], [40, 5], [40, 8], [50, 8], [50, 10], [60, 10], [70, 10], [70, 12], [70, 14], [80, 14], [90, 14], [90, 16], [90, 18], [100, 18]];
  const stepTxt = s => `FiO₂ ${s[0]}% · PEEP ${s[0] === 100 ? '18–24' : s[1]}`;
  const nearest = (f, p) => TBL.reduce((b, s, i) => {
    const d = Math.abs(s[0] - f) / 10 + Math.abs(s[1] - Math.min(p, 18)) / 2;
    return d < b.d ? { i, d } : b;
  }, { i: 0, d: 1e9 }).i;

  const fld = (id, label, ph) => `<div class="fld"><label for="${id}">${label}</label><input type="number" inputmode="decimal" id="${id}" placeholder="${ph}"></div>`;

  $('vent').innerHTML = `
    <div class="card">
      <h2>Ideal body weight</h2>
      <div class="row" style="margin-bottom:10px">
        <div class="seg"><button id="vM" class="sel">Male</button><button id="vF">Female</button></div>
        <div class="seg"><button id="vUft" class="sel">ft / in</button><button id="vUcm">cm</button></div>
      </div>
      <div class="grid2" id="vHtFt">${fld('vFt', 'Feet', '5')}${fld('vIn', 'Inches', '10')}</div>
      <div id="vHtCm" class="hidden">${fld('vCm', 'Height (cm)', '178')}</div>
      <div class="row" style="align-items:flex-end;margin-top:12px">
        <div><div class="label">IBW</div><div class="mid" id="vIBW">— kg</div></div>
        <div style="text-align:right"><div class="label" id="vHtConv">&nbsp;</div></div>
      </div>
      <div id="vIbwWarn" class="warn hidden"></div>
      <p class="note">Male 50 + 2.3 kg per inch over 5 ft · Female 45.5 + 2.3 kg per inch over 5 ft. Set tidal volume from IBW, never actual weight.</p>
    </div>

    <div class="card">
      <h2>Tidal volume by IBW</h2>
      <table id="vVtTbl"></table>
    </div>

    <div class="card">
      <div class="row" style="align-items:center;margin-bottom:8px">
        <h2 style="margin:0">Typical starting settings</h2>
        <div class="seg" style="flex:0 0 170px"><button id="vLn" class="sel">Normal</button><button id="vLa">ARDS</button></div>
      </div>
      <table id="vStart"></table>
    </div>

    <div class="card">
      <h2>What to change</h2>
      <p class="note" style="margin:0 0 10px">Put in current settings and the latest gas. Leave blank what you don't have.</p>
      <div class="grid2">
        ${fld('vVT', 'Set VT (mL)', '450')}${fld('vRR', 'Set RR', '16')}
        ${fld('vPEEP', 'PEEP', '5')}${fld('vFiO2', 'FiO₂ %', '40')}
        ${fld('vPplat', 'Plateau (Pplat)', '≤ 30')}${fld('vPeak', 'Peak pressure', 'optional')}
        ${fld('vPH', 'pH', '7.40')}${fld('vCO2', 'PaCO₂', '40')}
        ${fld('vSpO2', 'SpO₂ %', '94')}${fld('vPO2', 'PaO₂ (optional)', '80')}
      </div>
      <button class="small" id="vClear" style="margin-top:12px;width:100%">Clear</button>
    </div>
    <div class="card"><h2>Suggestions</h2><ol class="steps" id="vSug"></ol></div>

    <div class="card">
      <h2>ARDSNet PEEP / FiO₂ table (lower PEEP)</h2>
      <div id="vTbl" style="display:flex;flex-wrap:wrap;gap:6px"></div>
      <p class="note">Move one step at a time. Highlighted = closest to current settings.</p>
    </div>

    <div class="card">
      <details>
        <summary>Alarm or sudden desat? DOPE</summary>
        <table style="margin-top:8px">
          <tr><td>D — Displacement</td><td>Tube moved or out? Check depth at the teeth, ETCO₂, breath sounds both sides.</td></tr>
          <tr><td>O — Obstruction</td><td>Kink, biting, secretions, mucus plug. Suction, bite block.</td></tr>
          <tr><td>P — Pneumothorax</td><td>High pressures, one-sided breath sounds, falling BP. Tell the provider now.</td></tr>
          <tr><td>E — Equipment</td><td>Vent, circuit, O₂ supply. Unsure? Off the vent and bag with 100%.</td></tr>
          <tr><td>S — Stacking</td><td>Auto-PEEP (COPD/asthma). Disconnect briefly to let air out, then lower RR or shorten I-time.</td></tr>
        </table>
      </details>
    </div>
    <p class="note">Adult only. Suggestions are the usual next step, not orders. Changes go through the provider or RT per your unit's protocol. Recheck a gas about 20–30 min after a change.</p>`;

  function seg(a, b, on) { $(a).classList.toggle('sel', on); $(b).classList.toggle('sel', !on); }
  $('vM').onclick = () => { st.sex = 'M'; seg('vM', 'vF', true); run(); };
  $('vF').onclick = () => { st.sex = 'F'; seg('vM', 'vF', false); run(); };
  $('vUft').onclick = () => { st.unit = 'ftin'; seg('vUft', 'vUcm', true); $('vHtFt').classList.remove('hidden'); $('vHtCm').classList.add('hidden'); run(); };
  $('vUcm').onclick = () => { st.unit = 'cm'; seg('vUft', 'vUcm', false); $('vHtFt').classList.add('hidden'); $('vHtCm').classList.remove('hidden'); run(); };
  $('vLn').onclick = () => { st.lung = 'normal'; seg('vLn', 'vLa', true); run(); };
  $('vLa').onclick = () => { st.lung = 'ards'; seg('vLn', 'vLa', false); run(); };
  $('vent').addEventListener('input', run);
  $('vClear').onclick = () => { ['vVT', 'vRR', 'vPEEP', 'vFiO2', 'vPplat', 'vPeak', 'vPH', 'vCO2', 'vSpO2', 'vPO2'].forEach(i => $(i).value = ''); run(); };

  function heightIn() {
    if (st.unit === 'cm') { const c = num('vCm'); return c ? c / 2.54 : null; }
    const ft = num('vFt'), inch = num('vIn');
    if (ft == null && inch == null) return null;
    return (ft || 0) * 12 + (inch || 0);
  }

  function run() {
    const ard = st.lung === 'ards';
    const hin = heightIn();
    const ibw = hin ? (st.sex === 'M' ? 50 : 45.5) + 2.3 * (hin - 60) : null;
    const ok = ibw && ibw > 20;

    // IBW
    $('vIBW').textContent = ok ? `${f1(ibw)} kg` : '— kg';
    $('vHtConv').textContent = hin ? `${Math.floor(hin / 12)} ft ${f0(hin % 12)} in = ${f0(hin * 2.54)} cm` : ' ';
    const w = !hin ? '' : hin < 48 || hin > 90 ? 'Check the height — that looks off for an adult.'
      : hin < 60 ? 'Under 5 ft: the formula still applies but gives a small IBW. Double-check the tidal volume with RT.' : '';
    $('vIbwWarn').textContent = w; $('vIbwWarn').classList.toggle('hidden', !w);

    // VT table
    const goal = ard ? 6 : null;
    $('vVtTbl').innerHTML = [4, 5, 6, 7, 8].map(k => {
      const hi = ard ? k === 6 : k >= 6 && k <= 8;
      return `<tr${hi ? ' style="background:var(--green-bg)"' : ''}><td><b style="color:var(--ink)">${k} mL/kg</b>${k === 6 ? ' <span class="label">ARDS target</span>' : k === 4 ? ' <span class="label">floor</span>' : ''}</td><td><b>${ok ? f0(k * ibw) + ' mL' : '—'}</b></td></tr>`;
    }).join('');

    // Starting settings
    const vt = (a, b) => ok ? `${f0(a * ibw)}–${f0(b * ibw)} mL` : `${a}–${b} mL/kg IBW`;
    const rows = ard ? [
      ['Mode', 'Volume control (AC/VC)'],
      ['Tidal volume', `Start 8 mL/kg, drop to 6 within 4 hr: ${ok ? f0(6 * ibw) + ' mL' : '6 mL/kg IBW'}`],
      ['Rate', '18–22, up to 35 to keep pH ≥ 7.30'],
      ['PEEP / FiO₂', 'Use the PEEP/FiO₂ table below'],
      ['O₂ goal', 'SpO₂ 88–95% · PaO₂ 55–80'],
      ['pH goal', '7.30–7.45 (higher CO₂ is OK)'],
      ['Pressures', 'Plateau ≤ 30 · driving pressure (Pplat − PEEP) ≤ 15'],
    ] : [
      ['Mode', 'Volume control (AC/VC)'],
      ['Tidal volume', `6–8 mL/kg IBW: ${vt(6, 8)}`],
      ['Rate', '14–18 · minute ventilation about 6–8 L/min'],
      ['PEEP', '5'],
      ['FiO₂', 'Start 100%, wean fast to the SpO₂ goal'],
      ['O₂ goal', 'SpO₂ 92–96% (88–92% for CO₂ retainers)'],
      ['Flow / I:E', 'About 60 L/min · I:E 1:2 (1:3–1:4 in asthma/COPD)'],
      ['Pressures', 'Plateau ≤ 30 · driving pressure ≤ 15'],
    ];
    $('vStart').innerHTML = rows.map(r => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td></tr>`).join('');

    // ---------- suggestions ----------
    const VT = num('vVT'), RR = num('vRR'), PEEP = num('vPEEP'), FiO2 = num('vFiO2'), Pplat = num('vPplat'), Peak = num('vPeak');
    const pH = num('vPH'), CO2 = num('vCO2'), SpO2 = num('vSpO2'), PO2 = num('vPO2');
    const out = [], add = (lbl, txt, cls = '') => out.push(`<li><div class="lbl">${lbl}</div><span class="${cls}">${txt}</span></li>`);

    // Tidal volume
    if (VT != null) {
      if (!ok) add('Tidal volume', 'Enter height above to check mL/kg.');
      else {
        const k = VT / ibw, max = ard ? 6.5 : 8.5;
        if (k > max) add('Tidal volume', `${f0(VT)} mL = <b>${f1(k)} mL/kg</b> — too big. Lower to <b>${f0((ard ? 6 : 8) * ibw)} mL</b> (${ard ? 6 : 8} mL/kg) and raise RR to keep minute ventilation.`, 'flag-hi');
        else if (k < 4) add('Tidal volume', `${f0(VT)} mL = <b>${f1(k)} mL/kg</b> — below the 4 mL/kg floor. Check the setting.`, 'flag-hi');
        else add('Tidal volume', `${f0(VT)} mL = <b>${f1(k)} mL/kg</b> — in range.`, 'flag-ok');
      }
    }

    // Pressures
    if (Pplat != null) {
      const dp = PEEP != null ? Pplat - PEEP : null;
      if (Pplat > 30) add('Plateau', `<b>${Pplat}</b> is over 30. Lower VT by 1 mL/kg${ok ? ` (about ${f0(ibw)} mL)` : ''} at a time, down to 4 mL/kg if needed. Check for auto-PEEP, pneumothorax, belly distension.`, 'flag-hi');
      else if (ard && Pplat < 25 && VT != null && ok && VT / ibw < 6) add('Plateau', `<b>${Pplat}</b> with VT under 6 mL/kg: OK to raise VT by 1 mL/kg (ARDSNet).`);
      else add('Plateau', `<b>${Pplat}</b> — at or under 30.`, 'flag-ok');
      if (dp != null) add('Driving pressure', `Pplat − PEEP = <b>${f0(dp)}</b> ${dp > 15 ? '— over 15. Linked with worse outcomes; try a smaller VT.' : '— 15 or less, good.'}`, dp > 15 ? 'flag-hi' : 'flag-ok');
    }
    if (Peak != null && Pplat != null) {
      const g = Peak - Pplat;
      if (g > 10) add('Peak vs plateau', `Gap ${f0(g)} (over 10) = <b>airway resistance</b>: secretions (suction), bronchospasm (bronchodilator), kinked tube or biting.`, 'flag-hi');
      else if (Peak > 35) add('Peak vs plateau', `Both high, small gap = <b>stiff lungs or chest</b>: pneumothorax, ARDS, mainstem intubation, belly pressure.`, 'flag-hi');
    }

    // Ventilation (CO2)
    if (pH != null && CO2 != null) {
      const lo = ard ? 7.30 : 7.35;
      const newRR = RR != null ? Math.round(RR * CO2 / 40) : null;
      if (pH < lo && CO2 > 45) {
        add('Ventilation', `pH ${pH}, PaCO₂ ${CO2}: <b>under-ventilated</b>. ` + (RR != null
          ? `Raise RR from ${RR} to about <b>${Math.min(newRR, 35)}</b>${newRR > 35 ? ' (35 is the max — tell the provider)' : ''}. Keep VT where it is.`
          : 'Raise the rate (enter set RR for a number).') + (ard ? ' In ARDS a higher CO₂ is fine as long as pH ≥ 7.30.' : ''), 'flag-hi');
      } else if (pH < lo) {
        add('Ventilation', `pH ${pH} with PaCO₂ ${CO2}: the acidosis is <b>metabolic</b>, not the vent. Tell the provider; don't drop the rate${CO2 < 35 ? ' — they\'re blowing off CO₂ to compensate' : ''}.`, 'flag-hi');
      } else if (pH > 7.45 && CO2 < 35) {
        add('Ventilation', `pH ${pH}, PaCO₂ ${CO2}: <b>over-ventilated</b>. ` + (RR != null
          ? `Lower RR from ${RR} to about <b>${Math.max(newRR, 8)}</b>.` : 'Lower the rate.') +
          ' If they\'re breathing over the set rate, lowering it won\'t help: look at pain, anxiety, sedation.', 'flag-hi');
      } else if (pH > 7.45) {
        add('Ventilation', `pH ${pH} with PaCO₂ ${CO2}: <b>metabolic alkalosis</b>. Not a vent fix; tell the provider.`, 'flag-hi');
      } else {
        add('Ventilation', `pH ${pH}, PaCO₂ ${CO2} — acceptable. No rate change needed.`, 'flag-ok');
      }
      if (RR != null && VT != null) add('Minute ventilation', `${f0(VT)} mL × ${RR} = <b>${f1(VT * RR / 1000)} L/min</b>`);
    }

    // Oxygenation
    const useSp = SpO2 != null;
    if (useSp || PO2 != null) {
      const [loG, hiG] = useSp ? (ard ? [88, 95] : [92, 96]) : (ard ? [55, 80] : [60, 100]);
      const v = useSp ? SpO2 : PO2, lab = useSp ? `SpO₂ ${v}%` : `PaO₂ ${v}`;
      const i = FiO2 != null && PEEP != null ? nearest(FiO2, PEEP) : null;
      if (v < loG) {
        const nx = i != null ? TBL[Math.min(i + 1, TBL.length - 1)] : null;
        add('Oxygenation', `${lab} is under the goal (${loG}–${hiG}). ` + (ard && nx ? `Go up one step: <b>${stepTxt(nx)}</b>.`
          : FiO2 != null && FiO2 >= 60 ? '<b>Raise PEEP</b> (FiO₂ is already 60% or more).' : '<b>Raise FiO₂</b>; add PEEP if it keeps climbing.') +
          ' Check the tube, suction, and DOPE if it dropped suddenly.', 'flag-hi');
      } else if (v > hiG && FiO2 != null && FiO2 > 21) {
        const pv = i != null ? TBL[Math.max(i - 1, 0)] : null;
        add('Oxygenation', `${lab} is above the goal (${loG}–${hiG}). ` + (ard && pv ? `Go down one step: <b>${stepTxt(pv)}</b>.`
          : FiO2 > 40 ? `<b>Wean FiO₂</b> first (to about ${Math.max(FiO2 - 10, 30)}%).` : PEEP != null && PEEP > 5 ? '<b>Wean PEEP</b> toward 5.' : 'Close to minimal settings — think about an SBT.'), 'flag-due');
      } else {
        add('Oxygenation', `${lab} — in the goal range (${loG}–${hiG}).`, 'flag-ok');
      }
      if (PO2 != null && FiO2 != null) {
        const pf = PO2 / (FiO2 / 100);
        add('P/F ratio', `${PO2} ÷ ${f1(FiO2 / 100)} = <b>${f0(pf)}</b> — ${pf >= 300 ? 'normal' : pf >= 200 ? 'mild' : pf >= 100 ? 'moderate' : 'severe'}${pf < 150 ? '. Under 150: ask about proning.' : ''}`, pf < 300 ? 'flag-hi' : 'flag-ok');
      }
    }
    $('vSug').innerHTML = out.length ? out.join('') : '<li style="list-style:none;margin-left:-22px" class="label">Enter settings and a gas to see suggestions.</li>';

    // PEEP/FiO2 table
    const cur = FiO2 != null && PEEP != null ? nearest(FiO2, PEEP) : -1;
    $('vTbl').innerHTML = TBL.map((s, i) => `<span class="pill ${i === cur ? 'p-yes' : ''}" style="${i === cur ? 'outline:2px solid var(--green)' : 'background:var(--btn)'}">${s[0]}% / ${s[0] === 100 ? '18–24' : s[1]}</span>`).join('');
  }
  run();
})();
