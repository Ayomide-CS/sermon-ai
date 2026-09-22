type SermonHeaderProps = {
  title: string;
  speaker: string;
  publishedAt: string;
  duration: string;
};

export default function SermonHeader({
  title,
  speaker,
  publishedAt,
  duration,
}: SermonHeaderProps) {
  return (
    <header className="sermon-header">
      <p className="eyebrow">Sermon</p>

      <h1>{title}</h1>

      <p>
        {speaker} · {duration} · {publishedAt}
      </p>
    </header>
  );
}