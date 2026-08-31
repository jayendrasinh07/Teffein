import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  Utensils, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Smartphone,
  QrCode,
  Banknote,
  Flame,
  Droplet,
  Plus,
  Minus,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  getMealDetailsForDate, 
  calculateOrderPrice, 
  createDefaultMealCustomization,
  SingleMealCustomization,
  ORDER_ADDON_CATALOG 
} from '../services/orderCustomizationEngine';
import { 
  checkMealAvailability, 
  getOrderableDates, 
  SAVED_CUSTOMER_ADDRESSES, 
  TEFFEIN_OPERATIONAL_CONFIG 
} from '../services/availabilityEngine';
import { CustomerAddress, DeliverySlot, PaymentMethod, OneTimeOrder } from '../types';
import { calculateDeliveryFeeForZone } from '../services/locationService';
import { OrderMealShowcase } from '../components/order/OrderMealShowcase';
import { OrderDateSlotSelector } from '../components/order/OrderDateSlotSelector';
import { MultiMealCustomizer } from '../components/order/MultiMealCustomizer';
import { AddOnSelector } from '../components/order/AddOnSelector';
import { DeliverySlotSelector } from '../components/order/DeliverySlotSelector';
import { AddressSelector } from '../components/order/AddressSelector';
import { OrderSummaryDesktop } from '../components/order/OrderSummaryDesktop';
import { OrderSummaryMobile } from '../components/order/OrderSummaryMobile';
import { OrderConfirmedView } from '../components/order/OrderConfirmedView';

