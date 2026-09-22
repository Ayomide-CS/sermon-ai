import type { SermonNote } from "@/app/types/sermon";
import Overview from "./Overview";

type SermonNoteViewProps = {
    sermonNote: SermonNote;
};


export default function SermonNoteView({
    sermonNote,
}: SermonNoteViewProps) {
    return (
        <div>
            <Overview overview={sermonNote.overview} />
        </div>
    )
}