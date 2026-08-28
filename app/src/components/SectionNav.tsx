import { sections } from "../content/config";

export function SectionNav() {
  return (
    <nav
      aria-label="Submission sections"
      className="sticky top-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Sections
      </p>
      <ul className="space-y-1">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <span className="font-medium text-slate-500">{index + 1}.</span> {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
