/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  useStatsQuery, useListWorkersQuery, useGetWorkerQuery, useDecideWorkerMutation, useRunVerificationMutation,
} from '../store/api';
import { Layout } from '../components/Layout';
import { Card, Button, StatusBadge, TrustMeter, Skeleton, Alert } from '../components/ui';
import { DocumentViewer } from '../components/DocumentViewer';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useStatsQuery();
  const { data: workersData, isLoading: workersLoading } = useListWorkersQuery();
  const [selId, setSelId] = useState<string | null>(null);
  const { data: detail, isFetching: detailLoading } = useGetWorkerQuery(selId as string, { skip: !selId });
  const [decide, decideState] = useDecideWorkerMutation();
  const [runVerification, verify] = useRunVerificationMutation();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const workers = workersData?.workers || [];

  const act = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selId) return;
    setMsg(null);
    try {
      await decide({ id: selId, decision, reason: `Manual ${decision}` }).unwrap();
      setMsg({ type: 'success', text: `Worker ${decision.toLowerCase()}.` });
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
                    onClick={() => { setSelId(w._id); setMsg(null); }}
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
              <Button onClick={reverify} loading={verify.isLoading} className="w-full bg-slate-600 hover:bg-slate-700">
                {verify.isLoading ? 'Running verification…' : 'Run verification'}
              </Button>

              <div className="flex gap-2">
                <Button onClick={() => act('APPROVED')} loading={decideState.isLoading} className="flex-1 bg-green-600 hover:bg-green-700">Approve</Button>
                <Button onClick={() => act('REJECTED')} loading={decideState.isLoading} className="flex-1 bg-red-600 hover:bg-red-700">Reject</Button>
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
    </Layout>
  );
}