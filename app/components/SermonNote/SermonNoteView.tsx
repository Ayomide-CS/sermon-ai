"use client";

import { useState, useRef, useEffect } from "react";
import type { SermonNote } from "@/app/types/sermon";

import Overview from "./Overview";
import MainPoints from "./MainPoints";
import KeyLessons from "./KeyLessons";
import KeyQuotes from "./KeyQuotes";
import PracticalApplications from "./PracticalApplications";
import PrayerPoints from "./PrayerPoints";
import ReflectionQuestions from "./ReflectionQuestions";
import BibleReferences from "./BibleReferences";

type SectionId =
  | "overview"
  | "main-points"
  | "bible-references"
  | "key-lessons"
  | "key-quotes"
  | "practical-applications"
  | "prayer-points"
  | "reflection-questions";

interface Section {
  id: SectionId;
  label: string;
  icon: string;
  hasContent: boolean;
}

type SermonNoteViewProps = {
  sermonNote: SermonNote;
};

export default function SermonNoteView({
  sermonNote,
}: SermonNoteViewProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");

  // Initialize refs record with all possible keys
  const emptyRefs: Record<SectionId, HTMLDivElement | null> = {
    "overview": null,
    "main-points": null,
    "bible-references": null,
    "key-lessons": null,
    "key-quotes": null,
    "practical-applications": null,
    "prayer-points": null,
    "reflection-questions": null,
  };
  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>(emptyRefs);

  // Build table of contents from available sections
  const sections: Section[] = [
    { id: "overview" as SectionId, label: "Overview", icon: "📋", hasContent: !!sermonNote.overview },
    { id: "main-points" as SectionId, label: "Main Points", icon: "⭐", hasContent: sermonNote.mainPoints.length > 0 },
    { id: "bible-references" as SectionId, label: "Bible References", icon: "📖", hasContent: sermonNote.bibleReferences.length > 0 },
    { id: "key-lessons" as SectionId, label: "Key Lessons", icon: "💡", hasContent: sermonNote.keyLessons.length > 0 },
    { id: "key-quotes" as SectionId, label: "Key Quotes", icon: "💬", hasContent: sermonNote.keyQuotes.length > 0 },
    { id: "practical-applications" as SectionId, label: "Applications", icon: "🎯", hasContent: sermonNote.practicalApplications.length > 0 },
    { id: "prayer-points" as SectionId, label: "Prayer Points", icon: "🙏", hasContent: sermonNote.prayerPoints.length > 0 },
    { id: "reflection-questions" as SectionId, label: "Reflection", icon: "❓", hasContent: sermonNote.reflectionQuestions.length > 0 },
  ].filter((s): s is Section => s.hasContent);

  // Intersection observer to track active section
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(section.id);
            }
          });
        },
        { rootMargin: "-20% 0px -60% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  const scrollToSection = (id: SectionId) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="sermon-note">
      {/* ── Section Navigation (Sticky TOC) ── */}
      {sections.length > 3 && (
        <nav className="note-toc" aria-label="Sermon sections">
          <div className="note-toc__inner">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={`note-toc__item ${activeSection === section.id ? "active" : ""}`}
                aria-current={activeSection === section.id ? "true" : undefined}
              >
                <span className="note-toc__icon">{section.icon}</span>
                <span className="note-toc__label">{section.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* ── Heading ── */}
      <div className="note-heading">
        <div>
          <h2>Sermon Notes</h2>
          <p>Generated from the sermon transcript</p>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="note-grid">
        {sermonNote.overview && (
          <div ref={(el) => { sectionRefs.current["overview"] = el; }} id="overview" className="note-section note-section--overview">
            <Overview overview={sermonNote.overview} />
          </div>
        )}

        {sermonNote.mainPoints.length > 0 && (
          <div ref={(el) => { sectionRefs.current["main-points"] = el; }} id="main-points" className="note-section">
            <MainPoints mainPoints={sermonNote.mainPoints} />
          </div>
        )}

        {sermonNote.bibleReferences.length > 0 && (
          <div ref={(el) => { sectionRefs.current["bible-references"] = el; }} id="bible-references" className="note-section">
            <BibleReferences bibleReferences={sermonNote.bibleReferences} />
          </div>
        )}

        {sermonNote.keyLessons.length > 0 && (
          <div ref={(el) => { sectionRefs.current["key-lessons"] = el; }} id="key-lessons" className="note-section">
            <KeyLessons keyLessons={sermonNote.keyLessons} />
          </div>
        )}

        {sermonNote.keyQuotes.length > 0 && (
          <div ref={(el) => { sectionRefs.current["key-quotes"] = el; }} id="key-quotes" className="note-section note-section--quotes">
            <KeyQuotes keyQuotes={sermonNote.keyQuotes} />
          </div>
        )}

        {sermonNote.practicalApplications.length > 0 && (
          <div ref={(el) => { sectionRefs.current["practical-applications"] = el; }} id="practical-applications" className="note-section">
            <PracticalApplications practicalApplications={sermonNote.practicalApplications} />
          </div>
        )}

        {sermonNote.prayerPoints.length > 0 && (
          <div ref={(el) => { sectionRefs.current["prayer-points"] = el; }} id="prayer-points" className="note-section">
            <PrayerPoints prayerPoints={sermonNote.prayerPoints} />
          </div>
        )}

        {sermonNote.reflectionQuestions.length > 0 && (
          <div ref={(el) => { sectionRefs.current["reflection-questions"] = el; }} id="reflection-questions" className="note-section">
            <ReflectionQuestions reflectionQuestions={sermonNote.reflectionQuestions} />
          </div>
        )}
      </div>
    </section>
  );
}
