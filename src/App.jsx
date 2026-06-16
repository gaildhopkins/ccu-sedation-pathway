import { useState } from "react";

// ─── Colour tokens ────────────────────────────────────────────────
const C = {
  navy:      "#1F3864",
  blue:      "#2E75B6",
  bluePale:  "#D6E4F0",
  blueXPale: "#EBF3FB",
  amber:     "#C05000",
  amberPale: "#FFF3CD",
  red:       "#C00000",
  green:     "#1E5631",
  greenPale: "#E2EFDA",
  gray:      "#F4F4F4",
  grayMid:   "#E8E8E8",
  grayText:  "#4A4A4A",
  white:     "#FFFFFF",
  border:    "#CCCCCC",
};

// ─── Decision tree data ───────────────────────────────────────────
const TREE = {
  id: "start",
  question: "What is the primary CCU indication for sedation?",
  subtitle: "Select patient syndrome",
  options: [
    {
      label: "OHCA / Post-Cardiac Arrest",
      sublabel: "Requiring intubation ± TTM",
      color: C.blue,
      next: "ohca_pain",
    },
    {
      label: "ADHF / Cardiogenic Shock",
      sublabel: "Requiring intubation",
      color: C.amber,
      next: "adhf_pain",
    },
  ],
};

// OHCA branch
const OHCA_NODES = {
  ohca_pain: {
    id: "ohca_pain",
    track: "ohca",
    question: "Step 1 — Analgesia",
    subtitle: "Is pain/noxious stimulus present or anticipated? (Analgesic-first strategy — always)",
    info: null,
    options: [
      { label: "Yes — initiate analgesia", next: "ohca_pain_rx" },
      { label: "No pain — assess for delirium", next: "ohca_delirium" },
    ],
  },
  ohca_pain_rx: {
    id: "ohca_pain_rx",
    track: "ohca",
    question: "Analgesia — OHCA/TTM",
    type: "recommendation",
    rec: {
      title: "Fentanyl — First-Line",
      color: C.blue,
      items: [
        { bold: "Dose:", text: "25–50 mcg IV q10 min PRN; titrate to CPOT ≤2" },
        { bold: "Infusion:", text: "20–50 mcg/hr; reduce 30–50% during active cooling (hypothermia ↓ hepatic clearance)" },
        { bold: "Rewarming:", text: "Retitrate upward as metabolism normalizes — anticipate wakening" },
        { bold: "Multimodal:", text: "Acetaminophen 650–975 mg IV/PO q6h for opioid sparing (if no hepatic failure)" },
        { bold: "Avoid morphine:", text: "Not preferred — histamine release; avoid in ACS context" },
      ],
      monitor: "CPOT q4h | NRS when arousable",
      warning: null,
    },
    next: "ohca_delirium",
    nextLabel: "Continue → Assess for Delirium",
  },
  ohca_delirium: {
    id: "ohca_delirium",
    track: "ohca",
    question: "Step 2 — Delirium",
    subtitle: "Is delirium present or suspected? (100% of TTM survivors have ≥1 delirium day — anticipate)",
    options: [
      { label: "Delirium present / CAM-ICU positive", next: "ohca_delirium_rx" },
      { label: "No delirium — assess sedation need", next: "ohca_sedation_needed" },
    ],
  },
  ohca_delirium_rx: {
    id: "ohca_delirium_rx",
    track: "ohca",
    question: "Delirium Management — OHCA/TTM",
    type: "recommendation",
    rec: {
      title: "Delirium Protocol",
      color: C.blue,
      items: [
        { bold: "Non-pharm first:", text: "Reorientation, clocks/calendars, hearing aids/glasses, light/noise control, early mobilization when safe" },
        { bold: "QTc:", text: "Baseline EKG before any antipsychotic — high TdP risk post-TTM" },
        { bold: "First-line:", text: "Quetiapine 25–50 mg PO/NG BID; increase by 25 mg q24h (target 100–200 mg BID)" },
        { bold: "PRN agitation:", text: "Haloperidol 2.5–5 mg IV — only for acute breakthrough; avoid if QTc >480 ms" },
        { bold: "If QTc >500 ms:", text: "Aripiprazole 5–10 mg PO daily (no QTc prolongation)" },
        { bold: "Near-extubation agitation:", text: "Dexmedetomidine 0.2–0.4 mcg/kg/hr (DahLIA trial — ↓ delirium resolution time)" },
      ],
      monitor: "CAM-ICU q12h when RASS ≥ −3 | QTc at baseline and 48–72h",
      warning: "AVOID benzodiazepines for delirium — ↑ delirium burden, impairs cognitive recovery post-TTM",
    },
    next: "ohca_sedation_needed",
    nextLabel: "Continue → Assess Sedation Need",
  },
  ohca_sedation_needed: {
    id: "ohca_sedation_needed",
    track: "ohca",
    question: "Step 3 — Is adjunctive sedation indicated?",
    subtitle: "After addressing pain and delirium",
    options: [
      { label: "TTM active cooling phase (shivering, ventilator dyssynchrony)", next: "ohca_ttm_sedation" },
      { label: "Persistent agitation despite analgesia + antipsychotics", next: "ohca_sedation_agent" },
      { label: "Patient comfortable — light sedation / SAT candidate", next: "ohca_sat" },
    ],
  },
  ohca_ttm_sedation: {
    id: "ohca_ttm_sedation",
    track: "ohca",
    question: "TTM Sedation Protocol",
    type: "recommendation",
    rec: {
      title: "Active Cooling Phase (Target 33–36°C)",
      color: C.blue,
      items: [
        { bold: "Primary sedation:", text: "Propofol 5–25 mcg/kg/min + Fentanyl infusion" },
        { bold: "Target RASS:", text: "−3 to −4 during cooling; lighten to −1 to 0 at rewarming" },
        { bold: "Shivering (Step 1):", text: "Fentanyl 50 mcg IV bolus + increase propofol by 5 mcg/kg/min" },
        { bold: "Shivering (Step 2):", text: "Cisatracurium 0.15 mg/kg IV bolus → infusion 1–3 mcg/kg/min (Hofmann elimination — ideal in hypothermia)" },
        { bold: "Rewarming:", text: "Reduce propofol and fentanyl — drug concentrations rise as hepatic metabolism resumes; anticipate agitation" },
        { bold: "PRIS monitoring:", text: "TG q48h; anion gap, lactate, CK daily if propofol >4 mg/kg/hr or >48h" },
      ],
      monitor: "RASS q4h | CPOT q4h | TG q48–72h | Temperature q1h",
      warning: "NMBAs have NO sedative/amnestic properties — ensure adequate propofol + fentanyl BEFORE cisatracurium",
    },
    next: "ohca_sat",
    nextLabel: "Continue → SAT/Monitoring",
  },
  ohca_sedation_agent: {
    id: "ohca_sedation_agent",
    track: "ohca",
    question: "Adjunctive Sedation — OHCA (non-TTM)",
    type: "recommendation",
    rec: {
      title: "Agent Selection — OHCA",
      color: C.blue,
      items: [
        { bold: "First-line:", text: "Propofol 5–25 mcg/kg/min — advantages: rapid titration, neuroprotection (ROS scavenging), reduces ICP, frequent neuro exams without stopping" },
        { bold: "Alternative:", text: "Dexmedetomidine 0.2–0.7 mcg/kg/hr — reduces new-onset AF, anti-arrhythmic (vagotonic), allows arousability; omit loading dose if hemodynamically unstable" },
        { bold: "Dexmedetomidine contraindications:", text: "HR <55, 2nd/3rd degree AV block without pacemaker, EF <20%, severe hepatic failure (RVH PPO)" },
        { bold: "Benzodiazepines:", text: "AVOID for routine sedation post-arrest — ↑ delirium, impairs cognitive assessment, prolongs ventilation" },
        { bold: "Target RASS:", text: "−1 to −2 (light sedation) — reassess daily" },
      ],
      monitor: "RASS q4h | Daily SAT | Propofol: TG q48h",
      warning: "Ketamine: AVOID — sympathomimetic, ↑ HR/O₂ demand, may worsen arrhythmia post-ROSC",
    },
    next: "ohca_sat",
    nextLabel: "Continue → SAT/Monitoring",
  },
  ohca_sat: {
    id: "ohca_sat",
    track: "ohca",
    question: "Step 4 — SAT & Monitoring",
    type: "recommendation",
    rec: {
      title: "Ongoing Monitoring — OHCA",
      color: C.blue,
      items: [
        { bold: "Daily SAT:", text: "Hold sedation each morning until following commands — restart at 50% previous rate if re-sedation required" },
        { bold: "SAT contraindications:", text: "Active seizures, raised ICP, active hemodynamic instability, NMBA in use" },
        { bold: "Pair with SBT:", text: "SAT + SBT reduces ICU LOS and 1-year mortality (ABC Trial, Girard 2008)" },
        { bold: "Neuro prognostication:", text: "24–72h post-TTM: EEG, SSEP, brain imaging as indicated — adequate SAT essential for accurate assessment" },
        { bold: "RASS target:", text: "Document on rounds daily; reassess if RASS ≤ −3 without specific indication" },
        { bold: "QTc:", text: "Repeat at 48–72h if on antipsychotics" },
      ],
      monitor: "RASS q4h | CAM-ICU q12h | CPOT q4h | QTc at 48–72h",
      warning: null,
    },
    next: null,
  },
};

