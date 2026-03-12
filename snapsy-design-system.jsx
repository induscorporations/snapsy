import { useState } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const t = {
  primary: "#6CF073", primaryDark: "#3DB844", primaryDeep: "#1A5E1F",
  primaryLight: "#EAFBEB", primaryMid: "#B8F5BB",
  white: "#FFFFFF",
  g50: "#F7F8F7", g100: "#EFF0EF", g200: "#D9DBD9", g300: "#B8BCB8",
  g400: "#8E948E", g500: "#636863", g600: "#454945", g700: "#2E322E",
  g800: "#1C1F1C", g900: "#0F110F",
  error: "#E53935", errorLight: "#FDECEA",
  success: "#3DB844", successLight: "#EAFBEB",
  warning: "#F59E0B", warningLight: "#FFFBEB",
  darkBg: "#0F110F", darkSurface: "#1C1F1C", darkBorder: "#3A3E3A",
  // shadows
  shSm: "0 1px 3px rgba(0,0,0,0.08)",
  shMd: "0 4px 12px rgba(0,0,0,0.08)",
  shLg: "0 8px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.04)",
  shXl: "0 16px 40px rgba(0,0,0,0.12)",
  shPrimary: "0 8px 24px rgba(108,240,115,0.3)",
  shPrimarySm: "0 4px 12px rgba(108,240,115,0.2)",
  // font
  fam: "'Plus Jakarta Sans', system-ui, sans-serif",
};

// ─── INLINE SVG ICONS ────────────────────────────────────────────────────────
// linear = strokeWidth 1.75, no fill (default/inactive state)
// solid  = strokeWidth 0, fill=color (active/selected state)
function Icon({ d, size = 20, solid = false, color = "currentColor", viewBox = "0 0 24 24", style = {} }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill={solid ? color : "none"}
      stroke={solid ? "none" : color} strokeWidth={solid ? 0 : 1.75}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0, ...style }}>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

// SVG path data for each icon
const PATHS = {
  camera: ["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z", "M12 13m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0"],
  search: ["M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0"],
  bell: ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"],
  user: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  home: ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  settings: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  arrowLeft: ["M19 12H5", "M12 19l-7-7 7-7"],
  arrowRight: ["M5 12h14", "M12 5l7 7-7 7"],
  upload: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  chevronRight: ["M9 18l6-6-6-6"],
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"],
  eyeOff: ["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24", "M1 1l22 22"],
  alertCircle: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 8v4", "M12 16h.01"],
  checkCircle: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4L12 14.01l-3-3"],
  info: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 16v-4", "M12 8h.01"],
  xCircle: ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z", "M15 9l-6 6", "M9 9l6 6"],
  check: ["M20 6L9 17l-5-5"],
  zap: ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  tag: ["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z", "M7 7h.01"],
  lock: ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M17 11V7a5 5 0 0 0-10 0v4"],
  image: ["M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 0 2 2z", "M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z", "M21 15l-5-5L5 21"],
  share2: ["M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M18 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M8.59 13.51l6.83 3.98", "M15.41 6.51l-6.82 3.98"],
  download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  trash2: ["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2", "M10 11v6", "M14 11v6"],
  star: ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  heart: ["M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"],
  calendar: ["M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z", "M16 2v4", "M8 2v4", "M3 10h18"],
  mapPin: ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"],
  messageCircle: ["M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"],
  globe: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"],
  helpCircle: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", "M12 17h.01"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  cloud: ["M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"],
  filter: ["M22 3H2l8 9.46V19l4 2v-8.54L22 3z"],
  moon: ["M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"],
  plus: ["M12 5v14", "M5 12h14"],
  refresh: ["M23 4v6h-6", "M1 20v-6h6", "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"],
  moreHorizontal: ["M12 12h.01", "M19 12h.01", "M5 12h.01"],
  logOut: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  loader: ["M12 2v4", "M12 18v4", "M4.93 4.93l2.83 2.83", "M16.24 16.24l2.83 2.83", "M2 12h4", "M18 12h4", "M4.93 19.07l2.83-2.83", "M16.24 7.76l2.83-2.83"],
};

function Ic({ name, size = 20, solid = false, color = "currentColor", style }) {
  return <Icon d={PATHS[name]} size={size} solid={solid} color={color} style={style} />;
}

// ─── SPINNER ─────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}
      strokeLinecap="round" style={{ animation: "spin 0.7s linear infinite", display: "block", flexShrink: 0 }}>
      {PATHS.loader.map((d, i) => <path key={i} d={d} opacity={i < 4 ? 1 : 0.3} />)}
    </svg>
  );
}

// ─── BTN ─────────────────────────────────────────────────────────────────────
function Btn({ variant = "primary", size = "md", iconOnly, iconL, iconR, disabled, loading, children, fullWidth, onClick }) {
  const [pressed, setPressed] = useState(false);
  const isIconOnly = iconOnly && !children;
  const h = { sm: "36px", md: "44px", lg: "52px" }[size];
  const pad = isIconOnly ? "0" : { sm: "0 16px", md: "0 20px", lg: "0 24px" }[size];
  const fs = { sm: "12px", md: "14px", lg: "16px" }[size];
  const variantStyles = {
    primary: { background: t.primary, color: t.g900, boxShadow: pressed ? "none" : t.shPrimarySm, border: "none" },
    secondary: { background: t.primaryLight, color: t.primaryDark, border: "none" },
    ghost: { background: "transparent", color: t.g700, border: `1.5px solid ${t.g200}` },
    destructive: { background: t.errorLight, color: t.error, border: "none" },
  };
  const iconSz = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: t.fam, fontWeight: 600, borderRadius: "9999px", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", outline: "none", userSelect: "none", height: h, padding: pad, width: isIconOnly ? h : fullWidth ? "100%" : undefined, fontSize: fs, transform: pressed ? "scale(0.97)" : "scale(1)", opacity: disabled ? 0.4 : 1, ...variantStyles[variant] }}>
      {loading && <Spinner size={iconSz} />}
      {!loading && iconL && <Ic name={iconL} size={iconSz} />}
      {!loading && isIconOnly && <Ic name={iconOnly} size={iconSz} />}
      {children && <span>{children}</span>}
      {!loading && iconR && <Ic name={iconR} size={iconSz} />}
    </button>
  );
}

