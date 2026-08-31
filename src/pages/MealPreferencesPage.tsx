import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DietType, PortionSize } from '../types';
import { Sliders, CheckCircle2, Save, Leaf, Sparkles, Droplets, MapPin, ArrowLeft } from 'lucide-react';

export const MealPreferencesPage: React.FC = () => {
  const { subscription, updatePreferences, updateDeliveryAddress, setActiveTab, showToast } = useApp();

  const [dietType, setDietType] = useState<DietType>(subscription.dietType);
  const [portionSize, setPortionSize] = useState<PortionSize>(subscription.portionSize);
  const [chaasDaily, setChaasDaily] = useState<boolean>(subscription.addons.chaasDaily);
  const [extraRoti, setExtraRoti] = useState<boolean>(subscription.addons.extraRoti);
  const [sweetSunday, setSweetSunday] = useState<boolean>(subscription.addons.sweetSunday);
  const [specialInstructions, setSpecialInstructions] = useState(subscription.specialInstructions || '');
  const [streetAddress, setStreetAddress] = useState(subscription.deliveryAddress.street);
  const [area, setArea] = useState(subscription.deliveryAddress.area);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences(dietType, portionSize, {
      extraRoti,
      chaasDaily,
      sweetSunday
    }, specialInstructions);

    updateDeliveryAddress({
      ...subscription.deliveryAddress,
      street: streetAddress,
      area: area
    });

    showToast(
      'Preferences Saved',
      'Your meal configuration will apply starting with your very next kitchen shift.',
      'success'
    );
  };

  return (
    <div className="py-10 bg-[#FAF8F5] min-h-[85vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Back Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('customer_dashboard')}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-xs text-stone-400 font-mono">ID: {subscription.id}</span>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-md">
          <div className="border-b border-stone-100 pb-6 mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#107048] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Personalized Nutrition
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
              Meal Preferences & Dietary Routine
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Customize your diet, phulka portion, and chaas add-on. Updates take effect immediately.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            {/* 1. Dietary Type Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
                1. Dietary Preparation Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setDietType('standard_gujarati')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    dietType === 'standard_gujarati'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 bg-stone-50 hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-sm text-stone-900">Standard Gujarati</div>
                  <p className="text-xs text-stone-500 mt-1">
                    Authentic home taste with garlic/onion and traditional balanced mild seasoning.
                  </p>
                </div>

                <div
                  onClick={() => setDietType('jain_satvik')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    dietType === 'jain_satvik'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 bg-stone-50 hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-700" />
                    <span>Jain Satvik</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Zero root vegetables (no onion, garlic, potato, carrot). Cooked in dedicated hygienic utensils.
                  </p>
                </div>

                <div
                  onClick={() => setDietType('low_oil_fit')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    dietType === 'low_oil_fit'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 bg-stone-50 hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-emerald-700" />
                    <span>Low-Oil Fit</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Dry-roasted spices, minimal cold-pressed oil, ungreased phulkas for light daily digestion.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Portion Size & Roti Count */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
                2. Phulka Roti Portion (MP Sharbati Whole Wheat)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { size: 'mini' as PortionSize, label: 'Mini Diet (3 Phulkas)', desc: 'Light appetite' },
                  { size: 'regular' as PortionSize, label: 'Standard (4 Phulkas)', desc: 'Balanced meal' },
                  { size: 'jumbo' as PortionSize, label: 'Jumbo (6 Phulkas)', desc: 'Heavy appetite' }
                ].map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setPortionSize(item.size)}
                    className={`py-3 px-2 rounded-2xl border font-black text-xs sm:text-sm transition-all ${
                      portionSize === item.size
                        ? 'border-emerald-600 bg-[#107048] text-white shadow-md'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Chaas & Daily Add-ons */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                3. Daily Fresh Add-ons
              </label>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Include Fresh Churned Chaas Daily</h4>
                  <p className="text-xs text-stone-500">200ml Gujarati buttermilk with roasted jeera</p>
                </div>

                <button
                  type="button"
                  onClick={() => setChaasDaily(!chaasDaily)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    chaasDaily ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      chaasDaily ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Sunday Sweet Treat Cup</h4>
                  <p className="text-xs text-stone-500">Shrikhand / Moong Sheera / Sukhdi dessert</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSweetSunday(!sweetSunday)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    sweetSunday ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      sweetSunday ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 4. Delivery Address Update */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
                4. Delivery Address & Instructions
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Flat / Room No, Hostel Wing, Building Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Area / Sector (e.g. Bhaijipura / PDPU Road)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Special Delivery Note (e.g. Leave with guard / ring bell twice)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">No extra charges for standard diet adjustments</span>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl bg-[#107048] hover:bg-[#0A4E32] text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
