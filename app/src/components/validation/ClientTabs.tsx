import { ClientDefinition } from "@lib/types";

interface ClientTabsProps {
  clients: { id: string; label: string; definition: ClientDefinition }[];
  activeId: string;
  onChange: (id: string) => void;
}

export function ClientTabs({ clients, activeId, onChange }: ClientTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Client definitions"
      className="flex flex-wrap gap-2 border-b border-slate-200 pb-4"
    >
      {clients.map((client) => {
        const isActive = client.id === activeId;
        return (
          <button
            key={client.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(client.id)}
            className={`min-h-11 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
              isActive
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {client.label}
          </button>
        );
      })}
    </div>
  );
}
