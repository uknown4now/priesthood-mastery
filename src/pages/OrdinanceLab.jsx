import { useEffect, useMemo, useState } from "react";
import ordinances from "../data/ordinances.json";

const FILTERS = ["All", "Aaronic", "Melchizedek"];

export default function OrdinanceLab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedCard, setSelectedCard] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setActiveTab("steps");
    setHighContrast(false);
  }, [selectedCard]);

  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;
      window.speechSynthesis?.cancel();
    };
  }, []);

  const filteredCards = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return ordinances.filter((item) => {
      const matchesFilter =
        activeFilter === "All" || item.category === activeFilter;
      const stepsText = Array.isArray(item.steps) ? item.steps.join(" ") : "";
      const searchText = `${item.title || ""} ${stepsText} ${
        item.Prayer || item.prayer || item.prayer_bread || ""
      } ${item.prayer_water || ""} ${item.prayer_hint || ""}`.toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchText.includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  const getPrayerText = (item) => {
    if (!item) return "";
    if (item.Prayer) return item.Prayer;
    if (item.prayer) return item.prayer;
    if (item.prayer_bread || item.prayer_water) {
      return [item.prayer_bread, item.prayer_water].filter(Boolean).join("\n\n");
    }
    if (item.prayer_hint) return item.prayer_hint;
    return "";
  };

  const handleReadAloud = () => {
    if (!selectedCard || typeof window === "undefined") return;
    const synthesis = window.speechSynthesis;
    if (!synthesis) return;

    if (isSpeaking) {
      synthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const stepsText = selectedCard.steps
      ? selectedCard.steps.map((step, index) => `Step ${index + 1}. ${step}`).join(" ")
      : "";
    const prayerText = getPrayerText(selectedCard);
    const utterance = new SpeechSynthesisUtterance(
      `${selectedCard.title}. ${stepsText} Prayer. ${prayerText}`
    );
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    synthesis.cancel();
    synthesis.speak(utterance);
  };

  const [activeTab, setActiveTab] = useState("steps");

  return (
    <>
      <header className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
          Ordinance Lab
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Procedures & Prayers
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Search and review essential ordinance instructions.
        </p>
      </header>

      <div className="mb-5 rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-4 backdrop-blur-xl">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search ordinances"
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-gold-500 text-slate-900"
                    : "border border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-200 hover:border-gold-500/60"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 pb-8">
        {filteredCards.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-5 text-sm text-gray-400">
            No ordinances match your search.
          </div>
        ) : (
          filteredCards.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedCard(item)}
              className="rounded-2xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-5 text-left transition hover:border-gold-500/60 hover:bg-[rgba(var(--color-surface),0.9)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <span className="rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-500">
                  {item.category}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-300">
                Tap to view steps and the exact prayer.
              </p>
            </button>
          ))
        )}
      </div>

      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-6 text-gray-100 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  {selectedCard.category} Ordinance
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {selectedCard.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300 hover:border-white/30"
              >
                Close
              </button>
            </div>
            <button
              onClick={handleReadAloud}
              className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isSpeaking
                  ? "bg-white/10 text-gray-200"
                  : "bg-gold-500 text-slate-900 hover:bg-gold-400"
              }`}
            >
              {isSpeaking ? "Stop Read-Aloud" : "Read-Aloud"}
            </button>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {[
                { key: "steps", label: "Steps" },
                { key: "prayer", label: "The Prayer" },
                { key: "handbook", label: "Handbook" }
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "bg-gold-500 text-slate-900"
                        : "border border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-200 hover:border-gold-500/60"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
              <button
                onClick={() => setHighContrast((prev) => !prev)}
                className={`ml-auto rounded-full px-4 py-2 text-xs font-semibold transition ${
                  highContrast
                    ? "bg-gold-500 text-slate-900"
                    : "border border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-200 hover:border-gold-500/60"
                }`}
              >
                High Contrast
              </button>
            </div>

            {activeTab === "steps" && (
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-gold-500">
                  Step-by-Step
                </h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-200">
                  {selectedCard.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "prayer" && (
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-gold-500">The Prayer</h4>
                <div
                  className={`mt-3 rounded-2xl border px-4 py-4 ${
                    highContrast
                      ? "border-[#EAB308]/60 bg-black text-[#EAB308]"
                      : "border-gold-500/40 bg-black text-gold-500"
                  }`}
                >
                  <p
                    className={`whitespace-pre-line ${
                      highContrast ? "text-xl font-bold" : "text-lg font-semibold"
                    }`}
                  >
                    {getPrayerText(selectedCard) || "Prayer text not available."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "handbook" && (
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-gold-500">Handbook</h4>
                <a
                  href={selectedCard.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-gold-400"
                >
                  Open in Gospel Library
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
