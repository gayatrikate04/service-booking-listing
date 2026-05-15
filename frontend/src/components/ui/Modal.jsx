'use client';
// Portals a modal overlay. Used for review submission, cancel confirmation, etc.
// Closes on backdrop click or Escape key.

import { useEffect } from 'react';
import { Button } from './Button';

export function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 overflow-y-auto"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">

        <h3 className="text-base font-semibold text-gray-900 break-words min-w-0">
          {title}
        </h3>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-6 py-5 overflow-y-auto min-w-0">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-end gap-3">
          {footer}
        </div>
      )}
    </div>
  </div>
);
}