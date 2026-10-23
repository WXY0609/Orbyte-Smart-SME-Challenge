import React, { useState } from 'react';
import { ArrowRight, Check, Clipboard, ExternalLink, Plus, Send, Play, ShieldCheck, RefreshCw } from 'lucide-react';
import { Empty, Field, Panel, PlanCard, Status, Submit, Ref } from './ui';
import { api, dateTime, money, windowLabel } from './lib';

export function Plans({ state, onQuestion, onDraft, mode }) {
  const [booked, setBooked] = useState(state.business.indoor_booked);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  async function simulate(e) {
    e.preventDefault(); setError(''); setChecking(true);
    try { setPreview(await api(mode, '/checks', { method: 'POST', body: { indoor_booked: Number(booked) } })); }
    catch (err) { setError(err.message); } finally { setChecking(false); }
  }
  return <div className="page-stack"><div className="info-banner"><ShieldCheck size={20}/><span>{state.checks.disclaimer} Each check applies to {windowLabel(state.target)}.</span></div>
    <div className="page-stack">{state.checks.plans.map(plan => <PlanCard key={plan.id} plan={plan} onQuestion={onQuestion} onDraft={onDraft}/>)}</div>
    <Panel title="Explore a what-if" subtitle="Try a different indoor booking count without changing saved conditions or approvals."><form onSubmit={simulate} className="row gap wrap align-end"><Field label="Hypothetical indoor seats booked"><input type="number" min="0" max={state.business.indoor_capacity} required value={booked} onChange={e => setBooked(e.target.value)}/></Field><Submit busy={checking}>Check hypothetical scenario</Submit></form>{error && <p className="error-text" role="alert">{error}</p>}{preview && <div className="preview-result"><span className="source-tag demo">Hypothetical · not saved</span><h3>{preview.plans[0].name}</h3><Status value={preview.plans[0].status}/>{[...preview.plans[0].reasons, ...preview.plans[0].missing].map((r, i) => <p className="muted small" key={i}>{r}</p>)}</div>}</Panel>
  </div>;
}

export function Confirmations({ state, run, busy }) {
  return <div className="page-stack"><div className="section-line"><div><h3>Ask the person who was there</h3><p className="muted">A recent observation helps you investigate. The owner confirms tomorrow's conditions.</p></div><button className="btn primary" disabled={busy} onClick={() => run('/questions', 'POST', {})}><Plus size={16}/>Create rear-access question</button></div>
    {!state.questions.length && <Panel><Empty title="No confirmation questions yet">When rear access is unknown, create a short voluntary question and share its link with a customer who just arrived.</Empty></Panel>}
    {state.questions.map(q => <QuestionCard key={q.id} question={q} state={state} run={run} busy={busy}/>)}</div>;
}

