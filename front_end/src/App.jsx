import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutDashboard, CloudRain, GitBranch, MessageSquare, ClipboardCheck, Bot, Store, Sparkles, ArrowUpRight, RefreshCw, Menu, X, MapPin, ChevronRight, ShieldCheck } from 'lucide-react';
import Overview from './Overview';
import Events from './Events';
import Profile from './Profile';
import { Actions, Confirmations, Plans } from './Workflows';
import Copilot from './Copilot';
import PublicFeedback from './PublicFeedback';
import { api, dateLabel } from './lib';

const navigation = [
  ['overview', 'Tomorrow Overview', LayoutDashboard, 'Your next business day, in focus.'],
  ['events', 'Events & Evidence', CloudRain, 'Know what is happening around your restaurant.'],
  ['plans', 'Plan Checks', GitBranch, 'Check the alternatives against real conditions.'],
  ['confirmations', 'Confirmations', MessageSquare, 'Turn missing information into a useful next question.'],
  ['actions', 'Actions', ClipboardCheck, 'Review, approve and follow through.'],
  ['copilot', 'AI Copilot', Bot, 'A thinking partner for your next business day.'],
  ['profile', 'Business Profile', Store, 'The details that make each recommendation relevant.'],
];
const readTab = () => {
  const tab = window.location.hash.slice(1).split(':')[0];
  return navigation.some(n => n[0] === tab) ? tab : 'overview';
};

