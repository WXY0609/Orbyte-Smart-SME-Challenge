import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, Plus, ArrowUpRight, Sparkles, User, MessageSquare } from 'lucide-react';
import { api, dateTime, windowLabel } from './lib';
import { Panel, Ref } from './ui';

const prompts = ['What could affect tomorrow afternoon?', 'Indoor seating is full. Can we switch to delivery?', 'What do we still need to confirm?', 'Draft a customer notice for rear-door pickup.', 'Which preparation tasks are still pending?'];

export default function Copilot({ state, mode, refresh }) {
  const [conversations, setConversations] = useState([]);
  const [current, setCurrent] = useState(null);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const end = useRef(null);
  const selected = conversations.find(c => c.id === current);
  useEffect(() => { api(mode, '/copilot/conversations').then(setConversations).catch(e => setError(e.message)); }, [mode]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [current, pending, conversations]);
  async function send(e, suggested) {
    e?.preventDefault(); const message = (suggested || input).trim();
    if (!message || pending) return;
    setPending(message); setInput(''); setError('');
    try {
      const result = await api(mode, '/copilot/chat', { method: 'POST', body: { conversation_id: current, message } });
      setCurrent(result.conversation_id);
      setConversations(await api(mode, '/copilot/conversations'));
    } catch (err) { setError(err.message); setInput(message); }
    finally { setPending(''); await refresh(); }
  }
  return <div className="copilot-layout"><aside className="conversation-list panel"><button className="btn primary" disabled={!!pending} onClick={() => { setCurrent(null); setError(''); }}><Plus size={16}/>New conversation</button><span className="eyebrow">SAVED CONVERSATIONS</span>{conversations.map(c => <button className={`conversation-item ${current === c.id ? 'selected' : ''}`} disabled={!!pending} key={c.id} onClick={() => setCurrent(c.id)}><MessageSquare size={15}/><span>{c.title}<small>{dateTime(c.created_at)}</small></span></button>)}{!conversations.length && <p className="muted small">Your conversations will be saved here.</p>}<div className="copilot-context"><span className="eyebrow">WORKING WITH</span><strong>{state.business.name}</strong><span className={`source-tag ${mode === 'demo' ? 'demo' : 'forecast'}`}>{mode === 'demo' ? 'Demo workspace' : 'Live workspace'}</span><p className="muted small">{windowLabel(state.target)}</p><p className="muted small">Facts are refreshed for each message. Actions always need your approval.</p></div></aside>
    <section className="chat-panel panel"><div className="chat-header"><span className="icon-tile cyan"><Bot size={23}/></span><div><h3>Orbyte AI Copilot</h3><p className="muted small">Understand the risk. Explore your options. Prepare the next step.</p></div><span className={`connection-pill ${state.copilot_configured ? 'online' : ''}`}><i/>{state.copilot_configured ? 'OpenRouter configured' : 'Setup required'}</span></div>
    {!state.copilot_configured && <div className="warning-box">{state.public_demo ? 'AI is not configured on this demo server. The website owner needs to configure OpenRouter in Render. Other workflows remain available.' : <>Real AI replies need a backend API key. Set <code>OPENROUTER_API_KEY</code> in <code>back_end/.env</code> and restart Flask. Other workflows remain available.</>}</div>}
    {state.ai_limits && <div className="warning-box">Shared free AI · Up to {state.ai_limits.per_network_daily} message attempts per network and {state.ai_limits.global_daily} across all visitors daily, resetting at midnight MYT. Provider errors also count. New chats and Reset demo do not restore this allowance.</div>}
    <div className="chat-messages" aria-live="polite">{!selected?.messages.length && !pending && <div className="chat-welcome"><div className="copilot-orb"><Sparkles size={36}/></div><span className="eyebrow cyan-text">YOUR TOMORROW, PUT IN CONTEXT</span><h2>Let's think a step ahead.</h2><p className="muted">Ask about risks, test an alternative, or turn a checked plan into an action draft.</p><div className="prompt-grid">{prompts.map(p => <button key={p} disabled={!!pending || !state.copilot_configured} onClick={() => send(null, p)}>{p}<ArrowUpRight size={15}/></button>)}</div></div>}
      {selected?.messages.map((m, i) => <div key={i} className={`chat-message ${m.role}`}><span className={`avatar ${m.role}`}>{m.role === 'user' ? <User size={17}/> : <Bot size={17}/>}</span><div><span className="message-name">{m.role === 'user' ? 'You' : 'Orbyte Copilot'}</span><div className="message-body">{m.content}</div>{m.citations?.length > 0 && <div className="ref-list">{m.citations.map((r, i) => <Ref key={i} item={r}/>)}</div>}{m.drafts?.length > 0 && <div className="draft-cards">{m.drafts.map((r, i) => <Ref key={i} item={r}/>)}</div>}{m.model && <small className="model-label muted">Via OpenRouter · {m.model}</small>}</div></div>)}
      {pending && <><div className="chat-message user"><span className="avatar user"><User size={17}/></span><div><span className="message-name">You</span><div className="message-body">{pending}</div></div></div><div className="chat-message assistant"><span className="avatar"><Bot size={17}/></span><div className="thinking"><span/><span/><span/>Checking the context and preparing a reply…</div></div></>}
      {error && <div className="error-banner" role="alert">{error}</div>}<div ref={end}/>
    </div><form onSubmit={send} className="chat-compose"><div><textarea aria-label="Message AI Copilot" rows={2} maxLength={4000} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(e); } }} placeholder="Ask about tomorrow, an alternative plan, or a preparation task…"/><button className="send-btn" aria-label="Send message" disabled={!!pending || !input.trim() || !state.copilot_configured}><Send size={19}/></button></div><p className="muted small">Checks cover known conditions. Review sources and approve exact actions before execution.</p></form>
  </section></div>;
}
