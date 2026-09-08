import React, { FormEvent, useEffect, useState } from 'react';
import { KeyRound, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupabaseClient } from '../../services/supabaseClient';

type GateState = 'loading' | 'enroll' | 'verify' | 'ready';

export const KitchenMfaGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { signOutUser } = useApp();
  const [state, setState] = useState<GateState>('loading');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const inspect = async () => {
      try {
        const client = getSupabaseClient();
        const assurance = await client.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assurance.error) throw assurance.error;
        if (assurance.data.currentLevel === 'aal2') {
          if (active) setState('ready');
          return;
        }
        const factors = await client.auth.mfa.listFactors();
        if (factors.error) throw factors.error;
        const verified = factors.data.totp[0];
        if (!active) return;
        if (verified) {
          setFactorId(verified.id);
          setState('verify');
        } else {
          setState('enroll');
        }
      } catch {
        if (active) {
          setError('Security check failed. Please sign out and try again.');
          setState('enroll');
        }
      }
    };
    void inspect();
    return () => { active = false; };
  }, []);

  const beginEnrollment = async () => {
    setBusy(true);
    setError('');
    try {
      const client = getSupabaseClient();
      const factors = await client.auth.mfa.listFactors();
      if (factors.error) throw factors.error;
      for (const factor of factors.data.all.filter(item => item.factor_type === 'totp' && item.status === 'unverified')) {
        const removal = await client.auth.mfa.unenroll({ factorId: factor.id });
        if (removal.error) throw removal.error;
      }
      const enrollment = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Thalimitra Kitchen' });
      if (enrollment.error) throw enrollment.error;
      setFactorId(enrollment.data.id);
      setQrCode(enrollment.data.totp.qr_code);
      setSecret(enrollment.data.totp.secret);
      setState('verify');
    } catch {
      setError('Authenticator setup could not start. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    if (!factorId || !/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const client = getSupabaseClient();
      const verification = await client.auth.mfa.challengeAndVerify({ factorId, code });
      if (verification.error) throw verification.error;
      const assurance = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assurance.error || assurance.data.currentLevel !== 'aal2') throw assurance.error ?? new Error('MFA incomplete');
      setQrCode('');
      setSecret('');
      setCode('');
      setState('ready');
    } catch {
      setError('That code was not accepted. Use the latest code and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'ready') return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
          {state === 'loading' ? <Loader2 className="h-7 w-7 animate-spin" /> : <ShieldCheck className="h-7 w-7" />}
        </div>
        <h1 className="mt-4 text-center text-2xl font-black text-stone-900">Kitchen security check</h1>
        {state === 'loading' ? (
          <p className="mt-2 text-center text-sm text-stone-600">Checking your secure session…</p>
        ) : qrCode ? (
          <>
            <p className="mt-2 text-center text-sm text-stone-600">Scan this QR code in Google Authenticator, then enter the current code.</p>
            <img src={qrCode} alt="Thalimitra Kitchen authenticator QR code" className="mx-auto mt-5 h-52 w-52 rounded-xl border border-stone-200 p-2" />
            <details className="mt-3 rounded-xl bg-stone-50 p-3 text-xs text-stone-600">
              <summary className="cursor-pointer font-bold">Cannot scan? Show setup key</summary>
              <code className="mt-2 block break-all select-all">{secret}</code>
            </details>
          </>
        ) : state === 'verify' ? (
          <p className="mt-2 text-center text-sm text-stone-600">Enter the current 6-digit code from your authenticator app.</p>
        ) : (
          <>
            <p className="mt-2 text-center text-sm text-stone-600">Kitchen and admin access requires an authenticator code.</p>
            <button type="button" onClick={() => void beginEnrollment()} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D6E44] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Set up authenticator
            </button>
          </>
        )}
        {state === 'verify' && (
          <form onSubmit={verify} className="mt-5">
            <label className="block text-xs font-bold text-stone-700">6-digit security code
              <input value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" required className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-center text-xl font-black tracking-[0.35em] outline-none focus:ring-2 focus:ring-emerald-700" />
            </label>
            <button type="submit" disabled={busy || code.length !== 6} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D6E44] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Verify and open Kitchen
            </button>
          </form>
        )}
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</p>}
        {state !== 'loading' && <button type="button" onClick={() => void signOutUser()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-bold text-stone-700"><LogOut className="h-4 w-4" /> Sign out</button>}
      </section>
    </main>
  );
};
