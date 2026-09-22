type PracticalApplicationsProps = {
  practicalApplications: string[];
};

export default function PracticalApplications({
  practicalApplications,
}: PracticalApplicationsProps) {
  return (
    <section className="note-section">
      <h3>Practical Applications</h3>

      <ul>
        {practicalApplications.map((application, index) => (
          <li key={index}>
            {application}
          </li>
        ))}
      </ul>
    </section>
  );
}