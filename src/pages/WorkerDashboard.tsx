/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  useMeQuery, useMyDocumentsQuery, useUploadDocumentsMutation, useDeleteDocumentMutation,
  useRunVerificationMutation, useMyVerificationQuery,
} from '../store/api';
import { Layout } from '../components/Layout';
import { Card, Button, StatusBadge, TrustMeter, Skeleton, Alert, FilePicker, Spinner, VerificationNotes, VerificationProgress, ProgressSteps } from '../components/ui';
import { toast } from '../lib/toast';
import { DocumentViewer } from '../components/DocumentViewer';
import { WorkerChat } from '../components/WorkerChat';

const DOC_TYPES = ['NID', 'PASSPORT', 'SKILL_CERTIFICATE', 'TRAINING_CERTIFICATE', 'EXPERIENCE_CERTIFICATE', 'PHOTO'];

export default function WorkerDashboard() {
  const { data: meData, isLoading: meLoading } = useMeQuery();
  const { data: docData, isLoading: docsLoading } = useMyDocumentsQuery();
  const { data: verifData, isLoading: verifLoading } = useMyVerificationQuery();
  const [uploadDocuments, upload] = useUploadDocumentsMutation();
  const [deleteDocument] = useDeleteDocumentMutation();
  const [runVerification, verify] = useRunVerificationMutation();

  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('NID');
  const [result, setResult] = useState<any>(null);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const me = meData?.user;
  const documents = docData?.documents || [];

  const doUpload = async () => {
    if (!file) return setMsg({ type: 'error', text: 'Choose a file' });
    setMsg(null);
    const fd = new FormData();
    fd.append('files', file);
    fd.append('docTypes', docType);
    try { await uploadDocuments(fd).unwrap(); setFile(null); toast('Document uploaded.'); }
    catch (e: any) { setMsg({ type: 'error', text: e?.data?.error || 'Upload failed' }); }
  };

  const doVerify = async () => {
    setMsg(null);
    try { const r = await runVerification().unwrap(); setResult(r); toast('Verification complete.'); }
    catch (e: any) { setMsg({ type: 'error', text: e?.data?.error || 'Verification failed' }); }
  };

  const doDelete = async (id: string) => {
    if (!window.confirm('Delete this document?')) return;
    setMsg(null);
    setDeletingId(id);
    try { await deleteDocument(id).unwrap(); toast('Document deleted.', 'info'); }
    catch (e: any) { setMsg({ type: 'error', text: e?.data?.error || 'Delete failed' }); }
    finally { setDeletingId(null); }
  };

  // Prefer the just-ran result (has live AI output); fall back to the persisted record on load/reload.
  const verification = result || verifData?.verification;
  const qr = result?.qr || verifData?.qr;
  const uploadedTypes = new Set(documents.map((d: any) => d.docType));
  const missingTypes = DOC_TYPES.filter((t) => !uploadedTypes.has(t));

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">Worker Dashboard</h1>
        <div className="flex items-center gap-3">
          {meLoading ? <Skeleton className="h-5 w-32" /> : (
            <>
              <StatusBadge status={me?.profileStatus} />
              <TrustMeter score={me?.trustScore} />
            </>
          )}
        </div>
      </div>

      {msg && <div className="mb-4"><Alert type={msg.type} onDismiss={() => setMsg(null)}>{msg.text}</Alert></div>}

      {!meLoading && (
        <Card className="mb-4">
          <ProgressSteps status={me?.profileStatus} />
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="1 · Upload document">
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm mb-1 text-slate-600">Document type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
                {DOC_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <FilePicker file={file} onChange={setFile} />
            <Button onClick={doUpload} loading={upload.isLoading} disabled={!file} className="w-full">
              {upload.isLoading ? 'Uploading…' : 'Upload document'}
            </Button>
          </div>

          {!docsLoading && (
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-500">{uploadedTypes.size} of {DOC_TYPES.length} document types uploaded</span>
              {missingTypes.length > 0 && (
                <span className="text-amber-600 font-medium">Missing: {missingTypes.map((t) => t.replace(/_/g, ' ')).join(', ')}</span>
              )}
            </div>
          )}

          {docsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="rounded-lg border divide-y">
              {documents.map((d: any, idx: number) => (
                <div
                  key={d._id}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setViewerIndex(idx)}
                >
                  <span className="text-lg">📄</span>
                  <span className="flex-1 text-sm font-medium text-slate-700">{d.docType?.replace(/_/g, ' ')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.sourceVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {d.sourceVerified ? '✓ verified' : 'pending'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); doDelete(d._id); }}
                    disabled={deletingId === d._id}
                    aria-label="Delete document"
                    className="text-slate-400 hover:text-red-600 disabled:opacity-50 leading-none px-1"
                  >
                    {deletingId === d._id ? <Spinner className="h-4 w-4" /> : '🗑'}
                  </button>
                </div>
              ))}
              {documents.length === 0 && <div className="px-3 py-6 text-center text-sm text-slate-400">No documents yet.</div>}
            </div>
          )}
        </Card>

        <Card title="2 · AI verification">
          <Button onClick={doVerify} loading={verify.isLoading} className="w-full mb-3">
            {verify.isLoading ? 'Running AI checks…' : verification ? 'Re-run AI verification' : 'Run AI verification'}
          </Button>
          {verify.isLoading && <VerificationProgress />}
          {verify.isLoading ? null : verifLoading && !verification ? (
            <Skeleton className="h-10 w-full" />
          ) : verification ? (
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <StatusBadge status={verification.status} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${verification.analyzer === 'admin' ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-500'}`}>
                  {verification.analyzer === 'admin' ? '👤 verified by admin' : `🤖 ${verification.analyzer || 'openai'}`}
                </span>
              </div>
              <TrustMeter score={verification.trustScore} />
              <VerificationNotes notes={verification.notes} analyzer={verification.analyzer} />
            </div>
          ) : (
            <p className="text-sm text-slate-400">No verification run yet.</p>
          )}
        </Card>

        {qr && (
          <Card title="3 · QR credential (auto-issued)">
            <div className="text-center">
              <img src={qr.qrDataUrl} alt="QR" className="mx-auto w-48 h-48 rounded-lg border" />
              <p className="font-mono text-sm mt-2">{qr.serial}</p>
              <a href={qr.verifyUrl} target="_blank" className="text-brand text-xs underline break-all">{qr.verifyUrl}</a>
            </div>
          </Card>
        )}

        <Card title="Profile">
          {meLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : (
            <dl className="text-sm grid grid-cols-2 gap-y-1">
              <dt className="text-slate-500">Name</dt><dd>{me?.fullName}</dd>
              <dt className="text-slate-500">NID</dt><dd>{me?.nidNumber}</dd>
              <dt className="text-slate-500">Passport</dt><dd>{me?.passportNumber}</dd>
              <dt className="text-slate-500">Occupation</dt><dd>{me?.occupation}</dd>
              <dt className="text-slate-500">Destination</dt><dd>{me?.countryOfEmployment}</dd>
            </dl>
          )}
        </Card>
      </div>

      {viewerIndex !== null && (
        <DocumentViewer
          documents={documents}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      <WorkerChat />
    </Layout>
  );
}