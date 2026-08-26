import { useCallback, useEffect, useRef, useState } from 'react';

// A floating, collapsible, draggable four-function calculator. It docks to the
// right edge of the screen, remembers its position/collapsed state across
// reloads, and is hidden by default on small (mobile) screens via CSS.

const STORAGE_KEY = 'dosagecalc.calculator';

// Keypad layout. Each entry: { label, value, kind }.
// kind drives styling and behaviour (digit / operator / action).
const KEYS = [
  { label: 'C', action: 'clear', kind: 'action' },
  { label: '⌫', action: 'back', kind: 'action', aria: 'Backspace' },
  { label: '%', value: '%', kind: 'operator', aria: 'Percent' },
  { label: '÷', value: '/', kind: 'operator', aria: 'Divide' },

  { label: '7', value: '7', kind: 'digit' },
  { label: '8', value: '8', kind: 'digit' },
  { label: '9', value: '9', kind: 'digit' },
  { label: '×', value: '*', kind: 'operator', aria: 'Multiply' },

  { label: '4', value: '4', kind: 'digit' },
  { label: '5', value: '5', kind: 'digit' },
  { label: '6', value: '6', kind: 'digit' },
  { label: '−', value: '-', kind: 'operator', aria: 'Subtract' },

  { label: '1', value: '1', kind: 'digit' },
  { label: '2', value: '2', kind: 'digit' },
  { label: '3', value: '3', kind: 'digit' },
  { label: '+', value: '+', kind: 'operator', aria: 'Add' },

  { label: '0', value: '0', kind: 'digit', wide: true },
  { label: '.', value: '.', kind: 'digit' },
  { label: '=', action: 'equals', kind: 'equals', aria: 'Equals' },
];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      collapsed: saved.collapsed ?? false,
      pos: saved.pos ?? null,
    };
  } catch {
    return { collapsed: false, pos: null };
  }
}

// Tokenise then evaluate a simple arithmetic expression using the
// shunting-yard algorithm. Supports + - * / and a trailing/standalone %
// (interpreted as "divide the preceding number by 100"). No eval(), so the
// input is never executed as code.
function evaluate(expr) {
  const tokens = expr.match(/(\d+\.?\d*|\.\d+|[+\-*/%])/g);
  if (!tokens) return null;

  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const output = [];
  const ops = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    if (/^[\d.]/.test(t)) {
      output.push(parseFloat(t));
    } else if (t === '%') {
      // Convert the most recent value to a percentage of itself.
      if (output.length === 0) return null;
      output.push(output.pop() / 100);
    } else {
      while (
        ops.length &&
        ops[ops.length - 1] !== '(' &&
        prec[ops[ops.length - 1]] >= prec[t]
      ) {
        output.push(ops.pop());
      }
      ops.push(t);
    }
  }
  while (ops.length) output.push(ops.pop());

  const stack = [];
  for (const t of output) {
    if (typeof t === 'number') {
      stack.push(t);
    } else {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) return null;
      let r;
      if (t === '+') r = a + b;
      else if (t === '-') r = a - b;
      else if (t === '*') r = a * b;
      else if (t === '/') r = b === 0 ? NaN : a / b;
      stack.push(r);
    }
  }
  if (stack.length !== 1) return null;
  const result = stack[0];
  if (!Number.isFinite(result)) return null;
  // Trim floating-point noise while keeping useful precision.
  return String(parseFloat(result.toPrecision(12)));
}

export default function Calculator() {
  const initial = loadState();
  const [collapsed, setCollapsed] = useState(initial.collapsed);
  const [pos, setPos] = useState(initial.pos); // { top, left } in px, or null
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');

  const panelRef = useRef(null);
  const dragRef = useRef(null); // { offsetX, offsetY }

  // Persist collapsed + position.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ collapsed, pos }));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [collapsed, pos]);

  const doEquals = useCallback(() => {
    const value = evaluate(expr);
    if (value === null) {
      setResult('Error');
    } else {
      setResult(value);
      setExpr(value);
    }
  }, [expr]);

  const press = useCallback(
    (key) => {
      if (key.action === 'clear') {
        setExpr('');
        setResult('');
        return;
      }
      if (key.action === 'back') {
        setExpr((e) => e.slice(0, -1));
        return;
      }
      if (key.action === 'equals') {
        doEquals();
        return;
      }
      // A fresh value after "=" starts over when a digit is typed.
      setResult('');
      setExpr((e) => {
        if (result && key.kind === 'digit' && e === result) return key.value;
        return e + key.value;
      });
    },
    [doEquals, result],
  );

  // Keyboard support while the calculator is focused/open.
  const onKeyDown = useCallback(
    (e) => {
      if (collapsed) return;
      const { key } = e;
      if (/^[0-9.]$/.test(key)) {
        press({ value: key, kind: 'digit' });
      } else if (['+', '-', '*', '/', '%'].includes(key)) {
        press({ value: key, kind: 'operator' });
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        press({ action: 'equals' });
      } else if (key === 'Backspace') {
        press({ action: 'back' });
      } else if (key === 'Escape') {
        press({ action: 'clear' });
      } else {
        return;
      }
      e.stopPropagation();
    },
    [collapsed, press],
  );

  // --- Dragging via the header handle (pointer events) ---
  const onPointerDown = useCallback((e) => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const panel = panelRef.current;
    const w = panel ? panel.offsetWidth : 260;
    const h = panel ? panel.offsetHeight : 360;
    let left = e.clientX - drag.offsetX;
    let top = e.clientY - drag.offsetY;
    // Keep the panel within the viewport.
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - h - 8));
    setPos({ top, left });
  }, []);

  const onPointerUp = useCallback((e) => {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  }, []);

  // Inline position: when the user has dragged it, honour that; otherwise the
  // default right-edge dock comes from CSS.
  const style = pos ? { top: `${pos.top}px`, left: `${pos.left}px`, right: 'auto' } : undefined;

  if (collapsed) {
    return (
      <button
        type="button"
        className="calc-launcher"
        onClick={() => setCollapsed(false)}
        aria-label="Open calculator"
        title="Open calculator"
      >
        <span aria-hidden="true">🖩</span>
      </button>
    );
  }

  return (
    <section
      ref={panelRef}
      className="calc-panel"
      style={style}
      role="region"
      aria-label="Calculator"
      onKeyDown={onKeyDown}
    >
      <header
        className="calc-header"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span className="calc-title" aria-hidden="true">
          ⠿ Calculator
        </span>
        <button
          type="button"
          className="calc-collapse"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse calculator"
          title="Collapse"
        >
          –
        </button>
      </header>

      <div className="calc-display" aria-live="polite">
        <div className="calc-expr">{expr || '0'}</div>
        <div className="calc-result">{result}</div>
      </div>

      <div className="calc-keys" role="group" aria-label="Calculator keys">
        {KEYS.map((key) => (
          <button
            key={key.label}
            type="button"
            className={`calc-key calc-key-${key.kind}${key.wide ? ' calc-key-wide' : ''}`}
            onClick={() => press(key)}
            aria-label={key.aria || key.label}
          >
            {key.label}
          </button>
        ))}
      </div>
    </section>
  );
}