export const OrderOncePage: React.FC = () => {
  const { 
    createOneTimeOrder, 
    showToast, 
    setActiveTab,
    setActiveTrackingOrder,
    activeDeliveryAddress,
    centralLocation,
    savedAddresses,
    setIsLocationModalOpen
  } = useApp();

  const orderableDates = getOrderableDates();

  // Wizard Steps: 1: Meal & Customization, 2: Delivery & Address, 3: Payment
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Date & Meal Slot State
  const [selectedDate, setSelectedDate] = useState<string>(orderableDates[0]?.dateStr || '');
  const [selectedMealSlot, setSelectedMealSlot] = useState<'lunch' | 'dinner'>('lunch');

  // Quantity & Customization State
  const [quantity, setQuantity] = useState<number>(1);
  const [applySameCustomization, setApplySameCustomization] = useState<boolean>(true);
  const [mealCustomizations, setMealCustomizations] = useState<SingleMealCustomization[]>([
    createDefaultMealCustomization(0, 'Meal 1')
  ]);
  const [isCustomizingExpanded, setIsCustomizingExpanded] = useState<boolean>(false);

  // Standalone Add-ons State
  const [selectedAddons, setSelectedAddons] = useState<{ [id: string]: number }>({});

  // Delivery & Address State (initialized from central/active address)
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress>(() => {
    return (activeDeliveryAddress as CustomerAddress) || SAVED_CUSTOMER_ADDRESSES[0];
  });
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  // Sync when activeDeliveryAddress changes in context
  useEffect(() => {
    if (activeDeliveryAddress) {
      setSelectedAddress(activeDeliveryAddress as CustomerAddress);
    }
  }, [activeDeliveryAddress]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'other'>('gpay');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Confirmation State
  const [confirmedOrder, setConfirmedOrder] = useState<OneTimeOrder | null>(null);

  // Dynamic delivery fee calculation based on active zone
  const deliveryFee = useMemo(() => {
    const zoneId = (selectedAddress as any)?.zoneId || (centralLocation?.deliveryZoneId as any) || 'zone_a_core';
    return calculateDeliveryFeeForZone(zoneId);
  }, [selectedAddress, centralLocation]);

  // 1. Availability check
  const availability = useMemo(() => {
    return checkMealAvailability({
      date: selectedDate,
      mealSlot: selectedMealSlot
    });
  }, [selectedDate, selectedMealSlot]);

  // Set default slot when availability changes
  useEffect(() => {
    if (availability.availableSlots && availability.availableSlots.length > 0) {
      if (!selectedSlotId || !availability.availableSlots.some((s) => s.id === selectedSlotId)) {
        setSelectedSlotId(availability.availableSlots[0].id);
      }
    }
  }, [availability, selectedSlotId]);

  // 2. Fetch rich daily meal details (from WEEKLY_MENU and actual date)
  const mealDetails = useMemo(() => {
    return getMealDetailsForDate(selectedDate, selectedMealSlot);
  }, [selectedDate, selectedMealSlot]);

  // 3. Centralized Price Calculation
  const pricing = useMemo(() => {
    return calculateOrderPrice({
      basePricePerMeal: 119,
      quantity,
      applySameCustomization,
      mealCustomizations,
      selectedAddons,
      deliveryFee: deliveryFee,
      discount: 0
    });
  }, [quantity, applySameCustomization, mealCustomizations, selectedAddons, deliveryFee]);

  // Current selected slot object
  const currentSlot = useMemo(() => {
    return availability.availableSlots.find((s) => s.id === selectedSlotId) || availability.availableSlots[0];
  }, [availability, selectedSlotId]);

  // Date label formatted
  const dateLabel = useMemo(() => {
    const found = orderableDates.find((d) => d.dateStr === selectedDate);
    return found ? found.label : selectedDate;
  }, [orderableDates, selectedDate]);

  // Add-on toggle handler
  const handleAddonToggle = (id: string, delta: number) => {
    setSelectedAddons((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  // Next available recovery handler
  const handleSelectNextAvailable = (date: string, slot: 'lunch' | 'dinner') => {
    setSelectedDate(date);
    setSelectedMealSlot(slot);
    showToast(
      'Updated to Next Open Slot',
      `Switched to ${slot === 'lunch' ? 'Lunch' : 'Dinner'} on ${date}.`,
      'info'
    );
  };

  // Navigation flow
  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 3) {
      handleFinalizeOrder();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Finalize Order
  const handleFinalizeOrder = async () => {
    setIsSubmitting(true);

    const addonsList = Object.entries(selectedAddons).map(([id, qty]) => {
      const a = ORDER_ADDON_CATALOG.find((item) => item.id === id);
      return {
        id,
        name: a?.name || id,
        price: a?.price || 0,
        quantity: Number(qty) || 1
      };
    });

    const primaryCustom = mealCustomizations[0] || createDefaultMealCustomization(0);

    const customSummaries = pricing.customizationLineItems.map((c) => c.label);

    const orderData: Omit<OneTimeOrder, 'id' | 'createdAt' | 'traceabilityMealId'> = {
      userId: 'usr_guest_01',
      userName: selectedAddress.fullName,
      userPhone: selectedAddress.phone,
      orderType: 'ONE_TIME',
      mealId: `thali_${selectedMealSlot}_${mealDetails.dayName.toLowerCase()}`,
      mealName: mealDetails.title,
      mealImage: mealDetails.image,
      scheduledDate: selectedDate,
      scheduledDateLabel: dateLabel,
      mealSlot: selectedMealSlot,
      deliverySlotId: currentSlot?.id || 'slot_default',
      deliverySlotLabel: currentSlot?.windowLabel || (selectedMealSlot === 'lunch' ? '12:15 PM – 01:15 PM' : '07:45 PM – 08:45 PM'),
      quantity,
      customizations: {
        spiceLevel: primaryCustom.spiceLevel,
        oilLevel: primaryCustom.oilLevel,
        dietVariant: primaryCustom.dietVariant,
        rotiCount: primaryCustom.rotiCount,
        ricePortion: primaryCustom.ricePortion,
        extraDal: primaryCustom.dalPortion === 'extra',
        hasChaas: primaryCustom.hasChaas
      },
      mealCustomizations,
      customizationSummary: customSummaries,
      addOns: addonsList,
      address: selectedAddress,
      subtotal: pricing.mealsSubtotal,
      addOnsTotal: pricing.addOnsTotal + pricing.customizationsTotal,
      deliveryFee: pricing.deliveryFee,
      discount: pricing.discount,
      total: pricing.total,
      paymentMethod,
      paymentStatus: paymentMethod === 'CashOnDelivery' ? 'PENDING' : 'PAID',
      orderStatus: 'CONFIRMED',
      estimatedDeliveryTime: currentSlot?.windowLabel || '12:45 PM'
    };

    try {
      const created = await createOneTimeOrder(orderData);
      setIsSubmitting(false);
      setConfirmedOrder(created);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setIsSubmitting(false);
      showToast('Order Failed', 'Could not complete order. Please retry.', 'error');
    }
  };

  // If order is confirmed, show celebratory tracker view
  if (confirmedOrder) {
    return (
      <main className="py-10 sm:py-16 bg-[#FAF8F5] min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <OrderConfirmedView
            order={confirmedOrder}
            onOrderAnother={() => {
              setConfirmedOrder(null);
              setCurrentStep(1);
              setQuantity(1);
              setSelectedAddons({});
            }}
            onTrackOrder={() => {
              setActiveTrackingOrder(confirmedOrder);
              setActiveTab('delivery_tracking');
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="py-8 sm:py-12 bg-[#FAF8F5] min-h-screen text-stone-900 pb-28 lg:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Top Breadcrumb & Step Tracker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-stone-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Gandhinagar Food-Tech Platform
              </span>
              <span className="text-xs text-stone-400 font-semibold">•</span>
              <span className="text-xs text-stone-500 font-semibold">
                Aaj TEFFEIN mein kya mil raha hai?
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 tracking-tight">
              Order a Fresh Home-Style Meal
            </h1>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white p-1.5 rounded-2xl border border-stone-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currentStep === 1
                  ? 'bg-[#0D6E44] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              1. Meal & Custom
            </button>
            <span className="text-stone-300">/</span>
            <button
              type="button"
              onClick={() => {
                if (availability.isAvailable) setCurrentStep(2);
              }}
              disabled={!availability.isAvailable}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currentStep === 2
                  ? 'bg-[#0D6E44] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 disabled:opacity-40'
              }`}
            >
              2. Delivery
            </button>
            <span className="text-stone-300">/</span>
            <button
              type="button"
              onClick={() => {
                if (availability.isAvailable) setCurrentStep(3);
              }}
              disabled={!availability.isAvailable}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currentStep === 3
                  ? 'bg-[#0D6E44] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 disabled:opacity-40'
              }`}
            >
              3. Payment
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left Steps + Right Sticky Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Active Step Controls */}
          <div className="lg:col-span-8 space-y-6">

            {/* BACK BUTTON IF IN STEP 2 OR 3 */}
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 text-xs font-black text-stone-600 hover:text-stone-900 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to {currentStep === 2 ? 'Meal Selection' : 'Delivery Selection'}</span>
              </button>
            )}

            {/* STEP 1: Meal Choice, Date/Slot, Customization & Add-ons */}
            {currentStep === 1 && (
              <div className="space-y-6">
                
                {/* Deliver to Confirmed Address Banner */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0D6E44] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Deliver to:</div>
                      <div className="text-sm font-black text-stone-900 flex items-center gap-1.5 truncate">
                        <span>{activeDeliveryAddress?.label || 'Home'}</span>
                        <span className="text-stone-300">•</span>
                        <span>{activeDeliveryAddress?.sector || activeDeliveryAddress?.area || 'Gandhinagar'}</span>
                      </div>
                      <div className="text-xs text-stone-500 truncate">
                        {activeDeliveryAddress?.addressLine1 || activeDeliveryAddress?.addressLine || 'Gandhinagar'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-[#0D6E44] text-xs font-bold border border-stone-200 transition-colors cursor-pointer shrink-0"
                  >
                    Change
                  </button>
                </div>

                {/* 1. Date & Slot Segmented Selector */}
                <OrderDateSlotSelector
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  selectedMealSlot={selectedMealSlot}
                  onMealSlotChange={setSelectedMealSlot}
                  availability={availability}
                  onSelectNextAvailable={handleSelectNextAvailable}
                />

                {/* 2. Today's Meal Showcase with Food Photography & What's Included */}
                <OrderMealShowcase
                  mealDetails={mealDetails}
                  basePrice={119}
                  onCustomizeClick={() => setIsCustomizingExpanded(!isCustomizingExpanded)}
                  isCustomizing={isCustomizingExpanded}
                />

                {/* 3. Multi-Meal & Quantity Customizer */}
                <MultiMealCustomizer
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  applySameCustomization={applySameCustomization}
                  onApplySameChange={setApplySameCustomization}
                  mealCustomizations={mealCustomizations}
                  onCustomizationsChange={setMealCustomizations}
                  mealDetails={mealDetails}
                  isExpanded={isCustomizingExpanded}
                  onToggleExpand={() => setIsCustomizingExpanded(!isCustomizingExpanded)}
                />

                {/* 4. Standalone Add-ons */}
                <AddOnSelector
                  selectedAddons={selectedAddons}
                  onAddonToggle={handleAddonToggle}
                />
              </div>
            )}

            {/* STEP 2: Delivery Slot & Address Selector */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Delivery Time Window */}
                <DeliverySlotSelector
                  slots={availability.availableSlots}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={setSelectedSlotId}
                  mealSlot={selectedMealSlot}
                />

                {/* Saved / New Address */}
                <AddressSelector
                  selectedAddress={selectedAddress}
                  onSelectAddress={setSelectedAddress}
                />
              </div>
            )}

            {/* STEP 3: Payment Method & Review */}
            {currentStep === 3 && (
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-stone-150 pb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-[#0D6E44] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Step 3 of 3
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                    Select Payment Method
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Fast, encrypted checkout • 100% money-back quality guarantee
                  </p>
                </div>

                {/* Payment Option Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* UPI Button */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'UPI'
                        ? 'bg-emerald-50/70 border-[#0D6E44] ring-2 ring-[#0D6E44]/20 shadow-sm'
                        : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className={`w-4 h-4 ${paymentMethod === 'UPI' ? 'text-[#0D6E44]' : 'text-stone-500'}`} />
                      <span className="text-xs font-black text-stone-900">Instant UPI</span>
                    </div>
                    <span className="text-[10px] text-stone-500 mt-2 block">GPay / PhonePe / Paytm</span>
                  </button>

                  {/* Card / NetBanking */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'Card'
                        ? 'bg-emerald-50/70 border-[#0D6E44] ring-2 ring-[#0D6E44]/20 shadow-sm'
                        : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className={`w-4 h-4 ${paymentMethod === 'Card' ? 'text-[#0D6E44]' : 'text-stone-500'}`} />
                      <span className="text-xs font-black text-stone-900">Cards / NetBanking</span>
                    </div>
                    <span className="text-[10px] text-stone-500 mt-2 block">Debit / Credit / NetBanking</span>
                  </button>

                  {/* Cash On Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CashOnDelivery')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === 'CashOnDelivery'
                        ? 'bg-emerald-50/70 border-[#0D6E44] ring-2 ring-[#0D6E44]/20 shadow-sm'
                        : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Banknote className={`w-4 h-4 ${paymentMethod === 'CashOnDelivery' ? 'text-[#0D6E44]' : 'text-stone-500'}`} />
                      <span className="text-xs font-black text-stone-900">Cash on Delivery</span>
                    </div>
                    <span className="text-[10px] text-stone-500 mt-2 block">Pay upon meal arrival</span>
                  </button>
                </div>

                {/* UPI App Selection or QR */}
                {paymentMethod === 'UPI' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="text-xs font-black text-stone-800 uppercase tracking-wider block">
                      Choose UPI App
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['gpay', 'phonepe', 'paytm', 'other'] as const).map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setUpiApp(app)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            upiApp === app
                              ? 'bg-[#0D6E44] text-white border-[#0D6E44]'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {app === 'gpay' && 'Google Pay'}
                          {app === 'phonepe' && 'PhonePe'}
                          {app === 'paytm' && 'Paytm'}
                          {app === 'other' && 'Any UPI ID'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary for Desktop */}
          <div className="hidden lg:block lg:col-span-4">
            <OrderSummaryDesktop
              mealDetails={mealDetails}
              dateLabel={dateLabel}
              mealSlot={selectedMealSlot}
              pricing={pricing}
              selectedSlot={currentSlot}
              selectedAddress={selectedAddress}
              currentStep={currentStep}
              onContinue={handleNextStep}
              isSubmitting={isSubmitting}
              isAvailable={availability.isAvailable}
            />
          </div>
        </div>

        {/* MOBILE STICKY BOTTOM BAR & DRAWER */}
        <OrderSummaryMobile
          mealDetails={mealDetails}
          dateLabel={dateLabel}
          mealSlot={selectedMealSlot}
          pricing={pricing}
          selectedSlot={currentSlot}
          selectedAddress={selectedAddress}
          currentStep={currentStep}
          onContinue={handleNextStep}
          isSubmitting={isSubmitting}
          isAvailable={availability.isAvailable}
        />
      </div>
    </main>
  );
};
