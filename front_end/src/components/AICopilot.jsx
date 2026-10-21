import React, { useState } from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

export default function AICopilot({ weather, incident }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Orbyte AI Business Assistant. Ask me how today’s weather or accidents affect your stock!' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    const newMessages = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      let botReply = "Everything looks stable for your SME operations today!";
      const query = userMsg.toLowerCase();
      
      if (query.includes('weather') || query.includes('rain') || query.includes('storm')) {
        botReply = weather === 'clear' 
          ? "Weather is clear and optimal for normal business flow." 
          : `Current weather alert is active (${weather}). Foot traffic is predicted to drop significantly. I've reduced raw ingredient prep by up to 35%.`;
      } else if (query.includes('accident') || query.includes('traffic') || query.includes('road')) {
        botReply = incident === 'none' 
          ? "No major road accidents reported near your store." 
          : "A nearby road incident is causing traffic delays. Delivery times might be extended by 20 minutes.";
      } else if (query.includes('waste') || query.includes('save')) {
        botReply = "By following today's AI adjustment recommendations, you are saving approximately $482.50 in perishable inventory waste!";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-600" />
        Orbyte AI Copilot & Business Advisor
      </h3>
      <p className="text-xs text-slate-500 mb-4">Chat with your AI advisor regarding risk mitigation and real-time operations.</p>

      <div className="h-64 overflow-y-auto p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input 
          type="text" 
          placeholder="Ask AI about weather, traffic, or inventory savings..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition">
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
}