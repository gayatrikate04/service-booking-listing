import Link from 'next/link';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal header */}
      <header className="h-14 flex items-center px-6 bg-white border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-semibold">S</span>
          </div>
          <span className="text-base font-semibold text-gray-900">ServiceBook</span>
        </Link>
      </header>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>

      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        ServiceBook © 2025 — Smart Local Service Booking Platform
      </footer>
    </div>
  );
}