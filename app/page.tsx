'use client';

import { useEffect, useRef, useState } from 'react';

const quick = ['Morning briefing', 'Plan my day', 'Create a reminder', 'Search the web'];

type Routine = { name: string; time: string; enabled: boolean };

export default function Home() {
  const [listening, setListening] = useState(false);
  const [command, setCommand] = useState('');
  const [events, setEvents] = useState(['JARVIS online. Voice and command systems ready.']);
  const [routines, setRoutines] = useState<Routine[]>([
    { name: 'Morning briefing', time: '08:00', enabled: true },
    { name: 'Daily focus check', time: '09:30', enabled: true },
    { name: 'Evening shutdown', time: '22:00', enabled: false },
  ]);
  const recognition = useRef<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jarvis-routines');
      if (saved) setRoutines(JSON.parse(saved));
    } catch {}
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = 'en-IN'; r.interimResults = false; r.continuous = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onresult = (e: any) => { const text = e.results[0][0].transcript; setCommand(text); execute(text); };
    recognition.current = r;
  }, []);

  function say(text: string) {
    if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); }
  }

  function execute(value = command) {
    const text = value.trim(); if (!text) return;
    const q = text.toLowerCase();
    let reply = 'Command received. External tools can be connected to execute this action.';
    if (q.includes('briefing')) reply = 'Briefing mode ready. I can combine your schedule, priorities and fresh information.';
    else if (q.includes('plan')) reply = 'Planning mode activated. Priorities first, meetings second, chaos last.';
    else if (q.includes('reminder')) reply = 'Reminder intent detected. A time is needed before a real reminder can be scheduled.';
    else if (q.includes('search')) reply = 'Search intent detected. A web tool can be connected to perform the lookup.';
    setEvents(prev => [`You: ${text}`, `JARVIS: ${reply}`, ...prev].slice(0, 7));
    setCommand(''); say(reply);
  }

  function voice() {
    if (!recognition.current) { say('Voice recognition is unavailable in this browser.'); return; }
    if (listening) recognition.current.stop(); else recognition.current.start();
  }

  function toggleRoutine(index: number) {
    const next = routines.map((r, i) => i === index ? { ...r, enabled: !r.enabled } : r);
    setRoutines(next); localStorage.setItem('jarvis-routines', JSON.stringify(next));
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">J</span><div><strong>JARVIS</strong><small>PERSONAL AI AGENT</small></div></div>
        <div className="online"><i /> SYSTEM ONLINE</div>
      </header>

      <section className="hero">
        <div className={`orb-wrap ${listening ? 'listening' : ''}`} onClick={voice} role="button" tabIndex={0} aria-label="Start voice command">
          <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orb"><span>J</span></div>
        </div>
        <p className="eyebrow">{listening ? 'LISTENING' : 'READY FOR COMMAND'}</p>
        <h1>Your command center.</h1>
        <p className="sub">Speak naturally. JARVIS turns intent into actions, routines and useful answers.</p>
        <button className="voice" onClick={voice}><span className="mic">{listening ? '■' : '●'}</span>{listening ? 'Stop listening' : 'Start voice command'}</button>
      </section>

      <section className="command-card">
        <div className="input-row"><input aria-label="Command" value={command} onChange={e => setCommand(e.target.value)} onKeyDown={e => e.key === 'Enter' && execute()} placeholder="Tell JARVIS what to do..." /><button onClick={() => execute()}>RUN</button></div>
        <div className="chips">{quick.map(item => <button key={item} onClick={() => execute(item)}>{item}</button>)}</div>
      </section>

      <div className="grid">
        <section className="panel"><div className="panel-head"><div><span className="kicker">LIVE</span><h2>Activity</h2></div><button className="ghost" onClick={() => setEvents([])}>Clear</button></div><div className="feed">{events.length ? events.map((event, i) => <div className="event" key={`${event}-${i}`}><span className="dot"/><p>{event}</p><time>now</time></div>) : <p className="empty">No recent activity.</p>}</div></section>
        <section className="panel"><div className="panel-head"><div><span className="kicker">AUTOMATION</span><h2>Routines</h2></div><span className="count">{routines.filter(r => r.enabled).length} active</span></div><div className="routines">{routines.map((r, i) => <div className="routine" key={r.name}><div><strong>{r.name}</strong><span>Every day · {r.time}</span></div><button aria-label={`Toggle ${r.name}`} className={`switch ${r.enabled ? 'on' : ''}`} onClick={() => toggleRoutine(i)}><i/></button></div>)}</div></section>
      </div>
      <footer><span>JARVIS v1.0</span><span>Voice runs in-browser · External actions require connected tools</span></footer>
    </main>
  );
}
