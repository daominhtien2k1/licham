'use client';

// HeroUI v3 không cần Provider wrapper — components work standalone
// RouterProvider chỉ cần nếu dùng HeroUI Link component với router
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
