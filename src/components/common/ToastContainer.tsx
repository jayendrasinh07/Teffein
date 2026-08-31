import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto rounded-2xl p-4 shadow-xl border flex items-start gap-3 backdrop-blur-md ${
                isSuccess
                  ? 'bg-[#0E3D28]/95 text-white border-emerald-500/40 shadow-emerald-950/20'
                  : isWarning
                  ? 'bg-[#4A2D0B]/95 text-amber-50 border-amber-500/40 shadow-amber-950/20'
                  : isError
                  ? 'bg-[#4A1118]/95 text-rose-50 border-rose-500/40 shadow-rose-950/20'
                  : 'bg-[#1C2630]/95 text-cyan-50 border-sky-500/40 shadow-slate-950/20'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
                {isError && <XCircle className="w-5 h-5 text-rose-400" />}
                {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-sky-400" />}
              </div>

              <div className="flex-1 pr-2">
                <h4 className="font-semibold text-sm leading-tight text-white">{toast.title}</h4>
                <p className="text-xs mt-1 text-stone-200 leading-relaxed">{toast.message}</p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
