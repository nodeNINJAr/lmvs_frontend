import { useState } from 'react';
import { Button, StatusBadge } from './ui';

interface Doc {
  _id: string;
  docType: string;
  url: string;
  issuer?: string;
  certificateNo?: string;
  sourceLink?: string | null;
  sourceVerified?: boolean;
}

export function DocumentViewer({
  documents,
  startIndex = 0,
  onClose,
}: {
  documents: Doc[];
  startIndex?: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(startIndex);
  if (documents.length === 0) return null;

  const doc = documents[i];
  const prev = () => setI((n) => Math.max(0, n - 1));
  const next = () => setI((n) => Math.min(documents.length - 1, n + 1));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-semibold">
            {doc.docType.replace(/_/g, ' ')}
            <span className="text-slate-400 font-normal text-sm ml-2">{i + 1} / {documents.length}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        {/* image */}
        <div className="bg-slate-100 flex items-center justify-center p-4">
          <img src={doc.url} alt={doc.docType} className="max-h-[55vh] object-contain rounded" />
        </div>

        {/* details */}
        <div className="px-5 py-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-slate-500">Source verified</span>
            <span>{doc.sourceVerified ? <StatusBadge status="VERIFIED" /> : <span className="text-slate-400">No</span>}</span>
          </div>
          {doc.issuer && <div className="flex justify-between"><span className="text-slate-500">Issuer</span><span>{doc.issuer}</span></div>}
          {doc.certificateNo && <div className="flex justify-between"><span className="text-slate-500">Certificate No</span><span>{doc.certificateNo}</span></div>}
          <div className="flex justify-between">
            <span className="text-slate-500">Links</span>
            <span className="flex gap-3">
              <a href={doc.url} target="_blank" className="text-brand underline">file ↗</a>
              {doc.sourceLink && <a href={doc.sourceLink} target="_blank" className="text-green-600 underline">source ↗</a>}
            </span>
          </div>
        </div>

        {/* nav */}
        <div className="flex items-center justify-between px-5 py-3 border-t">
          <Button onClick={prev} disabled={i === 0} className="bg-slate-200 text-slate-700 hover:bg-slate-300">← Prev</Button>
          <Button onClick={next} disabled={i === documents.length - 1}>Next →</Button>
        </div>
      </div>
    </div>
  );
}