import type { SermonNote } from "@/app/types/sermon";
import Overview from "./Overview";
import MainPoints from "./MainPoints";
import KeyLessons from "./KeyLessons";
import PracticalApplications from "./PracticalApplications";
import PrayerPoints from "./PrayerPoints";
import KeyQuotes from "./KeyQuotes";
import ReflectionQuestions from "./ReflectionQuestions";

type SermonNoteViewProps = {
    sermonNote: SermonNote;
};


export default function SermonNoteView({
    sermonNote,
}: SermonNoteViewProps) {
    return (
        <section className="sermon-note" aria-label="Generated sermon notes">
            <div className="note-heading">
                <h2>Your study notes</h2>
                <p>Generated for reflection</p>
            </div>
            <div className="note-grid">
            <Overview overview={sermonNote.overview} />
            <MainPoints mainPoints={sermonNote.mainPoints} />
            <KeyLessons keyLessons={sermonNote.keyLessons} />
            <PracticalApplications practicalApplications={sermonNote.practicalApplications}/>
            <PrayerPoints prayerPoints={sermonNote.prayerPoints} />
            <KeyQuotes keyQuotes={sermonNote.keyQuotes} />
            <ReflectionQuestions reflectionQuestions={sermonNote.reflectionQuestions}/>
            </div>
        </section>
    )
};

