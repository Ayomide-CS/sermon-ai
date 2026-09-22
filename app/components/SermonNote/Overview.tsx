type OverviewProps = {
  overview: string;
};

export default function Overview({ overview }: OverviewProps) {
  return (
    <section className="note-section note-section--overview">
      <h3>Overview</h3>

      <p>{overview}</p>
    </section>
  );
}