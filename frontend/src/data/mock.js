// All shapes match your backend response format exactly.
// When connecting to real API, delete these and use the service files.

export  const MOCK_CATEGORIES = [
  { id: 1, name: 'Home Cleaning',    slug: 'home-cleaning',   icon: '🧹', count: 48 },
  { id: 2, name: 'Plumbing',         slug: 'plumbing',        icon: '🔧', count: 23 },
  { id: 3, name: 'Electrical',       slug: 'electrical',      icon: '⚡', count: 31 },
  { id: 4, name: 'Landscaping',      slug: 'landscaping',     icon: '🌿', count: 19 },
  { id: 5, name: 'Wellness & Spa',   slug: 'wellness-spa',    icon: '💆', count: 12 },
  { id: 6, name: 'Tutoring',         slug: 'tutoring',        icon: '📚', count: 27 },
  { id: 7, name: 'Pet Care',         slug: 'pet-care',        icon: '🐾', count: 35 },
  { id: 8, name: 'Moving & Storage', slug: 'moving-storage',  icon: '📦', count: 14 },
];

export const MOCK_PROVIDERS = [
  {
    id: 1, full_name: 'Sparkle Clean Services',
    city: 'Downtown, New York',   avg_rating: 4.9, total_reviews: 234,
    is_verified: true,  is_featured: true,
    category: 'Home Cleaning',    category_id: 1,
    price_per_hour: 45, price_unit: 'hr',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=280&fit=crop',
    bio: 'Professional home cleaning with eco-friendly products. Licensed, insured, and background-checked.',
    years_exp: 8, total_bookings: 312,
    services: [
      { id: 1, name: 'Deep Cleaning',     price_per_hour: 55 },
      { id: 2, name: 'Regular Cleaning',  price_per_hour: 45 },
      { id: 3, name: 'Move-out Cleaning', price_per_hour: 75 },
    ],
  },
  {
    id: 2, full_name: 'Pro Plumbing Solutions',
    city: 'Brooklyn, New York',   avg_rating: 4.8, total_reviews: 319,
    is_verified: true,  is_featured: false,
    category: 'Plumbing',         category_id: 2,
    price_per_hour: 75, price_unit: 'hr',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=280&fit=crop',
    bio: 'Licensed plumber with 12 years of experience in residential and commercial plumbing.',
    years_exp: 12, total_bookings: 280,
    services: [
      { id: 4, name: 'Pipe Repair',    price_per_hour: 75 },
      { id: 5, name: 'Drain Cleaning', price_per_hour: 60 },
      { id: 6, name: 'Water Heater',   price_per_hour: 90 },
    ],
  },
  {
    id: 3, full_name: 'Green Thumb Landscaping',
    city: 'Queens, New York',     avg_rating: 4.7, total_reviews: 758,
    is_verified: true,  is_featured: true,
    category: 'Landscaping',      category_id: 4,
    price_per_hour: 60, price_unit: 'hr',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=280&fit=crop',
    bio: 'Transform your outdoor space with professional landscaping and garden design services.',
    years_exp: 6, total_bookings: 195,
    services: [
      { id: 7, name: 'Lawn Mowing',   price_per_hour: 45 },
      { id: 8, name: 'Garden Design', price_per_hour: 80 },
      { id: 9, name: 'Tree Trimming', price_per_hour: 60 },
    ],
  },
  {
    id: 4, full_name: 'Zen Wellness Spa',
    city: 'Manhattan, New York',  avg_rating: 4.9, total_reviews: 202,
    is_verified: true,  is_featured: false,
    category: 'Wellness & Spa',   category_id: 5,
    price_per_hour: 120, price_unit: 'session',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=280&fit=crop',
    bio: 'Luxury spa treatments in the comfort of your home. Certified therapists with 10 years experience.',
    years_exp: 10, total_bookings: 421,
    services: [
      { id: 10, name: 'Swedish Massage', price_per_hour: 120 },
      { id: 11, name: 'Hot Stone',       price_per_hour: 150 },
      { id: 12, name: 'Aromatherapy',    price_per_hour: 100 },
    ],
  },
  {
    id: 5, full_name: 'Elite Electrical Co.',
    city: 'Bronx, New York',      avg_rating: 4.6, total_reviews: 98,
    is_verified: false, is_featured: false,
    category: 'Electrical',       category_id: 3,
    price_per_hour: 85, price_unit: 'hr',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=280&fit=crop',
    bio: 'Certified electrician for residential and commercial electrical work. 15 years experience.',
    years_exp: 15, total_bookings: 167,
    services: [
      { id: 13, name: 'Wiring',         price_per_hour: 85 },
      { id: 14, name: 'Panel Upgrade',  price_per_hour: 110 },
      { id: 15, name: 'Outlet Install', price_per_hour: 65 },
    ],
  },
  {
    id: 6, full_name: 'Paws & Claws Pet Care',
    city: 'Harlem, New York',     avg_rating: 4.8, total_reviews: 287,
    is_verified: true,  is_featured: false,
    category: 'Pet Care',         category_id: 7,
    price_per_hour: 35, price_unit: 'hr',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=280&fit=crop',
    bio: 'Loving and professional pet care and grooming. Certified animal handlers.',
    years_exp: 5, total_bookings: 388,
    services: [
      { id: 16, name: 'Dog Walking',  price_per_hour: 25 },
      { id: 17, name: 'Pet Grooming', price_per_hour: 55 },
      { id: 18, name: 'Pet Sitting',  price_per_hour: 35 },
    ],
  },
  {
    id: 7, full_name: 'Academic Excellence Tutoring',
    city: 'Upper East Side, NY',  avg_rating: 4.9, total_reviews: 178,
    is_verified: true,  is_featured: false,
    category: 'Tutoring',         category_id: 6,
    price_per_hour: 55, price_unit: 'hr',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=280&fit=crop',
    bio: 'Expert tutors for K-12 and college prep with proven results.',
    years_exp: 9, total_bookings: 241,
    services: [
      { id: 19, name: 'Math Tutoring',    price_per_hour: 55 },
      { id: 20, name: 'SAT Prep',         price_per_hour: 70 },
      { id: 21, name: 'Science Tutoring', price_per_hour: 55 },
    ],
  },
  {
    id: 8, full_name: 'Swift Movers & Packers',
    city: 'Staten Island, NY',    avg_rating: 4.5, total_reviews: 142,
    is_verified: true,  is_featured: false,
    category: 'Moving & Storage', category_id: 8,
    price_per_hour: 150, price_unit: 'hr',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop',
    bio: 'Fast, reliable moving services for homes and offices. Fully insured.',
    years_exp: 7, total_bookings: 299,
    services: [
      { id: 22, name: 'Local Move',      price_per_hour: 150 },
      { id: 23, name: 'Packing Service', price_per_hour: 80 },
      { id: 24, name: 'Storage',         price_per_hour: 50 },
    ],
  },
  {
    id: 9, full_name: 'Crystal Clear Windows',
    city: 'Chelsea, New York',    avg_rating: 4.7, total_reviews: 69,
    is_verified: false, is_featured: false,
    category: 'Home Cleaning',    category_id: 1,
    price_per_hour: 40, price_unit: 'hr',
    image: 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=400&h=280&fit=crop',
    bio: 'Streak-free window cleaning for homes and businesses.',
    years_exp: 4, total_bookings: 156,
    services: [
      { id: 25, name: 'Interior Windows', price_per_hour: 40 },
      { id: 26, name: 'Exterior Windows', price_per_hour: 50 },
      { id: 27, name: 'Full Package',     price_per_hour: 75 },
    ],
  },
];

