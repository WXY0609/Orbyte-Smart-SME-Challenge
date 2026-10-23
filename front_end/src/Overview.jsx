import React from 'react';
import { ArrowRight, CloudRain, ShieldCheck, ClipboardCheck, Wallet, MapPin, ArrowUpRight } from 'lucide-react';
import { Panel, PlanCard, Status } from './ui';
import { money, dateLabel, dateTime } from './lib';

export default function Overview({ state, onQuestion, onDraft }) {
  const { checks, actions, business, target } = state;
  const missing = [...new Set(checks.plans.flatMap(p => p.missing))];
  const pending = actions.filter(a => ['draft', 'needs_review'].includes(a.status));
  const approvedCost = actions.filter(a => a.approval && a.status !== 'needs_review').reduce((sum, a) => sum + a.cost, 0);
  const stats = [
    { title: 'Relevant events', value: checks.active_event_ids.length.toString().padStart(2, '0'), note: 'Overlapping your service window', icon: CloudRain, color: 'cyan' },
    { title: 'Information gaps', value: missing.length.toString().padStart(2, '0'), note: 'Conditions still needing confirmation', icon: ShieldCheck, color: 'amber' },
    { title: 'Awaiting your review', value: pending.length.toString().padStart(2, '0'), note: 'Specific actions ready to review', icon: ClipboardCheck, color: 'violet' },
    { title: 'Approved estimated cost', value: money(approvedCost), note: 'Owner estimates, not guaranteed savings', icon: Wallet, color: 'green' },
  ];
  return <div className="page-stack">
    {state.workspace === 'live' && !state.profile_confirmed && <div className="info-banner"><MapPin size={18}/><span>Your live workspace starts with sample restaurant settings. <a className="text-link" href="#profile">Confirm your Business Profile <ArrowRight size={13}/></a> before relying on plan checks.</span></div>}
    <div className="hero panel"><div><span className="eyebrow cyan-text">A LITTLE PREPARATION. A BETTER TOMORROW.</span><h2>See what tomorrow<br/>has in store.</h2><p className="muted hero-copy">Connect the events around you with the realities of your restaurant. Find the gaps, check your options, and decide what comes next.</p><div className="row gap wrap"><a href="#plans" className="btn primary">Review preparation plans <ArrowRight size={16}/></a><a href="#copilot" className="btn">Ask AI Copilot <ArrowUpRight size={16}/></a></div></div><div className="tomorrow-card"><CloudRain size={38} className="cyan-text"/><span className="eyebrow">TOMORROW'S SERVICE</span><strong>{dateLabel(target.date)}</strong><span className="time-large">{target.start}<span>—</span>{target.end}</span><span className="muted small">Asia/Kuala_Lumpur · MYT</span><div className="location-line"><MapPin size={14}/>{business.name}</div></div></div>
    <div className="stats-grid">{stats.map(({ title, value, note, icon: Icon, color }) => <div className="stat panel" key={title}><div className="row between"><span className="stat-label">{title}</span><span className={`icon-tile ${color}`}><Icon size={18}/></span></div><strong>{value}</strong><p className="muted small">{note}</p></div>)}</div>
    <Panel title="Your preparation, connected" subtitle="One event can change several options. Check the whole chain." aside={<a href="#plans" className="text-link">View all checks <ArrowRight size={14}/></a>}>
      <div className="risk-banner"><span className="icon-tile amber"><CloudRain size={22}/></span><div><strong>{checks.rain_trigger ? 'Outdoor service needs a closer look' : checks.weather_known ? 'Review tomorrow’s known conditions' : 'Tomorrow’s forecast needs checking'}</strong><p className="muted small">{checks.risk}</p></div></div>
      <div className="plan-grid">{checks.plans.map((p, i) => <div key={p.id}><div className="step-label"><span>0{i + 1}</span>{['Check indoor capacity', 'Check front access', 'Confirm the alternative'][i]}</div><PlanCard plan={p} compact onQuestion={onQuestion} onDraft={onDraft}/></div>)}</div>
      <p className="disclaimer">{checks.disclaimer}</p>
    </Panel>
    <div className="two-grid"><Panel title="Next steps" subtitle="Keep the decision with the owner."><div className="next-step"><span className="number">1</span><div><strong>Close the information gaps</strong><p className="muted small">{missing.length ? missing[0] : 'All currently checked conditions have evidence. Review the results before acting.'}</p><a href="#confirmations" className="text-link">Open confirmations <ArrowRight size={13}/></a></div></div><div className="next-step"><span className="number">2</span><div><strong>Review concrete actions</strong><p className="muted small">Approve the exact message or preparation task, then track its progress.</p><a href="#actions" className="text-link">Open actions <ArrowRight size={13}/></a></div></div></Panel>
    <Panel title="Activity trail" subtitle="A record of changes and decisions.">{state.audit.length ? <div className="activity-list">{state.audit.slice(-5).reverse().map(log => <div key={log.id}><span className="activity-dot"/><div><p>{log.detail}</p><small className="muted">{dateTime(log.at)}</small></div></div>)}</div> : <div className="onboarding"><ClipboardCheck size={30}/><p>No decisions recorded yet.</p><span className="muted small">Start by checking your business profile and tomorrow's events.</span></div>}</Panel></div>
  </div>;
}
