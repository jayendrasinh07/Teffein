import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRAND_CONFIG } from '../data/config';
import { MapPin, Phone, Mail, MessageSquare, Send, Clock, Building2, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [queryType, setQueryType] = useState('subscription_support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast(
      'Message Received',
      `Thank you ${name}! Our Gandhinagar team will reply within 30 minutes.`,
      'success'
    );
  };

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#0D6E44] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            Gandhinagar Kitchen & Support Hub
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 mt-4 tracking-tight">
            Get in Touch with TEFFEIN
          </h1>
          <p className="text-stone-600 text-base mt-3 leading-relaxed">
            Have questions about custom plans, corporate orders, or delivery timing in your sector? We’re always here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-stone-200 space-y-4">
              <h3 className="font-bold text-lg text-stone-900">Direct Contact Details</h3>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-stone-900">Central Steam Kitchen:</span>
                    <span>{BRAND_CONFIG.location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-stone-900">Helpline / WhatsApp:</span>
                    <span>{BRAND_CONFIG.phone} (Daily 7:00 AM – 9:30 PM)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-stone-900">Official Email:</span>
                    <span>{BRAND_CONFIG.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-stone-900">Kitchen Operations:</span>
                    <span>Morning Shift: 6:00 AM – 2:00 PM | Evening Shift: 4:30 PM – 9:30 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Action */}
            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200">
              <h4 className="font-bold text-sm text-emerald-950 mb-1">Instant WhatsApp Assistance</h4>
              <p className="text-xs text-emerald-800 mb-4">
                Chat directly with our meal coordinator for immediate subscription assistance or address updates.
              </p>
              <a
                href={`https://wa.me/${(BRAND_CONFIG.whatsapp || '').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp Chat</span>
              </a>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Message Sent Successfully!</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Thank you for reaching out. We will get back to you shortly at {phone || email}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-bold text-lg text-stone-900 mb-2">Send Us an Enquiry</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priyesh Patel"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98790 XXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Enquiry Type</label>
                      <select
                        value={queryType}
                        onChange={(e) => setQueryType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        <option value="subscription_support">Personal Subscription Support</option>
                        <option value="corporate_catering">Corporate / Office Bulk Catering</option>
                        <option value="hostel_tieup">Hostel / PG Warden Tie-up</option>
                        <option value="dietary_customization">Dietary / Jain Satvik Query</option>
                        <option value="general">Other Question</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Your Message / Requirements</label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your requirements, specific Gandhinagar sector, or meal questions..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#107048] hover:bg-[#0A4E32] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Gandhinagar Team</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