// ADHF branch
const ADHF_NODES = {
  adhf_pain: {
    id: "adhf_pain",
    track: "adhf",
    question: "Step 1 — Analgesia",
    subtitle: "Treat pain first — analgesic-first strategy always",
    options: [
      { label: "Yes — initiate analgesia", next: "adhf_pain_rx" },
      { label: "No pain — assess for delirium", next: "adhf_delirium" },
    ],
  },
  adhf_pain_rx: {
    id: "adhf_pain_rx",
    track: "adhf",
    question: "Analgesia — ADHF/Cardiogenic Shock",
    type: "recommendation",
    rec: {
      title: "Fentanyl — First-Line (preferred over morphine)",
      color: C.amber,
      items: [
        { bold: "Dose:", text: "25–50 mcg IV PRN; infusion 20–50 mcg/hr if intubated" },
        { bold: "ADHF benefit:", text: "Fentanyl reduces LV filling pressures and relieves air hunger without significant histamine release" },
        { bold: "Dyspnea:", text: "Fentanyl 25–50 mcg IV — safe for air hunger relief; no histamine-mediated hypotension" },
        { bold: "Multimodal:", text: "Acetaminophen if no hepatic contraindication; avoid NSAIDs (fluid retention, ↓ renal perfusion)" },
        { bold: "Avoid morphine:", text: "CRUSADE registry — IV morphine associated with ↑ in-hospital mortality in ACS; histamine release worsens hypotension in shock; delays ADP inhibitor absorption" },
      ],
      monitor: "CPOT q4h | MAP and CO response to opioid administration",
      warning: "Morphine: NOT recommended in ACS/ADHF — use fentanyl",
    },
    next: "adhf_delirium",
    nextLabel: "Continue → Assess for Delirium",
  },
  adhf_delirium: {
    id: "adhf_delirium",
    track: "adhf",
    question: "Step 2 — Delirium",
    subtitle: "Delirium in HF: incidence 1-in-3; linked to low CO and cerebral hypoperfusion — optimize hemodynamics first",
    options: [
      { label: "Delirium present / CAM-ICU positive", next: "adhf_delirium_rx" },
      { label: "No delirium — assess sedation need", next: "adhf_sedation_needed" },
    ],
  },
  adhf_delirium_rx: {
    id: "adhf_delirium_rx",
    track: "adhf",
    question: "Delirium Management — ADHF",
    type: "recommendation",
    rec: {
      title: "Delirium Protocol — HF Context",
      color: C.amber,
      items: [
        { bold: "Hemodynamics first:", text: "Optimize CO and MAP — cerebral hypoperfusion is a primary deliriogenic mechanism in low-output states" },
        { bold: "Non-pharm:", text: "Reorientation, hearing/vision aids, early mobilization (device permitting), sleep hygiene" },
        { bold: "QTc baseline:", text: "ADHF patients frequently have prolonged QTc — mandatory EKG before antipsychotics; optimize K+ and Mg²+" },
        { bold: "First-line:", text: "Quetiapine 25 mg BID (START LOW in HF — drug clearance reduced with low CO)" },
        { bold: "PRN agitation:", text: "Haloperidol 1–2 mg IV (lower dose in HF); avoid if QTc >480 ms" },
        { bold: "If QTc >500 ms:", text: "Aripiprazole 5 mg PO daily (no QTc prolongation)" },
      ],
      monitor: "CAM-ICU q12h | QTc baseline + 48–72h | Electrolytes daily",
      warning: "Drug clearance ↓ in heart failure — antipsychotics accumulate at standard doses; start at 50% usual dose",
    },
    next: "adhf_sedation_needed",
    nextLabel: "Continue → Assess Sedation Need",
  },
  adhf_sedation_needed: {
    id: "adhf_sedation_needed",
    track: "adhf",
    question: "Step 3 — Is adjunctive sedation indicated?",
    subtitle: "Favour lightest sedation that achieves clinical goals — prefer bolus over continuous infusion",
    options: [
      { label: "Yes — ventilator dyssynchrony / persistent agitation", next: "adhf_lv_function" },
      { label: "No — patient comfortable, consider SAT", next: "adhf_sat" },
    ],
  },
  adhf_lv_function: {
    id: "adhf_lv_function",
    track: "adhf",
    question: "Assess LV Function & Hemodynamic Status",
    subtitle: "This drives agent selection in ADHF — the most important fork in the pathway",
    options: [
      {
        label: "Severe — EF <30% or vasopressors required",
        sublabel: "Cardiogenic shock / severely depressed LV",
        color: C.red,
        next: "adhf_severe_sedation",
      },
      {
        label: "Moderate — EF 30–45%, no vasopressors",
        sublabel: "Decompensated but not in shock",
        color: C.amber,
        next: "adhf_moderate_sedation",
      },
      {
        label: "VT storm / Recurrent VT dominant",
        sublabel: "Arrhythmia management priority",
        color: "#7B1FA2",
        next: "adhf_vt",
      },
    ],
  },
  adhf_severe_sedation: {
    id: "adhf_severe_sedation",
    track: "adhf",
    question: "Sedation — Severe LV Dysfunction / Cardiogenic Shock",
    type: "recommendation",
    rec: {
      title: "Benzodiazepine — Preferred Adjunctive Sedative",
      color: C.amber,
      items: [
        { bold: "Agent:", text: "Midazolam 1–2 mg IV PRN; infusion 0.02–0.05 mg/kg/hr if intubated" },
        { bold: "Rationale:", text: "Benzodiazepines: least CO reduction of all sedative classes; clinically insignificant hemodynamic effects at therapeutic doses (Schenone 2019, Zakaria 2018)" },
        { bold: "AVOID propofol:", text: "Reduces CO ~20%; significant preload/afterload reduction; may precipitate haemodynamic collapse in shock" },
        { bold: "AVOID dexmedetomidine:", text: "EF <20% is RVH PPO contraindication; reduces cardiac output; rare refractory cardiogenic shock (idiosyncratic sympatholytic effect); clearance ↓ with low CO → drug accumulation" },
        { bold: "AVOID ketamine:", text: "In catecholamine-depleted state, direct myocardial depression unmasked; ↑ SVR worsens pulmonary oedema; ↑ arrhythmia risk" },
        { bold: "Infusion caution:", text: "Midazolam >48h — propylene glycol accumulation (anion gap acidosis); consider lorazepam if short infusion preferred" },
        { bold: "Target RASS:", text: "−1 to −2; avoid deeper sedation unless specifically indicated" },
      ],
      monitor: "RASS q4h | MAP, CO (echo or PA catheter) before/after dose changes | Daily SAT",
      warning: "Propofol and dexmedetomidine are CONTRAINDICATED in active cardiogenic shock (vasopressor-dependent)",
    },
    next: "adhf_sat",
    nextLabel: "Continue → SAT/Monitoring",
  },
  adhf_moderate_sedation: {
    id: "adhf_moderate_sedation",
    track: "adhf",
    question: "Sedation — Moderate LV Dysfunction (EF 30–45%, no vasopressors)",
    type: "recommendation",
    rec: {
      title: "Propofol — Acceptable; Titrate Carefully",
      color: C.amber,
      items: [
        { bold: "Start low:", text: "Propofol 5 mcg/kg/min; titrate by 5 mcg/kg/min q5–10 min" },
        { bold: "Haemodynamic threshold:", text: "If MAP falls >15 mmHg from baseline → switch to midazolam" },
        { bold: "Dexmedetomidine:", text: "Cautious use at 0.2–0.4 mcg/kg/hr — benefits: ↓ AF burden, sympatholysis reduces catecholamine requirement, allows arousability; AVOID if HR <55 or EF <20%" },
        { bold: "Propofol vs dex:", text: "Dexmedetomidine associated with shorter extubation time and less delirium (Djaiani 2016, Jakob JAMA 2012); propofol easier to titrate for deeper sedation" },
        { bold: "Benzodiazepines:", text: "Reserve for breakthrough agitation; avoid as primary sedation (↑ delirium, ↑ ventilator time)" },
        { bold: "PRIS monitoring:", text: "TG q48–72h; anion gap, lactate if high-dose or prolonged" },
      ],
      monitor: "RASS q4h | MAP q1–2h (escalate monitoring if on dexmedetomidine) | TG q48–72h | Daily SAT",
      warning: null,
    },
    next: "adhf_sat",
    nextLabel: "Continue → SAT/Monitoring",
  },
  adhf_vt: {
    id: "adhf_vt",
    track: "adhf",
    question: "VT Storm / Recurrent Malignant Ventricular Arrhythmia",
    type: "recommendation",
    rec: {
      title: "Arrhythmia-Specific Sedation Strategy",
      color: "#7B1FA2",
      items: [
        { bold: "Deep sedation goal:", text: "VT storm requires sympathetic suppression — sedation is a direct anti-arrhythmic intervention" },
        { bold: "Analgesia:", text: "Fentanyl 50–100 mcg IV bolus; infusion — opioids ↑ VT threshold via κ-receptor stimulation" },
        { bold: "Primary sedation:", text: "Propofol infusion 5–25 mcg/kg/min — anti-arrhythmic via autonomic modulation; case reports of VT storm termination (Burjorjee 2002); anti-arrhythmic effects replicated in animal models" },
        { bold: "If propofol contraindicated:", text: "Midazolam 1–2 mg IV PRN; infusion 0.02–0.1 mg/kg/hr" },
        { bold: "Dexmedetomidine (adjunct):", text: "0.2–0.4 mcg/kg/hr once acute shock resolved — vagotonic mechanism ↑ arrhythmogenic threshold; reduced new-onset AF 13.6% vs 36.4% (Liu 2016)" },
        { bold: "AVOID haloperidol IV:", text: "↓ VT threshold; causes more TdP/SCD than other antipsychotics despite less QTc prolongation — especially dangerous in VT storm" },
        { bold: "AVOID ketamine:", text: "Catecholamine release ↑ arrhythmia risk; ↑ HR and myocardial O₂ demand" },
        { bold: "Antipsychotics:", text: "Quetiapine PO/NG if needed; aripiprazole if QTc >500 ms; NO IV antipsychotics if QTc >480 ms or active VT" },
      ],
      monitor: "Continuous telemetry | RASS q4h | QTc baseline + 48h | MAP q1–2h",
      warning: "NO IV haloperidol in active VT / QTc >480 ms / concurrent QT-prolonging drugs",
    },
    next: "adhf_sat",
    nextLabel: "Continue → SAT/Monitoring",
  },
  adhf_sat: {
    id: "adhf_sat",
    track: "adhf",
    question: "Step 4 — SAT & Monitoring",
    type: "recommendation",
    rec: {
      title: "Ongoing Monitoring — ADHF",
      color: C.amber,
      items: [
        { bold: "Daily SAT:", text: "Hold sedation each morning until following commands — restart at 50% previous rate if required" },
        { bold: "Extubation priority:", text: "Early extubation associated with ↓ afterload and ↑ CO in ADHF — daily SBT assessment is hemodynamically therapeutic, not just a ventilator goal" },
        { bold: "SAT contraindications:", text: "Active vasopressor escalation, haemodynamic instability, active VT/arrhythmia, inadequate pain control" },
        { bold: "Drug accumulation:", text: "Low CO ↓ hepatic blood flow → ↑ t½ for propofol and dexmedetomidine; titrate cautiously; lower doses than non-cardiac ICU" },
        { bold: "RASS target:", text: "−1 to 0 in most ADHF patients; document daily; question any RASS ≤ −3" },
        { bold: "QTc:", text: "Repeat EKG at 48–72h if on antipsychotics; electrolytes daily" },
      ],
      monitor: "RASS q4h | CAM-ICU q12h | CPOT q4h | QTc at 48–72h | CO monitoring if PA catheter in situ",
      warning: null,
    },
    next: null,
  },
};

