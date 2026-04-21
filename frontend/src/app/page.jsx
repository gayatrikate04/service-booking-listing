// import Link from 'next/link';
// import { Navbar } from '@/components/layout/Navbar';
// import { ProviderCard } from '@/components/provider/ProviderCard';
// import { MOCK_CATEGORIES, MOCK_PROVIDERS } from '@/data/mock';
// Landing page is a Server Component — no 'use client' needed.
// Navbar is client because it reads Zustand, but this shell is server.

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ProviderCard } from "@/components/provider/ProviderCard";
import { MOCK_CATEGORIES, MOCK_PROVIDERS } from "@/data/mock";

export default function LandingPage() {
  const featured = MOCK_PROVIDERS.filter((p) => p.is_featured).slice(0, 3);
 

  return (
    
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-white border-b border-gray-200 py-20 px-6">
        <div className="max-w-xl mx-auto text-center">

          <span className="inline-block text-[11px] font-medium text-gray-400 uppercase tracking-widest border border-gray-200 rounded-full px-4 py-1.5 mb-5">
            Trusted by 10,000+ customers
          </span>

          <h1 className="text-3xl sm:text-4xl font-semibold text-black leading-tight tracking-tight mb-4">
            Find trusted local<br />service professionals
          </h1>

          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed mb-8">
            Book vetted home services, wellness, tutoring, and more —
            instantly and reliably.
          </p>

          {/* Search bar */}
          <div className="flex max-w-md mx-auto bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <input
              type="text"
              placeholder="What service are you looking for?"
              className="flex-1 px-4 py-3 text-sm text-black placeholder-gray-400 bg-white outline-none"
            />
            <Link
              href="/providers"
              className="px-5 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center whitespace-nowrap rounded-r-xl"
            >
              Search
            </Link>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['Home Cleaning', 'Plumbing', 'Electrical', 'Pet Care', 'Tutoring'].map((s) => (
              <Link
                key={s}
                href={`/providers?q=${encodeURIComponent(s)}`}
                className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:border-gray-400 hover:text-black hover:bg-gray-50 transition-all duration-200"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-black tracking-tight">
              Browse by category
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Find the right professional for any job
            </p>
          </div>
          <Link
            href="/providers"
            className="text-xs font-medium text-gray-500 hover:text-black transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MOCK_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/providers?categoryId=${cat.id}`}
              className="group bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:border-gray-400 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
            >
              <div className="text-2xl mb-3">{cat.icon}</div>
              <p className="text-sm font-medium text-black">{cat.name}</p>
              <p className="text-xs text-gray-400 mt-1">{cat.count} providers</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PROVIDERS ── */}
      <section className="border-t border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-black tracking-tight">
                Featured providers
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Top-rated professionals in your area
              </p>
            </div>
            <Link
              href="/providers"
              className="text-xs font-medium text-gray-500 hover:text-black transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featured.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="border-t border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-xl font-semibold text-black tracking-tight mb-1">
              How it works
            </h2>
            <p className="text-xs text-gray-500">
              Three simple steps to get the service you need
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🔍', step: '01', title: 'Search & Filter', text: 'Browse verified providers by category, location, price, and ratings.' },
              { icon: '📅', step: '02', title: 'Book Instantly',  text: 'Choose a service, pick a date and time slot, confirm in minutes.' },
              { icon: '⭐', step: '03', title: 'Rate & Review',   text: 'After your service, share your experience to help the community.' },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center"
              >
                <div className="w-11 h-11 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                  Step {item.step}
                </p>
                <h3 className="text-sm font-semibold text-black mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              ['10,000+', 'Happy Customers'],
              ['500+',    'Verified Providers'],
              ['4.8★',    'Average Rating'],
              ['24/7',    'Support Available'],
            ].map(([num, label]) => (
              <div key={label}>
                <div className="text-2xl font-semibold text-black tracking-tight">{num}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BECOME PROVIDER CTA ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
          <div className="text-3xl mb-4">🔧</div>
          <h2 className="text-xl font-semibold text-black tracking-tight mb-2">
            Are you a service professional?
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto mb-6">
            Join thousands of providers earning more with ServiceBook.
            Set your own hours, grow your client base.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Become a Provider →
          </Link>
        </div>
      </section>
    </div>
  );
}
