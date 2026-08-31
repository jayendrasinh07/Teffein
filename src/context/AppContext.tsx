import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  UserRole, 
  CustomerSegment, 
  PlanDuration, 
  MealSlot, 
  DietType, 
  PortionSize,
  UserSubscription,
  MealTraceabilityInfo,
  CustomerFeedback,
  KitchenBatch,
  CorporateAccount,
  OneTimeOrder,
  OrderStatus,
  LocationState,
  NotificationPermissionState,
  DeliveryAddress,
  DetectedLocation,
  ServiceabilityResult,
  CentralLocationState,
  AddressLabel
} from '../types';
import { 
  INITIAL_USER_SUBSCRIPTION, 
  MOCK_TRACEABILITY_MEAL, 
  CUSTOMER_FEEDBACKS, 
  MOCK_KITCHEN_BATCHES,
  MOCK_CORPORATE_ACCOUNTS,
  MEAL_PLANS
} from '../data/config';
import { INITIAL_ONE_TIME_ORDERS } from '../data/orders';
import { checkMealAvailability } from '../services/availabilityEngine';
import { permissionManager } from '../services/permissionService';
import { 
  reverseGeocodeCoordinates, 
  evaluateLocationServiceability,
  getCachedLocation, 
  setCachedLocation, 
  getSavedAddresses, 
  saveAddressesToStorage,
  DEFAULT_SAVED_ADDRESSES,
  checkAreaServiceability,
  calculateDeliveryFeeForZone,
  getInitialCentralLocationState,
  validateOrderPayload,
  getDefaultAddressId
} from '../services/locationService';

export type ActiveTab = 
  // Public
  | 'home' 
  | 'how_it_works' 
  | 'meal_plans' 
  | 'todays_menu' 
  | 'order_once'
  | 'students' 
  | 'workers' 
  | 'corporate' 
  | 'about_us' 
  | 'quality_hygiene' 
  | 'quality_standards'
  | 'why_us'
  | 'coverage'
  | 'faq' 
  | 'contact'
  // Customer
  | 'customer_dashboard'
  | 'my_subscription'
  | 'meal_preferences'
  | 'delivery_tracking'
  | 'order_history'
  | 'profile'
  | 'traceability'
  // Business / Admin
  | 'admin_dashboard'
  | 'kitchen_dashboard'
  | 'delivery_dashboard'
  | 'corporate_admin_dashboard'
  | 'customer_management'
  | 'subscription_management'
  | 'meal_planning'
  | 'kitchen_operations'
  | 'delivery_clusters'
  | 'corporate_accounts'
  | 'feedback_analytics'
  | 'revenue_overview';

interface ToastState {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  subscription: UserSubscription;
  setSubscription: React.Dispatch<React.SetStateAction<UserSubscription>>;
  
  // One-Time Ordering System
  oneTimeOrders: OneTimeOrder[];
  activeTrackingOrder: OneTimeOrder | null;
  setActiveTrackingOrder: (order: OneTimeOrder | null) => void;
  isOrderOnceModalOpen: boolean;
  setIsOrderOnceModalOpen: (open: boolean) => void;
  createOneTimeOrder: (orderData: Omit<OneTimeOrder, 'id' | 'createdAt' | 'traceabilityMealId'>) => Promise<OneTimeOrder>;
  reorderMeal: (orderId: string) => void;
  cancelOneTimeOrder: (orderId: string) => void;
  advanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;

  // Interactive Operations
  pauseSubscription: (daysCount?: number) => void;
  resumeSubscription: () => void;
  skipTomorrowMeal: (slot?: MealSlot) => void;
  unskipMeal: (date: string) => void;
  updatePreferences: (diet: DietType, portion: PortionSize, addons: UserSubscription['addons'], notes?: string) => void;
  updateDeliveryAddress: (address: UserSubscription['deliveryAddress']) => void;
  createNewSubscription: (planId: PlanDuration, segment: CustomerSegment, slot: MealSlot, diet: DietType, portion: PortionSize, address: UserSubscription['deliveryAddress'], addons: UserSubscription['addons']) => void;
  
