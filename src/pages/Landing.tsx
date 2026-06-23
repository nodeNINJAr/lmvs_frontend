/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { usePublicStatsQuery } from '../store/api';
import { Layout } from '../components/Layout';
import { Card, Skeleton } from '../components/ui';

const STEPS = [
  { icon: '📝', title: 'Register & upload', text: 'Submit your profile and identity documents — NID, passport, certificates.' },
  { icon: '🤖', title: 'AI verification', text: 'Documents are read, cross-checked against issuing sources, and scored for trust.' },
  { icon: '👤', title: 'Admin review', text: 'Borderline cases get a human review, with manual approval when needed.' },
  { icon: '📱', title: 'QR credential', text: 'Verified workers get a scannable QR ID employers and officials can check instantly.' },
];

const COUNTER_ICONS = ['👥', '✅', '📱'];

export default function Landing() {
  const { data: stats, isLoading } = usePublicStatsQuery();

  const counters = [
    ['Workers registered', stats?.totalWorkers ?? 0],
    ['Verified', stats?.verified ?? 0],
    ['QR credentials issued', stats?.qrIssued ?? 0],
  ];

  return (
    <Layout>
      <section className="relative text-center py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand/10 rounded-full blur-3xl -z-10" />
        <div className="text-5xl mb-4">🇧🇩</div>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-3 tracking-tight">
          Labor Migration Verification System
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto mb-6">
          AI-powered identity &amp; document verification for migrant workers — from registration to
          a scannable QR credential, trusted by employers and immigration officers.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="bg-brand text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-brand-dark hover:shadow-md transition-all"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Login
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 mb-16 max-w-2xl mx-auto">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-7 w-12 mx-auto mb-2" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </Card>
            ))
          : counters.map(([label, value], i) => (
              <Card key={label as string}>
                <div className="text-2xl mb-1 text-center">{COUNTER_ICONS[i]}</div>
                <div className="text-2xl font-bold text-slate-800 text-center">{value as number}</div>
                <div className="text-xs text-slate-500 text-center">{label as string}</div>
              </Card>
            ))}
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-center text-slate-800 mb-8">How it works</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 relative">
          <div className="hidden md:block absolute top-9 left-[12%] right-[12%] h-0.5 bg-slate-200 -z-0" />
          {STEPS.map((s, i) => (
            <Card key={s.title} className="relative">
              <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center text-2xl mb-3">{s.icon}</div>
              <div className="text-xs text-brand font-semibold mb-1">STEP {i + 1}</div>
              <div className="font-semibold text-slate-700 mb-1">{s.title}</div>
              <p className="text-sm text-slate-500">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}
