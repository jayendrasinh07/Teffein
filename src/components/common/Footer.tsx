import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UtensilsCrossed, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Heart, 
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { BRAND_CONFIG } from '../../data/config';

export const Footer: React.FC = () => {
  const { setActiveTab, setIsCorporateModalOpen, setIsAreaCheckerOpen, setIsSubscribeModalOpen } = useApp();

  return (
    <footer className="bg-[#151C18] text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0D6E44] to-[#08482C] flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
                <span className="font-black text-xl text-amber-300 font-mono">T</span>
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-white font-sans">
                  TEFF<span className="text-emerald-400">EIN</span>
                </span>
                <p className="text-xs text-stone-400 font-medium">Roz ka khana. Sahi khana.</p>
              </div>
            </div>

            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              Modern healthy home-food subscription platform for students, workers, and professionals in Gandhinagar, Gujarat. Freshly cooked, controlled oil, punctual cluster delivery.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-stone-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Central Kitchen: Sector 25 GIDC Estate, Gandhinagar - 382024, Gujarat, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Lunch: 12:00 – 1:00 PM • Dinner: 7:30 – 8:30 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Helpline: {BRAND_CONFIG.phone} (7:00 AM – 9:30 PM)</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700/80 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{BRAND_CONFIG.fssaiNumber}</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Public Pages</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-emerald-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('todays_menu')} className="hover:text-emerald-400 transition-colors">
                  Weekly Rotating Menu
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('meal_plans')} className="hover:text-emerald-400 transition-colors">
                  Subscription Plans & Pricing
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('how_it_works')} className="hover:text-emerald-400 transition-colors">
                  How It Works (4-Step Flow)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('quality_hygiene')} className="hover:text-emerald-400 transition-colors">
                  Food Quality & Hygiene
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about_us')} className="hover:text-emerald-400 transition-colors">
                  About TEFFEIN
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('faq')} className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Target Segments */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Target Solutions</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => setActiveTab('students')} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>For Students & PGs</span>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.5 rounded">Popular</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('workers')} className="hover:text-emerald-400 transition-colors">
                  For Workers & Employees
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('corporate')} className="hover:text-emerald-400 transition-colors">
                  For Companies & Factories (B2B)
                </button>
              </li>
              <li>
                <button onClick={() => setIsAreaCheckerOpen(true)} className="hover:text-emerald-400 transition-colors">
                  Gandhinagar Area Coverage
                </button>
              </li>
              <li>
                <button onClick={() => setIsCorporateModalOpen(true)} className="hover:text-emerald-400 transition-colors">
                  Request Corporate Demo
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('contact')} className="hover:text-emerald-400 transition-colors">
                  Contact Support Team
                </button>
              </li>
            </ul>
          </div>

          {/* Operational Portals (Admin & Operations) */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-white">Platform Portals</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => setActiveTab('customer_dashboard')} className="hover:text-emerald-400 transition-colors">
                  Customer Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('my_subscription')} className="hover:text-emerald-400 transition-colors">
                  My Subscription Manager
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('meal_preferences')} className="hover:text-emerald-400 transition-colors">
                  Meal Preferences & Diet
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('delivery_tracking')} className="hover:text-emerald-400 transition-colors">
                  Cluster Route Tracking
                </button>
              </li>
              <li className="pt-2 border-t border-stone-800">
                <button onClick={() => setActiveTab('admin_dashboard')} className="text-rose-400 hover:text-rose-300 transition-colors font-medium">
                  Admin Analytics Hub
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('kitchen_operations')} className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  Kitchen Production Ops
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('corporate_accounts')} className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                  Corporate B2B Accounts
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>© 2026 TEFFEIN Technologies Pvt. Ltd.</span>
            <span>•</span>
            <span>Gandhinagar, Gujarat</span>
            <span>•</span>
            <span className="text-stone-400 font-medium">Vision: {BRAND_CONFIG.vision}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-stone-400 flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for healthy routines in Gujarat
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
