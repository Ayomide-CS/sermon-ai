"use client";

type ModeSelectorProps = {
  onSelect: (mode: "structured" | "ai") => void;
  isProcessing: boolean;
};

export default function ModeSelector({
  onSelect,
  isProcessing,
}: ModeSelectorProps) {
  return (
    <section className="mode-selector">
      <div className="mode-selector__header">
        <p className="eyebrow">Choose your experience</p>

        <h2>How would you like your sermon notes?</h2>

        <p>
          Choose between a transcript-based structured
          note or deeper AI-powered analysis.
        </p>
      </div>

      <div className="mode-selector__options">

        <button
          type="button"
          onClick={() => onSelect("structured")}
          disabled={isProcessing}
        >
          <strong>Structured Notes</strong>

          <span>
            Organize the sermon directly from the
            transcript without AI interpretation.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect("ai")}
          disabled={isProcessing}
        >
          <strong>AI-Powered Notes</strong>

          <span>
            Use AI to analyze the sermon and produce
            deeper structured study notes.
          </span>
        </button>

      </div>
    </section>
  );
}