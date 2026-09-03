import React, { useState } from 'react';
import { 
  MapPin, 
  Home, 
  Building2, 
  GraduationCap, 
  Plus, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  Phone,
  User,
  Navigation,
  Sparkles,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerAddress, AddressLabel, DeliveryInstructionPreset } from '../../types';
import { checkAreaServiceability } from '../../services/locationService';

interface AddressSelectorProps {
  selectedAddress: CustomerAddress;
  onSelectAddress: (addr: CustomerAddress) => void;
  savedAddresses?: CustomerAddress[];
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddress,
  onSelectAddress
}) => {
  const { 
    savedAddresses, 
    activeDeliveryAddress,
    selectDeliveryAddress,
    saveDeliveryAddress,
    detectUserLocation,
    locationState,
    setIsLocationModalOpen
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);

  // New address form state
  const [newLabel, setNewLabel] = useState<AddressLabel>('Home');
  const [newName, setNewName] = useState(selectedAddress.fullName || '');
  const [newPhone, setNewPhone] = useState(selectedAddress.phone || '');
  const [newHouseNumber, setNewHouseNumber] = useState('');
  const [newBuilding, setNewBuilding] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newInstructionPreset, setNewInstructionPreset] = useState<DeliveryInstructionPreset>('call_on_reach');
  const [newCustomInstruction, setNewCustomInstruction] = useState('');

  const [formError, setFormError] = useState('');

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || (!newHouseNumber.trim() && !newBuilding.trim())) {
      setFormError('Please fill in your name, phone number, and house/building details.');
      return;
    }

    if(!newArea.trim()||!/^\d{6}$/.test(newPincode.trim())){setFormError('Enter your actual area and a six-digit pincode.');return;}

    let finalInstruction = '';
    switch (newInstructionPreset) {
      case 'call_on_reach':
        finalInstruction = 'Call on arrival';
        break;
      case 'leave_at_security':
        finalInstruction = 'Leave with security guard / gate desk';
        break;
      case 'ring_bell':
        finalInstruction = 'Ring doorbell';
        break;
      case 'deliver_at_reception':
        finalInstruction = 'Deliver at office reception';
        break;
      case 'custom':
        finalInstruction = newCustomInstruction.trim();
        break;
    }

    const fullLineParts = [
      newHouseNumber.trim(),
      newBuilding.trim(),
      newLandmark.trim() ? `Near ${newLandmark.trim()}` : '',
      newArea.trim(),
      'Gandhinagar'
    ].filter(Boolean);

    const fullAddress = fullLineParts.join(', ');

    const newAddr: CustomerAddress = {
      id: 'addr-' + Date.now(),
      label: newLabel,
      fullName: newName.trim(),
      name: newName.trim(),
      phone: newPhone.trim(),
      houseNumber: newHouseNumber.trim() || undefined,
      building: newBuilding.trim() || undefined,
      addressLine: fullAddress,
      addressLine1: fullAddress,
      area: newArea.trim(),
      sector: newArea.trim(),
      landmark: newLandmark.trim() || undefined,
      city: 'Gandhinagar',
      state: 'Gujarat',
      pincode: newPincode.trim(),
      clusterId: '',
      clusterName: '',
      zoneId: undefined,
      deliveryFee: 0,
      instructions: finalInstruction,
      instructionPreset: newInstructionPreset,
      isDefault: false,
      isServiceable: false
    };

    try { const saved=await saveDeliveryAddress(newAddr as any); onSelectAddress({...saved,addressLine:saved.addressLine??saved.addressLine1}); }
    catch(error){setFormError((error as Error).message);return;}
    setShowAddForm(false);
    setFormError('');
  };

  const handleGpsDetect = () => { setIsLocationModalOpen(true); };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home className="w-4 h-4 text-emerald-600" />;
      case 'Office':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'PG':
      case 'College':
        return <GraduationCap className="w-4 h-4 text-amber-600" />;
      default:
        return <MapPin className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0D6E44]" />
            <span>Where should we deliver?</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Doorstep delivery across all Gandhinagar Sectors, Infocity & GIFT City
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick GPS button */}
          <button
            type="button"
            onClick={handleGpsDetect}
            disabled={locationState === 'requesting' || locationState === 'detecting'}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Auto-detect current sector"
          >
            <Navigation className={`w-3.5 h-3.5 text-[#0D6E44] ${locationState === 'detecting' ? 'animate-spin' : ''}`} />
            <span>{locationState === 'detecting' ? 'Detecting...' : 'Auto-Detect'}</span>
          </button>

          {/* Search modal trigger */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search Sector</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-black text-[#0D6E44] hover:text-[#08482C] flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add New'}</span>
          </button>
        </div>
      </div>

      {/* Saved Addresses List */}
      {!showAddForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {savedAddresses.map((addr) => {
            const isSelected = selectedAddress.id === addr.id || activeDeliveryAddress?.id === addr.id;

            return (
              <div
                key={addr.id}
                onClick={() => {
                  selectDeliveryAddress(addr);
                  onSelectAddress(addr);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/70 border-[#0D6E44] ring-2 ring-[#0D6E44]/20 shadow-sm'
                    : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center shadow-2xs">
                        {getLabelIcon(addr.label)}
                      </div>
                      <span className="text-xs font-black text-stone-900">
                        {addr.label}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] font-bold text-[#0D6E44] bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Deliver Here</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-stone-800 pt-1">
                    {addr.fullName || addr.name} <span className="text-stone-400 font-normal">• {addr.phone}</span>
                  </p>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {addr.addressLine1 || addr.addressLine}, {addr.area} ({addr.pincode})
                  </p>

                  {addr.instructions && (
                    <p className="text-[10px] text-stone-500 italic mt-0.5">
                      "{addr.instructions}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Address Form */}
      {showAddForm && (
        <form onSubmit={handleSaveNewAddress} className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 animate-in fade-in duration-200">
          <span className="text-xs font-black uppercase tracking-wider text-stone-800 block">
            Add New Delivery Location
          </span>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Label selector: Home / Office / PG / College */}
          <div className="flex items-center gap-2">
            {(['Home', 'Office', 'PG', 'College', 'Other'] as const).map((lbl) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setNewLabel(lbl)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  newLabel === lbl
                    ? 'bg-[#0D6E44] text-white border-[#0D6E44]'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Your Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Aarav Patel"
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D6E44]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D6E44]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">House / Flat / Office No. *</label>
              <input
                type="text"
                value={newHouseNumber}
                onChange={(e) => setNewHouseNumber(e.target.value)}
                placeholder="e.g. Flat 302 / Cabin 4B"
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D6E44]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Building / Society / Complex *</label>
              <input
                type="text"
                value={newBuilding}
                onChange={(e) => setNewBuilding(e.target.value)}
                placeholder="e.g. Shivalik Residency / Infocity Tower 2"
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D6E44]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">Nearby Landmark (Optional)</label>
            <input
              type="text"
              value={newLandmark}
              onChange={(e) => setNewLandmark(e.target.value)}
              placeholder="e.g. Behind TCS Garima Park / Near Reliance Petrol Pump"
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D6E44]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Gandhinagar Area / Sector *</label>
              <input type="text" value={newArea} onChange={e=>setNewArea(e.target.value)} required placeholder="e.g. Sector 21, Kudasan or GIFT City" className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs" />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Pincode</label>
              <input
                type="text"
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value)}
                placeholder="382421 / 382007"
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D6E44]"
              />
            </div>
          </div>

          {/* Delivery instructions */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1.5">Delivery Instructions</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'call_on_reach', label: 'Call on Arrival' },
                { id: 'leave_at_security', label: 'Leave with Security' },
                { id: 'ring_bell', label: 'Ring Doorbell' },
                { id: 'deliver_at_reception', label: 'Deliver at Reception' }
              ].map((inst) => (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => setNewInstructionPreset(inst.id as DeliveryInstructionPreset)}
                  className={`p-2 rounded-xl text-[11px] font-bold text-left border transition-all cursor-pointer ${
                    newInstructionPreset === inst.id
                      ? 'bg-emerald-50 border-[#0D6E44] text-[#0D6E44]'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {inst.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2 px-4 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 rounded-xl bg-[#0D6E44] hover:bg-[#08482C] text-white text-xs font-black shadow-md cursor-pointer transition-colors"
            >
              Save Address
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
