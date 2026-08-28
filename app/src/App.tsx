import { sections, SectionConfig } from "./content/config";
import { Layout } from "./components/Layout";
import { RichTextSection } from "./components/RichTextSection";
import { VideoEmbed } from "./components/VideoEmbed";
import { ValidationDemo } from "./components/validation/ValidationDemo";
import { TranscriptSection } from "./components/TranscriptSection";
import { EventStackSection } from "./components/EventStackSection";

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
      return section.eventStack ? (
        <EventStackSection config={section.eventStack} />
      ) : null;
    default:
      return null;
  }
}

export default function App() {
  return (
    <Layout>
      {sections.map((section, index) => {
        const partNumber = index + 1;
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
            <SectionContent section={section} partNumber={partNumber} />
          </section>
        );
      })}
    </Layout>
  );
}
