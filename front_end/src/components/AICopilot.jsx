import React, { useState } from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

export default function AICopilot({ weather, incident }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Orbyte AI Copilot. Ask me how today’s weather or road status impacts your inventory!' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      let botReply = "Everything looks stable for your SME operations today!";
      const query = userMsg.toLowerCase();

      if (query.includes('weather') || query.includes('rain') || query.includes('storm')) {
        botReply = weather === 'clear'
          ? "Weather is clear and optimal for normal business flow."
          : `Current weather alert is active (${weather}). Foot traffic is predicted to drop significantly. Prep targets reduced up to 35%.`;
      } else if (query.includes('accident') || query.includes('traffic')) {
        botReply = incident === 'none'
          ? "No major road accidents reported near your store."
          : "A nearby road incident is causing traffic delays. Delivery times might be extended.";
      } else if (query.includes('waste') || query.includes('save')) {
        botReply = "Following AI recommendations helps prevent overstock and saves up to ~$5,200 monthly!";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 text-slate-100">
      <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-cyan-400" />
        AI Copilot & Operations Advisor
      </h3>
      <p className="text-xs text-slate-400 mb-4">Direct conversational assistant for real-time risk mitigation.</p>

      <div className="h-72 overflow-y-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-4 space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${m.sender === 'user' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400 border border-slate-700'}`}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${m.sender === 'user' ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask AI about traffic, weather impact, or stock..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 transition">
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
}