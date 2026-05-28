// adot UI kit components — vanilla JSX
// Loaded after React + Babel; defines window-scoped components.

const { useState } = React;

// Lucide icon helper (initialized once, re-runs on mount)
function Icon({ name, size = 24, color, className = "", style = {}, onClick }) {
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  return <i data-lucide={name} className={className}
    style={{ width: size, height: size, color, flexShrink: 0, ...style }}
    onClick={onClick} />;
}

function Header({ type = "center", title, leftIcon, rightIcons = [], onLeft, cancel, confirm, onCancel, onConfirm }) {
  if (type === "edit") {
    return (
      <div className="adot-header edit">
        <span className="text-action cancel" onClick={onCancel}>{cancel || "취소"}</span>
        <div className="title">{title}</div>
        <span className="text-action confirm" onClick={onConfirm}>{confirm || "확인"}</span>
      </div>
    );
  }
  return (
    <div className={`adot-header ${type === "left" ? "left" : ""}`}>
      {leftIcon && <Icon name={leftIcon} size={28} className="ico" onClick={onLeft} />}
      <div className="title">{title}</div>
      {rightIcons.map((n, i) => <Icon key={i} name={n} size={28} className="ico" />)}
    </div>
  );
}

function ListRow({ icL, title, subtitle, icR = [], compact, onClick, children }) {
  return (
    <div className={`adot-row ${compact ? "compact" : ""}`} onClick={onClick}>
      {icL && <Icon name={icL} size={22} className="icL" />}
      {children && <div style={{ display: "contents" }}>{children}</div>}
      <div className="body">
        <div className="ttl">{title}</div>
        {subtitle && <div className="sub">{subtitle}</div>}
      </div>
      {icR.map((n, i) => <Icon key={i} name={n} size={22} className={`icR ${n === "grip-vertical" ? "dim" : ""}`} />)}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return <div className={`adot-toggle ${on ? "on" : ""}`} onClick={() => onChange?.(!on)}><div className="knob" /></div>;
}
function Radio({ on, onChange }) {
  return <div className={`adot-radio ${on ? "on" : ""}`} onClick={() => onChange?.(!on)} />;
}
function Checkbox({ on, onChange }) {
  return <div className={`adot-check ${on ? "on" : ""}`} onClick={() => onChange?.(!on)}>
    {on && <Icon name="check" size={20} color="#fff" />}
  </div>;
}

function Chip({ selected, onClick, children, onDark }) {
  return <div className={`adot-chip ${selected ? "selected" : ""} ${onDark ? "on-dark" : ""}`} onClick={onClick}>{children}</div>;
}

function Tabs({ kind = "underline", tabs, active, onChange }) {
  return (
    <div className={`adot-tabs ${kind}`}>
      {tabs.map((t, i) => (
        <div key={i} className={`tab ${active === i ? "active" : ""}`} onClick={() => onChange?.(i)}>{t}</div>
      ))}
    </div>
  );
}

function Field({ icon, value, onChange, placeholder, gray, typing }) {
  return (
    <div className={`adot-field ${gray ? "gray" : ""} ${typing || value ? "typing" : ""}`}>
      {icon && <Icon name={icon} size={20} color={value ? "#1F2937" : "#9CA3AF"} />}
      <input value={value || ""} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} />
      {value && <Icon name="x-circle" size={20} color="#9CA3AF" onClick={() => onChange?.("")} style={{ cursor: "pointer" }} />}
    </div>
  );
}

function Modal({ icon = "alert-circle", title, body, cancel = "취소", confirm = "확인", onCancel, onConfirm }) {
  return (
    <div className="adot-modal-bg" onClick={onCancel}>
      <div className="adot-modal" onClick={e => e.stopPropagation()}>
        {icon && <Icon name={icon} size={40} color="#1F2937" />}
        <div>
          <div className="ttl">{title}</div>
          <div className="body">{body}</div>
        </div>
        <div className="actions">
          <button className="adot-btn line" onClick={onCancel}>{cancel}</button>
          <button className="adot-btn primary" onClick={onConfirm}>{confirm}</button>
        </div>
      </div>
    </div>
  );
}

function Drum({ values, focusIdx = 1, label }) {
  return (
    <div className="adot-drum">
      {values.map((col, ci) => (
        <div className="col" key={ci}>
          {col.map((v, i) => <span key={i} className={i === focusIdx ? "focus" : ""}>{v}</span>)}
        </div>
      ))}
    </div>
  );
}

function Phone({ label, children }) {
  return <div className="adot-phone"><div className="label">{label}</div>{children}</div>;
}

Object.assign(window, { Icon, Header, ListRow, Toggle, Radio, Checkbox, Chip, Tabs, Field, Modal, Drum, Phone });
