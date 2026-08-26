import ThemeControls from './ThemeControls.jsx';

export default function Header() {
  return (
    <header className="app-header">
      <div>
        <h1 className="app-title">Dosage Calc Practice</h1>
        <p className="app-subtitle">
          Randomized practice problems with worked solutions.
        </p>
      </div>
      <ThemeControls />
    </header>
  );
}
