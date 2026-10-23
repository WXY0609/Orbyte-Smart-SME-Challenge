import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { api, localNow, windowLabel } from './lib';
import { Field } from './ui';

export default function PublicFeedback({ token }) {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [observed, setObserved] = useState(localNow());
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api('live', `/public/questions/${token}`).then(setQuestion).catch(e => setError(e.message)); }, [token]);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { await api('live', `/public/questions/${token}/responses`, { method: 'POST', body: { answer, observed_at: `${observed}:00+08:00` } }); setDone(true); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <main className="public-page"><div className="public-brand"><span className="brand-icon"><Sparkles size={22}/></span><strong>orbyte<span> / local insight</span></strong></div><section className="panel feedback-card">{done ? <div className="feedback-done"><CheckCircle2 size={48}/><h1>Thanks for helping.</h1><p className="muted">Your observation has been recorded as an unverified lead. The store will check whether it affects tomorrow's service.</p><span className="chip">You can close this page.</span></div> : question ? <><div className="row gap wrap"><span className="icon-tile cyan"><MessageSquare size={24}/></span><span className="eyebrow">A QUICK, VOLUNTARY CHECK</span>{question.demo && <span className="source-tag demo">Demo question</span>}</div><p className="muted">{question.store} would appreciate a recent observation.</p><h1>{question.text}</h1><p className="muted">Please answer only what you personally saw. No name, contact details or location access needed.</p>{question.closed ? <div className="warning-box">This question is closed. Ask the store for a current feedback link.</div> : <form onSubmit={submit}><fieldset className="answer-options"><legend className="sr-only">Your observation</legend>{[['yes', 'Yes', 'I saw a blockage'], ['no', 'No', 'I did not see a blockage'], ['not_sure', 'Not sure', 'I could not tell'], ['skip', 'Skip', 'I prefer not to answer']].map(([val, label, sub]) => <label key={val} className={answer === val ? 'selected' : ''}><input type="radio" name="answer" required value={val} checked={answer === val} onChange={() => setAnswer(val)}/><span><strong>{label}</strong><small>{sub}</small></span></label>)}</fieldset><Field label="When did you observe this? (Malaysia time)"><input type="datetime-local" required max={localNow()} value={observed} onChange={e => setObserved(e.target.value)}/></Field><div className="info-banner small">This describes your observation, not a guarantee about tomorrow. The owner will separately verify {windowLabel(question.target)}.</div><button className="btn primary" disabled={busy || !answer}>{busy ? 'Submitting…' : 'Submit observation'}<ArrowRight size={16}/></button></form>}</> : <p className="muted">{error ? 'The feedback question could not be loaded.' : 'Loading your question…'}</p>}{error && <div className="error-banner" role="alert">{error}</div>}</section><p className="muted small public-note">Small observations. Better-prepared local businesses.</p></main>;
}
