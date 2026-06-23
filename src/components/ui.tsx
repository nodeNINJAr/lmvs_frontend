/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';

export function Card({ title, children, right }: { title?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5">
      {(title || right) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="font-semibold text-slate-700">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function Button({ children, className = '', loading = false, disabled, ...rest }: any) {
  return (
    <button
      disabled={disabled || loading}
      {...rest}
      className={`inline-flex items-center justify-center gap-2 bg-brand text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors hover:bg-brand-dark active:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function Input({ label, ...rest }: any) {
  return (
    <div>
      {label && <label className="block text-sm mb-1 text-slate-600">{label}</label>}
      <input
        {...rest}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none transition-shadow focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`animate-spin h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePicker({
  file,
  onChange,
  accept = 'image/*',
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  accept?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const preview = useMemo(
    () => (file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  if (file) {
    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
        <div className="relative bg-slate-100 flex items-center justify-center h-40">
          {preview ? (
            <img src={preview} alt={file.name} className="h-full w-full object-contain" />
          ) : (
            <span className="text-4xl text-slate-400">📄</span>
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white text-slate-500 hover:text-red-600 rounded-full h-6 w-6 flex items-center justify-center shadow text-lg leading-none"
            aria-label="Remove file"
          >
            ×
          </button>
        </div>
        <div className="px-3 py-2 text-sm">
          <div className="font-medium text-slate-700 truncate">{file.name}</div>
          <div className="text-xs text-slate-400">{formatBytes(file.size)}</div>
        </div>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f && f.type.startsWith('image/')) onChange(f);
      }}
      className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg px-3 py-4 text-center cursor-pointer transition-colors ${
        dragOver ? 'border-brand bg-brand/5' : 'border-slate-300 hover:border-brand hover:bg-slate-50'
      }`}
    >
      <span className="text-2xl">🖼️</span>
      <span className="text-sm text-slate-600">
        <span className="text-brand font-medium">Click to upload</span> or drag and drop
      </span>
      <span className="text-xs text-slate-400">PNG, JPG up to 10MB</span>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          onChange(f && f.type.startsWith('image/') ? f : null);
        }}
      />
    </label>
  );
}

const ALERT_STYLES: Record<string, string> = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  info: 'bg-amber-50 border-amber-200 text-amber-800',
};

const ALERT_ICONS: Record<string, string> = { error: '⚠', success: '✓', info: 'ℹ' };

export function Alert({ type = 'info', children, onDismiss }: { type?: 'error' | 'success' | 'info'; children: ReactNode; onDismiss?: () => void }) {
  return (
    <div className={`flex items-start gap-2 text-sm border rounded-lg px-3 py-2 ${ALERT_STYLES[type]}`}>
      <span>{ALERT_ICONS[type]}</span>
      <span className="flex-1">{children}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 leading-none">×</button>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  const map: Record<string, string> = {
    VERIFIED: 'bg-green-100 text-green-700',
    SUBMITTED: 'bg-slate-100 text-slate-600',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    REVIEW_REQUIRED: 'bg-amber-100 text-amber-700',
    REJECTED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status || ''] || 'bg-slate-100 text-slate-500'}`}>
      {status || '—'}
    </span>
  );
}

export function TrustMeter({ score }: { score?: number | null }) {
  const s = score ?? 0;
  const color = s >= 85 ? 'bg-green-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${s}%` }} />
      </div>
      <span className="text-sm font-semibold">{score == null ? '—' : `${s}%`}</span>
    </div>
  );
}

/** Splits a "|"-joined notes string into trimmed, deduplicated phrases (defends against
 * already-corrupted/repeated data even if the backend hasn't been redeployed yet). */
function splitPhrases(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split('|')) {
    const phrase = raw.trim();
    if (!phrase || seen.has(phrase)) continue;
    seen.add(phrase);
    out.push(phrase);
  }
  return out;
}

/** Renders verification notes point-by-point, highlighting the AI-authored portion in light yellow. */
export function VerificationNotes({ notes, analyzer }: { notes?: string | null; analyzer?: string | null }) {
  if (!notes) return null;

  if (analyzer !== 'admin') {
    const points = splitPhrases(notes);
    return (
      <ul className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 rounded px-3 py-2 space-y-0.5 list-disc list-inside">
        {points.map((p) => <li key={p}>{p}</li>)}
      </ul>
    );
  }

  const idx = notes.indexOf('AI findings:');
  if (idx === -1) return <p className="text-xs text-slate-500">{notes}</p>;

  const before = notes.slice(0, idx).replace(/\|\s*$/, '').trim();
  const points = splitPhrases(notes.slice(idx).replace(/^AI findings:\s*/, ''));

  return (
    <div className="text-xs space-y-1">
      {before && <p className="text-slate-500">{before}</p>}
      {points.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded px-3 py-2">
          <p className="font-medium mb-1">AI findings</p>
          <ul className="space-y-0.5 list-disc list-inside">
            {points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

const AI_STEPS = [
  '📄 Reading uploaded documents…',
  '🔎 Extracting fields with AI vision…',
  '🌐 Cross-checking official sources…',
  '🧮 Scoring confidence & trust…',
  '📡 Finalizing decision…',
];

/** Simulated step-by-step progress while a verification request is in flight (the backend
 * returns one final result, not a stream, so this approximates pacing rather than reporting
 * real server-side progress). Mount this conditionally from the caller (e.g. `{loading && <VerificationProgress />}`)
 * so it starts fresh at step 0 each run. */
export function VerificationProgress() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, AI_STEPS.length - 1));
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-1.5 text-xs text-slate-600 mt-3">
      {AI_STEPS.map((label, i) => (
        <div key={label} className={`flex items-center gap-2 transition-opacity ${i > step ? 'opacity-40' : ''}`}>
          {i < step ? (
            <span className="text-green-600">✓</span>
          ) : i === step ? (
            <Spinner className="h-3 w-3 text-brand" />
          ) : (
            <span className="w-3 inline-block" />
          )}
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}