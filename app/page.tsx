import SermonForm from "./components/SermonForm";
export default function Home() {
  return (
    <main className="sermon-shell">
      <div className="sermon-container">
        <header className="sermon-header">
          <p className="eyebrow">Your study companion</p>
          <h1>Sermon AI</h1>
          <p>Turn sermons into personal Bible study notes you can return to, reflect on, and live out.</p>
        </header>
        <SermonForm />
      </div>
    </main>
  );
}
