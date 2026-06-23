/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import { useVerifyByTokenQuery } from '../store/api';
import { StatusBadge, TrustMeter, Spinner, Alert, VerificationNotes } from '../components/ui';

export default function VerifyPortal() {
  const { token } = useParams();
  const { data, isLoading, isError, error } = useVerifyByTokenQuery(token as string, { skip: !token });

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-brand-dark text-white px-4 py-3 text-center font-semibold shadow-md">
        🇧🇩 Immigration Verification Portal
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-slate-400 py-16">
            <Spinner className="h-5 w-5" /> Loading credential…
          </div>
        )}
        {isError && (
          <div className="py-10">
            <Alert type="error">{(error as any)?.data?.error || 'Invalid or revoked credential'}</Alert>
          </div>
        )}
        {data && <Profile data={data} />}
      </main>
    </div>
  );
}

function Profile({ data }: { data: any }) {
  const { worker, documents, verification, credential } = data;
  const v = verification || {};
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="bg-brand text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-xl shrink-0" aria-hidden="true">
            🇧🇩
          </div>
          <div>
            <div className="text-xs uppercase opacity-80 font-semibold tracking-wide">LMVS · Verified Migrant Worker</div>
            <div className="font-mono">{credential.serial}</div>
          </div>
        </div>
        <StatusBadge status={v.status} />
      </div>

      <div className="p-5 grid md:grid-cols-2 gap-5">
        <section>
          <h3 className="font-semibold mb-2">Worker information</h3>
          <dl className="text-sm grid grid-cols-2 gap-y-1">
            <dt className="text-slate-500">Name</dt><dd>{worker.fullName}</dd>
            <dt className="text-slate-500">Date of birth</dt><dd>{worker.dateOfBirth}</dd>
            <dt className="text-slate-500">NID</dt><dd>{worker.nidNumber}</dd>
            <dt className="text-slate-500">Passport</dt><dd>{worker.passportNumber}</dd>
            <dt className="text-slate-500">Occupation</dt><dd>{worker.occupation}</dd>
            <dt className="text-slate-500">Destination</dt><dd>{worker.countryOfEmployment}</dd>
          </dl>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Trust assessment</h3>
          <div className="space-y-2 text-sm">
            <TrustMeter score={v.trustScore} />
            <div className="flex items-center gap-2">
              <span>Status:</span> <StatusBadge status={v.status} />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.analyzer === 'admin' ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-500'}`}>
                {v.analyzer === 'admin' ? '👤 verified by admin' : `🤖 ${v.analyzer || 'openai'}`}
              </span>
            </div>
            <div>Verified at: {v.verifiedAt ? new Date(v.verifiedAt).toLocaleString() : '—'}</div>
            <VerificationNotes notes={v.notes} analyzer={v.analyzer} />
          </div>
        </section>

        <section className="md:col-span-2">
          <h3 className="font-semibold mb-2">Documents & sources</h3>
          <div className="space-y-1 text-sm">
            {documents.map((d: any) => (
              <div key={d._id} className="flex items-center justify-between border-b py-2">
                <span className="font-medium">{d.docType?.replace(/_/g, ' ')}</span>
                <span className="flex items-center gap-3">
                  <a href={d.url} target="_blank" className="text-slate-500 underline text-xs">file ↗</a>
                  {d.sourceLink
                    ? <a href={d.sourceLink} target="_blank" className="text-green-600 underline text-xs">source verified ↗</a>
                    : <span className="text-slate-400 text-xs">no source</span>}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}