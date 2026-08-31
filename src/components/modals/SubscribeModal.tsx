import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Check, 
  Sparkles, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Utensils, 
  Flame, 
  ChevronRight,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { MEAL_PLANS, GANDHINAGAR_AREAS } from '../../data/config';
import { CustomerSegment, PlanDuration, MealSlot, DietType, PortionSize } from '../../types';

export const SubscribeModal: React.FC = () => {
  const { 
    isSubscribeModalOpen, 
    setIsSubscribeModalOpen, 
    selectedPlanForCheckout, 
    createNewSubscription 
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [segment, setSegment] = useState<CustomerSegment>('student');
  const [selectedPlan, setSelectedPlan] = useState<PlanDuration>(selectedPlanForCheckout || 'half_month_15');
  const [slot, setSlot] = useState<MealSlot>('lunch');
  const [diet, setDiet] = useState<DietType>('standard_gujarati');
  const [portion, setPortion] = useState<PortionSize>('regular');
  
  // Address form
  const [name, setName] = useState('Aarav Patel');
  const [phone, setPhone] = useState('+91 98254 99120');
  const [email, setEmail] = useState('aarav.patel.pdpu@gmail.com');
  const [street, setStreet] = useState('Room 402, Shivalik Elite Boys PG, Near Swagat Flamingo');
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(1); // Kudasan
  const [landmark, setLandmark] = useState('Behind Reliance Petrol Pump');
  const [specialInstructions, setSpecialInstructions] = useState('Please leave with PG security guard if in lecture.');
  
  // Addons
  const [addons, setAddons] = useState({
    extraRoti: false,
    chaasDaily: true,
    sweetSunday: true
  });

  if (!isSubscribeModalOpen) return null;

  const currentArea = GANDHINAGAR_AREAS[selectedAreaIndex] || GANDHINAGAR_AREAS[0];
  const activePlanObj = MEAL_PLANS.find((p) => p.id === selectedPlan) || MEAL_PLANS[2];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete subscription
      createNewSubscription(
        selectedPlan,
        segment,
        slot,
        diet,
        portion,
        {
          street,
          area: currentArea.area,
          sector: currentArea.sector,
          pincode: currentArea.pincode,
          landmark,
          clusterId: currentArea.cluster.startsWith('Cluster A') ? 'cluster-a' : currentArea.cluster.startsWith('Cluster B') ? 'cluster-b' : currentArea.cluster.startsWith('Cluster C') ? 'cluster-c' : 'cluster-d',
          deliveryTimeSlot: slot === 'lunch' ? currentArea.lunchSlot : currentArea.dinnerSlot
        },
        addons
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#107048] to-[#0A4E32] px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-stone-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Step {step} of 3
              </span>
              <span className="text-emerald-100 text-xs font-semibold">Gandhinagar Routine Setup</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {step === 1 && '1. Choose Your Daily Plan'}
              {step === 2 && '2. Set Your Food & Diet Preferences'}
              {step === 3 && '3. Delivery Location in Gandhinagar'}
            </h3>
          </div>
          <button
            onClick={() => setIsSubscribeModalOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: Plan & Segment */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Who is this meal plan for?
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSegment('student')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      segment === 'student'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 text-emerald-950 font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="text-sm font-bold">Student / PG</div>
                    <div className="text-xs text-stone-500 mt-0.5">PDPU, DA-IICT, GNLU</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSegment('worker')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      segment === 'worker'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 text-emerald-950 font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="text-sm font-bold">Office Employee</div>
                    <div className="text-xs text-stone-500 mt-0.5">Infocity & GIFT City</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSegment('individual')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      segment === 'individual'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 text-emerald-950 font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="text-sm font-bold">Resident / Family</div>
                    <div className="text-xs text-stone-500 mt-0.5">Sectors 1 to 30</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Select Subscription Duration
                </label>
                <div className="space-y-2.5">
                  {MEAL_PLANS.filter((p) => p.id !== 'corporate_custom').map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlan(p.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedPlan === p.id
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedPlan === p.id ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300'
                        }`}>
                          {selectedPlan === p.id && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-stone-900">{p.name}</span>
                            {p.isPopular && (
                              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                                Most Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{p.tagline}</p>
                          <div className="text-xs text-emerald-700 font-medium mt-1">
                            {p.totalMeals} meals • Flexible pause up to {p.flexibility.pauseAllowedDays} days
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-extrabold text-stone-900">₹{p.totalPrice}</div>
                        <div className="text-xs text-stone-500 font-medium">₹{p.pricePerMeal}/meal</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Slot */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Delivery Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSlot('lunch')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      slot === 'lunch'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    <div className="text-sm font-bold">Lunch Only</div>
                    <div className="text-xs text-stone-500">12:00 – 1:00 PM</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSlot('dinner')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      slot === 'dinner'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    <div className="text-sm font-bold">Dinner Only</div>
                    <div className="text-xs text-stone-500">7:30 – 8:30 PM</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSlot('both')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      slot === 'both'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    <div className="text-sm font-bold">Lunch + Dinner</div>
                    <div className="text-xs text-stone-500">Both Daily Slots</div>
                  </button>
                </div>
              </div>

              {/* Diet Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Food Preparation Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setDiet('standard_gujarati')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      diet === 'standard_gujarati'
                        ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-950'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold text-sm">Authentic Gujarati Home-Style</div>
                    <div className="text-xs text-stone-500 mt-0.5">Mildly spiced, sweet-sour balance, fresh phulkas</div>
                  </div>

                  <div
                    onClick={() => setDiet('jain_satvik')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      diet === 'jain_satvik'
                        ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-950'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold text-sm">Jain Satvik (No Onion/Garlic/Roots)</div>
                    <div className="text-xs text-stone-500 mt-0.5">Separate sanctified steam preparation counter</div>
                  </div>

                  <div
                    onClick={() => setDiet('kathiyawadi')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      diet === 'kathiyawadi'
                        ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-950'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold text-sm">Kathiyawadi / Saurashtra Touch</div>
                    <div className="text-xs text-stone-500 mt-0.5">Garlic chutney, ringna no olo & sev tameta</div>
                  </div>

                  <div
                    onClick={() => setDiet('low_oil_fit')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      diet === 'low_oil_fit'
                        ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-950'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold text-sm">Low-Oil Fit (Cold-Pressed)</div>
                    <div className="text-xs text-stone-500 mt-0.5">Zero ghee on rotis, steamed veggies, high pulse protein</div>
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Complimentary & Daily Add-ons
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <span className="text-sm font-medium text-stone-800">Fresh Churned Masala Chaas Daily</span>
                    <input
                      type="checkbox"
                      checked={addons.chaasDaily}
                      onChange={(e) => setAddons({ ...addons, chaasDaily: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <span className="text-sm font-medium text-stone-800">Sunday Special Traditional Sweet (Sheera/Shrikhand)</span>
                    <input
                      type="checkbox"
                      checked={addons.sweetSunday}
                      onChange={(e) => setAddons({ ...addons, sweetSunday: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <span className="text-sm font-medium text-stone-800">+2 Extra Phulka Rotis per meal (+₹10/meal)</span>
                    <input
                      type="checkbox"
                      checked={addons.extraRoti}
                      onChange={(e) => setAddons({ ...addons, extraRoti: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Delivery Location */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="text-xs text-emerald-900">
                  <span className="font-bold">Gandhinagar Cluster Delivery:</span> Free doorstep delivery at scheduled shift/lecture break times.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Select Gandhinagar Area / Sector</label>
                <select
                  value={selectedAreaIndex}
                  onChange={(e) => setSelectedAreaIndex(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {GANDHINAGAR_AREAS.map((a, i) => (
                    <option key={i} value={i}>
                      {a.area} ({a.sector}) - Pincode: {a.pincode}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
                  <span>Assigned: {currentArea.cluster}</span>
                  <span className="text-emerald-700 font-semibold">
                    Est. Slot: {slot === 'lunch' ? currentArea.lunchSlot : currentArea.dinnerSlot}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Building / PG / House Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Room 402, Shivalik Elite PG, Near Reliance Circle"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Notes / Landmark</label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Leave at security desk or ring bell twice"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                  <span>Plan Total ({activePlanObj.name}):</span>
                  <span className="font-bold text-stone-900">₹{activePlanObj.totalPrice}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                  <span>Doorstep Delivery:</span>
                  <span className="font-bold text-emerald-700">FREE (Gandhinagar Cluster)</span>
                </div>
                <div className="flex items-center justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Amount to Activate:</span>
                  <span className="text-[#107048] text-base">₹{activePlanObj.totalPrice}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={() => setIsSubscribeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-stone-500 text-sm font-semibold hover:text-stone-800"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[#107048] hover:bg-[#0A4E32] text-white text-sm font-bold shadow-md shadow-emerald-950/20 flex items-center gap-2 transition-all"
          >
            <span>{step === 3 ? 'Confirm & Start Routine' : 'Continue'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
