import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldCheck, FileText, RotateCcw, Truck, HelpCircle, Phone, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { BRAND_CONFIG, FAQS } from '../../data/config';

export const LegalModal: React.FC = () => {
  const { isLegalModalOpen, setIsLegalModalOpen, legalModalTab, setLegalModalTab, setActiveTab } = useApp();

  if (!isLegalModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#141A17] text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800/80 flex items-center justify-center text-emerald-300">
              {legalModalTab === 'privacy' && <ShieldCheck className="w-4 h-4" />}
              {legalModalTab === 'terms' && <FileText className="w-4 h-4" />}
              {legalModalTab === 'refund' && <RotateCcw className="w-4 h-4" />}
              {legalModalTab === 'delivery' && <Truck className="w-4 h-4" />}
              {legalModalTab === 'faq' && <HelpCircle className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                {legalModalTab === 'privacy' && 'Privacy Policy'}
                {legalModalTab === 'terms' && 'Terms & Conditions'}
                {legalModalTab === 'refund' && 'Cancellation & Refund Policy'}
                {legalModalTab === 'delivery' && 'Delivery Information & Timings'}
                {legalModalTab === 'faq' && 'Frequently Asked Questions'}
              </h3>
              <p className="text-[11px] text-stone-400">TEFFEIN Customer Trust & Operations • Gandhinagar</p>
            </div>
          </div>

          <button
            onClick={() => setIsLegalModalOpen(false)}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Nav Switcher */}
        <div className="px-5 sm:px-6 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setLegalModalTab('privacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              legalModalTab === 'privacy' ? 'bg-[#0D6E44] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setLegalModalTab('terms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              legalModalTab === 'terms' ? 'bg-[#0D6E44] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setLegalModalTab('refund')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              legalModalTab === 'refund' ? 'bg-[#0D6E44] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            Cancellation & Refund
          </button>
          <button
            type="button"
            onClick={() => setLegalModalTab('delivery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              legalModalTab === 'delivery' ? 'bg-[#0D6E44] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            Delivery Info
          </button>
          <button
            type="button"
            onClick={() => setLegalModalTab('faq')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              legalModalTab === 'faq' ? 'bg-[#0D6E44] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
          >
            FAQs
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-stone-700 text-xs sm:text-sm leading-relaxed">
          
          {/* PRIVACY POLICY */}
          {legalModalTab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <p className="font-bold text-xs">Effective Date: January 1, 2026 • Last updated: August 2026</p>
                <p className="text-xs text-emerald-800 mt-1">
                  At TEFFEIN, we respect your privacy and are committed to protecting the personal information you share with us for daily home meal deliveries.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">1. Information We Collect</h4>
                <p>
                  To fulfill doorstep food orders in Gandhinagar, we collect:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-stone-600">
                  <li><strong>Contact details:</strong> Name, delivery phone number, and optional email for invoice receipts.</li>
                  <li><strong>Location data:</strong> Doorstep address (house/flat number, society/building name, landmark, sector/area, and GPS coordinates if verified).</li>
                  <li><strong>Meal preferences:</strong> Dietary selections (Standard Gujarati, Jain Satvik, Low-Oil Fitness), spice levels, and delivery instructions.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">2. How We Use Your Data</h4>
                <p className="text-stone-600">
                  We use your information exclusively to cook, pack, and punctually dispatch meals to your location via our assigned Gandhinagar delivery clusters. We never sell, rent, or trade your personal data to third-party marketing brokers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">3. Payment Security</h4>
                <p className="text-stone-600">
                  All digital transactions are processed through RBI-authorized, PCI-DSS compliant payment gateways (UPI, Cards, NetBanking). TEFFEIN does not store full credit/debit card numbers or UPI PINs.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">4. Data Retention & Deletion</h4>
                <p className="text-stone-600">
                  You can request the modification or deletion of your saved addresses and account history anytime by contacting our support team at <a href={`mailto:${BRAND_CONFIG.email}`} className="text-[#0D6E44] font-bold underline">{BRAND_CONFIG.email}</a>.
                </p>
              </div>
            </div>
          )}

          {/* TERMS OF SERVICE */}
          {legalModalTab === 'terms' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-900">
                <p className="font-bold text-xs">TEFFEIN Platform & Service Terms</p>
                <p className="text-xs text-stone-600 mt-1">
                  By placing a one-time order or activating a meal subscription with TEFFEIN in Gandhinagar, you agree to the following terms.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">1. Kitchen Cutoff & Batch Timings</h4>
                <p className="text-stone-600">
                  Our meals are freshly prepared daily in scheduled batches. Same-day lunch orders and skips must be placed before <strong>9:30 AM</strong>. Same-day dinner orders and skips must be placed before <strong>5:00 PM</strong>. Orders received after cutoff will be scheduled for the next delivery slot.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">2. Service Coverage & Cluster Handover</h4>
                <p className="text-stone-600">
                  Deliveries are restricted to confirmed clusters across Gandhinagar (Kudasan, Infocity, GIFT City, Bhaijipura, Sectors 1–30, and GIDC). Delivery partners hand over food-grade thermo-sealed meal trays directly to you, your society guard, or designated reception desks per your instructions.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">3. Food Quality & Consumption Window</h4>
                <p className="text-stone-600">
                  TEFFEIN meals are cooked without chemical preservatives or artificial shelf-life extenders. Meals should ideally be consumed within <strong>2.5 hours</strong> of delivery for optimal nutritional freshness and aroma.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">4. Subscription Pause & Rollover</h4>
                <p className="text-stone-600">
                  Subscribers may pause plans anytime via the customer dashboard or helpline. Remaining unserved meal credits roll over with an extended validity period matching your plan tier.
                </p>
              </div>
            </div>
          )}

          {/* CANCELLATION & REFUND */}
          {legalModalTab === 'refund' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <p className="font-bold text-xs">Customer-First Cancellation & Refund Promise</p>
                <p className="text-xs text-amber-800 mt-1">
                  We believe in zero-friction meal flexibility. If your plans change or a meal doesn't meet our promised standard, we make it right.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">1. One-Time Meal Orders</h4>
                <p className="text-stone-600">
                  You can cancel a one-time meal anytime prior to kitchen dispatch (up to 2 hours before the slot delivery window). In case of eligible pre-dispatch cancellation, 100% of the amount is automatically refunded to your original payment method within 2–4 bank working days.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">2. Subscription Skips & Pauses</h4>
                <p className="text-stone-600">
                  If you do not require food on specific days, you do not lose your money! Simply skip the slot on your dashboard before cutoff (9:30 AM for lunch, 5:00 PM for dinner). The skipped meal credit is credited to your balance and extends your subscription end date.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">3. Quality or Delivery Guarantee</h4>
                <p className="text-stone-600">
                  If a meal tray arrives damaged, delayed beyond acceptable transit limits due to operational fault, or incorrect items are dispatched, contact our helpline at <span className="font-bold text-stone-900">{BRAND_CONFIG.phone}</span> immediately. We will issue a replacement meal or full slot credit immediately.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">4. Refund Processing Time</h4>
                <p className="text-stone-600">
                  UPI and card refunds are initiated immediately and reflect in your account within 24 to 72 hours depending on your issuing bank.
                </p>
              </div>
            </div>
          )}

          {/* DELIVERY INFORMATION */}
          {legalModalTab === 'delivery' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <p className="font-bold text-xs">Punctual Cluster Logistics • Gandhinagar</p>
                <p className="text-xs text-emerald-800 mt-1">
                  Our route-optimized vans dispatch directly from our central kitchen to ensure food reaches your doorstep piping hot.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-xs text-stone-900 block">Lunch Delivery Slot</span>
                  <span className="text-sm font-extrabold text-[#0D6E44]">12:00 PM – 1:00 PM</span>
                  <p className="text-[11px] text-stone-500 mt-1">Timed for college breaks and corporate lunch hours.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-xs text-stone-900 block">Dinner Delivery Slot</span>
                  <span className="text-sm font-extrabold text-[#0D6E44]">7:30 PM – 8:30 PM</span>
                  <p className="text-[11px] text-stone-500 mt-1">Delivered hot for a relaxing evening routine.</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">Key Delivery Clusters</h4>
                <ul className="list-disc pl-5 space-y-1 text-stone-600 text-xs">
                  <li><strong>Cluster A (Student & Tech Corridor):</strong> Kudasan, PDPU Road, Bhaijipura, Raysan, Infocity Phase 1 & 2, DA-IICT area.</li>
                  <li><strong>Cluster B (GIFT City & Koba):</strong> GIFT City SEZ & Domestic Towers, Randesan, Sargasan Cross Roads, Koba Circle.</li>
                  <li><strong>Cluster C (GIDC Industrial Hub):</strong> Sector 24, Sector 25 Electronic Estate, Sector 26, Sector 28.</li>
                  <li><strong>Cluster D (Central Sectors):</strong> Sectors 1 to 30 Residential rows, Old & New Sachivalaya, Vidhan Sabha area, Vavol.</li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLegalModalOpen(false);
                    setActiveTab('coverage');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0D6E44] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#08482C] transition-colors"
                >
                  <span>View Full Coverage Map & Sector List</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* FAQS */}
          {legalModalTab === 'faq' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm flex items-start gap-2">
                    <span className="text-[#0D6E44] font-black">Q:</span>
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-stone-600 text-xs pl-5 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#0D6E44]" />
              <span>{BRAND_CONFIG.phone}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#0D6E44]" />
              <span>{BRAND_CONFIG.email}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsLegalModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
