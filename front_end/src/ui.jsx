import React from 'react';
import { ArrowUpRight, CheckCircle2, AlertTriangle, CircleHelp } from 'lucide-react';
import { labels, refHref } from './lib';

export function Status({ value }) {
  const good = ['conditions_met', 'approved', 'completed'].includes(value);
  const warn = ['insufficient_data', 'draft', 'needs_review', 'waiting_reply'].includes(value);
  const Icon = good ? CheckCircle2 : warn ? CircleHelp : AlertTriangle;
  return <span className={`status ${good ? 'good' : warn ? 'warn' : 'bad'}`}><Icon size={13} />{labels[value] || value}</span>;
}
export function Panel({ title, subtitle, children, className = '', aside, id }) {
  return <section className={`panel ${className}`} id={id}>{title && <div className="panel-head"><div><h3>{title}</h3>{subtitle && <p className="muted small">{subtitle}</p>}</div>{aside}</div>}{children}</section>;
}
export function Field({ label, children, hint }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small className="muted">{hint}</small>}</label>;
}
export function Empty({ title, children }) {
  return <div className="empty"><CircleHelp size={26} /><h3>{title}</h3><p className="muted">{children}</p></div>;
}
export function Ref({ item }) {
  return <a className="ref-link" href={refHref(item)}>{item.label}<ArrowUpRight size={13}/></a>;
}
export function Submit({ busy, children = 'Save changes' }) {
  return <button className="btn primary" disabled={busy} type="submit">{busy ? 'Saving…' : children}</button>;
}
export function PlanCard({ plan, compact = false, onQuestion, onDraft }) {
  return <Panel id={`record-${plan.id}`} className={`plan-card ${plan.status}`} title={plan.name} aside={<Status value={plan.status}/>}>
    {plan.reasons.map((reason, i) => <p key={`r${i}`} className="reason conflict-text"><AlertTriangle size={15}/>{reason}</p>)}
    {plan.missing.map((reason, i) => <p key={`m${i}`} className="reason missing-text"><CircleHelp size={15}/>{reason}</p>)}
    {plan.status === 'conditions_met' && <p className="reason success-text"><CheckCircle2 size={15}/>No conflict found in the known conditions for this service window.</p>}
    {!compact && <div className="evidence"><span className="eyebrow">Checked against</span><div className="ref-list">{plan.evidence.map((item, i) => <Ref key={i} item={item}/>)}</div></div>}
    <div className="row gap wrap card-actions">{plan.id === 'rear' && plan.missing.some(m => m.includes('rear')) && <button className="btn small-btn" onClick={onQuestion}>Create confirmation question</button>}
      <button className="btn small-btn" onClick={() => onDraft(plan)}>Prepare action draft <ArrowUpRight size={14}/></button></div>
  </Panel>;
}
