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
    <header>
      <h1>{title}</h1>

      <p>Speaker: {speaker}</p>

      <p>Published: {publishedAt}</p>

      <p>Duration: {duration}</p>
    </header>
  );
}