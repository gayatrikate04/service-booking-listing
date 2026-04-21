'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StarRating } from '@/components/ui/StarRating';
import { formatPrice, getInitials } from '@/utils/format';

export function ProviderCard({ provider }) {
  const {
    id, full_name, city, avg_rating, total_reviews,
    is_verified, is_featured, category, price_per_hour,
    price_unit, image,
  } = provider;

  return (
    <Link href={`/providers/${id}`} className="block group">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5">

        {/* ── Image ── */}
        <div className="relative w-full h-[108px] bg-gray-100 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={full_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-2xl font-semibold text-gray-300">
                {getInitials(full_name)}
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Featured badge */}
          {is_featured && (
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-semibold bg-black text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
                Featured
              </span>
            </div>
          )}

          {/* Verified badge */}
          {is_verified && (
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-medium bg-white/90 text-gray-700 border border-gray-200 px-2 py-1 rounded-full">
                ✓ Verified
              </span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-4">

          {/* Category */}
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            {category}
          </p>

          {/* Name */}
          <h3 className="text-sm font-semibold text-black leading-snug truncate mb-2">
            {full_name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating rating={avg_rating} size="sm" />
            <span className="text-xs font-medium text-black">
              {Number(avg_rating).toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({total_reviews})</span>
          </div>

          {/* Location */}
          <p className="text-xs text-gray-400 truncate mb-3">📍 {city}</p>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-semibold text-black leading-tight">
                {formatPrice(price_per_hour)}
              </p>
              <p className="text-[11px] text-gray-400">/ {price_unit}</p>
            </div>

            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="px-3.5 py-2 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}