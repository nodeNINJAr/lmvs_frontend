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
      <div className="flex items-center gap-3 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
        {preview ? (
          <img src={preview} alt={file.name} className="h-10 w-10 rounded object-cover border" />
        ) : (
          <div className="h-10 w-10 rounded bg-slate-200 flex items-center justify-center text-slate-500 text-lg">📄</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-700 truncate">{file.name}</div>
          <div className="text-xs text-slate-400">{formatBytes(file.size)}</div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-slate-400 hover:text-red-600 text-lg leading-none px-1"
          aria-label="Remove file"
        >
          ×
        </button>
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