  // Location & Address Intelligence System
  centralLocation: CentralLocationState;
  locationState: LocationState;
  setLocationState: (state: LocationState) => void;
  detectedLocation: DetectedLocation | null;
  setDetectedLocation: (loc: DetectedLocation | null) => void;
  activeDeliveryAddress: DeliveryAddress;
  setActiveDeliveryAddress: (address: DeliveryAddress) => void;
  defaultAddressId: string;
  savedAddresses: DeliveryAddress[];
  detectUserLocation: () => Promise<DetectedLocation | null>;
  simulateLocationCoordinates: (latitude: number, longitude: number, accuracy?: number) => Promise<DetectedLocation>;
  confirmDetectedAddress: (options?: { label?: AddressLabel; fullName?: string; phone?: string; addressLine1?: string }) => DeliveryAddress;
  selectDeliveryAddress: (address: DeliveryAddress) => void;
  saveDeliveryAddress: (address: DeliveryAddress) => void;
  deleteDeliveryAddress: (id: string) => void;
  setDefaultDeliveryAddress: (id: string) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  locationErrorMessage: string | null;
  setLocationErrorMessage: (msg: string | null) => void;
  
  // Notification Management
  notificationPermission: NotificationPermissionState;
  requestNotificationPermission: () => Promise<boolean>;
  sendOrderLiveNotification: (title: string, body: string) => void;

  // Modals & Triggers
  isSubscribeModalOpen: boolean;
  setIsSubscribeModalOpen: (open: boolean) => void;
  selectedPlanForCheckout: PlanDuration | null;
  setSelectedPlanForCheckout: (plan: PlanDuration | null) => void;
  openCheckoutForPlan: (planId: PlanDuration) => void;

  isTraceabilityModalOpen: boolean;
  setIsTraceabilityModalOpen: (open: boolean) => void;
  activeTraceabilityMeal: MealTraceabilityInfo;
  lookupMealTraceability: (mealId: string) => void;

  isCorporateModalOpen: boolean;
  setIsCorporateModalOpen: (open: boolean) => void;

  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;
  submitCustomerFeedback: (rating: number, comment: string, tags: string[]) => void;

  isAreaCheckerOpen: boolean;
  setIsAreaCheckerOpen: (open: boolean) => void;

  // Live Data
  feedbacks: CustomerFeedback[];
  kitchenBatches: KitchenBatch[];
  advanceKitchenBatch: (batchId: string) => void;
  corporateAccounts: CorporateAccount[];
  
