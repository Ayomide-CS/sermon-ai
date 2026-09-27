"use client";

type ModeSelectorProps = {
  onSelect: (
    mode: "structured" | "ai"
  ) => void;

  isProcessing: boolean;
};

export default function ModeSelector({
  onSelect,
  isProcessing,
}: ModeSelectorProps) {
  return (
    <section className="mode-selector">
      <div className="mode-selector__header">
        <p className="eyebrow">
          Choose your experience
        </p>

        <h2>
          How would you like your sermon notes?
        </h2>

        <p>
          Choose between transcript-based notes
          or deeper AI-powered study notes.
        </p>
      </div>

      <div className="mode-selector__options">
        {/* =====================================
            TRANSCRIPT NOTES
        ====================================== */}

        <button
          type="button"
          onClick={() =>
            onSelect("structured")
          }
          disabled={isProcessing}
        >
          <strong>
            Transcript Notes
          </strong>

          <span>
            Organize information directly from
            the sermon transcript without AI
            analysis.
          </span>
        </button>

        {/* =====================================
            AI STUDY NOTES
        ====================================== */}

        <button
          type="button"
          onClick={() =>
            onSelect("ai")
          }
          disabled={isProcessing}
        >
          <strong>
            AI Study Notes
          </strong>

          <span>
            Let AI understand the sermon
            structure, themes, teachings,
            applications, and study points.
          </span>
        </button>
      </div>
    </section>
  );
}