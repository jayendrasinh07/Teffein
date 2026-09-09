import React from 'react';
import { clientMonitoringService } from '../../services/clientMonitoringService';

const isOpsBuild = (import.meta as any).env?.VITE_APP_TARGET === 'ops';

type State = { failed: boolean; eventId: string };
type Props = { children: React.ReactNode };

export class AppErrorBoundary extends React.Component<Props, State> {
  declare readonly props: Readonly<Props>;
  state: State = { failed: false, eventId: '' };

  static getDerivedStateFromError(): State {
    return { failed: true, eventId: crypto.randomUUID() };
  }

  componentDidCatch(_error: unknown, info: React.ErrorInfo) {
    console.error('[Thalimitra UI crash]', {
      eventId: this.state.eventId.slice(0, 8),
      componentStack: info.componentStack,
    });
    void clientMonitoringService.reportRenderCrash(
      this.state.eventId,
      isOpsBuild ? 'kitchen' : 'customer',
    );
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-stone-50 px-5 text-stone-900">
        <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Thalimitra</p>
          <h1 className="mt-3 text-2xl font-black">This screen could not load</h1>
          <p className="mt-2 text-sm text-stone-600">Reload once. If it happens again, share reference {this.state.eventId.slice(0, 8)} with support.</p>
          <button className="mt-6 w-full rounded-xl bg-emerald-800 px-4 py-3 text-sm font-black text-white" onClick={() => window.location.reload()}>
            Reload
          </button>
          <a className="mt-3 block text-sm font-bold text-emerald-800 underline" href="/">
            Return to {isOpsBuild ? 'Operations' : 'Customer'} home
          </a>
        </section>
      </main>
    );
  }
}
