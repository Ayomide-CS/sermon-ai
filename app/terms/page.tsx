import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="sermon-shell">
      <div className="sermon-container" style={{ maxWidth: "62rem" }}>
        {/* Header */}
        <header className="sermon-header">
          <p className="eyebrow">Legal</p>
          <h1>Terms of Service</h1>
          <p>Last updated: October 9, 2025</p>
        </header>

        {/* Content */}
        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "clamp(1.5rem, 4vw, 3rem)" }}>
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>1. Acceptance of Terms</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              By accessing or using SermonAI (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, you may not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>2. Description of Service</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              SermonAI is a web-based tool that analyzes YouTube sermon videos and generates structured study notes including overviews, main points, Bible references, key quotes, practical applications, prayer points, and reflection questions. The Service may use automated analysis methods (including deterministic text processing and optional AI-powered analysis) to generate these notes.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>3. User Accounts</h2>
            <ul style={{ color: "var(--ink-muted)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are solely responsible for all activities that occur under your account.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>4. Acceptable Use</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>You agree not to:</p>
            <ul style={{ color: "var(--ink-muted)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws or regulations.</li>
              <li>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Attempt to decode, reverse-engineer, or extract source code from any software underlying the Service.</li>
              <li>Use automated tools (bots, scrapers) to access the Service without prior written consent.</li>
              <li>Submit false or misleading YouTube URLs for analysis.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>5. Intellectual Property</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              The Service and its original content, features, and functionality are owned by SermonAI and are protected by international copyright, trademark, and other intellectual property laws. You retain all rights to the content you create using the Service (your saved notes and reflections). We claim no ownership over your personal notes or reflections.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>6. Third-Party Content & Links</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              The Service accesses content from YouTube and may integrate with third-party AI providers (e.g., Google Gemini, OpenAI). We do not control and are not responsible for the content, accuracy, or policies of these third-party services. Your use of such services is at your own risk and governed by their respective terms.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>7. User Content</h2>
            <ul style={{ color: "var(--ink-muted)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
              <li>You are solely responsible for the content you save or create using the Service.</li>
              <li>By saving content to the Service, you grant us a limited license to store and process that content solely for the purpose of providing the Service to you.</li>
              <li>We do not review, edit, or endorse user-generated content. However, we reserve the right to remove any content that violates these Terms or applicable law.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>8. Service Availability</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              The Service is provided "as available." We do not guarantee that the Service will be uninterrupted, error-free, or secure. YouTube's availability of transcripts and metadata is beyond our control, and we cannot guarantee that every video will produce usable results. We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>9. Limitation of Liability</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              To the fullest extent permitted by law, SermonAI and its owners, operators, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from: (a) your access to or use of (or inability to access or use) the Service; (b) any conduct or content of any third party on the Service; (c) any content obtained from the Service; and (d) unauthorized access, use, or alteration of your transmissions or content.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>10. Indemnification</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              You agree to defend, indemnify, and hold harmless SermonAI and its owners, operators, affiliates, officers, and employees from and against any claims, disputes, demands, liabilities, damages, losses, and costs and expenses, including but not limited to reasonable legal fees, arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your infringement of any third-party rights.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>11. Governing Law</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which SermonAI operates, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located within that jurisdiction.
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>12. Changes to Terms</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>13. Contact</h2>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, marginTop: "0.5rem" }}>
              Email: legal@sermon-ai.com
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