  // Toasts
  toasts: ToastState[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('teffein_user_role');
    return (saved as UserRole) || 'guest';
  });
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem('teffein_sub');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USER_SUBSCRIPTION;
  });

  const [oneTimeOrders, setOneTimeOrders] = useState<OneTimeOrder[]>(() => {
    const saved = localStorage.getItem('teffein_onetime_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_ONE_TIME_ORDERS;
  });

  const [activeTrackingOrder, setActiveTrackingOrder] = useState<OneTimeOrder | null>(() => {
    return INITIAL_ONE_TIME_ORDERS[0] || null;
  });

  const [isOrderOnceModalOpen, setIsOrderOnceModalOpen] = useState<boolean>(false);

  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>(CUSTOMER_FEEDBACKS);
  const [kitchenBatches, setKitchenBatches] = useState<KitchenBatch[]>(MOCK_KITCHEN_BATCHES);
  const [corporateAccounts, setCorporateAccounts] = useState<CorporateAccount[]>(MOCK_CORPORATE_ACCOUNTS);
  const [activeTraceabilityMeal, setActiveTraceabilityMeal] = useState<MealTraceabilityInfo>(MOCK_TRACEABILITY_MEAL);

  // Location & Address Intelligence State
  const [centralLocation, setCentralLocation] = useState<CentralLocationState>(() => getInitialCentralLocationState());
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(() => getCachedLocation());
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>(() => getSavedAddresses());
  const [defaultAddressId, setDefaultAddressIdState] = useState<string>(() => getDefaultAddressId());
  const [activeDeliveryAddress, setActiveDeliveryAddress] = useState<DeliveryAddress>(() => {
    const addresses = getSavedAddresses();
    const defaultAddr = addresses.find((a) => a.isDefault);
    return defaultAddr || addresses[0] || DEFAULT_SAVED_ADDRESSES[0];
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);

  // Notification State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>(() => 
    permissionManager.checkNotificationPermission()
  );

  // Modals
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState<boolean>(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanDuration | null>(null);
  const [isTraceabilityModalOpen, setIsTraceabilityModalOpen] = useState<boolean>(false);
  const [isCorporateModalOpen, setIsCorporateModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [isAreaCheckerOpen, setIsAreaCheckerOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('teffein_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('teffein_sub', JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem('teffein_onetime_orders', JSON.stringify(oneTimeOrders));
  }, [oneTimeOrders]);

  useEffect(() => {
    saveAddressesToStorage(savedAddresses);
  }, [savedAddresses]);

  // Window scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ----------------------------------------------------
  // LOCATION & ADDRESS INTELLIGENCE ACTIONS
  // ----------------------------------------------------
  const processResolvedLocation = useCallback((resolved: DetectedLocation) => {
    setDetectedLocation(resolved);
    setCachedLocation(resolved);

    const zoneId = (resolved.serviceability?.zoneId || (resolved.isServiceable ? 'zone_a_core' : 'unserviceable')) as 'zone_a_core' | 'zone_b_extended' | 'zone_c_periphery' | 'unserviceable';
    const fee = calculateDeliveryFeeForZone(zoneId);

    setCentralLocation((prev) => ({
      ...prev,
      detectionStatus: 'detected',
      permissionStatus: 'granted',
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      accuracy: resolved.accuracy ?? null,
      detectedAt: resolved.timestamp,
      source: 'gps',
      city: resolved.city,
      area: resolved.area,
      sector: resolved.sector || resolved.area,
      pincode: resolved.pincode,
      formattedAddress: resolved.displayName,
      serviceable: resolved.isServiceable,
      deliveryZoneId: zoneId,
      deliveryFee: fee,
      isAddressConfirmed: false
    }));

    if (resolved.isServiceable) {
      setLocationState('serviceable');
      showToast('GPS Location Detected', `${resolved.displayName}. Confirm your address to activate cluster delivery.`, 'success');
    } else {
      setLocationState('not-serviceable');
      showToast('Outside Active Zone', resolved.serviceability?.message || `TEFFEIN is currently not delivering to ${resolved.displayName}.`, 'warning');
    }
  }, []);

  const detectUserLocation = useCallback(async (): Promise<DetectedLocation | null> => {
    setLocationState('requesting');
    setLocationErrorMessage(null);
    setDetectedLocation(null); // Clear stale location before new GPS request
    setCentralLocation((prev) => ({
      ...prev,
      detectionStatus: 'detecting',
      permissionStatus: 'granted'
    }));

    const geoResult = await permissionManager.requestLocationPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0 // Strictly fresh GPS coordinates
    });

    if (!geoResult.success || geoResult.latitude === undefined || geoResult.longitude === undefined) {
      const errType = geoResult.errorType || 'unavailable';
      setLocationState(errType);
      setLocationErrorMessage(geoResult.errorMessage || 'Unable to detect GPS location.');
      setCentralLocation((prev) => ({
        ...prev,
        detectionStatus: 'failed',
        permissionStatus: errType === 'permission-denied' ? 'denied' : prev.permissionStatus
      }));
      showToast('Location Detection', geoResult.errorMessage || 'Unable to detect GPS location. You can enter or select your area manually.', 'warning');
      return null;
    }

    console.log(
      'GPS RESULT\n' +
      `latitude: ${geoResult.latitude}\n` +
      `longitude: ${geoResult.longitude}\n` +
      `accuracy: ${geoResult.accuracy !== undefined ? `${geoResult.accuracy.toFixed(1)} meters` : 'N/A'}\n` +
      `timestamp: ${new Date().toISOString()}`
    );

    setLocationState('detecting');
    
    // Real Reverse Geocode coordinates without mock/hardcoded snapping
    const resolved = await reverseGeocodeCoordinates(geoResult.latitude, geoResult.longitude, geoResult.accuracy);
    console.log('Reverse geocoded address:', resolved.formattedAddress || resolved.displayName);
    console.log('Serviceability result:', resolved.serviceability);

    processResolvedLocation(resolved);
    return resolved;
  }, [processResolvedLocation, showToast]);

  const simulateLocationCoordinates = useCallback(async (latitude: number, longitude: number, accuracy?: number): Promise<DetectedLocation> => {
    setLocationState('detecting');
    setCentralLocation((prev) => ({
      ...prev,
      detectionStatus: 'detecting',
      permissionStatus: 'granted'
    }));

    const resolved = await reverseGeocodeCoordinates(latitude, longitude, accuracy);
    processResolvedLocation(resolved);
    return resolved;
  }, [processResolvedLocation]);

  const selectDeliveryAddress = useCallback((address: DeliveryAddress) => {
    setActiveDeliveryAddress(address);
    const fee = calculateDeliveryFeeForZone(address.zoneId);
    
    setCentralLocation((prev) => ({
      ...prev,
      isAddressConfirmed: true,
      confirmedAddress: address,
      selectedAddressId: address.id,
      source: address.source || 'saved',
      latitude: address.latitude ?? prev.latitude,
      longitude: address.longitude ?? prev.longitude,
      accuracy: address.accuracy ?? prev.accuracy,
      city: address.city || 'Gandhinagar',
      area: address.area,
      sector: address.sector || address.area,
      pincode: address.pincode,
      formattedAddress: address.addressLine1 || address.addressLine || `${address.area}, Gandhinagar`,
      deliveryZoneId: (address.zoneId || 'zone_a_core') as any,
      deliveryFee: fee,
      serviceable: address.isServiceable
    }));

    // Sync to subscription address
    setSubscription((prev) => ({
      ...prev,
      deliveryAddress: {
        street: address.addressLine1 || address.addressLine || '',
        area: address.area,
        sector: address.sector || address.area,
        pincode: address.pincode,
        landmark: address.landmark || '',
        clusterId: address.clusterId || 'cluster-a',
        deliveryTimeSlot: prev.deliveryAddress.deliveryTimeSlot
      }
    }));

    showToast('Delivery Location Selected', `${address.label}: ${address.area} (${address.pincode})`, 'info');
  }, []);

  const confirmDetectedAddress = useCallback((options?: { label?: AddressLabel; fullName?: string; phone?: string; addressLine1?: string }): DeliveryAddress => {
    const loc = detectedLocation;
    const nowIso = new Date().toISOString();

    if (!loc) {
      const fallback = activeDeliveryAddress;
      setCentralLocation((prev) => ({ ...prev, isAddressConfirmed: true, confirmedAddress: fallback }));
      return fallback;
    }

    const serviceCheck = loc.serviceability || evaluateLocationServiceability(loc.latitude, loc.longitude, loc.area, loc.city, loc.pincode);
    const zoneId = (serviceCheck.zoneId || (loc.isServiceable ? 'zone_a_core' : 'unserviceable')) as 'zone_a_core' | 'zone_b_extended' | 'zone_c_periphery';
    const fee = calculateDeliveryFeeForZone(zoneId);

    const newAddr: DeliveryAddress = {
      id: `addr-gps-${Date.now()}`,
      label: options?.label || 'Home',
      name: options?.fullName || activeDeliveryAddress.name || 'Jayendrasinh Parmar',
      fullName: options?.fullName || activeDeliveryAddress.fullName || 'Jayendrasinh Parmar',
      phone: options?.phone || activeDeliveryAddress.phone || '9825014820',
      addressLine1: options?.addressLine1 || loc.displayName || `${loc.sector || loc.area}`,
      addressLine: options?.addressLine1 || loc.displayName || `${loc.sector || loc.area}`,
      area: loc.area || 'Gandhinagar',
      sector: loc.sector || loc.area || 'Gandhinagar',
      city: loc.city || 'Gandhinagar',
      state: loc.state || 'Gujarat',
      pincode: loc.pincode || '',
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracy,
      source: 'gps',
      createdAt: nowIso,
      updatedAt: nowIso,
      isDefault: true,
      clusterId: serviceCheck.clusterId || 'cluster-a',
      clusterName: serviceCheck.clusterName || 'Gandhinagar Delivery Cluster',
      zoneId: zoneId as any,
      deliveryFee: fee,
      isServiceable: serviceCheck.isServiceable
    };

    setSavedAddresses((prev) => [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))]);
    setActiveDeliveryAddress(newAddr);
    setDefaultAddressIdState(newAddr.id);

    setCentralLocation((prev) => ({
      ...prev,
      isAddressConfirmed: true,
      confirmedAddress: newAddr,
      selectedAddressId: newAddr.id,
      source: 'gps',
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracy ?? null,
      city: newAddr.city,
      area: newAddr.area,
      sector: newAddr.sector || newAddr.area,
      pincode: newAddr.pincode,
      formattedAddress: newAddr.addressLine1,
      deliveryZoneId: zoneId,
      deliveryFee: fee,
      serviceable: newAddr.isServiceable
    }));

    showToast('Address Confirmed', `Delivery set to ${newAddr.label}: ${newAddr.sector || newAddr.area}`, 'success');
    return newAddr;
  }, [detectedLocation, activeDeliveryAddress]);

  const saveDeliveryAddress = useCallback((address: DeliveryAddress) => {
    setSavedAddresses((prev) => {
      const existingIdx = prev.findIndex((a) => a.id === address.id);
      let updated: DeliveryAddress[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = address;
      } else {
        updated = [address, ...prev];
      }

      if (address.isDefault) {
        updated = updated.map((a) => ({
          ...a,
          isDefault: a.id === address.id
        }));
        setDefaultAddressIdState(address.id);
      }
      return updated;
    });

    setActiveDeliveryAddress(address);
    const fee = calculateDeliveryFeeForZone(address.zoneId);

    setCentralLocation((prev) => ({
      ...prev,
      isAddressConfirmed: true,
      confirmedAddress: address,
      selectedAddressId: address.id,
      area: address.area,
      sector: address.sector || address.area,
      pincode: address.pincode,
      formattedAddress: address.addressLine1 || address.addressLine || `${address.area}, Gandhinagar`,
      deliveryZoneId: (address.zoneId || 'zone_a_core') as any,
      deliveryFee: fee,
      serviceable: address.isServiceable
    }));

    showToast('Address Saved', `${address.label} address has been saved for future orders.`, 'success');
  }, []);

  const deleteDeliveryAddress = useCallback((id: string) => {
    setSavedAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (activeDeliveryAddress.id === id && filtered.length > 0) {
        setActiveDeliveryAddress(filtered[0]);
        selectDeliveryAddress(filtered[0]);
      }
      return filtered;
    });
    showToast('Address Removed', 'Delivery address removed.', 'info');
  }, [activeDeliveryAddress.id, selectDeliveryAddress]);

  const setDefaultDeliveryAddress = useCallback((id: string) => {
    setSavedAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id
      }))
    );
    setDefaultAddressIdState(id);
    const target = savedAddresses.find((a) => a.id === id);
    if (target) {
      const updated = { ...target, isDefault: true };
      setActiveDeliveryAddress(updated);
      selectDeliveryAddress(updated);
      showToast('Default Address Set', `${target.label} is now your primary delivery address.`, 'success');
    }
  }, [savedAddresses, selectDeliveryAddress]);

  // ----------------------------------------------------
  // NOTIFICATION ACTIONS
  // ----------------------------------------------------
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    const state = await permissionManager.requestNotificationPermission();
    setNotificationPermission(state);
    if (state === 'granted') {
      showToast('Notifications Enabled', 'You will receive live updates when your meal is prepared, dispatched, and delivered.', 'success');
      permissionManager.sendOrderNotification('TEFFEIN Delivery Updates Active 🍲', {
        body: 'You will receive punctual status alerts for your lunch and dinner orders.'
      });
      return true;
    } else if (state === 'denied') {
      showToast('Notifications Blocked', 'You can still view live order tracking anytime on your dashboard.', 'info');
      return false;
    }
    return false;
  }, []);

  const sendOrderLiveNotification = useCallback((title: string, body: string) => {
    if (notificationPermission === 'granted') {
      permissionManager.sendOrderNotification(title, { body });
    }
  }, [notificationPermission]);

  // ONE TIME ORDER CREATION WITH IMMUTABLE ADDRESS SNAPSHOT & VALIDATION
  const createOneTimeOrder = async (
    orderData: Omit<OneTimeOrder, 'id' | 'createdAt' | 'traceabilityMealId'>
  ): Promise<OneTimeOrder> => {
    // 1. Server-side validation simulation
    const validation = validateOrderPayload({
      address: orderData.address,
      quantity: orderData.quantity,
      scheduledDate: orderData.scheduledDate,
      mealSlot: orderData.mealSlot,
      subtotal: orderData.subtotal,
      addOnsTotal: orderData.addOnsTotal,
      deliveryFee: orderData.deliveryFee,
      total: orderData.total
    });

    if (!validation.isValid && validation.errors.length > 0) {
      showToast('Order Verification Issue', validation.errors[0], 'warning');
    }

    const orderId = `TF${Math.floor(10000 + Math.random() * 90000)}`;
    const traceId = `GDM-${Math.floor(2000 + Math.random() * 8000)}`;
    const timeString = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // 2. Build order with immutable address snapshot
    const newOrder: OneTimeOrder = {
      ...orderData,
      id: orderId,
      createdAt: `${timeString}, ${orderData.scheduledDateLabel}`,
      traceabilityMealId: traceId,
      deliveryAddressSnapshot: validation.immutableAddressSnapshot,
      deliveryZoneId: validation.validatedDeliveryZoneId,
      deliveryFee: validation.validatedDeliveryFee
    };

    setOneTimeOrders((prev) => [newOrder, ...prev]);
    setActiveTrackingOrder(newOrder);

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // safe fallback
    }

    showToast(
      'Order Confirmed! 🍱',
      `Your meal #${orderId} is scheduled for ${orderData.scheduledDateLabel} (${orderData.deliverySlotLabel}).`,
      'success'
    );

    return newOrder;
  };

  const reorderMeal = (orderId: string) => {
    const prevOrder = oneTimeOrders.find((o) => o.id === orderId);
    if (!prevOrder) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const availability = checkMealAvailability({
      date: todayStr,
      mealSlot: prevOrder.mealSlot
    });

    if (availability.isAvailable) {
      createOneTimeOrder({
        ...prevOrder,
        scheduledDate: todayStr,
        scheduledDateLabel: 'Today',
        orderStatus: 'CONFIRMED',
        paymentStatus: 'PAID'
      });
      setActiveTab('order_history');
    } else if (availability.nextAvailable) {
      createOneTimeOrder({
        ...prevOrder,
        scheduledDate: availability.nextAvailable.date,
        scheduledDateLabel: availability.nextAvailable.dateLabel,
        mealSlot: availability.nextAvailable.mealSlot,
        deliverySlotLabel: availability.nextAvailable.timeWindow,
        orderStatus: 'CONFIRMED',
        paymentStatus: 'PAID'
      });
      showToast(
        'Reordered for Next Available Slot!',
        `Today's cutoff passed. Order scheduled for ${availability.nextAvailable.dateLabel} ${availability.nextAvailable.mealSlot}.`,
        'info'
      );
      setActiveTab('order_history');
    }
  };

  const cancelOneTimeOrder = (orderId: string) => {
    setOneTimeOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'CANCELLED', paymentStatus: 'REFUNDED' } : o))
    );
    showToast('Order Cancelled', `Order #${orderId} was cancelled. Refund initiated.`, 'info');
  };

  const advanceOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOneTimeOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: nextStatus } : o))
    );
    if (activeTrackingOrder && activeTrackingOrder.id === orderId) {
      setActiveTrackingOrder((prev) => (prev ? { ...prev, orderStatus: nextStatus } : null));
    }
  };

  const pauseSubscription = (daysCount = 3) => {
    const today = new Date().toISOString().split('T')[0];
    setSubscription((prev) => ({
      ...prev,
      status: 'paused',
      pausedDates: [...prev.pausedDates, today]
    }));
    showToast(
      'Subscription Paused',
      `Your subscription is safely paused. Your remaining ${subscription.daysRemaining} days are protected and will resume whenever you are ready.`,
      'info'
    );
  };

  const resumeSubscription = () => {
    setSubscription((prev) => ({
      ...prev,
      status: 'active'
    }));
    showToast(
      'Welcome Back!',
      'Your meal routine has resumed. Tomorrow’s fresh home meal will be dispatched on schedule.',
      'success'
    );
  };

  const skipTomorrowMeal = (slot: MealSlot = 'lunch') => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    setSubscription((prev) => {
      const alreadySkipped = prev.skippedDates.includes(tomorrowStr);
      if (alreadySkipped) return prev;
      return {
        ...prev,
        skippedDates: [...prev.skippedDates, tomorrowStr],
        daysRemaining: prev.daysRemaining + 1 // rollover credit day!
      };
    });

    showToast(
      'Tomorrow’s Meal Skipped',
      `Meal for ${tomorrowStr} (${slot}) skipped. We added +1 day credit to your subscription balance!`,
      'warning'
    );
  };

  const unskipMeal = (dateStr: string) => {
    setSubscription((prev) => ({
      ...prev,
      skippedDates: prev.skippedDates.filter((d) => d !== dateStr),
      daysRemaining: Math.max(1, prev.daysRemaining - 1)
    }));
    showToast('Meal Restored', `Meal on ${dateStr} is back on your active delivery schedule.`, 'success');
  };

  const updatePreferences = (diet: DietType, portion: PortionSize, addons: UserSubscription['addons'], notes?: string) => {
    setSubscription((prev) => ({
      ...prev,
      dietType: diet,
      portionSize: portion,
      addons,
      specialInstructions: notes !== undefined ? notes : prev.specialInstructions
    }));
    showToast('Preferences Saved', 'Your kitchen kitchen profile and spice preferences have been updated.', 'success');
  };

  const updateDeliveryAddress = (address: UserSubscription['deliveryAddress']) => {
    setSubscription((prev) => ({
      ...prev,
      deliveryAddress: address
    }));
    showToast('Address Updated', `Delivery cluster assigned: ${address.clusterId}. Delivery window updated.`, 'success');
  };

  const openCheckoutForPlan = (planId: PlanDuration) => {
    setSelectedPlanForCheckout(planId);
    setIsSubscribeModalOpen(true);
  };

  const createNewSubscription = (
    planId: PlanDuration,
    segment: CustomerSegment,
    slot: MealSlot,
    diet: DietType,
    portion: PortionSize,
    address: UserSubscription['deliveryAddress'],
    addons: UserSubscription['addons']
  ) => {
    const planObj = MEAL_PLANS.find((p) => p.id === planId) || MEAL_PLANS[2];
    const newSub: UserSubscription = {
      id: `SUB-GJ-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: 'USR-892',
      userName: 'Aarav Patel',
      userPhone: '+91 98254 99120',
      userEmail: 'aarav.patel.pdpu@gmail.com',
      userSegment: segment,
      planId: planId,
      planName: planObj.name,
      slot: slot,
      dietType: diet,
      portionSize: portion,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + planObj.totalMeals * 86400000).toISOString().split('T')[0],
      totalDays: planObj.totalMeals,
      daysRemaining: planObj.totalMeals,
      mealsDeliveredCount: 0,
      pausedDates: [],
      skippedDates: [],
      deliveryAddress: address,
      addons: addons
    };

    setSubscription(newSub);
    setIsSubscribeModalOpen(false);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    showToast(
      'Meal Plan Activated!',
      `Congratulations! Your ${planObj.name} is active. Your first hot meal arrives tomorrow between ${address.deliveryTimeSlot}.`,
      'success'
    );

    setActiveTab('customer_dashboard');
  };

  const lookupMealTraceability = (mealId: string) => {
    if (mealId.toUpperCase() === 'GDM-2841' || !mealId) {
      setActiveTraceabilityMeal(MOCK_TRACEABILITY_MEAL);
    } else {
      setActiveTraceabilityMeal({
        ...MOCK_TRACEABILITY_MEAL,
        mealId: mealId.toUpperCase(),
        preparedTime: '10:15 AM',
        packedTime: '10:48 AM',
        dispatchTime: '11:10 AM',
        deliveredTime: '12:05 PM',
        currentStatus: 'delivered'
      });
    }
    setIsTraceabilityModalOpen(true);
  };

  const submitCustomerFeedback = (rating: number, comment: string, tags: string[]) => {
    const newFb: CustomerFeedback = {
      id: `FB-${Math.random().toString(36).substring(2, 6)}`,
      customerName: subscription.userName || 'Aarav Patel',
      customerRole: 'Subscriber, Gandhinagar',
      sectorOrArea: `${subscription.deliveryAddress.area}, Gandhinagar`,
      mealId: 'GDM-2841',
      date: 'Just now',
      rating,
      comment,
      positiveTags: tags,
      isFeaturedTestimonial: true
    };
    setFeedbacks((prev) => [newFb, ...prev]);
    setIsFeedbackModalOpen(false);
    showToast('Feedback Received!', 'Thank you! Your feedback goes straight to the head chef for tomorrow’s preparation.', 'success');
  };

  const advanceKitchenBatch = (batchId: string) => {
    setKitchenBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        if (b.status === 'in_prep') {
          return { ...b, status: 'packing', preparedCount: b.targetCount };
        } else if (b.status === 'packing') {
          return { ...b, status: 'dispatching', packedCount: b.preparedCount };
        } else if (b.status === 'dispatching') {
          return { ...b, status: 'completed', dispatchedCount: b.packedCount };
        }
        return b;
      })
    );
    showToast('Kitchen Batch Advanced', `Batch ${batchId} status successfully updated.`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userRole,
        setUserRole,
        subscription,
        setSubscription,
        oneTimeOrders,
        activeTrackingOrder,
        setActiveTrackingOrder,
        isOrderOnceModalOpen,
        setIsOrderOnceModalOpen,
        createOneTimeOrder,
        reorderMeal,
        cancelOneTimeOrder,
        advanceOrderStatus,
        pauseSubscription,
        resumeSubscription,
        skipTomorrowMeal,
        unskipMeal,
        updatePreferences,
        updateDeliveryAddress,
        createNewSubscription,
        isSubscribeModalOpen,
        setIsSubscribeModalOpen,
        selectedPlanForCheckout,
        setSelectedPlanForCheckout,
        openCheckoutForPlan,
        isTraceabilityModalOpen,
        setIsTraceabilityModalOpen,
        activeTraceabilityMeal,
        lookupMealTraceability,
        isCorporateModalOpen,
        setIsCorporateModalOpen,
        isFeedbackModalOpen,
        setIsFeedbackModalOpen,
        submitCustomerFeedback,
        isAreaCheckerOpen,
        setIsAreaCheckerOpen,
        feedbacks,
        kitchenBatches,
        advanceKitchenBatch,
        corporateAccounts,
        toasts,
        showToast,
        removeToast,
        // Location & Address Intelligence
        centralLocation,
        locationState,
        setLocationState,
        detectedLocation,
        setDetectedLocation,
        activeDeliveryAddress,
        setActiveDeliveryAddress,
        defaultAddressId,
        savedAddresses,
        detectUserLocation,
        confirmDetectedAddress,
        selectDeliveryAddress,
        saveDeliveryAddress,
        deleteDeliveryAddress,
        setDefaultDeliveryAddress,
        isLocationModalOpen,
        setIsLocationModalOpen,
        locationErrorMessage,
        setLocationErrorMessage,
        // Notifications
        notificationPermission,
        requestNotificationPermission,
        sendOrderLiveNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
