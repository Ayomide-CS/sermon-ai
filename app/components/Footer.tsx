import Link from "next/link";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        {/* Brand Column */}
        <div className="site-footer__brand">
          <Link href="/" className="site-footer__logo">
            🎙️ SermonAI
          </Link>
          <p className="site-footer__tagline">
            Turn sermons into personal Bible study notes you can return to, reflect on, and live out.
          </p>
        </div>

        {/* Navigation Columns */}
        <div className="site-footer__columns">
          <div className="site-footer__column">
            <h4>Navigate</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/sermons">Sermons</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

          <div className="site-footer__column">
            <h4>Resources</h4>
            <ul>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Documentation</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">API Reference</a></li>
              <li><a href="https://github.com/sermon-ai" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>

          <div className="site-footer__column">
            <h4>Legal</h4>
            <ul>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="site-footer__bottom">
          <p>&copy; {currentYear} SermonAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
