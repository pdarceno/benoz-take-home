import { ReactNode } from "react";
import { SectionNav } from "./SectionNav";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Benoz Take-Home Submission</h1>
            <p className="text-sm text-slate-600">Validation library demo &amp; supporting materials</p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <aside className="lg:w-64 lg:shrink-0">
          <SectionNav />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col gap-8">{children}</main>
      </div>
    </div>
  );
}
