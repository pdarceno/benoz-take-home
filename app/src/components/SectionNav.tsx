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
        {sections.map((section, index) => {
          const partNumber = index + 1;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <span className="font-medium text-slate-500">{partNumber}.</span> {section.title}
              </a>
              {section.subsections && section.subsections.length > 0 && (
                <ul className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
                  {section.subsections.map((subsection, subIndex) => (
                    <li key={subsection.id}>
                      <a
                        href={`#${subsection.id}`}
                        className="block rounded-md px-2 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        <span className="font-medium text-slate-500">
                          {partNumber}.{subIndex + 1}
                        </span>{" "}
                        {subsection.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
