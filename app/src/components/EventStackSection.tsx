import { useId, useState } from "react";
import {
  EventStackConfig,
  StackCategory,
  StackDecision,
} from "../content/config";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "stack", label: "Stack" },
  { id: "flow", label: "Flow" },
  { id: "scaling", label: "Scaling" },
  { id: "rejected", label: "Rejected" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const CATEGORY_LABELS: Record<StackCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  data: "Data",
  auth: "Auth",
  payments: "Payments",
  jobs: "Jobs",
  email: "Email & SMS",
  infra: "Infra",
  monitoring: "Monitoring",
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as StackCategory[];

function RichHtml({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className ?? "rich-text-content"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function StackCard({ decision }: { decision: StackDecision }) {
  return (
    <article className="stack-card">
      <div className="stack-card-header">
        <span className="stack-category-pill">
          {CATEGORY_LABELS[decision.category]}
        </span>
        <h4 className="stack-card-title">{decision.layer}</h4>
      </div>
      <dl className="stack-card-body">
        <div className="stack-card-row">
          <dt>Choice</dt>
          <dd className="stack-choice">{decision.choice}</dd>
        </div>
        <div className="stack-card-row">
          <dt>Rejected</dt>
          <dd className="stack-rejected">{decision.rejected}</dd>
        </div>
        <div className="stack-card-row">
          <dt>Why</dt>
          <dd>{decision.rationale}</dd>
        </div>
      </dl>
    </article>
  );
}

function RejectedAccordion({ decisions }: { decisions: StackDecision[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="stack-accordion">
      {decisions.map((decision) => {
        const isOpen = openId === decision.id;
        return (
          <div key={decision.id} className="stack-accordion-item">
            <button
              type="button"
              className="stack-accordion-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : decision.id)}
            >
              <span className="stack-accordion-label">
                <span className="stack-rejected-tag">{decision.rejected}</span>
                <span className="stack-accordion-context">
                  — chose {decision.choice.split("(")[0].trim()} for{" "}
                  {decision.layer.toLowerCase()}
                </span>
              </span>
              <span className="stack-accordion-icon" aria-hidden="true">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <div className="stack-accordion-panel">
                <p className="mb-2 text-sm font-medium text-slate-900">
                  {decision.layer}
                </p>
                <p className="text-sm leading-relaxed text-slate-700">
                  {decision.rationale}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface EventStackSectionProps {
  config: EventStackConfig;
}

export function EventStackSection({ config }: EventStackSectionProps) {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [categoryFilter, setCategoryFilter] = useState<StackCategory | "all">(
    "all",
  );

  const filteredDecisions =
    categoryFilter === "all"
      ? config.decisions
      : config.decisions.filter((d) => d.category === categoryFilter);

  return (
    <div className="event-stack">
      <div
        role="tablist"
        aria-label="Event platform stack sections"
        className="stack-tabs"
      >
        {TABS.map((tab) => {
          const tabId = `${baseId}-tab-${tab.id}`;
          const panelId = `${baseId}-panel-${tab.id}`;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              className={`stack-tab${isSelected ? " stack-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {TABS.map((tab) => {
        const tabId = `${baseId}-tab-${tab.id}`;
        const panelId = `${baseId}-panel-${tab.id}`;
        const isSelected = activeTab === tab.id;
        if (!isSelected) return null;

        return (
          <div
            key={tab.id}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            className="stack-tab-panel"
          >
            {tab.id === "overview" && (
              <div className="space-y-6">
                <RichHtml html={config.intro} />
                <div className="stack-callout">
                  <h3 className="mb-3 text-base font-semibold text-slate-900">
                    Lesson from Virnew
                  </h3>
                  <RichHtml html={config.virnewLesson} />
                </div>
              </div>
            )}

            {tab.id === "stack" && (
              <div>
                <div
                  className="stack-category-filters"
                  role="group"
                  aria-label="Filter by category"
                >
                  <button
                    type="button"
                    className={`stack-category-pill stack-category-pill-btn${categoryFilter === "all" ? " stack-category-pill-active" : ""}`}
                    onClick={() => setCategoryFilter("all")}
                  >
                    All ({config.decisions.length})
                  </button>
                  {ALL_CATEGORIES.map((cat) => {
                    const count = config.decisions.filter(
                      (d) => d.category === cat,
                    ).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`stack-category-pill stack-category-pill-btn${categoryFilter === cat ? " stack-category-pill-active" : ""}`}
                        onClick={() => setCategoryFilter(cat)}
                      >
                        {CATEGORY_LABELS[cat]} ({count})
                      </button>
                    );
                  })}
                </div>
                <div className="stack-card-grid">
                  {filteredDecisions.map((decision) => (
                    <StackCard key={decision.id} decision={decision} />
                  ))}
                </div>
              </div>
            )}

            {tab.id === "flow" && (
              <ol className="flow-stepper">
                {config.flowSteps.map((step) => (
                  <li key={step.order} className="flow-step">
                    <div className="flow-step-marker" aria-hidden="true">
                      {step.order}
                    </div>
                    <div className="flow-step-content">
                      <h4 className="flow-step-label">{step.label}</h4>
                      <p className="flow-step-detail">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {tab.id === "scaling" && <RichHtml html={config.scalingNotes} />}

            {tab.id === "rejected" && (
              <div>
                <p className="mb-4 text-sm text-slate-600">
                  Every layer below lists what I would <em>not</em> build and
                  why — expand any row for the full rationale.
                </p>
                <RejectedAccordion decisions={config.decisions} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
