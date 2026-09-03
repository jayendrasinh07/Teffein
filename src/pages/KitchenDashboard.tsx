import React from 'react';
import { ChefHat } from 'lucide-react';

// Activate the real queue only after the separately verified Kitchen migration.
export const KitchenDashboard: React.FC = () => (
  <div className="min-h-[60vh] bg-[#FAF8F5] px-4 py-12">
    <div className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-white p-8">
      <ChefHat className="mb-4 h-8 w-8 text-[#0D6E44]" />
      <h1 className="text-2xl font-black text-stone-900">Kitchen workspace</h1>
      <p className="mt-3 text-sm text-stone-600">
        Kitchen order management is being set up. Live preparation counts and order status controls will appear here when it is ready.
      </p>
    </div>
  </div>
);