const ALL_NODES = { ...OHCA_NODES, ...ADHF_NODES, start: TREE };

// ─── Track colours ────────────────────────────────────────────────
function trackColor(track) {
  if (track === "ohca") return C.blue;
  if (track === "adhf") return C.amber;
  return C.navy;
}
function trackBg(track) {
  if (track === "ohca") return C.blueXPale;
  if (track === "adhf") return C.amberPale;
  return C.gray;
}
function trackLabel(track) {
  if (track === "ohca") return "OHCA / Post-Cardiac Arrest";
  if (track === "adhf") return "ADHF / Cardiogenic Shock";
  return "";
}

// ─── Components ───────────────────────────────────────────────────
function Badge({ text, color, bg }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 99,
      background: bg || color + "22",
      color: color,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      border: `1px solid ${color}44`,
    }}>{text}</span>
  );
}

function WarningBanner({ text }) {
  return (
    <div style={{
      background: "#FFF0F0",
      border: `1.5px solid ${C.red}`,
      borderRadius: 8,
      padding: "10px 14px",
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      marginTop: 12,
    }}>
      <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>⚠️</span>
      <p style={{ margin: 0, fontSize: 13, color: C.red, fontWeight: 600, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function MonitorBanner({ text, color }) {
  return (
    <div style={{
      background: color + "11",
      border: `1px solid ${color}44`,
      borderRadius: 8,
      padding: "9px 14px",
      display: "flex",
      gap: 8,
      alignItems: "center",
      marginTop: 12,
    }}>
      <span style={{ fontSize: 15 }}>📋</span>
      <p style={{ margin: 0, fontSize: 12.5, color, fontWeight: 600 }}>Monitor: {text}</p>
    </div>
  );
}

function RecommendationCard({ rec, track }) {
  const color = trackColor(track);
  return (
    <div style={{
      background: C.white,
      border: `2px solid ${color}`,
      borderRadius: 12,
      overflow: "hidden",
      marginTop: 4,
    }}>
      <div style={{ background: color, padding: "10px 16px" }}>
        <p style={{ margin: 0, color: C.white, fontWeight: 700, fontSize: 15 }}>
          {rec.title}
        </p>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rec.items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 6, fontSize: 13.5, lineHeight: 1.55 }}>
              <span style={{ fontWeight: 700, color, flexShrink: 0, minWidth: 90 }}>{item.bold}</span>
              <span style={{ color: C.grayText }}>{item.text}</span>
            </div>
          ))}
        </div>
        {rec.monitor && <MonitorBanner text={rec.monitor} color={color} />}
        {rec.warning && <WarningBanner text={rec.warning} />}
      </div>
    </div>
  );
}

