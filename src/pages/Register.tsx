/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../store/api';
import { useAppDispatch } from '../store';
import { setCredentials } from '../store/authSlice';
import { Layout } from '../components/Layout';
import { Card, Button, Input, Alert, FilePicker } from '../components/ui';

const PROFILE_FIELDS = [
  ['fullName', 'Full name'],
  ['dateOfBirth', 'Date of birth (YYYY-MM-DD)'],
  ['nidNumber', 'NID number'],
  ['passportNumber', 'Passport number'],
  ['phone', 'Phone'],
  ['address', 'Address'],
  ['emergencyContact', 'Emergency contact'],
  ['occupation', 'Occupation'],
  ['countryOfEmployment', 'Country of employment'],
  ['password', 'Password'],
];

const DOC_TYPES = ['NID', 'PASSPORT', 'SKILL_CERTIFICATE', 'TRAINING_CERTIFICATE', 'EXPERIENCE_CERTIFICATE', 'PHOTO'];

interface DocRow { file: File | null; docType: string; }

export default function Register() {
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({
    fullName: 'Mehedi Hassan', dateOfBirth: '2000-01-01', nidNumber: '1234567890',
    passportNumber: 'BR1234567', phone: '01912345678', address: 'Mohakhali, Dhaka',
    emergencyContact: '01911111111', occupation: 'Electrician', countryOfEmployment: 'Saudi Arabia', password: 'pass123',
  });
  const [docs, setDocs] = useState<DocRow[]>([{ file: null, docType: 'NID' }]);
  const [err, setErr] = useState('');

  const addRow = () => setDocs([...docs, { file: null, docType: 'PHOTO' }]);
  const setRow = (i: number, patch: Partial<DocRow>) =>
    setDocs(docs.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const removeRow = (i: number) => setDocs(docs.filter((_, idx) => idx !== i));

  const submit = async () => {
    setErr('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    docs.forEach((d) => {
      if (d.file) {
        fd.append('files', d.file);
        fd.append('docTypes', d.docType);
      }
    });
    try {
      const res = await register(fd).unwrap();
      dispatch(setCredentials({ token: res.token, user: res.user }));
      nav('/worker');
    } catch (e: any) {
      setErr(e?.data?.error || 'Registration failed');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-4">
        <Card title="Worker Registration">
          <div className="grid grid-cols-2 gap-3">
            {PROFILE_FIELDS.map(([key, label]) => (
              <Input
                key={key}
                label={label}
                type={key === 'password' ? 'password' : 'text'}
                value={form[key] || ''}
                onChange={(e: any) => setForm({ ...form, [key]: e.target.value })}
              />
            ))}
          </div>
        </Card>

        <Card title="Documents (uploaded to Cloudinary)" right={<button onClick={addRow} className="text-sm text-brand font-medium hover:underline">+ Add document</button>}>
          <div className="space-y-3">
            {docs.map((d, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={d.docType}
                    onChange={(e) => setRow(i, { docType: e.target.value })}
                    className="flex-1 border border-slate-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    {DOC_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                  {docs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-slate-400 hover:text-red-600 text-lg leading-none px-1"
                      aria-label="Remove row"
                    >
                      ×
                    </button>
                  )}
                </div>
                <FilePicker file={d.file} onChange={(f) => setRow(i, { file: f })} />
              </div>
            ))}
          </div>
        </Card>

        {err && <Alert type="error" onDismiss={() => setErr('')}>{err}</Alert>}
        <Button onClick={submit} loading={isLoading} className="w-full">
          {isLoading ? 'Registering…' : 'Register & continue'}
        </Button>
      </div>
    </Layout>
  );
}