function QuestionCard({ question: q, state, run, busy }) {
  const [value, setValue] = useState('unknown');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/feedback/${q.token}`;
  const verified = state.verifications.filter(v => v.question_id === q.id).at(-1);
  const answers = new Set(q.observations.map(o => o.answer));
  const contradicted = answers.has('yes') && answers.has('no');
  const current = JSON.stringify(q.target) === JSON.stringify(state.target) && q.target.date === state.tomorrow;
  async function copy() { try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setCopied(false); } }
  const verify = async e => { e.preventDefault(); if (await run(`/questions/${q.id}/verify`, 'POST', { value, notes })) setNotes(''); };
  return <Panel id={`record-${q.id}`} title={q.text} aside={<span className={`source-tag ${q.resolved ? 'forecast' : 'merchant'}`}>{q.resolved ? 'Owner verified' : 'Awaiting owner verification'}</span>}>
    <p className="muted small">Target service: {windowLabel(q.target)} · Created {dateTime(q.created_at)}</p>
    <div className="feedback-link"><input aria-label="Customer feedback link" value={link} readOnly onFocus={e => e.target.select()}/><button className="btn" onClick={copy}><Clipboard size={15}/>{copied ? 'Copied' : 'Copy link'}</button><a className="icon-btn" href={link} target="_blank" rel="noreferrer" aria-label="Open customer feedback page"><ExternalLink size={17}/></a></div>
    <div className="observations"><span className="eyebrow">CUSTOMER OBSERVATIONS · UNVERIFIED LEADS</span>{!q.observations.length ? <p className="muted small">No responses yet. Customers may skip without giving personal details.</p> : q.observations.map(o => <div className="observation" key={o.id}><span className="chip">{({ yes: 'Yes — passage was blocked', no: 'No — no blockage seen', not_sure: 'Not sure', skip: 'Skipped' })[o.answer]}</span><span className="muted small">Observed {dateTime(o.observed_at)} · Received {dateTime(o.submitted_at)}</span></div>)}</div>
    {contradicted && <div className="warning-box">Reports conflict. They do not establish access for tomorrow. Record how you independently checked the target service window.</div>}
    {verified && <div className="verification"><ShieldCheck size={18}/><div><strong>{verified.value === 'yes' ? 'Rear access confirmed available' : verified.value === 'no' ? 'Rear access confirmed unavailable' : 'Access remains unconfirmed'}</strong><p>{verified.notes}</p><small className="muted">{verified.owner} · {dateTime(verified.at)} · {windowLabel(verified.target)}</small></div></div>}
    {current ? <form onSubmit={verify} className="verification-form"><h4>Owner check for tomorrow's service</h4><p className="muted small">An answer about today never confirms tomorrow automatically. Check the planned works, passage and pickup arrangements yourself.</p><div className="form-grid"><Field label="Rear passage usable during the target service window?"><select value={value} onChange={e => setValue(e.target.value)}><option value="unknown">Still unknown — keep asking</option><option value="yes">Confirmed usable</option><option value="no">Confirmed unavailable</option></select></Field><Field label="How did you verify the target service window?"><textarea required maxLength={1000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="E.g. checked the site and confirmed tomorrow’s works schedule with the building manager."/></Field></div><Submit busy={busy}>Record owner check & recheck plans</Submit></form> : <div className="warning-box">This question belongs to an older service window. Create a new one for tomorrow.</div>}
  </Panel>;
}

const emptyAction = (state, plan) => ({ title: plan ? `Prepare ${plan.id === 'indoor' ? 'indoor seating' : `${plan.id}-door pickup`}` : '', kind: 'task', plan_id: plan?.id || 'preparation', recipient: 'Restaurant team', owner: state.business.owner, cost: 0, content: plan ? `Prepare ${plan.name.toLowerCase()} for ${windowLabel(state.target)}. Check the plan conditions before starting.` : '' });

export function Actions({ state, run, busy, draftPlan }) {
  const [show, setShow] = useState(Boolean(draftPlan));
  const [form, setForm] = useState(() => emptyAction(state, draftPlan));
  const [editing, setEditing] = useState(null);
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  async function create(e) { e.preventDefault(); if (await run(editing ? `/actions/${editing}` : '/actions', editing ? 'PUT' : 'POST', { ...form, cost: Number(form.cost) })) { setShow(false); setEditing(null); setForm(emptyAction(state)); } }
  const estimated = state.actions.reduce((sum, a) => sum + a.cost, 0);
  return <div className="page-stack"><div className="section-line"><div><h3>Decisions become actions</h3><p className="muted small">Total proposed estimated cost: <strong>{money(estimated)}</strong> · Entered by the owner, not predicted savings.</p></div><button className="btn primary" onClick={() => { setEditing(null); setForm(emptyAction(state)); setShow(!show); }}><Plus size={16}/>New action draft</button></div>
    {show && <Panel title={editing ? 'Edit action draft' : 'Prepare a concrete action'} subtitle={`Service window / deadline: ${windowLabel(state.target)}`}><form className="form-grid" onSubmit={create}><Field label="Action title"><input required value={form.title} maxLength={160} onChange={e => set('title', e.target.value)}/></Field><Field label="Action type"><select value={form.kind} onChange={e => set('kind', e.target.value)}><option value="task">Internal preparation task</option><option value="customer_notice">Customer notice · simulated send</option><option value="supplier_inquiry">Supplier inquiry · simulated send</option></select></Field><Field label="Supporting plan"><select value={form.plan_id} onChange={e => set('plan_id', e.target.value)}><option value="preparation">Preparation / investigation task only</option>{state.checks.plans.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></Field><Field label="Recipient / team"><input required maxLength={160} value={form.recipient} onChange={e => set('recipient', e.target.value)}/></Field><Field label="Responsible person"><input required maxLength={100} value={form.owner} onChange={e => set('owner', e.target.value)}/></Field><Field label="Estimated cost (RM)"><input required type="number" min="0" max="1000000" step="0.01" value={form.cost} onChange={e => set('cost', e.target.value)}/></Field><div className="full"><Field label="Exact task instructions / message content"><textarea required rows={4} maxLength={3000} value={form.content} onChange={e => set('content', e.target.value)}/></Field></div><div className="full row gap"><Submit busy={busy}>{editing ? 'Save revised draft' : 'Save draft for review'}</Submit><button type="button" className="btn" onClick={() => setShow(false)}>Cancel</button></div></form></Panel>}
    {!state.actions.length && <Panel><Empty title="Your action list is clear">Create a preparation task, or ask Copilot to draft a message. Every action needs your explicit approval before execution.</Empty></Panel>}
    {state.actions.slice().reverse().map(a => <ActionCard key={a.id} action={a} state={state} busy={busy} run={run} onEdit={() => { setEditing(a.id); setForm({ ...a }); setShow(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}/>)}</div>;
}

function ActionCard({ action: a, state, busy, run, onEdit }) {
  const [reply, setReply] = useState('');
  const plan = state.checks.plans.find(p => p.id === a.plan_id);
  const supported = !plan || plan.status === 'conditions_met';
  const current = a.target.date === state.tomorrow && JSON.stringify(a.target) === JSON.stringify(state.target);
  return <Panel id={`record-${a.id}`} title={a.title} aside={<Status value={a.status}/>}><div className="row gap wrap"><span className="chip">{a.kind.replaceAll('_', ' ')}</span><span className="chip">{money(a.cost)} estimated</span>{a.kind !== 'task' && <span className="source-tag demo">SIMULATED NOTIFICATION</span>}</div><div className="action-meta"><div><span className="muted small">Recipient</span><strong>{a.recipient}</strong></div><div><span className="muted small">Responsible</span><strong>{a.owner}</strong></div><div><span className="muted small">Service / deadline (MYT)</span><strong>{windowLabel(a.target)}</strong></div></div><div className="message-preview">{a.content}</div>
    {plan && <div className="row gap wrap"><Ref item={{ type: 'plan', id: plan.id, label: plan.name }}/><Status value={plan.status}/></div>}
    {!current && <div className="warning-box">This action belongs to an old service window. Create a new draft for tomorrow.</div>}
    {a.approval && <details className="approval"><summary>Approved by {a.approval.by} · {dateTime(a.approval.at)} · view approved snapshot</summary><p className="small">{a.approval.snapshot.content}</p><p className="muted small">{a.approval.snapshot.recipient} · {money(a.approval.snapshot.cost)} · {windowLabel(a.approval.snapshot.target)}</p></details>}
    {a.status === 'needs_review' && <div className="warning-box">Business conditions changed after approval. Review current checks and approve this action again.</div>}
    {['draft', 'needs_review'].includes(a.status) && <div className="card-actions"><p className="muted small">{!supported ? 'Resolve this plan’s conflicts and missing conditions before approval.' : 'Approval records the exact content, recipient, time window and estimated cost.'}</p><div className="row gap"><button className="btn primary" disabled={busy || !supported || !current || (a.plan_id === 'preparation' && a.kind !== 'task')} onClick={() => run(`/actions/${a.id}/approve`, 'POST', {})}><Check size={16}/>Approve this action</button><button className="btn" onClick={onEdit} disabled={busy}>Edit draft</button></div></div>}
    {a.status === 'approved' && <div className="card-actions"><button className="btn primary" disabled={busy || !current || !supported} onClick={() => run(`/actions/${a.id}/execute`, 'POST', {})}>{a.kind === 'task' ? <Play size={16}/> : <Send size={16}/>} {a.kind === 'task' ? 'Start preparation task' : 'Simulate sending this message'}</button></div>}
    {['in_progress', 'waiting_reply'].includes(a.status) && <form className="completion-form" onSubmit={e => { e.preventDefault(); run(`/actions/${a.id}/complete`, 'POST', { reply }); }}><p className="muted small">{a.kind === 'task' ? `Started ${dateTime(a.execution_at)}. Record what was completed.` : `Simulated sent ${dateTime(a.execution_at)}. Record the reply you received manually.`}</p><Field label={a.kind === 'task' ? 'Completion note' : 'Recorded reply'}><textarea required maxLength={2000} value={reply} onChange={e => setReply(e.target.value)}/></Field><Submit busy={busy}>Record & mark completed</Submit></form>}
    {a.status === 'completed' && <div className="verification"><Check size={18}/><div><strong>Completed {dateTime(a.completed_at)}</strong><p>{a.reply}</p></div></div>}
  </Panel>;
}
