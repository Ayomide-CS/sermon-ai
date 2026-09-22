type MainPointsProps = {
  mainPoints: string[];
};

export default function MainPoints({
  mainPoints,
}: MainPointsProps) {
  return (
    <section className="note-section">
      <h3>Main Points</h3>

      <ul>
        {mainPoints.map((point, index) => (
          <li key={index}>
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}