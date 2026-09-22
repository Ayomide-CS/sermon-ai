import type {SermonMetadata, SermonNote,} from "@/app/types/sermon";

import SermonHeader from "./SermonHeader";
import Overview from "./Overview";
import MainPoints from "./MainPoints";
import KeyLessons from "./KeyLessons";
import KeyQuotes from "./KeyQuotes";
import PracticalApplications from "./PracticalApplications";
import PrayerPoints from "./PrayerPoints";
import ReflectionQuestions from "./ReflectionQuestions";

type SermonNoteViewProps = {
  sermonNote: SermonNote;
  metadata: SermonMetadata;
};

export default function SermonNoteView({
  sermonNote,
  metadata,
}: SermonNoteViewProps) {
  return (
    <div>
      <SermonHeader
        title={metadata.title}
        speaker={metadata.speaker}
        publishedAt={metadata.publishedAt}
        duration={metadata.duration}
      />

      <Overview overview={sermonNote.overview} />

      <MainPoints mainPoints={sermonNote.mainPoints} />

      <KeyLessons keyLessons={sermonNote.keyLessons} />

      <KeyQuotes keyQuotes={sermonNote.keyQuotes} />

      <PracticalApplications
        practicalApplications={sermonNote.practicalApplications}
      />

      <PrayerPoints prayerPoints={sermonNote.prayerPoints} />

      <ReflectionQuestions
        reflectionQuestions={sermonNote.reflectionQuestions}
      />
    </div>
  );
}