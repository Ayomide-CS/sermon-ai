type KeyQuotesProps = {
  keyQuotes: string[];
};

export default function KeyQuotes({
  keyQuotes,
}: KeyQuotesProps) {
  return (
    <section className="note-section note-section--quotes">
      <h3>Key Quotes</h3>

      <ul>
        {keyQuotes.map((quote, index) => (
          <li key={index}>
            {quote}
          </li>
        ))}
      </ul>
    </section>
  );
}