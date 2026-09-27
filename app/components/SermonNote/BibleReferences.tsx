type BibleReferencesProps = {
  bibleReferences: string[];
};

export default function BibleReferences({
  bibleReferences,
}: BibleReferencesProps) {
  if (bibleReferences.length === 0) {
    return null;
  }

  return (
    <section className="note-section">
      <h3>Bible References</h3>

      <ul>
        {bibleReferences.map((reference) => (
          <li key={reference}>
            {reference}
          </li>
        ))}
      </ul>
    </section>
  );
}