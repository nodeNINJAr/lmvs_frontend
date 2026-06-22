/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  useMeQuery, useMyDocumentsQuery, useUploadDocumentsMutation, useRunVerificationMutation,
} from '../store/api';
import { Layout } from '../components/Layout';
import { Card, Button, StatusBadge, TrustMeter, Skeleton, Alert, FilePicker } from '../components/ui';

const DOC_TYPES = ['NID', 'PASSPORT', 'SKILL_CERTIFICATE', 'TRAINING_CERTIFICATE', 'EXPERIENCE_CERTIFICATE', 'PHOTO'];

export default function WorkerDashboard() {
  const { data: meData, isLoading: meLoading } = useMeQuery();
  const { data: docData, isLoading: docsLoading } = useMyDocumentsQuery();
  const [uploadDocuments, upload] = useUploadDocumentsMutation();
  const [runVerification, verify] = useRunVerificationMutation();

  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('NID');
  const [result, setResult] = useState<any>(null);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const me = meData?.user;
  const documents = docData?.documents || [];

  const doUpload = async () => {
    if (!file) return setMsg({ type: 'error', text: 'Choose a file' });
    setMsg(null);
    const fd = new FormData();
    fd.append('files', file);
    fd.append('docTypes', docType);
    try { await uploadDocuments(fd).unwrap(); setFile(null); setMsg({ type: 'success', text: 'Document uploaded.' }); }
    catch (e: any) { setMsg({ type: 'error', text: e?.data?.error || 'Upload failed' }); }
  };

  const doVerify = async () => {
    setMsg(null);
    try { const r = await runVerification().unwrap(); setResult(r); }
    catch (e: any) { setMsg({ type: 'error', text: e?.data?.error || 'Verification failed' }); }
  };

  const qr = result?.qr;

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

          {docsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="rounded-lg border divide-y">
              {documents.map((d: any) => (
                <div key={d._id} className="flex items-center gap-3 px-3 py-2">
                  <span className="text-lg">📄</span>
                  <span className="flex-1 text-sm font-medium text-slate-700">{d.docType?.replace(/_/g, ' ')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.sourceVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {d.sourceVerified ? '✓ verified' : 'pending'}
                  </span>
                </div>
              ))}
              {documents.length === 0 && <div className="px-3 py-6 text-center text-sm text-slate-400">No documents yet.</div>}
            </div>
          )}
        </Card>

        <Card title="2 · AI verification">
          <Button onClick={doVerify} loading={verify.isLoading} className="w-full mb-3">
            {verify.isLoading ? 'Running AI checks…' : 'Run AI verification'}
          </Button>
          {result && (
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <StatusBadge status={result.status} />
                <span className="text-slate-500">{result.analyzer || 'openai'}</span>
              </div>
              <TrustMeter score={result.trustScore} />
            </div>
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
    </Layout>
  );
}