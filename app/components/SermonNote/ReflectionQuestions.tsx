type ReflectionQuestionsProps = {
  reflectionQuestions: string[];
};

export default function ReflectionQuestions({
  reflectionQuestions,
}: ReflectionQuestionsProps) {
  return (
    <section className="note-section">
      <h3>Reflection Questions</h3>

      <ul>
        {reflectionQuestions.map((question, index) => (
          <li key={index}>
            {question}
          </li>
        ))}
      </ul>
    </section>
  );
}