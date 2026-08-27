import { TOTAL_VARIANTS } from '../lib/generators/index.js';

export default function Footer() {
  return (
    <footer className="app-footer">
      <p>
        Practice tool for educational use. Always verify medication calculations
        against your institution&rsquo;s policies and a licensed professional.
      </p>
      <p>
        Reload the page any time for a fresh problem — roughly{' '}
        <strong>{TOTAL_VARIANTS.toLocaleString()}</strong> distinct problems can
        be generated across all types.
      </p>
    </footer>
  );
}
