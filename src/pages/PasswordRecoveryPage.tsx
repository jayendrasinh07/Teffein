import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, LockKeyhole } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

export const PasswordRecoveryPage: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    if (password.length < 8) {
      setErrorMessage('Use at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await authService.updatePassword(password);
    setLoading(false);
    if (error) {
      setErrorMessage(error.message || 'This reset link is invalid or expired. Request a new one.');
      return;
    }
    setComplete(true);
    showToast('Password Updated', 'Your new password is active.', 'success');
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-[#0D6E44]">
          {complete ? <CheckCircle2 className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
        </div>
        <h1 className="mt-4 text-center text-2xl font-black text-stone-900">
          {complete ? 'Password updated' : 'Create a new password'}
        </h1>
        <p className="mt-2 text-center text-sm text-stone-600">
          {complete ? 'You can now return to the Kitchen workspace.' : 'Choose a secure password for your TEFFEIN account.'}
        </p>

        {complete ? (
          <button
            type="button"
            onClick={() => setActiveTab('kitchen_dashboard')}
            className="mt-6 w-full rounded-2xl bg-[#0D6E44] px-5 py-3 text-sm font-black text-white hover:bg-[#08482C]"
          >
            Open Kitchen
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {errorMessage && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}
            <label className="block text-xs font-bold text-stone-700">
              New password
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#0D6E44]"
              />
            </label>
            <label className="block text-xs font-bold text-stone-700">
              Confirm new password
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#0D6E44]"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0D6E44] px-5 py-3 text-sm font-black text-white hover:bg-[#08482C] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kitchen_dashboard')}
              className="w-full text-xs font-bold text-stone-500 hover:text-stone-800"
            >
              Back to Kitchen sign in
            </button>
          </form>
        )}
      </section>
    </main>
  );
};
