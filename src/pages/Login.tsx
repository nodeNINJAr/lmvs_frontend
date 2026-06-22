/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../store/api';
import { useAppDispatch } from '../store';
import { setCredentials } from '../store/authSlice';
import { Layout } from '../components/Layout';
import { Card, Button, Input, Alert } from '../components/ui';

export default function Login() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [phone, setPhone] = useState('01900000000');
  const [password, setPassword] = useState('worker123');
  const [err, setErr] = useState('');

  const submit = async () => {
    setErr('');
    try {
      const res = await login({ phone, password }).unwrap();
      dispatch(setCredentials({ token: res.token, user: res.user }));
      nav(res.user.role === 'ADMIN' ? '/admin' : '/worker');
    } catch (e: any) {
      setErr(e?.data?.error || 'Login failed');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8 space-y-4">
        <Card title="Sign in">
          <div className="space-y-3">
            <Input label="Phone" value={phone} onChange={(e: any) => setPhone(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />
            {err && <Alert type="error" onDismiss={() => setErr('')}>{err}</Alert>}
            <Button onClick={submit} loading={isLoading} className="w-full">
              {isLoading ? 'Signing in…' : 'Login'}
            </Button>
          </div>
        </Card>
        <Card title="Demo accounts">
          <div className="text-sm space-y-1 text-slate-600">
            <p>Worker: 01900000000 / worker123</p>
            <p>Admin: 01700000000 / admin123</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}