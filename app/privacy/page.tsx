import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="sermon-shell">
      <div className="sermon-container" style={{ maxWidth: "62rem" }}>
        {/* Header */}
        <header className="sermon-header">
          <p className="eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p>Last updated: October 9, 2025</p>
        </header>

        {/* Content */}
        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "clamp(1.5rem, 4vw, 3rem)" }}>
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>1. Introduction</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              SermonAI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (the "Service"). By accessing or using the Service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>2. Information We Collect</h2>
            
            <h3 style={{ fontSize: "1.05rem", fontWeight: 650, marginTop: "1.5rem", marginBottom: "0.5rem" }}>2.1 Information You Provide</h3>
            <ul style={{ color: "var(--ink-muted)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
              <li><strong>Account information:</strong> When you create an account, we collect your email address, password (stored as a hashed value), and optional display name.</li>
              <li><strong>Saved content:</strong> Sermons you save, custom notes you write, and tags you assign are stored in our database.</li>
            </ul>

            <h3 style={{ fontSize: "1.05rem", fontWeight: 650, marginTop: "1.5rem", marginBottom: "0.5rem" }}>2.2 Information Collected Automatically</h3>
            <ul style={{ color: "var(--ink-muted)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
              <li><strong>Cookies:</strong> We use HTTP-only cookies for authentication (refresh tokens). These are essential for the Service to function.</li>
              <li><strong>Usage data:</strong> We may collect basic analytics about how you interact with the Service, such as pages visited and features used.</li>
            </ul>

            <h3 style={{ fontSize: "1.05rem", fontWeight: 650, marginTop: "1.5rem", marginBottom: "0.5rem" }}>2.3 Third-Party Data</h3>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              When you submit a YouTube URL, we retrieve publicly available metadata (title, speaker, description) and transcripts from YouTube's servers. This data is processed solely to generate sermon notes and is not shared with third parties.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>3. How We Use Your Information</h2>
            <ul style={{ color: "var(--ink-muted)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
              <li>To create and manage your account.</li>
              <li>To generate sermon notes from YouTube video transcripts.</li>
              <li>To store and organize your saved sermons and personal notes.</li>
              <li>To improve the Service and develop new features.</li>
              <li>To send you service-related communications (e.g., security alerts).</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>4. Data Storage & Security</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              Your data is stored securely using industry-standard encryption. Passwords are hashed using bcrypt before storage. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>5. Your Rights & Choices</h2>
            <ul style={{ color: "var(--ink-muted)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
              <li><strong>Access:</strong> You can view and export your saved sermons and notes at any time.</li>
              <li><strong>Correction:</strong> You can update your account information through the Service settings.</li>
              <li><strong>Deletion:</strong> You may request deletion of your account and all associated data by contacting us.</li>
              <li><strong>Cookies:</strong> You can disable cookies in your browser, though this may affect Service functionality.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>6. Third-Party Services</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              The Service interacts with YouTube's API to retrieve video metadata and transcripts. Your use of YouTube is governed by YouTube's own Terms of Service and Privacy Policy. If you choose to use external LLM providers (e.g., Gemini, OpenAI) through the Service, those providers' terms and privacy policies also apply to any data transmitted to them.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>7. Children's Privacy</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              The Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such data, we will take steps to delete it promptly.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>8. Changes to This Policy</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the Service after such modifications constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>9. Contact Us</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              If you have questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, marginTop: "0.5rem" }}>
              Email: privacy@sermon-ai.com
            </p>
          </section>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)" }}>
            <Link href="/">
              <button className="btn btn--accent" type="button">← Back to Home</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