// ─── INPUT ───────────────────────────────────────────────────────────────────
function Input({ label, placeholder, type = "text", state = "default", helperText, prefix, showPasswordToggle, icon }) {
  const [showPw, setShowPw] = useState(false);
  const borders = { default: `1.5px solid ${t.g200}`, focused: `1.5px solid ${t.primary}`, error: `1.5px solid ${t.error}`, disabled: `1.5px solid ${t.g100}` };
  const shadows = { focused: `0 0 0 3px rgba(108,240,115,0.15)`, error: `0 0 0 3px rgba(229,57,53,0.1)` };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && <label style={{ fontSize: "12px", fontWeight: 600, color: t.g600 }}>{label}</label>}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: state === "disabled" ? t.g50 : t.white, borderRadius: "16px", padding: "0 14px", border: borders[state], boxShadow: shadows[state] || "none" }}>
        {/* Linear icon — neutral state */}
        {icon && <Ic name={icon} size={16} solid={false} color={state === "focused" ? t.primaryDark : t.g400} />}
        {prefix && <span style={{ fontSize: "12px", color: t.g400, fontWeight: 500, flexShrink: 0 }}>{prefix}</span>}
        <input type={showPasswordToggle && !showPw ? "password" : showPasswordToggle ? "text" : type} placeholder={placeholder} disabled={state === "disabled"}
          style={{ flex: 1, height: "44px", border: "none", outline: "none", background: "transparent", fontFamily: t.fam, fontSize: "14px", color: t.g800 }} />
        {showPasswordToggle && (
          <button onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: t.g400 }}>
            <Ic name={showPw ? "eye" : "eyeOff"} size={16} />
          </button>
        )}
        {/* Solid icon on error — filled = high emphasis */}
        {state === "error" && <Ic name="alertCircle" size={16} solid color={t.error} />}
      </div>
      {helperText && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Ic name={state === "error" ? "xCircle" : "info"} size={12} solid={state === "error"} color={state === "error" ? t.error : t.g400} />
          <p style={{ fontSize: "11px", color: state === "error" ? t.error : t.g400, margin: 0 }}>{helperText}</p>
        </div>
      )}
    </div>
  );
}

function OTPInput({ length = 6 }) {
  const [vals, setVals] = useState(Array(length).fill(""));
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {Array(length).fill(0).map((_, i) => (
        <input key={i} maxLength={1} value={vals[i]} onChange={e => { const n = [...vals]; n[i] = e.target.value; setVals(n); }}
          style={{ width: "44px", height: "52px", textAlign: "center", border: `1.5px solid ${vals[i] ? t.primary : t.g200}`, borderRadius: "12px", fontFamily: t.fam, fontSize: "20px", fontWeight: 700, color: t.g800, outline: "none", boxShadow: vals[i] ? `0 0 0 3px rgba(108,240,115,0.15)` : "none", transition: "all 0.15s" }} />
      ))}
    </div>
  );
}

