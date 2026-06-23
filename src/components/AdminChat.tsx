/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useAdminChatMutation } from '../store/api';
import { Spinner } from './ui';

interface ChatMsg { role: 'user' | 'assistant'; content: string; }

export function AdminChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [chat, { isLoading }] = useAdminChatMutation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    try {
      const res = await chat({ message: text, history: next.slice(-10) }).unwrap();
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', content: e?.data?.error || 'Something went wrong.' }]);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 bg-brand text-white rounded-full h-14 w-14 shadow-lg flex items-center justify-center text-2xl hover:bg-brand-dark transition-colors"
        aria-label="Ask AI assistant"
      >
        {open ? '×' : '💬'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 sm:w-96 h-[28rem] bg-white rounded-xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
          <div className="bg-brand text-white px-4 py-3 font-semibold text-sm">
            🤖 Ask about workers &amp; stats
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 text-sm">
            {messages.length === 0 && (
              <p className="text-slate-400 text-xs">
                Try: "How many workers are verified?" or "Tell me about worker 01900000000."
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-500 rounded-lg px-3 py-2">
                  <Spinner className="h-4 w-4" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 p-3 border-t border-slate-200">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder="Ask about a worker or stats…"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
              onClick={send}
              disabled={isLoading || !input.trim()}
              aria-label="Send"
              className="bg-brand text-white rounded-lg px-3 disabled:opacity-50 hover:bg-brand-dark transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