function Workspace() {
  const [mode, setMode] = useState(() => localStorage.getItem('orbyte-workspace') === 'live' ? 'live' : 'demo');
  const [state, setState] = useState(null);
  const [tab, setTab] = useState(readTab);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [menu, setMenu] = useState(false);
  const [draftPlan, setDraftPlan] = useState(null);
  const [draftVersion, setDraftVersion] = useState(0);
  const activeMode = useRef(mode);
  activeMode.current = mode;
  const refresh = useCallback(async () => {
    try {
      const next = await api(mode, '/state');
      if (activeMode.current === mode) setState(next);
      return true;
    } catch (e) { if (activeMode.current === mode) setError(e.message); return false; }
  }, [mode]);
  useEffect(() => { setState(null); setError(''); setDraftPlan(null); localStorage.setItem('orbyte-workspace', mode); refresh(); }, [mode, refresh]);
  useEffect(() => {
    const update = () => { setTab(readTab()); setMenu(false); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    const id = window.location.hash.split(':')[1];
    if (id) { const timer = setTimeout(() => document.getElementById(`record-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); return () => clearTimeout(timer); }
  }, [tab, state]);
  useEffect(() => {
    if (tab !== 'confirmations') return;
    const timer = setInterval(() => { if (!document.hidden && !busy) refresh(); }, 10000);
    return () => clearInterval(timer);
  }, [tab, busy, refresh]);
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(''), 4500); return () => clearTimeout(timer); } }, [notice]);
  async function run(path, method = 'POST', body) {
    if (busy) return false;
    setBusy(true); setError(''); setNotice('');
    try {
      const next = await api(mode, path, { method, body });
      if (activeMode.current === mode) { setState(next); setNotice('Saved. Plans and records are up to date.'); }
      return true;
    } catch (e) {
      if (activeMode.current === mode) { setError(e.message); if (e.state) setState(e.state); }
      return false;
    } finally { setBusy(false); }
  }
  async function question() {
    if (await run('/questions', 'POST', {})) window.location.hash = 'confirmations';
  }
  function draft(plan) {
    setDraftPlan(plan); setDraftVersion(v => v + 1); window.location.hash = 'actions';
  }
  const current = navigation.find(n => n[0] === tab);
  const pending = state?.actions.filter(a => ['draft', 'needs_review'].includes(a.status)).length || 0;
  return <div className="app-shell">
    {menu && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMenu(false)}/>}
    <aside className={`sidebar ${menu ? 'open' : ''}`}>
      <a className="brand" href="#overview"><span className="brand-icon"><Sparkles size={24}/></span><div><strong>orbyte<span className="brand-dot">.</span></strong><small>READY FOR TOMORROW</small></div></a>
      <div className="workspace-switch" aria-label="Workspace"><button className={mode === 'demo' ? 'selected' : ''} disabled={busy} onClick={() => setMode('demo')}>Demo scenario</button><button className={mode === 'live' ? 'selected' : ''} disabled={busy} onClick={() => setMode('live')}>Live workspace</button></div>
      <span className="nav-caption">YOUR WORKSPACE</span>
      <nav>{navigation.map(([id, label, Icon]) => <a href={`#${id}`} key={id} className={tab === id ? 'active' : ''}><Icon size={18}/><span>{label}</span>{id === 'actions' && pending > 0 && <span className="nav-count">{pending}</span>}{id === 'copilot' && <span className="ai-tag">AI</span>}</a>)}</nav>
      <div className="sidebar-bottom"><div className="owner-note"><ShieldCheck size={19}/><div><strong>You stay in control.</strong><p>AI prepares. You decide.</p></div></div><div className="store-switch"><span className="store-avatar"><Store size={20}/></span><div><strong>{state?.business.name || 'Your restaurant'}</strong><small><MapPin size={11}/> Kuala Lumpur · MYR</small></div></div><p className="sidebar-foot">Orbyte / SME readiness assistant</p></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="row gap"><button className="icon-btn mobile-menu" aria-label="Open navigation" onClick={() => setMenu(true)}><Menu size={21}/></button><span className="breadcrumb">Workspace <ChevronRight size={13}/> <strong>{current[1]}</strong></span></div><div className="row gap"><span className={`environment ${mode}`}><i/>{mode === 'demo' ? 'DEMO DATA' : 'LIVE + MERCHANT DATA'}</span><span className="owner-avatar">{(state?.business.owner || 'O').charAt(0)}</span></div></header>
      <main className="main-content"><div className="page-heading"><div><span className="eyebrow">{state ? dateLabel(state.target.date) : 'LOOKING ONE DAY AHEAD'}</span><h1>{current[1]}<span className="heading-dot">.</span></h1><p className="muted">{current[3]}</p></div><div className="row gap wrap">{mode === 'demo' && <button className="btn subtle" disabled={busy} onClick={() => { setDraftPlan(null); setDraftVersion(v => v + 1); run('/demo/reset', 'POST', {}); }}><RefreshCw size={15}/>Reset demo</button>}<button className="icon-btn" aria-label="Refresh saved records" disabled={busy} onClick={refresh}><RefreshCw size={17} className={busy ? 'spin' : ''}/></button></div></div>
      {mode === 'demo' && <div className="demo-strip"><span className="source-tag demo">DEMO SCENARIO</span><span>Tomorrow's rain, full indoor bookings and front-door closure are simulated. Live data stays separate.</span></div>}
      {state && state.target.date !== state.tomorrow && <div className="warning-box">The saved service date is no longer tomorrow. <a href="#profile">Update your service window</a> before approving actions.</div>}
      {error && <div className="error-banner" role="alert"><span>{error}</span><button className="icon-btn" aria-label="Dismiss error" onClick={() => setError('')}><X size={16}/></button></div>}
      {!state ? <div className="loading-state"><Sparkles size={36}/><h3>{error ? 'Let’s reconnect your workspace.' : 'Preparing your workspace…'}</h3><p className="muted">{error ? 'Check that the Flask backend is running on port 5000.' : 'Loading saved conditions and tomorrow’s checks.'}</p>{error && <button className="btn primary" onClick={refresh}>Retry connection</button>}</div> : <>
      {tab === 'overview' && <Overview state={state} onQuestion={question} onDraft={draft}/>}
      {tab === 'events' && <Events key={mode} state={state} busy={busy} run={run}/>}
      {tab === 'plans' && <Plans key={mode} state={state} mode={mode} onQuestion={question} onDraft={draft}/>}
      {tab === 'confirmations' && <Confirmations state={state} busy={busy} run={run}/>}
      {tab === 'actions' && <Actions key={`${mode}-${draftVersion}`} state={state} busy={busy} run={run} draftPlan={draftPlan}/>}
      {tab === 'profile' && <Profile key={`${mode}-${draftVersion}`} state={state} busy={busy} run={run}/>}
      {tab === 'copilot' && <Copilot key={`${mode}-${draftVersion}`} state={state} mode={mode} refresh={refresh}/>}
      </>}
      <footer className="main-footer"><span>Good decisions start with clear conditions.</span><span>Times in MYT · Amounts in RM</span></footer>
      </main>{notice && <div className="toast" role="status"><ShieldCheck size={17}/>{notice}</div>}
    </div>
  </div>;
}

export default function App() {
  const token = window.location.pathname.match(/^\/feedback\/([a-zA-Z0-9_-]+)\/?$/)?.[1];
  return token ? <PublicFeedback token={token}/> : <Workspace/>;
}