// ─── TOGGLE ──────────────────────────────────────────────────────────────────
function Toggle({ label, defaultOn = false, icon }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Linear → solid as state changes */}
        {icon && <Ic name={icon} size={18} solid={on} color={on ? t.primaryDark : t.g400} />}
        {label && <span style={{ fontSize: "14px", color: t.g700, fontWeight: 500 }}>{label}</span>}
      </div>
      <div onClick={() => setOn(!on)} style={{ width: "48px", height: "28px", borderRadius: "9999px", background: on ? t.primary : t.g200, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: "3px", left: on ? "23px" : "3px", width: "22px", height: "22px", borderRadius: "50%", background: on ? t.g900 : t.white, boxShadow: t.shSm, transition: "left 0.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function Checkbox({ label, defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div onClick={() => setChecked(!checked)} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
      <div style={{ width: "20px", height: "20px", borderRadius: "4px", border: `2px solid ${checked ? t.primary : t.g300}`, background: checked ? t.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}>
        {checked && <Ic name="check" size={13} solid color={t.g900} style={{ strokeWidth: "3px" }} />}
      </div>
      {label && <span style={{ fontSize: "14px", color: t.g700 }}>{label}</span>}
    </div>
  );
}

function RadioCard({ label, sublabel, icon, selected, onClick }) {
  return (
    <div onClick={onClick} style={{ padding: "16px", borderRadius: "20px", border: `2px solid ${selected ? t.primary : t.g100}`, background: selected ? t.primaryLight : t.white, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: selected ? t.primary : t.g100, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s", flexShrink: 0 }}>
        {/* Linear → solid on select */}
        {icon && <Ic name={icon} size={20} solid={selected} color={selected ? t.g900 : t.g500} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: t.g800 }}>{label}</div>
        {sublabel && <div style={{ fontSize: "12px", color: t.g400, marginTop: "2px" }}>{sublabel}</div>}
      </div>
      <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${selected ? t.primary : t.g300}`, display: "flex", alignItems: "center", justifyContent: "center", background: selected ? t.primaryLight : "transparent", transition: "all 0.15s", flexShrink: 0 }}>
        {selected && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.primaryDark }} />}
      </div>
    </div>
  );
}

function SegmentedControl({ options }) {
  const [active, setActive] = useState(0);
  return (
    <div style={{ display: "flex", background: t.g100, borderRadius: "16px", padding: "3px", gap: "2px" }}>
      {options.map((opt, i) => (
        <button key={i} onClick={() => setActive(i)} style={{ flex: 1, height: "36px", border: "none", cursor: "pointer", borderRadius: "12px", background: active === i ? t.white : "transparent", boxShadow: active === i ? t.shSm : "none", fontFamily: t.fam, fontSize: "12px", fontWeight: active === i ? 600 : 500, color: active === i ? t.g800 : t.g500, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
          {/* Linear inactive → solid active */}
          {opt.icon && <Ic name={opt.icon} size={14} solid={active === i} color={active === i ? t.g800 : t.g400} />}
          {opt.label || opt}
        </button>
      ))}
    </div>
  );
}

function TagChip({ label, selected, onToggle }) {
  return (
    <button onClick={onToggle} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "9999px", border: "none", background: selected ? t.primary : t.g100, color: selected ? t.g900 : t.g500, fontFamily: t.fam, fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
      {selected && <Ic name="check" size={13} solid color={t.g900} />}
      {label}
    </button>
  );
}

function Badge({ label, variant = "default", dot = false }) {
  const v = { default: { background: t.g100, color: t.g600 }, primary: { background: t.primaryLight, color: t.primaryDark }, success: { background: t.successLight, color: t.success }, error: { background: t.errorLight, color: t.error }, warning: { background: t.warningLight, color: t.warning } };
  return (
    <span style={{ ...v[variant], padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.02em", display: "inline-flex", alignItems: "center", gap: "4px" }}>
      {dot && <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor", display: "inline-block" }} />}
      {label}
    </span>
  );
}

function Card({ variant = "flat", children, padding = "20px" }) {
  const v = { flat: { background: t.white, border: `1px solid ${t.g100}` }, elevated: { background: t.white, boxShadow: t.shLg }, bordered: { background: "transparent", border: `1.5px solid ${t.g200}` }, primary: { background: t.primaryDeep, border: "none" } };
  return <div style={{ ...v[variant], borderRadius: "24px", padding, overflow: "hidden" }}>{children}</div>;
}

function ListItem({ icon, title, subtitle, trailing, divider = true, active = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 0", borderBottom: divider ? `1px solid ${t.g100}` : "none" }}>
      {icon && (
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: active ? t.primaryLight : t.g100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
          {/* Linear default → solid active */}
          <Ic name={icon} size={18} solid={active} color={active ? t.primaryDark : t.g500} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: t.g800 }}>{title}</div>
        {subtitle && <div style={{ fontSize: "12px", color: t.g400, marginTop: "2px" }}>{subtitle}</div>}
      </div>
      {trailing && <div style={{ flexShrink: 0, color: t.g400 }}>{typeof trailing === "string" ? <Ic name="chevronRight" size={16} /> : trailing}</div>}
    </div>
  );
}

const TAB_ICONS = ["home", "search", "camera", "bell", "user"];
const TAB_LABELS = ["Home", "Discover", "Capture", "Activity", "Profile"];

function BottomTabBar({ dark = false }) {
  const [active, setActive] = useState(0);
  return (
    <div style={{ background: dark ? t.darkSurface : t.white, borderTop: `1px solid ${dark ? t.darkBorder : t.g100}`, display: "flex", borderRadius: "24px 24px 0 0", padding: "8px 0 16px", boxShadow: t.shXl }}>
      {TAB_ICONS.map((icon, i) => (
        <button key={i} onClick={() => setActive(i)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", padding: "6px 0" }}>
          {/* Linear inactive → solid active */}
          <Ic name={icon} size={i === 2 ? 22 : 20} solid={active === i} color={active === i ? (dark ? t.primary : t.primaryDark) : (dark ? t.g600 : t.g400)} />
          <span style={{ fontSize: "11px", fontWeight: active === i ? 600 : 400, color: active === i ? (dark ? t.primary : t.primaryDark) : (dark ? t.g600 : t.g400), fontFamily: t.fam }}>{TAB_LABELS[i]}</span>
          {active === i && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: t.primary, marginTop: "-2px" }} />}
        </button>
      ))}
    </div>
  );
}

function TopHeaderBar({ title, showBack = false, trailing }) {
  return (
    <div style={{ display: "flex", alignItems: "center", height: "56px", padding: "0 20px", background: t.white, borderBottom: `1px solid ${t.g100}` }}>
      {showBack && (
        <button style={{ width: "36px", height: "36px", borderRadius: "12px", background: t.g100, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px" }}>
          <Ic name="arrowLeft" size={16} color={t.g700} />
        </button>
      )}
      <span style={{ flex: 1, fontSize: "16px", fontWeight: 700, color: t.g800, fontFamily: t.fam }}>{title}</span>
      {trailing}
    </div>
  );
}

function Snackbar({ message, type = "default" }) {
  const cfg = {
    default: { bg: t.g800, icon: "info", ic: t.g300, solid: false },
    success: { bg: t.primaryDeep, icon: "checkCircle", ic: t.primary, solid: true },
    error: { bg: "#7B1F1F", icon: "xCircle", ic: "#FF8A80", solid: true },
  };
  const { bg, icon, ic, solid } = cfg[type];
  return (
    <div style={{ background: bg, borderRadius: "20px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", boxShadow: t.shLg }}>
      {/* Solid icons in snackbars for instant recognition */}
      <Ic name={icon} size={18} solid={solid} color={ic} />
      <span style={{ fontSize: "14px", color: t.white, fontWeight: 500 }}>{message}</span>
    </div>
  );
}

function ProgressBar({ value = 60, label }) {
  return (
    <div>
      {label && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "12px", fontWeight: 500, color: t.g600 }}>{label}</span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: t.primaryDark }}>{value}%</span>
      </div>}
      <div style={{ height: "6px", background: t.g100, borderRadius: "9999px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: t.primary, borderRadius: "9999px", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle, cta }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ width: "72px", height: "72px", borderRadius: "24px", background: t.g100, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        {/* Solid icon in empty state — provides visual weight */}
        {icon && <Ic name={icon} size={32} solid color={t.g400} />}
      </div>
      <div style={{ fontSize: "20px", fontWeight: 700, color: t.g700, marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "14px", color: t.g400, marginBottom: "24px", lineHeight: 1.65 }}>{subtitle}</div>
      {cta && <Btn variant="primary" size="md">{cta}</Btn>}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "48px 24px" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: `3px solid ${t.g100}`, borderTopColor: t.primary, animation: "spin 0.8s linear infinite" }} />
      <span style={{ fontSize: "14px", color: t.g400 }}>Loading your photos...</span>
    </div>
  );
}

function BottomSheetDemo() {
  const [open, setOpen] = useState(false);
  const items = [{ icon: "share2", label: "Copy Link", sub: "Share with anyone" }, { icon: "messageCircle", label: "Send via Message", sub: "Send to contacts" }, { icon: "download", label: "Export Photos", sub: "Download to device" }];
  return (
    <div>
      <Btn variant="ghost" onClick={() => setOpen(!open)}>{open ? "Close Sheet" : "Open Bottom Sheet"}</Btn>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setOpen(false)}>
          <div style={{ width: "100%", maxWidth: "480px", margin: "0 auto", background: t.white, borderRadius: "32px 32px 0 0", padding: "0 24px 40px", animation: "slideUp 0.3s cubic-bezier(0.4,0,0.2,1)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 20px" }}>
              <div style={{ width: "36px", height: "4px", borderRadius: "9999px", background: t.g200 }} />
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Share Album</div>
            <div style={{ fontSize: "14px", color: t.g400, marginBottom: "20px" }}>Choose how to share this event album</div>
            {items.map(({ icon, label, sub }, i) => <ListItem key={i} icon={icon} title={label} subtitle={sub} trailing="›" divider={i < 2} />)}
            <div style={{ marginTop: "20px" }}><Btn variant="ghost" fullWidth onClick={() => setOpen(false)}>Cancel</Btn></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ColorSwatch({ name, value }) {
  return (
    <div>
      <div style={{ height: "56px", borderRadius: "12px", background: value, marginBottom: "8px", border: "1px solid rgba(0,0,0,0.06)" }} />
      <div style={{ fontSize: "11px", fontWeight: 600, color: t.g700 }}>{name}</div>
      <div style={{ fontSize: "11px", color: t.g400, fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}

function PhoneMockup({ children, dark = false }) {
  const bg = dark ? t.darkBg : t.white;
  return (
    <div style={{ width: "320px", background: bg, borderRadius: "40px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)" }}>
      <div style={{ height: "44px", background: bg, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: dark ? t.g300 : t.g700 }}>9:41</span>
        <div style={{ width: "120px", height: "28px", background: dark ? t.darkSurface : t.g900, borderRadius: "20px" }} />
        <div style={{ width: "16px", height: "8px", borderRadius: "2px", border: `1.5px solid ${t.g500}`, position: "relative" }}>
          <div style={{ position: "absolute", inset: "1px 0 1px 1px", background: t.g400, borderRadius: "1px", width: "60%" }} />
        </div>
      </div>
      {children}
    </div>
  );
}

function OnboardingScreen() {
  return (
    <PhoneMockup>
      <div style={{ padding: "28px 24px", background: t.white, minHeight: "580px", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "88px", height: "88px", background: t.primaryDeep, borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "28px", boxShadow: t.shPrimary }}>
            <Ic name="camera" size={40} solid color={t.primary} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: t.g900, textAlign: "center", lineHeight: 1.2, marginBottom: "10px" }}>Your photos,<br />just for you</div>
          <div style={{ fontSize: "13px", color: t.g400, textAlign: "center", lineHeight: 1.6, marginBottom: "28px" }}>Snapsy uses on-device AI to deliver only the photos you appear in.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", marginBottom: "28px" }}>
            {[{ icon: "search", text: "On-device face recognition" }, { icon: "shield", text: "Privacy-first, no cloud upload" }, { icon: "zap", text: "Instant delivery after events" }].map(({ icon, text }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: t.g50, borderRadius: "16px" }}>
                <Ic name={icon} size={15} solid color={t.primaryDark} />
                <span style={{ fontSize: "13px", fontWeight: 500, color: t.g700 }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[true, false, false].map((a, i) => <div key={i} style={{ height: "6px", width: a ? "24px" : "6px", borderRadius: "3px", background: a ? t.primary : t.g200 }} />)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" }}>
          <Btn variant="primary" fullWidth size="lg" iconR="arrowRight">Get Started</Btn>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "13px", color: t.g400 }}>Already have an account? </span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: t.primaryDark }}>Sign in</span>
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
}

function HomeScreen() {
  return (
    <PhoneMockup dark>
      <div style={{ background: t.darkBg, minHeight: "580px" }}>
        <div style={{ padding: "8px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "12px", color: t.g500, fontWeight: 500 }}>Good morning</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: t.white }}>Alex</div>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: t.primaryDeep, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic name="user" size={20} solid color={t.primary} />
          </div>
        </div>
        <div style={{ margin: "0 16px 16px", background: `linear-gradient(135deg, ${t.primaryDeep} 0%, #0D2E10 100%)`, borderRadius: "24px", padding: "18px", border: `1px solid ${t.darkBorder}` }}>
          <Badge label="New event" variant="primary" dot />
          <div style={{ fontSize: "17px", fontWeight: 700, color: t.white, marginTop: "10px" }}>Marcus & Priya's Wedding</div>
          <div style={{ fontSize: "13px", color: t.g400, marginTop: "3px" }}>247 photos · 12 of you</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: "14px" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ width: "28px", height: "28px", borderRadius: "50%", background: t.g700, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: i > 0 ? "-8px" : 0, border: `2px solid ${t.darkBg}` }}>
                <Ic name="user" size={13} solid color={t.g400} />
              </div>
            ))}
            <span style={{ marginLeft: "8px", fontSize: "12px", color: t.g400 }}>+44 people</span>
          </div>
        </div>
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: t.white }}>Your Photos</span>
            <span style={{ fontSize: "13px", color: t.primaryDark, fontWeight: 600 }}>View all</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "3px", borderRadius: "16px", overflow: "hidden" }}>
            {["#2E3A1F","#1A3A20","#243020","#1E2E1A","#2A3820","#1C2A18"].map((c, i) => (
              <div key={i} style={{ aspectRatio: "1", background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic name="image" size={20} color={t.g600} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: "16px" }}>
          <BottomTabBar dark />
        </div>
      </div>
    </PhoneMockup>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ padding: "0 24px 64px" }}>
      <div style={{ fontSize: "20px", fontWeight: 700, color: t.g800, marginBottom: "8px", marginTop: "48px" }}>{title}</div>
      {subtitle && <div style={{ fontSize: "14px", color: t.g400, marginBottom: "32px", fontWeight: 500 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

const ALL_ICON_NAMES = ["home","search","camera","bell","user","settings","heart","star","share2","download","lock","calendar","image","cloud","upload","filter","globe","helpCircle","mapPin","messageCircle"];

export default function SnapsyDesignSystem() {
  const [radioSelected, setRadioSelected] = useState(0);
  const [chips, setChips] = useState([true, false, true, false, false, false]);
  const label = { fontSize: "11px", fontWeight: 600, color: t.g400, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px", display: "block" };

  return (
    <div style={{ fontFamily: t.fam, backgroundColor: t.g50, minHeight: "100vh", color: t.g800 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      {/* HERO */}
      <div style={{ background: t.primaryDeep, padding: "80px 24px 64px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(108,240,115,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
            <div style={{ width: "56px", height: "56px", background: t.primary, borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: t.shPrimary }}>
              <Ic name="camera" size={28} solid color={t.g900} />
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: t.white, lineHeight: 1 }}>Snapsy</div>
              <div style={{ fontSize: "12px", color: t.primaryMid, fontWeight: 500 }}>Design System v1.0</div>
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: t.white, marginBottom: "16px", lineHeight: 1.3 }}>Complete Mobile<br />Visual Identity System</div>
          <div style={{ fontSize: "16px", color: t.g400, maxWidth: "540px", lineHeight: 1.65, marginBottom: "24px" }}>
            Production-ready design foundation. 8pt grid · Plus Jakarta Sans · Inline SVG icons with linear/solid state convention.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["Tokens","Typography","Buttons","Forms","Navigation","Cards","Screens"].map(label => <Badge key={label} label={label} variant="primary" />)}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* ICON SYSTEM */}
        <Section title="Icon System" subtitle="Linear (stroke only, fill=none) = default/inactive · Solid (fill=color, no stroke) = active/selected/emphasis">
          <Card variant="flat" padding="24px">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <div style={label}>Linear — Default / Inactive</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", padding: "20px", background: t.g50, borderRadius: "16px" }}>
                  {ALL_ICON_NAMES.map(name => <Ic key={name} name={name} size={22} color={t.g500} />)}
                </div>
                <div style={{ marginTop: "8px", fontSize: "11px", color: t.g400, fontFamily: "monospace" }}>stroke only · fill="none"</div>
              </div>
              <div>
                <div style={label}>Solid — Active / Selected</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", padding: "20px", background: t.primaryLight, borderRadius: "16px" }}>
                  {ALL_ICON_NAMES.map(name => <Ic key={name} name={name} size={22} solid color={t.primaryDark} />)}
                </div>
                <div style={{ marginTop: "8px", fontSize: "11px", color: t.g400, fontFamily: "monospace" }}>fill=primaryDark · no stroke</div>
              </div>
            </div>
            <div style={{ height: "1px", background: t.g100, margin: "24px 0" }} />
            <div style={label}>Size Scale</div>
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-end", flexWrap: "wrap" }}>
              {[12,16,18,20,22,24,28,32,40].map(sz => (
                <div key={sz} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <Ic name="camera" size={sz} color={t.g600} />
                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: t.g400 }}>{sz}</span>
                </div>
              ))}
            </div>
            <div style={{ height: "1px", background: t.g100, margin: "24px 0" }} />
            <div style={label}>Usage Guide</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { name: "search", solid: false, label: "Input icons", desc: "Neutral, supporting role" },
                { name: "camera", solid: true, label: "Empty state icon", desc: "Visual weight needed" },
                { name: "calendar", solid: false, label: "List item (default)", desc: "Browsing state" },
                { name: "calendar", solid: true, label: "List item (active)", desc: "Selected row" },
                { name: "bell", solid: false, label: "Tab bar (inactive)", desc: "Unselected tab" },
                { name: "bell", solid: true, label: "Tab bar (active)", desc: "Active tab" },
                { name: "share2", solid: false, label: "Button icon", desc: "Action, supports label" },
                { name: "checkCircle", solid: true, label: "Snackbar icon", desc: "High-contrast feedback" },
              ].map(({ name, solid, label: lbl, desc }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: solid ? t.primaryLight : t.g50, borderRadius: "16px", border: `1px solid ${solid ? t.primaryMid : t.g100}` }}>
                  <Ic name={name} size={22} solid={solid} color={solid ? t.primaryDark : t.g500} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: t.g800 }}>{lbl}</div>
                    <div style={{ fontSize: "11px", color: t.g400, marginTop: "2px" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* COLOR SYSTEM */}
        <Section title="Color System" subtitle="Brand, semantic, and neutral tokens">
          <div style={{ background: t.white, borderRadius: "16px", padding: "20px", border: `1px solid ${t.g100}` }}>
            <div style={label}>Brand Palette</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
              <ColorSwatch name="Primary" value={t.primary} />
              <ColorSwatch name="Primary Dark" value={t.primaryDark} />
              <ColorSwatch name="Primary Deep" value={t.primaryDeep} />
              <ColorSwatch name="Primary Light" value={t.primaryLight} />
            </div>
            <div style={{ height: "1px", background: t.g100, margin: "20px 0" }} />
            <div style={label}>Neutrals</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
              {[["50",t.g50],["100",t.g100],["200",t.g200],["300",t.g300],["400",t.g400],["500",t.g500],["600",t.g600],["700",t.g700],["800",t.g800],["900",t.g900]].map(([n,v]) => <ColorSwatch key={n} name={`Grey ${n}`} value={v} />)}
            </div>
            <div style={{ height: "1px", background: t.g100, margin: "20px 0" }} />
            <div style={label}>Semantic + Dark Mode</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              <ColorSwatch name="Success" value={t.success} />
              <ColorSwatch name="Error" value={t.error} />
              <ColorSwatch name="Warning" value={t.warning} />
              <ColorSwatch name="Dark BG" value={t.darkBg} />
            </div>
          </div>
        </Section>

        {/* TYPOGRAPHY */}
        <Section title="Typography System" subtitle="Plus Jakarta Sans · Complete hierarchy">
          <Card variant="flat" padding="24px">
            {[{n:"H1 Display",sz:"40px",w:800,s:"Capture the moment"},{n:"H2 Title",sz:"32px",w:800,s:"Your Gallery"},{n:"H3 Heading",sz:"24px",w:700,s:"Recent Events"},{n:"H4 Subheading",sz:"20px",w:600,s:"47 photos of you"}].map(({ n, sz, w, s }) => (
              <div key={n} style={{ paddingBottom: "20px", marginBottom: "20px", borderBottom: `1px solid ${t.g100}` }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: t.g400, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>{n}</div>
                <div style={{ fontSize: sz, fontWeight: w, color: t.g900, lineHeight: 1.2, fontFamily: t.fam }}>{s}</div>
              </div>
            ))}
            {[{n:"Body Base",sz:"15px",w:400,lh:1.65},{n:"Caption",sz:"12px",w:500,lh:1.5},{n:"Label",sz:"14px",w:600,lh:1},{n:"Error",sz:"12px",w:500,lh:1.4,c:t.error}].map(({ n, sz, w, lh, c }) => (
              <div key={n} style={{ paddingBottom: "12px", marginBottom: "12px", borderBottom: `1px solid ${t.g100}` }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: t.g400, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>{n}</div>
                <div style={{ fontSize: sz, fontWeight: w, lineHeight: lh, color: c || t.g700, fontFamily: t.fam }}>The quick brown fox jumps over the lazy dog.</div>
              </div>
            ))}
          </Card>
        </Section>

        {/* SPACING */}
        <Section title="Spacing Scale" subtitle="8pt base grid — 4px minimum unit">
          <Card variant="flat" padding="24px">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[1,2,3,4,5,6,8,10,12,16].map(n => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "44px", fontSize: "11px", fontFamily: "monospace", color: t.g400 }}>sp-{n}</div>
                  <div style={{ height: "12px", background: t.primary, borderRadius: "2px", width: `${n * 4}px`, minWidth: "4px" }} />
                  <div style={{ fontSize: "11px", color: t.g500 }}>{n * 4}px</div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* BUTTONS */}
        <Section title="Button System" subtitle="All variants · 44px+ tap targets · Linear icons on all button states">
          <Card variant="flat" padding="24px">
            <div style={label}>Variants</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
              <Btn variant="primary">Primary</Btn>
              <Btn variant="secondary">Secondary</Btn>
              <Btn variant="ghost">Ghost</Btn>
              <Btn variant="destructive">Destructive</Btn>
            </div>
            <div style={label}>Sizes</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "24px" }}>
              <Btn variant="primary" size="sm">Small 36px</Btn>
              <Btn variant="primary" size="md">Medium 44px</Btn>
              <Btn variant="primary" size="lg">Large 52px</Btn>
            </div>
            <div style={label}>With Icons — Linear (outline) on all button states</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
              <Btn variant="primary" iconL="camera">Capture</Btn>
              <Btn variant="secondary" iconR="arrowRight">Continue</Btn>
              <Btn variant="ghost" iconOnly="search" />
              <Btn variant="ghost" iconOnly="settings" />
              <Btn variant="ghost" iconOnly="bell" />
              <Btn variant="destructive" iconL="trash2">Delete</Btn>
            </div>
            <div style={label}>States</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
              <Btn variant="primary" loading>Loading</Btn>
              <Btn variant="primary" disabled>Disabled</Btn>
              <Btn variant="ghost" disabled>Disabled Ghost</Btn>
            </div>
            <div style={label}>Full Width</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Btn variant="primary" fullWidth size="lg" iconR="arrowRight">Continue with Email</Btn>
              <Btn variant="ghost" fullWidth size="lg">Sign in with Apple</Btn>
            </div>
          </Card>
        </Section>

        {/* FORMS */}
        <Section title="Form Fields" subtitle="Linear icons in inputs · Solid AlertCircle on error state">
          <Card variant="flat" padding="24px">
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Input label="Full Name" placeholder="Enter your name" state="default" icon="user" />
              <Input label="Email (focused)" placeholder="you@example.com" state="focused" icon="star" helperText="We'll send a verification link" />
              <Input label="Password" placeholder="Enter password" state="default" showPasswordToggle />
              <Input label="Phone (with prefix)" placeholder="98765 43210" prefix="+91" state="default" />
              <Input label="Search" placeholder="Search photos, events..." icon="search" state="default" />
              <Input label="Username (error)" placeholder="@username" state="error" helperText="This username is already taken" />
              <Input label="Disabled field" placeholder="Cannot be edited" state="disabled" helperText="This field is locked" />
              <div>
                <div style={{ ...label, marginBottom: "12px" }}>OTP Verification</div>
                <OTPInput length={6} />
                <div style={{ fontSize: "11px", color: t.g400, marginTop: "8px" }}>Enter the 6-digit code sent to your phone</div>
              </div>
            </div>
          </Card>
        </Section>

        {/* SELECTION */}
        <Section title="Selection Components" subtitle="Icons transition linear → solid when selected/active">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card variant="flat" padding="20px">
              <div style={label}>Radio Cards — Linear unselected, solid selected</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[{icon:"zap",label:"Auto-deliver",sub:"AI finds your photos automatically"},{icon:"tag",label:"Manual tag",sub:"You choose which photos to keep"},{icon:"lock",label:"Private mode",sub:"Only you can access your photos"}].map((opt, i) => (
                  <RadioCard key={i} {...opt} selected={radioSelected === i} onClick={() => setRadioSelected(i)} />
                ))}
              </div>
            </Card>
            <Card variant="flat" padding="20px">
              <div style={label}>Segmented Control — Linear inactive, solid active</div>
              <SegmentedControl options={[{label:"All Photos",icon:"image"},{label:"Events",icon:"calendar"},{label:"People",icon:"user"}]} />
            </Card>
            <Card variant="flat" padding="20px">
              <div style={label}>Tag Chips — Solid Check appears on selection</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["Family","Friends","Work","Travel","Celebrations","Outdoors"].map((lbl, i) => (
                  <TagChip key={lbl} label={lbl} selected={chips[i]} onToggle={() => { const n = [...chips]; n[i] = !n[i]; setChips(n); }} />
                ))}
              </div>
            </Card>
            <Card variant="flat" padding="20px">
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={label}>Toggles — Linear when off, solid when on</div>
                <Toggle label="Face Recognition" defaultOn={true} icon="search" />
                <Toggle label="Auto-organize events" defaultOn={false} icon="calendar" />
                <Toggle label="Push notifications" defaultOn={true} icon="bell" />
                <div style={{ height: "1px", background: t.g100 }} />
                <div style={label}>Checkboxes — Solid Check icon on selection</div>
                <Checkbox label="Remember my device" defaultChecked={true} />
                <Checkbox label="Share usage analytics" defaultChecked={false} />
                <Checkbox label="Receive product updates" defaultChecked={true} />
              </div>
            </Card>
            <Card variant="flat" padding="20px">
              <div style={label}>Badges</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <Badge label="Default" />
                <Badge label="New event" variant="primary" dot />
                <Badge label="Synced" variant="success" dot />
                <Badge label="Upload failed" variant="error" dot />
                <Badge label="Processing" variant="warning" dot />
              </div>
            </Card>
          </div>
        </Section>

        {/* CARDS */}
        <Section title="Card System" subtitle="Flat, elevated, bordered, and brand variants">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card variant="flat" padding="20px">
              <div style={label}>List Items — Linear icons (browsing state)</div>
              <ListItem icon="calendar" title="Sarah's Birthday Party" subtitle="128 photos · 23 of you" trailing="›" />
              <ListItem icon="mapPin" title="Rajasthan Trip" subtitle="341 photos · 18 of you" trailing="›" />
              <ListItem icon="star" title="Live at NCPA" subtitle="89 photos · 7 of you" trailing="›" divider={false} />
            </Card>
            <Card variant="flat" padding="20px">
              <div style={label}>Active List Item — Solid icon (selected state)</div>
              <ListItem icon="camera" title="Wedding Album — Active" subtitle="Currently viewing" trailing={<Badge label="Active" variant="primary" />} active divider={false} />
            </Card>
            <Card variant="elevated" padding="20px">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Ic name="cloud" size={18} solid color={t.primaryDark} />
                <span style={{ fontSize: "16px", fontWeight: 700 }}>Storage</span>
              </div>
              <ProgressBar value={67} label="Photos stored" />
              <div style={{ marginTop: "12px", fontSize: "12px", color: t.g400 }}>1.3 GB of 2 GB used</div>
            </Card>
            <Card variant="bordered" padding="20px">
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Ic name="info" size={16} color={t.g400} style={{ marginTop: "2px" }} />
                <div style={{ fontSize: "14px", color: t.g600, lineHeight: 1.6 }}>Bordered cards work for secondary content, contextual notes, or lower-priority surfaces.</div>
              </div>
            </Card>
            <Card variant="primary" padding="24px">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Ic name="star" size={15} solid color={t.primaryMid} />
                <span style={{ fontSize: "12px", color: t.primaryMid, fontWeight: 600 }}>PRO TIP</span>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: t.white, marginBottom: "8px" }}>Enable Face Recognition</div>
              <div style={{ fontSize: "12px", color: t.g400, lineHeight: 1.6, marginBottom: "16px" }}>Turn on face recognition to automatically receive photos from any event you attend.</div>
              <Btn variant="primary" size="sm" iconL="search">Enable Now</Btn>
            </Card>
          </div>
        </Section>

        {/* NAVIGATION */}
        <Section title="Navigation Components" subtitle="Tab icons linear → solid on active · Linear in header actions">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card variant="flat" padding="0px">
              <div style={{ padding: "16px 16px 8px", ...label }}>Top Header — Default</div>
              <TopHeaderBar title="My Photos" trailing={<Btn variant="ghost" iconOnly="settings" size="sm" />} />
            </Card>
            <Card variant="flat" padding="0px">
              <div style={{ padding: "16px 16px 8px", ...label }}>Top Header — Back Navigation</div>
              <TopHeaderBar title="Wedding Album" showBack trailing={<Btn variant="secondary" size="sm" iconR="upload">Share</Btn>} />
            </Card>
            <Card variant="flat" padding="0px">
              <div style={{ padding: "16px 16px 8px", ...label }}>Bottom Tab Bar — Linear inactive · Solid active</div>
              <BottomTabBar />
            </Card>
            <Card variant="flat" padding="20px">
              <div style={label}>Bottom Sheet</div>
              <BottomSheetDemo />
            </Card>
          </div>
        </Section>

        {/* FEEDBACK */}
        <Section title="Feedback & States" subtitle="Solid icons in snackbars and empty states · Linear in progress">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card variant="flat" padding="20px">
              <div style={label}>Snackbars — Solid icons for immediate recognition</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Snackbar message="Photos synced successfully" type="success" />
                <Snackbar message="Upload failed. Please try again." type="error" />
                <Snackbar message="Processing 12 photos..." type="default" />
              </div>
            </Card>
            <Card variant="flat" padding="20px">
              <div style={label}>Progress Indicators</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <ProgressBar value={100} label="Upload complete" />
                <ProgressBar value={45} label="Processing faces" />
                <ProgressBar value={12} label="Downloading event" />
              </div>
            </Card>
            <Card variant="flat" padding="0px">
              <EmptyState icon="image" title="No photos yet" subtitle="Attend an event or upload photos to start seeing memories delivered to you." cta="Explore events" />
            </Card>
            <Card variant="flat" padding="0px"><LoadingState /></Card>
          </div>
        </Section>

        {/* SCREENS */}
        <Section title="Screen Previews" subtitle="Onboarding (light) · Home (dark)">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: t.g400 }}>Onboarding · Light</span>
              <OnboardingScreen />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: t.g400 }}>Home · Dark</span>
              <HomeScreen />
            </div>
          </div>
        </Section>

        {/* TOKEN REFERENCE */}
        <Section title="Developer Token Reference" subtitle="Copy-ready for NativeWind / StyleSheet / Expo">
          <Card variant="flat" padding="24px">
            <div style={label}>Border Radius Scale</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
              {[["xs","4px"],["sm","8px"],["md","12px"],["lg","16px"],["xl","20px"],["2xl","24px"],["3xl","32px"],["full","9999px"]].map(([k,v]) => (
                <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "48px", height: "48px", background: t.primaryLight, borderRadius: v, border: `1.5px solid ${t.primary}` }} />
                  <div style={{ fontSize: "10px", fontFamily: "monospace", color: t.g400 }}>{k}</div>
                </div>
              ))}
            </div>
            <div style={{ height: "1px", background: t.g100, margin: "8px 0 20px" }} />
            <div style={label}>Tokens + Icon Convention</div>
            <div style={{ background: t.g900, borderRadius: "16px", padding: "20px", overflow: "auto" }}>
              <pre style={{ fontFamily: "monospace", fontSize: "12px", color: t.primary, lineHeight: 1.8, margin: 0 }}>{`// Icon state convention
// LINEAR — inactive / default / buttons
stroke only, fill="none", strokeWidth=1.75

// SOLID — active / selected / emphasis
fill=color, no stroke, strokeWidth=0

// Sizes: 12 inline · 16 input · 18 list
//        20 tab/btn · 22 active · 32 empty

export const colors = {
  primary: '#6CF073',
  primaryDark: '#3DB844',
  primaryDeep: '#1A5E1F',
  primaryLight: '#EAFBEB',
  grey50:'#F7F8F7',  grey100:'#EFF0EF',
  grey200:'#D9DBD9', grey400:'#8E948E',
  grey500:'#636863', grey800:'#1C1F1C',
  grey900:'#0F110F', error:'#E53935',
  warning:'#F59E0B', success:'#3DB844',
  darkBg:'#0F110F',  darkSurface:'#1C1F1C',
};
export const spacing = {
  1:4,2:8,3:12,4:16,5:20,
  6:24,8:32,10:40,12:48,16:64,
};
export const radii = {
  xs:4,sm:8,md:12,lg:16,xl:20,xxl:24,
};`}</pre>
            </div>
          </Card>
        </Section>

        {/* FOOTER */}
        <div style={{ padding: "32px 24px 64px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "12px 24px", background: t.white, borderRadius: "9999px", border: `1px solid ${t.g100}`, boxShadow: t.shSm }}>
            <Ic name="camera" size={18} solid color={t.primaryDark} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: t.g600 }}>Snapsy Design System v1.0 · Production Ready</span>
          </div>
        </div>

      </div>
    </div>
  );
}
