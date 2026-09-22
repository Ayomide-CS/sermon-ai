import type { SermonNote } from "@/app/types/sermon";

import Overview from "./Overview";
import MainPoints from "./MainPoints";
import KeyLessons from "./KeyLessons";
import KeyQuotes from "./KeyQuotes";
import PracticalApplications from "./PracticalApplications";
import PrayerPoints from "./PrayerPoints";
import ReflectionQuestions from "./ReflectionQuestions";

type SermonNoteViewProps = {
  sermonNote: SermonNote;
};

export default function SermonNoteView({
  sermonNote,
}: SermonNoteViewProps) {
  return (
    <section className="sermon-note">

      <div className="note-heading">
        <div>
          <h2>Sermon Notes</h2>

          <p>
            Generated from the sermon transcript
          </p>
        </div>
      </div>

      <div className="note-grid">

        <Overview
          overview={sermonNote.overview}
        />

        <MainPoints
          mainPoints={sermonNote.mainPoints}
        />

        <KeyLessons
          keyLessons={sermonNote.keyLessons}
        />

        <KeyQuotes
          keyQuotes={sermonNote.keyQuotes}
        />

        <PracticalApplications
          practicalApplications={sermonNote.practicalApplications}
        />

        <PrayerPoints
          prayerPoints={sermonNote.prayerPoints}
        />

        <ReflectionQuestions
          reflectionQuestions={sermonNote.reflectionQuestions}
        />

      </div>

    </section>
  );
}