function OptionButton({ option, onClick, index }) {
  const color = option.color || C.navy;
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 18px",
        borderRadius: 10,
        border: `2px solid ${color}`,
        background: C.white,
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "all 0.15s",
        marginBottom: 10,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = color + "11";
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = C.white;
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: color, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: C.white, fontWeight: 700, fontSize: 14,
      }}>
        {String.fromCharCode(65 + index)}
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 700, color, fontSize: 14 }}>{option.label}</p>
        {option.sublabel && (
          <p style={{ margin: "2px 0 0", fontSize: 12, color: C.grayText }}>{option.sublabel}</p>
        )}
      </div>
    </button>
  );
}

function BreadcrumbBar({ history, onJump, track }) {
  const color = trackColor(track);
  if (history.length <= 1) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16, alignItems: "center" }}>
      {history.map((nodeId, i) => {
        const node = ALL_NODES[nodeId];
        if (!node) return null;
        const isLast = i === history.length - 1;
        const stepNum = i + 1;
        return (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => !isLast && onJump(i)}
              disabled={isLast}
              style={{
                border: "none",
                background: isLast ? color : C.grayMid,
                color: isLast ? C.white : C.grayText,
                padding: "3px 10px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: isLast ? 700 : 500,
                cursor: isLast ? "default" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {stepNum}
            </button>
            {!isLast && <span style={{ color: C.border, fontSize: 12 }}>›</span>}
          </span>
        );
      })}
    </div>
  );
}

