import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="section-light min-h-screen flex items-center justify-center p-4">
      {children}
    </div>
  );
}
