/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  useStatsQuery, useListWorkersQuery, useGetWorkerQuery, useDecideWorkerMutation, useRunVerificationMutation,
} from '../store/api';
import { Layout } from '../components/Layout';
import { Card, Button, StatusBadge, TrustMeter, Skeleton, Alert, VerificationNotes, VerificationProgress } from '../components/ui';
import { DocumentViewer } from '../components/DocumentViewer';
import { AdminChat } from '../components/AdminChat';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useStatsQuery();
  const { data: workersData, isLoading: workersLoading, isError: workersError } = useListWorkersQuery();
  const [selId, setSelId] = useState<string | null>(null);
  const { data: detail, isFetching: detailLoading, isError: detailError } = useGetWorkerQuery(selId as string, { skip: !selId });
  const [decide, decideState] = useDecideWorkerMutation();
  const [runVerification, verify] = useRunVerificationMutation();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [reason, setReason] = useState('');

  const workers = workersData?.workers || [];

  const act = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selId) return;
    setMsg(null);
    try {
      await decide({ id: selId, decision, reason: reason.trim() || undefined }).unwrap();
      setMsg({ type: 'success', text: `Worker ${decision.toLowerCase()}.` });
      setReason('');
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.data?.error || 'Decision failed' });
    }
  };

  const reverify = async () => {
    if (!selId) return;
    setMsg(null);
    try {
      await runVerification(selId).unwrap();
      setMsg({ type: 'success', text: 'Verification re-run complete.' });
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.data?.error || 'Verification failed' });
    }
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4 text-slate-800">Admin Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><Skeleton className="h-7 w-12 mb-2" /><Skeleton className="h-3 w-16" /></Card>
            ))
          : stats && [['Workers', stats.totalWorkers], ['Verified', stats.verified], ['Review', stats.underReview], ['Rejected', stats.rejected], ['QR issued', stats.qrIssued]].map(([k, v]) => (
              <Card key={k as string}><div className="text-2xl font-bold text-slate-800">{v as number}</div><div className="text-xs text-slate-500">{k as string}</div></Card>
            ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="All workers">
          {workersError && <Alert type="error">Failed to load workers. Try refreshing the page.</Alert>}
          {workersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b"><tr><th className="py-1">Name</th><th>Status</th><th>Trust</th><th>QR</th></tr></thead>
              <tbody>
                {workers.map((w: any) => (
                  <tr
                    key={w._id}
                    className={`border-b hover:bg-slate-50 cursor-pointer transition-colors ${selId === w._id ? 'bg-brand/5' : ''}`}
                    onClick={() => { setSelId(w._id); setMsg(null); setReason(''); }}
                  >
                    <td className="py-2">{w.fullName || w.phone}</td>
                    <td><StatusBadge status={w.profileStatus} /></td>
                    <td>{w.trustScore ?? '—'}</td>
                    <td>{w.qrSerial ? '🔗' : '—'}</td>
                  </tr>
                ))}
                {workers.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">No workers yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Review">
          {!selId && <p className="text-slate-400 text-sm">Select a worker.</p>}
          {selId && detailError && <Alert type="error">Failed to load worker details. Try again.</Alert>}
          {selId && detailLoading && !detail && (
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {detail && (
            <div className="text-sm space-y-3">
              {msg && <Alert type={msg.type} onDismiss={() => setMsg(null)}>{msg.text}</Alert>}

              <div className="font-semibold text-base">{detail.worker.fullName}</div>
              <div className="flex items-center gap-3">
                <StatusBadge status={detail.worker.profileStatus} />
                <TrustMeter score={detail.worker.trustScore} />
              </div>
              <dl className="grid grid-cols-2 gap-y-1">
                <dt className="text-slate-500">Phone</dt><dd>{detail.worker.phone}</dd>
                <dt className="text-slate-500">Date of birth</dt><dd>{detail.worker.dateOfBirth || '—'}</dd>
                <dt className="text-slate-500">NID</dt><dd>{detail.worker.nidNumber || '—'}</dd>
                <dt className="text-slate-500">Passport</dt><dd>{detail.worker.passportNumber || '—'}</dd>
                <dt className="text-slate-500">Occupation</dt><dd>{detail.worker.occupation || '—'}</dd>
                <dt className="text-slate-500">Destination</dt><dd>{detail.worker.countryOfEmployment || '—'}</dd>
              </dl>
              <div>
                <div className="text-slate-500 mb-1">Documents</div>
                <div className="rounded-lg border divide-y">
                  {detail.documents.map((d: any, idx: number) => (
                    <div
                      key={d._id}
                      className="flex justify-between px-2 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setViewerIndex(idx)}
                    >
                      <span>{d.docType?.replace(/_/g, ' ')}</span>
                      {d.sourceVerified ? <span className="text-green-600 text-xs">✓ verified</span> : <span className="text-slate-400 text-xs">view</span>}
                    </div>
                  ))}
                  {detail.documents.length === 0 && <div className="px-2 py-3 text-center text-slate-400">No documents.</div>}
                </div>
              </div>
              {detail.verifications?.[0] && (
                <div className="rounded-lg border bg-slate-50 px-3 py-2 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-600">Latest verification:</span>
                    <StatusBadge status={detail.verifications[0].status} />
                    <span className="text-slate-400">
                      {detail.verifications[0].analyzer === 'admin' ? '👤 admin' : `🤖 ${detail.verifications[0].analyzer || 'openai'}`}
                    </span>
                  </div>
                  <VerificationNotes notes={detail.verifications[0].notes} analyzer={detail.verifications[0].analyzer} />
                </div>
              )}

              {detail.qr && (
                <div className="rounded-lg border px-3 py-3 text-center">
                  <div className="text-slate-500 text-xs mb-2">QR credential (issued)</div>
                  <img src={detail.qr.qrDataUrl} alt="QR" className="mx-auto w-32 h-32 rounded border" />
                  <p className="font-mono text-xs mt-2">{detail.qr.serial}</p>
                  <a href={detail.qr.verifyUrl} target="_blank" className="text-brand text-xs underline break-all">{detail.qr.verifyUrl}</a>
                </div>
              )}

              <Button onClick={reverify} loading={verify.isLoading} className="w-full bg-slate-600 hover:bg-slate-700">
                {verify.isLoading ? 'Running verification…' : 'Run verification'}
              </Button>
              {verify.isLoading && <VerificationProgress />}

              <div>
                <label className="block text-xs text-slate-500 mb-1">Reason (optional — overrides AI, shown to the worker)</label>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Documents confirmed valid on manual review"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => act('APPROVED')}
                  loading={decideState.isLoading}
                  disabled={detail.worker.profileStatus === 'VERIFIED'}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {detail.worker.profileStatus === 'VERIFIED' ? 'Approved' : 'Approve'}
                </Button>
                <Button
                  onClick={() => act('REJECTED')}
                  loading={decideState.isLoading}
                  disabled={detail.worker.profileStatus === 'REJECTED'}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {detail.worker.profileStatus === 'REJECTED' ? 'Rejected' : 'Reject'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {viewerIndex !== null && detail && (
        <DocumentViewer
          documents={detail.documents}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      <AdminChat />
    </Layout>
  );
}