// ─── RASS Reference ──────────────────────────────────────────────
const RASS_LEVELS = [
  { score: "+4", label: "Combative", color: "#C00000", desc: "Violent, immediate danger to staff" },
  { score: "+3", label: "Very Agitated", color: "#E05000", desc: "Pulls/removes tubes, aggressive" },
  { score: "+2", label: "Agitated", color: "#F57F17", desc: "Frequent non-purposeful movement, fights ventilator" },
  { score: "+1", label: "Restless", color: "#F9A825", desc: "Anxious, movements not aggressive" },
  { score: "0",  label: "Alert & Calm", color: C.green, desc: "Baseline target for most patients" },
  { score: "−1", label: "Drowsy", color: "#1565C0", desc: "Sustained awakening >10s to voice" },
  { score: "−2", label: "Light Sedation", color: "#1976D2", desc: "Briefly awakens <10s to voice — target for most CCU" },
  { score: "−3", label: "Moderate Sedation", color: "#2E75B6", desc: "Movement to voice, no eye contact" },
  { score: "−4", label: "Deep Sedation", color: "#37474F", desc: "Response only to physical stimulation — TTM cooling target" },
  { score: "−5", label: "Unarousable", color: "#212121", desc: "No response to voice or physical stimulation" },
];

function RassReference() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "7px 14px",
          fontSize: 12.5, color: C.grayText, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <span>{open ? "▼" : "▶"}</span> RASS Scale Reference
      </button>
      {open && (
        <div style={{ marginTop: 10, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
          {RASS_LEVELS.map((r, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "7px 12px",
              background: i % 2 === 0 ? C.white : C.gray,
              borderBottom: i < RASS_LEVELS.length - 1 ? `1px solid ${C.grayMid}` : "none",
            }}>
              <span style={{
                fontWeight: 800, fontSize: 13, color: r.color,
                width: 28, textAlign: "center", flexShrink: 0,
              }}>{r.score}</span>
              <span style={{ fontWeight: 700, fontSize: 12.5, color: r.color, width: 120, flexShrink: 0 }}>{r.label}</span>
              <span style={{ fontSize: 12, color: C.grayText }}>{r.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Drug Quick Reference ────────────────────────────────────────
const DRUGS = [
  {
    name: "Fentanyl",
    class: "Opioid",
    dose: "25–100 mcg IV bolus q10 min PRN\nInfusion: 20–100 mcg/hr\nReduce 30–50% during TTM cooling",
    hemo: "↓ Preload/afterload mildly\n↑ VT threshold",
    flag: "preferred",
    flagLabel: "First-line",
    avoid: null,
  },
  {
    name: "Propofol",
    class: "GABA-A agonist",
    dose: "Sedation: 5–50 mcg/kg/min\nRSI: 1–2 mg/kg (avoid if hypotensive)\nPRIS risk: >4 mg/kg/hr or >48h",
    hemo: "↓↓ Preload/afterload\n↓ CO (~20%)\n↑ VT threshold",
    flag: "preferred",
    flagLabel: "OHCA/moderate LV",
    avoid: "Cardiogenic shock / vasopressor-dependent / EF <20%",
  },
  {
    name: "Dexmedetomidine",
    class: "α2-agonist",
    dose: "0.2–0.7 mcg/kg/hr (RVH max 1.4)\nOmit load if converting or hemodynamically unstable\nMax 48h per RVH PPO",
    hemo: "↓ HR (bradycardia 40%)\n↓ BP, CO\n↑ VT threshold",
    flag: "conditional",
    flagLabel: "Conditional",
    avoid: "HR <55 | EF <20% | 2nd/3rd AV block | Severe hepatic failure (RVH PPO CI)",
  },
  {
    name: "Midazolam",
    class: "Benzodiazepine",
    dose: "Bolus: 1–4 mg IV PRN\nInfusion: 0.02–0.1 mg/kg/hr\nSeizure/ETOH withdrawal: first-line",
    hemo: "Minimal ↓ BP\n↔ CO clinically",
    flag: "preferred",
    flagLabel: "Severe LV/shock",
    avoid: "Routine sedation (↑ delirium) | >48h infusion (propylene glycol toxicity)",
  },
  {
    name: "Ketamine",
    class: "NMDA antagonist",
    dose: "RSI: 1–2 mg/kg IV\nSub-dissociative: 0.15–0.3 mg/kg",
    hemo: "↑↑ HR/BP (sympathomimetic)\n↓ CO in critically ill cardiac patients",
    flag: "avoid",
    flagLabel: "Avoid in CCU",
    avoid: "OHCA, ADHF, ACS, VT — all CCU non-surgical contexts",
  },
  {
    name: "Quetiapine",
    class: "Atypical antipsychotic",
    dose: "25–100 mg PO/NG BID\nStart 25 mg in HF\nIncrease by 25–50 mg q24h",
    hemo: "Mild ↑ SBP/DBP\nQTc prolongation",
    flag: "preferred",
    flagLabel: "Delirium first-line",
    avoid: "QTc >500 ms (use aripiprazole) | High TdP risk",
  },
  {
    name: "Haloperidol IV",
    class: "Typical antipsychotic",
    dose: "2–10 mg IV over 1 min PRN\nRepeat q20–30 min\nMonitor QTc before each dose",
    hemo: "QTc prolongation\n↓ VT threshold",
    flag: "caution",
    flagLabel: "Caution",
    avoid: "QTc >480 ms | Active VT | VT storm | Concurrent QT-prolonging drugs | EKG required before each dose",
  },
  {
    name: "Etomidate",
    class: "GABA-A agonist (RSI only)",
    dose: "RSI induction: 0.3 mg/kg IV\n(NOT for ongoing sedation — adrenal suppression cumulative)",
    hemo: "Hemodynamically neutral\nNo myocardial depression",
    flag: "preferred",
    flagLabel: "Preferred RSI",
    avoid: "Single dose → 90% adrenal suppression → consider hydrocortisone 200 mg/day x5–7d if vasopressor-refractory | NOT for infusion",
  },
];

const FLAG_STYLES = {
  preferred: { bg: C.greenPale, color: C.green },
  conditional: { bg: C.amberPale, color: C.amber },
  caution: { bg: "#FFF3E0", color: "#E65100" },
  avoid: { bg: "#FFEBEE", color: C.red },
};

function DrugReference() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "7px 14px",
          fontSize: 12.5, color: C.grayText, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <span>{open ? "▼" : "▶"}</span> Drug Quick Reference
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DRUGS.map((drug, i) => {
              const fs = FLAG_STYLES[drug.flag];
              return (
                <button
                  key={i}
                  onClick={() => setSelected(selected === i ? null : i)}
                  style={{
                    border: `1.5px solid ${selected === i ? fs.color : C.border}`,
                    background: selected === i ? fs.bg : C.white,
                    borderRadius: 8, padding: "7px 12px",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: fs.color }}>{drug.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.grayText }}>{drug.class}</p>
                </button>
              );
            })}
          </div>
          {selected !== null && (() => {
            const drug = DRUGS[selected];
            const fs = FLAG_STYLES[drug.flag];
            return (
              <div style={{
                marginTop: 12, border: `2px solid ${fs.color}`,
                borderRadius: 10, overflow: "hidden",
              }}>
                <div style={{ background: fs.color, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 700, color: C.white, fontSize: 15 }}>{drug.name}</span>
                    <span style={{ marginLeft: 8, fontSize: 12, color: C.white + "CC" }}>{drug.class}</span>
                  </div>
                  <Badge text={drug.flagLabel} color={C.white} bg={C.white + "33"} />
                </div>
                <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 12, color: C.navy, textTransform: "uppercase", letterSpacing: "0.05em" }}>Dose</p>
                    <p style={{ margin: 0, fontSize: 13, color: C.grayText, lineHeight: 1.6, whiteSpace: "pre-line" }}>{drug.dose}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 12, color: C.navy, textTransform: "uppercase", letterSpacing: "0.05em" }}>Haemodynamic Effects</p>
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: C.grayText, lineHeight: 1.6, whiteSpace: "pre-line" }}>{drug.hemo}</p>
                    {drug.avoid && (
                      <div>
                        <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 12, color: C.red, textTransform: "uppercase", letterSpacing: "0.05em" }}>Avoid / Caution</p>
                        <p style={{ margin: 0, fontSize: 13, color: C.red, lineHeight: 1.5 }}>{drug.avoid}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [history, setHistory] = useState(["start"]);
  const currentId = history[history.length - 1];
  const node = ALL_NODES[currentId];
  const track = node?.track || null;

  const go = (nextId) => setHistory(h => [...h, nextId]);
  const jumpTo = (index) => setHistory(h => h.slice(0, index + 1));
  const reset = () => setHistory(["start"]);

  const accentColor = track ? trackColor(track) : C.navy;
  const bgColor = track ? trackBg(track) : C.gray;

  if (!node) return <div style={{ padding: 32, fontFamily: "system-ui" }}>Node not found: {currentId}</div>;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F0F4F8",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      padding: "0 0 40px",
    }}>
      {/* Header */}
      <div style={{
        background: C.navy,
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ margin: 0, color: C.white, fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>
            CCU Sedation Pathway
          </p>
          <p style={{ margin: "2px 0 0", color: "#A8C8E8", fontSize: 11.5 }}>
            Royal Victoria Hospital · Non-Surgical Critical Care · G. Hopkins RPh
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {track && (
            <Badge
              text={trackLabel(track)}
              color={accentColor}
              bg={accentColor + "33"}
            />
          )}
          {currentId !== "start" && (
            <button
              onClick={reset}
              style={{
                background: "none", border: `1px solid ${C.white}44`,
                color: C.white, padding: "5px 12px", borderRadius: 8,
                fontSize: 12, cursor: "pointer",
              }}
            >
              ↩ Restart
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 740, margin: "24px auto", padding: "0 16px" }}>
        {/* Breadcrumb */}
        <BreadcrumbBar history={history} onJump={jumpTo} track={track} />

        {/* Card */}
        <div style={{
          background: C.white,
          borderRadius: 14,
          border: `2px solid ${accentColor}`,
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}>
          {/* Card header */}
          <div style={{ background: accentColor, padding: "16px 20px" }}>
            <p style={{ margin: 0, color: C.white, fontWeight: 800, fontSize: 17, lineHeight: 1.3 }}>
              {node.question}
            </p>
            {node.subtitle && (
              <p style={{ margin: "6px 0 0", color: C.white + "CC", fontSize: 13, lineHeight: 1.5 }}>
                {node.subtitle}
              </p>
            )}
          </div>

          {/* Card body */}
          <div style={{ padding: "20px" }}>
            {/* Recommendation node */}
            {node.type === "recommendation" && (
              <>
                <RecommendationCard rec={node.rec} track={track} />
                {node.next && (
                  <button
                    onClick={() => go(node.next)}
                    style={{
                      marginTop: 16,
                      width: "100%",
                      padding: "12px",
                      background: accentColor,
                      color: C.white,
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    {node.nextLabel || "Continue →"}
                  </button>
                )}
                {!node.next && (
                  <div style={{
                    marginTop: 16,
                    padding: "12px 16px",
                    background: C.greenPale,
                    border: `1.5px solid ${C.green}`,
                    borderRadius: 10,
                    textAlign: "center",
                  }}>
                    <p style={{ margin: 0, fontWeight: 700, color: C.green, fontSize: 14 }}>
                      ✓ Pathway complete — reassess daily and document RASS target on rounds
                    </p>
                    <button
                      onClick={reset}
                      style={{
                        marginTop: 10, padding: "7px 18px",
                        background: C.green, color: C.white,
                        border: "none", borderRadius: 8,
                        fontWeight: 700, fontSize: 13, cursor: "pointer",
                      }}
                    >
                      ↩ New Patient
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Question node */}
            {!node.type && node.options && (
              <div>
                {node.options.map((opt, i) => (
                  <OptionButton
                    key={i}
                    option={{ ...opt, color: opt.color || accentColor }}
                    onClick={() => go(opt.next)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* References panel */}
        <div style={{
          background: C.white,
          borderRadius: 12,
          border: `1px solid ${C.border}`,
          padding: "16px 20px",
          marginTop: 16,
        }}>
          <p style={{ margin: "0 0 12px", fontWeight: 700, color: C.navy, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Clinical Tools
          </p>
          <RassReference />
          <DrugReference />
        </div>

        {/* Disclaimer */}
        <p style={{
          textAlign: "center", fontSize: 11, color: "#888", marginTop: 16, lineHeight: 1.6,
        }}>
          For educational and clinical reference use · Royal Victoria Hospital CCU · G. Hopkins RPh
          <br />Verify all dosing against current RVH PPO and institutional formulary before administration
        </p>
      </div>
    </div>
  );
}
