import { useCallback, useEffect, useState } from 'react';
import CalculatorButton from './CalculatorButton';

type Operator = '+' | '-' | '×' | '÷';

function compute(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      if (b === 0) throw new Error('Cannot divide by zero');
      return a / b;
  }
}

function formatValue(value: string): string {
  if (value === '' || value === '-') return value;
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  // Limit precision without trailing zeros
  const rounded = parseFloat(num.toPrecision(12));
  return String(rounded);
}

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previous, setPrevious] = useState<string | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [overwrite, setOverwrite] = useState(true);
  const [error, setError] = useState(false);

  const inputDigit = useCallback(
    (digit: string) => {
      if (error) {
        setError(false);
        setDisplay(digit);
        setOverwrite(false);
        return;
      }
      if (overwrite) {
        setDisplay(digit);
        setOverwrite(false);
      } else {
        setDisplay((prev) => (prev === '0' ? digit : prev + digit));
      }
    },
    [error, overwrite]
  );

  const inputDecimal = useCallback(() => {
    if (error) {
      setError(false);
      setDisplay('0.');
      setOverwrite(false);
      return;
    }
    if (overwrite) {
      setDisplay('0.');
      setOverwrite(false);
      return;
    }
    setDisplay((prev) => (prev.includes('.') ? prev : prev + '.'));
  }, [error, overwrite]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPrevious(null);
    setOperator(null);
    setOverwrite(true);
    setError(false);
  }, []);

  const backspace = useCallback(() => {
    if (error) {
      clearAll();
      return;
    }
    if (overwrite) return;
    setDisplay((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) {
        setOverwrite(true);
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [error, overwrite, clearAll]);

  const percent = useCallback(() => {
    if (error) return;
    const current = Number(display);
    if (!Number.isFinite(current)) return;
    const result = current / 100;
    setDisplay(formatValue(String(result)));
    setOverwrite(true);
  }, [display, error]);

  const chooseOperator = useCallback(
    (nextOp: Operator) => {
      if (error) return;
      const current = Number(display);
      if (!Number.isFinite(current)) return;

      if (operator && previous !== null && !overwrite) {
        try {
          const result = compute(Number(previous), current, operator);
          setPrevious(formatValue(String(result)));
        } catch {
          setDisplay('Error');
          setError(true);
          setPrevious(null);
          setOperator(null);
          return;
        }
      } else {
        setPrevious(formatValue(String(current)));
      }

      setOperator(nextOp);
      setOverwrite(true);
    },
    [display, operator, previous, overwrite, error]
  );

  const equals = useCallback(() => {
    if (error || operator === null || previous === null) return;
    const current = Number(display);
    if (!Number.isFinite(current)) return;
    try {
      const result = compute(Number(previous), current, operator);
      setDisplay(formatValue(String(result)));
    } catch {
      setDisplay('Error');
      setError(true);
    }
    setPrevious(null);
    setOperator(null);
    setOverwrite(true);
  }, [display, error, operator, previous]);

  const toggleSign = useCallback(() => {
    if (error) return;
    const current = Number(display);
    if (current === 0) return;
    setDisplay(formatValue(String(-current)));
  }, [display, error]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const { key } = e;
      if (key >= '0' && key <= '9') {
        e.preventDefault();
        inputDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        inputDecimal();
      } else if (key === '+') {
        e.preventDefault();
        chooseOperator('+');
      } else if (key === '-') {
        e.preventDefault();
        chooseOperator('-');
      } else if (key === '*') {
        e.preventDefault();
        chooseOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        chooseOperator('÷');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        equals();
      } else if (key === 'Escape') {
        e.preventDefault();
        clearAll();
      } else if (key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (key === '%') {
        e.preventDefault();
        percent();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    inputDigit,
    inputDecimal,
    chooseOperator,
    equals,
    clearAll,
    backspace,
    percent,
  ]);

  const expression =
    previous !== null && operator
      ? `${formatValue(previous)} ${operator}`
      : '\u00A0';

  return (
    <div className="w-full max-w-xs rounded-3xl bg-neutral-900 p-5 shadow-2xl ring-1 ring-white/10 sm:max-w-sm">
      {/* Display */}
      <div className="mb-4 flex flex-col items-end justify-end rounded-2xl bg-neutral-950 px-5 py-5 ring-1 ring-white/5">
        <span className="h-5 text-sm font-medium text-neutral-500 tabular-nums">
          {expression}
        </span>
        <span
          className={`mt-1 max-w-full truncate text-right text-4xl font-semibold tabular-nums ${
            error ? 'text-rose-400' : 'text-white'
          }`}
        >
          {display}
        </span>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        <CalculatorButton label="AC" variant="function" onClick={clearAll} />
        <CalculatorButton label="+/−" variant="function" onClick={toggleSign} />
        <CalculatorButton label="%" variant="function" onClick={percent} />
        <CalculatorButton label="÷" variant="operator" onClick={() => chooseOperator('÷')} />

        <CalculatorButton label="7" onClick={() => inputDigit('7')} />
        <CalculatorButton label="8" onClick={() => inputDigit('8')} />
        <CalculatorButton label="9" onClick={() => inputDigit('9')} />
        <CalculatorButton label="×" variant="operator" onClick={() => chooseOperator('×')} />

        <CalculatorButton label="4" onClick={() => inputDigit('4')} />
        <CalculatorButton label="5" onClick={() => inputDigit('5')} />
        <CalculatorButton label="6" onClick={() => inputDigit('6')} />
        <CalculatorButton label="−" variant="operator" onClick={() => chooseOperator('-')} />

        <CalculatorButton label="1" onClick={() => inputDigit('1')} />
        <CalculatorButton label="2" onClick={() => inputDigit('2')} />
        <CalculatorButton label="3" onClick={() => inputDigit('3')} />
        <CalculatorButton label="+" variant="operator" onClick={() => chooseOperator('+')} />

        <CalculatorButton label="0" wide onClick={() => inputDigit('0')} />
        <CalculatorButton label="." onClick={inputDecimal} />
        <CalculatorButton label="=" variant="equals" onClick={equals} />
      </div>
    </div>
  );
}
