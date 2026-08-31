import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Building2, CheckCircle2, Send, Users, MapPin, Phone, Mail } from 'lucide-react';

export const CorporateEnquiryModal: React.FC = () => {
  const { isCorporateModalOpen, setIsCorporateModalOpen, showToast } = useApp();

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [employeeCount, setEmployeeCount] = useState('50');
  const [location, setLocation] = useState('GIFT City SEZ, Gandhinagar');
  const [mealSlot, setMealSlot] = useState<'lunch' | 'dinner' | 'both'>('lunch');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isCorporateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    showToast(
      'Corporate Demo Requested',
      `Thank you ${contactPerson}! Our B2B meal coordinator will contact you within 2 hours with tailored team pricing.`,
      'success'
    );
    setTimeout(() => {
      setIsSubmitted(false);
      setIsCorporateModalOpen(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-[#107048] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-300">
                  Corporate & Factory Tier
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">Request Corporate Meal Demo</h3>
              </div>
            </div>

            <button
              onClick={() => setIsCorporateModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-stone-300 mt-2">
            Nutritious daily home-style meals for offices in GIFT City, Infocity, and factories in Sector 24-28 GIDC.
          </p>
        </div>

        {/* Form Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-stone-900">Enquiry Received!</h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              We have generated your customized quotation for {employeeCount} employees at {companyName || 'your company'}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Company / Factory Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme FinTech Solutions / Tata Consultancy"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Contact Person *</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Rajesh Shah (HR Lead)"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Official Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Official Work Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Employee Headcount</label>
                <select
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="15-30">15 – 30 Team Members</option>
                  <option value="31-75">31 – 75 Employees</option>
                  <option value="76-150">76 – 150 Employees (GIFT / GIDC)</option>
                  <option value="150+">150+ Enterprise Workforce</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Gandhinagar Office / Plant Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Tower 2, GIFT SEZ / Sector 25 GIDC"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Meal Service Timing Required</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMealSlot('lunch')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    mealSlot === 'lunch'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Lunch (12:00-1:00 PM)
                </button>
                <button
                  type="button"
                  onClick={() => setMealSlot('dinner')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    mealSlot === 'dinner'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Dinner (7:30-8:30 PM)
                </button>
                <button
                  type="button"
                  onClick={() => setMealSlot('both')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    mealSlot === 'both'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Both Shifts
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Additional Requirements / Dietary Mix</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. We have ~30% Jain staff, need hot crates by 12:15 PM sharp."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#107048] hover:bg-[#0A4E32] text-white text-sm font-bold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Submit Corporate Enquiry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
