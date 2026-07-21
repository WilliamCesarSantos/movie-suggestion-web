import type { ReactNode } from 'react';
import { AccessDeniedState } from '../../components/feedback/AccessDeniedState';

export function HomeAccessBoundary({ allowed, children }: { allowed: boolean; children: ReactNode }) {
  return allowed ? children : <AccessDeniedState />;
}
