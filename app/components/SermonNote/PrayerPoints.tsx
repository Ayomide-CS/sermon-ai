type PrayerPointsProps = {
  prayerPoints: string[];
};

export default function PrayerPoints({
  prayerPoints,
}: PrayerPointsProps) {
  return (
    <section className="note-section">
      <h3>Prayer Points</h3>

      <ul>
        {prayerPoints.map((prayer, index) => (
          <li key={index}>
            {prayer}
          </li>
        ))}
      </ul>
    </section>
  );
}