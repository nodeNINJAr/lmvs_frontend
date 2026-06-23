import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store';
import { useMeQuery } from './store/api';
import { setUser } from './store/authSlice';
import { ProtectedRoute } from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VerifyPortal from './pages/VerifyPortal';

function Home() {
  const { user } = useAppSelector((s) => s.auth);
  if (!user) return <Landing />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/worker'} replace />;
}

// Hydrate the logged-in user from the token on app load.
function AuthHydrator() {
  const { token } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const { data } = useMeQuery(undefined, { skip: !token });
  useEffect(() => {
    if (data?.user) dispatch(setUser(data.user));
  }, [data, dispatch]);
  return null;
}

export default function App() {
  return (
    <>
      <AuthHydrator />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/worker" element={<ProtectedRoute roles={['WORKER']}><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/verify/:token" element={<VerifyPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}