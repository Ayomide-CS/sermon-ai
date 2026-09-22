type KeyLessonsProps = {
  keyLessons: string[];
};

export default function KeyLessons({
  keyLessons,
}: KeyLessonsProps) {
  return (
    <section className="note-section">
      <h3>Key Lessons</h3>

      <ul>
        {keyLessons.map((lesson, index) => (
          <li key={index}>
            {lesson}
          </li>
        ))}
      </ul>
    </section>
  );
}