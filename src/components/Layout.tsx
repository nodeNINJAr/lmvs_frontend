import { type JSX, type ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-brand text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold tracking-tight">🇧🇩 LMVS</Link>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <span className="opacity-90 hidden sm:inline">{user.fullName || user.phone} · {user.role}</span>
                <button
                  onClick={() => { dispatch(logout()); nav('/login'); }}
                  className="bg-white/15 hover:bg-white/25 transition-colors px-3 py-1.5 rounded-lg font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">Login</Link>
                <Link to="/register" className="bg-white text-brand px-3 py-1.5 rounded-lg font-medium shadow-sm hover:shadow transition-shadow">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

export function ProtectedRoute({ roles, children }: { roles: string[]; children: JSX.Element }) {
  const { token, user } = useAppSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}