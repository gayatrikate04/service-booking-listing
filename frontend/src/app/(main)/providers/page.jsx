import { Suspense } from 'react';
import ProvidersContent from './ProvidersContent';

export default function ProvidersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProvidersContent />
    </Suspense>
  );
}