export const MOCK_REVIEWS = {
  1: [
    { id: 1, reviewer_name: 'Sarah M.', rating: 5, comment: 'Absolutely fantastic! My home has never been cleaner. Will definitely book again.', created_at: '2025-03-10' },
    { id: 2, reviewer_name: 'James K.', rating: 4, comment: 'Very professional and thorough. Arrived on time and did an excellent job.', created_at: '2025-03-05' },
    { id: 3, reviewer_name: 'Lisa T.', rating: 5, comment: 'Best cleaning service I have ever used. Highly recommend!', created_at: '2025-02-28' },
  ],
  2: [
    { id: 4, reviewer_name: 'Robert C.', rating: 5, comment: 'Fixed our leaking pipe in under an hour. Fair price and great work.', created_at: '2025-03-08' },
    { id: 5, reviewer_name: 'Mike A.', rating: 4, comment: 'Professional and knowledgeable. Would hire again.', created_at: '2025-03-02' },
  ],
};

export const MOCK_BOOKINGS = [
  { id: 101, provider_id: 1, service_name: 'Deep Cleaning',   provider_name: 'Sparkle Clean Services',      status: 'confirmed',   slot_date: '2025-04-15', start_time: '10:00', total_amount: 55,  category_icon: '🧹', notes: '' },
  { id: 102, provider_id: 2, service_name: 'Pipe Repair',     provider_name: 'Pro Plumbing Solutions',      status: 'completed',   slot_date: '2025-03-20', start_time: '14:00', total_amount: 75,  category_icon: '🔧', notes: 'Fixed the main pipe' },
  { id: 103, provider_id: 4, service_name: 'Swedish Massage', provider_name: 'Zen Wellness Spa',            status: 'requested',   slot_date: '2025-04-18', start_time: '11:00', total_amount: 120, category_icon: '💆', notes: '' },
  { id: 104, provider_id: 6, service_name: 'Pet Grooming',    provider_name: 'Paws & Claws Pet Care',       status: 'cancelled',   slot_date: '2025-03-10', start_time: '09:00', total_amount: 55,  category_icon: '🐾', notes: '' },
  { id: 105, provider_id: 7, service_name: 'SAT Prep',        provider_name: 'Academic Excellence Tutoring',status: 'in_progress', slot_date: '2025-04-20', start_time: '16:00', total_amount: 70,  category_icon: '📚', notes: '' },
];

export const MOCK_SLOTS = [
  { id: 1, start_time: '09:00:00', end_time: '10:00:00', status: 'available' },
  { id: 2, start_time: '10:00:00', end_time: '11:00:00', status: 'available' },
  { id: 3, start_time: '11:00:00', end_time: '12:00:00', status: 'available' },
  { id: 4, start_time: '13:00:00', end_time: '14:00:00', status: 'available' },
  { id: 5, start_time: '14:00:00', end_time: '15:00:00', status: 'available' },
  { id: 6, start_time: '15:00:00', end_time: '16:00:00', status: 'available' },
  { id: 7, start_time: '16:00:00', end_time: '17:00:00', status: 'available' },
];