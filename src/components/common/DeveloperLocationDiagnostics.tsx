import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Crosshair, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Check,
  Compass,
  Radio,
  Sliders
} from 'lucide-react';

export const DeveloperLocationDiagnostics: React.FC = () => {
  const { 
    centralLocation, 
    detectedLocation, 
    activeDeliveryAddress,
    detectUserLocation, 
    simulateLocationCoordinates,
    locationState,
    setLocationState,
    showToast
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyDebugJson = () => {
    const payload = {
      centralLocation,
      detectedLocation,
      activeDeliveryAddress,
      deviceTime: new Date().toISOString()
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Diagnostics Copied', 'Location pipeline debug JSON copied to clipboard', 'info');
  };

  const isLowAccuracy = Boolean(centralLocation.accuracy && centralLocation.accuracy > 1000);

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-20 right-3 sm:bottom-4 sm:right-4 z-30 font-mono text-xs max-w-sm sm:max-w-md select-none">
      {/* Floating Toggle Pill */}
      <div className="flex items-center justify-end gap-1.5">
        <button
          id="dev-diagnostics-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold shadow-md border backdrop-blur-md transition-all cursor-pointer text-[10px] ${
            centralLocation.latitude 
              ? 'bg-stone-900/85 text-emerald-400 border-stone-700 hover:bg-stone-900' 
              : 'bg-amber-950/85 text-amber-300 border-amber-800/60 hover:bg-amber-950'
          }`}
          title="Toggle TEFFEIN Location Diagnostics"
        >
          <Crosshair className="w-3 h-3 animate-pulse text-emerald-400" />
          <span className="font-sans tracking-wide">
            GPS {centralLocation.latitude ? `(${centralLocation.latitude.toFixed(2)}°)` : 'Off'}
          </span>
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="w-5 h-5 rounded-full bg-stone-900/60 hover:bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
          title="Hide developer diagnostics"
        >
          ✕
        </button>
      </div>

      {/* Expanded Diagnostics Card */}
      {isOpen && (
        <div className="mt-2 bg-stone-950/95 border border-stone-800 text-stone-300 rounded-2xl shadow-2xl p-4 space-y-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2 text-stone-100 font-sans font-bold text-xs">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Location Pipeline Diagnostics</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDebugJson}
                className="p-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1 text-[10px] px-2 transition-colors cursor-pointer"
                title="Copy Full Diagnostic State as JSON"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'JSON'}</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-500 hover:text-stone-300 text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Core Telemetry Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800/80 space-y-0.5">
              <span className="text-stone-500 block text-[9px] uppercase tracking-wider">Coordinates (WGS84)</span>
              <div className="text-stone-200 font-medium truncate">
                {centralLocation.latitude !== null && centralLocation.longitude !== null
                  ? `${centralLocation.latitude.toFixed(5)}°, ${centralLocation.longitude.toFixed(5)}°`
                  : 'Not acquired'}
              </div>
            </div>

            <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800/80 space-y-0.5">
              <span className="text-stone-500 block text-[9px] uppercase tracking-wider">Accuracy & Source</span>
              <div className="flex items-center gap-1.5 font-medium">
                <span className={isLowAccuracy ? 'text-amber-400' : 'text-emerald-400'}>
                  {centralLocation.accuracy !== null ? `±${Math.round(centralLocation.accuracy)}m` : 'N/A'}
                </span>
                <span className="text-[10px] text-stone-400 uppercase bg-stone-800 px-1.5 py-0.2 rounded">
                  {centralLocation.source || 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800/80 space-y-0.5">
              <span className="text-stone-500 block text-[9px] uppercase tracking-wider">Reverse Geocoded Area</span>
              <div className="text-stone-200 font-medium truncate" title={centralLocation.formattedAddress}>
                {centralLocation.area || centralLocation.sector || 'Unresolved'}
              </div>
            </div>

            <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800/80 space-y-0.5">
              <span className="text-stone-500 block text-[9px] uppercase tracking-wider">Serviceability & Fee</span>
              <div className="flex items-center gap-1 font-medium">
                {centralLocation.serviceable ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Zone: ₹{centralLocation.deliveryFee}</span>
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span>Out of Zone</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Low Accuracy Warning if applicable */}
          {isLowAccuracy && (
            <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-[10px] flex items-center gap-1.5 font-sans">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>GPS accuracy is low (±{Math.round(centralLocation.accuracy!)}m). Verification prompt required.</span>
            </div>
          )}

          {/* Quick Simulation Bar for Multi-Location Verification */}
          <div className="border-t border-stone-800/80 pt-2 space-y-1.5">
            <span className="text-[10px] text-stone-400 font-sans font-semibold block flex items-center gap-1">
              <Sliders className="w-3 h-3 text-emerald-400" />
              <span>Test Specific GPS Coordinates:</span>
            </span>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-sans">
              <button
                onClick={() => detectUserLocation()}
                className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Real Device GPS</span>
              </button>

              <button
                onClick={() => simulateLocationCoordinates(23.1878, 72.6369, 15)}
                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-medium truncate text-left px-2 transition-colors cursor-pointer"
                title="Kudasan (Gandhinagar Core - Zone A)"
              >
                📍 Kudasan (Zone A)
              </button>

              <button
                onClick={() => simulateLocationCoordinates(23.1610, 72.6841, 20)}
                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-medium truncate text-left px-2 transition-colors cursor-pointer"
                title="GIFT City SEZ (Zone B)"
              >
                📍 GIFT City (Zone B)
              </button>

              <button
                onClick={() => simulateLocationCoordinates(23.0350, 72.5293, 25)}
                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/60 font-medium truncate text-left px-2 transition-colors cursor-pointer"
                title="Ahmedabad Metro (Outside Zone)"
              >
                🚫 Ahmedabad (Out)
              </button>

              <button
                onClick={() => simulateLocationCoordinates(18.9256, 72.8242, 10)}
                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/60 font-medium truncate text-left px-2 transition-colors cursor-pointer"
                title="Mumbai (Outside Zone)"
              >
                🚫 Mumbai (Out)
              </button>

              <button
                onClick={() => {
                  setLocationState('permission-denied');
                  showToast('Permission Denied', 'Simulated GPS permission denied by user', 'warning');
                }}
                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 font-medium truncate text-left px-2 transition-colors cursor-pointer"
                title="Simulate Geolocation Permission Denied"
              >
                ⚠️ Permission Denied
              </button>
            </div>
          </div>

          <div className="text-[9px] text-stone-500 font-sans text-right pt-0.5">
            Real GPS source: navigator.geolocation • Zero mock fallbacks
          </div>
        </div>
      )}
    </div>
  );
};
