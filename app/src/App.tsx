import { lazy } from "react";
import { sections, SectionConfig } from "./content/config";
import { Layout } from "./components/Layout";
import { LazySection } from "./components/LazySection";
import { VideoEmbed } from "./components/VideoEmbed";

const RichTextSection = lazy(() =>
  import("./components/RichTextSection").then((m) => ({ default: m.RichTextSection })),
);
const ValidationDemo = lazy(() =>
  import("./components/validation/ValidationDemo").then((m) => ({
    default: m.ValidationDemo,
  })),
);
const TranscriptSection = lazy(() =>
  import("./components/TranscriptSection").then((m) => ({
    default: m.TranscriptSection,
  })),
);
const EventStackSection = lazy(() =>
  import("./components/EventStackSection").then((m) => ({
    default: m.EventStackSection,
  })),
);

function SectionContent({
  section,
  partNumber,
}: {
  section: SectionConfig;
  partNumber: number;
}) {
  switch (section.kind) {
    case "richtext":
      return (
        <RichTextSection
          content={section.content}
          subsections={section.subsections}
          partNumber={partNumber}
        />
      );
    case "video":
      return <VideoEmbed />;
    case "validation":
      return <ValidationDemo />;
    case "transcript":
      return <TranscriptSection />;
    case "event-stack":
      return <EventStackSection config={section.eventStack} />;
    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
}

export default function App() {
  return (
    <Layout>
      {sections.map((section, index) => {
        const partNumber = index + 1;
        const isLightweight = section.kind === "video";

        return (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-8 section-card"
            aria-labelledby={`${section.id}-heading`}
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Part {partNumber}
            </p>
            <h2
              id={`${section.id}-heading`}
              className="mb-6 text-2xl font-semibold text-slate-900"
            >
              {section.title}
            </h2>
            {isLightweight ? (
              <SectionContent section={section} partNumber={partNumber} />
            ) : (
              <LazySection
                minHeight={
                  section.kind === "validation" || section.kind === "event-stack"
                    ? "12rem"
                    : "4rem"
                }
              >
                <SectionContent section={section} partNumber={partNumber} />
              </LazySection>
            )}
          </section>
        );
      })}
    </Layout>
  );
}
