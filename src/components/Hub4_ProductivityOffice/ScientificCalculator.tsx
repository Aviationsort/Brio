/**
 * ScientificCalculator Component: Full Scientific & Graphic Function Evaluation
 * Styled like iOS 3 Calculator with glossy buttons and orange accents
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calculator, Delete, RotateCcw } from 'lucide-react';

type Token = { type: 'num'; value: number } | { type: 'op'; value: string } | { type: 'func'; value: string } | { type: 'const'; value: string } | { type: 'paren'; value: string };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    if (expr[i] === ' ') { i++; continue; }
    if (/[0-9.]/.test(expr[i])) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'num', value: parseFloat(num) });
    } else if (/[+\-*/^(),]/.test(expr[i])) {
      tokens.push({ type: 'op', value: expr[i] });
      i++;
    } else if (/[a-zA-Z_]/.test(expr[i])) {
      let name = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        name += expr[i];
        i++;
      }
      if (name === 'pi' || name === 'PI') tokens.push({ type: 'const', value: 'PI' });
      else if (name === 'e' || name === 'E') tokens.push({ type: 'const', value: 'E' });
      else tokens.push({ type: 'func', value: name });
    } else {
      throw new Error(`Invalid character: ${expr[i]}`);
    }
  }
  return tokens;
}

function parseExpr(tokens: Token[], pos: { i: number }): { value: number; pos: { i: number } } {
  let left = parseTerm(tokens, pos);

  while (pos.i < tokens.length && (tokens[pos.i].type === 'op') && (tokens[pos.i].value === '+' || tokens[pos.i].value === '-')) {
    const op = tokens[pos.i].value;
    pos.i++;
    const right = parseTerm(tokens, pos);
    if (op === '+') left = { value: left.value + right.value, pos };
    else left = { value: left.value - right.value, pos };
  }

  return left;
}

function parseTerm(tokens: Token[], pos: { i: number }): { value: number; pos: { i: number } } {
  let left = parsePower(tokens, pos);

  while (pos.i < tokens.length && (tokens[pos.i].type === 'op') && (tokens[pos.i].value === '*' || tokens[pos.i].value === '/')) {
    const op = tokens[pos.i].value;
    pos.i++;
    const right = parsePower(tokens, pos);
    if (op === '*') left = { value: left.value * right.value, pos };
    else left = { value: right.value === 0 ? (() => { throw new Error('Division by zero'); })() : left.value / right.value, pos };
  }

  return left;
}

function parsePower(tokens: Token[], pos: { i: number }): { value: number; pos: { i: number } } {
  let left = parseUnary(tokens, pos);

  while (pos.i < tokens.length && (tokens[pos.i].type === 'op') && tokens[pos.i].value === '^') {
    pos.i++;
    const right = parseUnary(tokens, pos);
    left = { value: Math.pow(left.value, right.value), pos };
  }

  return left;
}

function parseUnary(tokens: Token[], pos: { i: number }): { value: number; pos: { i: number } } {
  if (pos.i < tokens.length && (tokens[pos.i].type === 'op') && tokens[pos.i].value === '-') {
    pos.i++;
    const val = parseUnary(tokens, pos);
    return { value: -val.value, pos };
  }
  if (pos.i < tokens.length && (tokens[pos.i].type === 'op') && tokens[pos.i].value === '+') {
    pos.i++;
    return parseUnary(tokens, pos);
  }
  return parsePrimary(tokens, pos);
}

function parsePrimary(tokens: Token[], pos: { i: number }): { value: number; pos: { i: number } } {
  const token = tokens[pos.i];

  if (!token) {
    throw new Error('Unexpected end of expression');
  }

  if (token.type === 'num') {
    pos.i++;
    return { value: token.value, pos };
  }

  if (token.type === 'const') {
    pos.i++;
    if (token.value === 'PI') return { value: Math.PI, pos };
    if (token.value === 'E') return { value: Math.E, pos };
    throw new Error(`Unknown constant: ${token.value}`);
  }

  if (token.type === 'func') {
    pos.i++;
    if (pos.i >= tokens.length || tokens[pos.i].type !== 'paren' || tokens[pos.i].value !== '(') {
      throw new Error(`Expected '(' after function ${token.value}`);
    }
    pos.i++;
    const arg = parseExpr(tokens, pos);
    if (pos.i >= tokens.length || tokens[pos.i].type !== 'paren' || tokens[pos.i].value !== ')') {
      throw new Error('Expected closing parenthesis');
    }
    pos.i++;
    const fnName = token.value.toLowerCase();
    switch (fnName) {
      case 'sin': return { value: Math.sin(arg.value), pos };
      case 'cos': return { value: Math.cos(arg.value), pos };
      case 'tan': return { value: Math.tan(arg.value), pos };
      case 'sqrt': return { value: Math.sqrt(arg.value), pos };
      case 'log': return { value: Math.log10(arg.value), pos };
      case 'ln': return { value: Math.log(arg.value), pos };
      case 'abs': return { value: Math.abs(arg.value), pos };
      case 'floor': return { value: Math.floor(arg.value), pos };
      case 'ceil': return { value: Math.ceil(arg.value), pos };
      case 'round': return { value: Math.round(arg.value), pos };
      default: throw new Error(`Unknown function: ${token.value}`);
    }
  }

  if (token.type === 'paren' && token.value === '(') {
    pos.i++;
    const val = parseExpr(tokens, pos);
    if (pos.i >= tokens.length || tokens[pos.i].type !== 'paren' || tokens[pos.i].value !== ')') {
      throw new Error('Expected closing parenthesis');
    }
    pos.i++;
    return val;
  }

  throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
}

function safeEvaluate(expr: string): number {
  const tokens = tokenize(expr);
  const pos = { i: 0 };
  const result = parseExpr(tokens, pos);
  if (pos.i < tokens.length) {
    throw new Error('Unexpected trailing characters');
  }
  return result.value;
}

export const ScientificCalculator: React.FC = () => {
  const { showToast } = useApp();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string>('0');
  const [history, setHistory] = useState<string[]>([]);

  const appendSymbol = (sym: string) => {
    setExpression((prev) => prev + sym);
  };

  const clearCalculator = () => {
    setExpression('');
    setResult('0');
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const evaluateExpression = () => {
    if (!expression.trim()) return;

    try {
      const evalResult = safeEvaluate(expression);
      const stringRes = String(Number(evalResult.toFixed(6)));

      setResult(stringRes);
      setHistory((prev) => [`${expression} = ${stringRes}`, ...prev.slice(0, 5)]);
      showToast('Calculated', `${expression} = ${stringRes}`, 'success');
    } catch (err) {
      setResult('Syntax Error');
      showToast('Math Error', 'Invalid expression format.', 'error');
    }
  };

  const BTNS = [
    ['sin(', 'cos(', 'tan(', 'sqrt('],
    ['log(', '^', 'pi', 'e'],
    ['(', ')', '/', '*'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', '00', 'C'],
  ];

  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border-4 border-[#3a3a3a] rounded-[32px] p-4 shadow-2xl max-w-lg mx-auto space-y-4" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-gradient-to-b from-[#C8102E] to-[#cc4d19] rounded-xl text-black shadow-lg">
            <Calculator className="w-4 h-4" />
          </span>
          <div>
            <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">iOS Calculator</p>
            <h3 className="text-sm font-bold text-white">Scientific</h3>
          </div>
        </div>

        <button
          onClick={clearCalculator}
          className="p-2 bg-gradient-to-b from-rose-600 to-rose-800 text-white rounded-xl shadow-md active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Screen Display - iOS 3 style LCD */}
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-4 rounded-2xl border-2 border-[#333] shadow-inner text-right" style={{ boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.8)' }}>
        <p className="text-xs font-mono text-zinc-500 min-h-[18px] overflow-x-auto">{expression || '0'}</p>
        <p className="text-3xl font-black font-mono text-white tracking-tight overflow-x-auto drop-shadow-[0_2px_4px_rgba(255,95,31,0.5)]">{result}</p>
      </div>

      {/* Button Grid - iOS 3 glossy style */}
      <div className="space-y-2">
        {BTNS.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-4 gap-2">
            {row.map((btn) => {
              const isOperator = ['+', '-', '*', '/', '='].includes(btn);
              const isSpecial = ['sin(', 'cos(', 'tan(', 'sqrt(', 'log(', '^', 'pi', 'e'].includes(btn);

              return (
                <button
                  key={btn}
                  onClick={() => {
                    if (btn === '=') evaluateExpression();
                    else if (btn === 'C') clearCalculator();
                    else appendSymbol(btn);
                  }}
                  className={`py-4 rounded-2xl font-bold font-mono text-lg transition-all shadow-md active:scale-95 ${
                    btn === '='
                      ? 'bg-gradient-to-b from-[#C8102E] to-[#cc4d19] text-black font-black shadow-[0_4px_12px_rgba(255,95,31,0.4)]'
                      : btn === 'C'
                      ? 'bg-gradient-to-b from-rose-500 to-rose-700 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]'
                      : isSpecial
                      ? 'bg-gradient-to-b from-[#333] to-[#222] border border-white/10 text-[#C8102E] shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                      : isOperator
                      ? 'bg-gradient-to-b from-[#444] to-[#333] text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                      : 'bg-gradient-to-b from-[#555] to-[#444] text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                  }`}
                  style={{
                    backgroundImage: btn !== '=' && !isSpecial && !isOperator && btn !== 'C'
                      ? 'linear-gradient(to bottom, #666 0%, #444 100%)'
                      : undefined
                  }}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Calculation History */}
      {history.length > 0 && (
        <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] p-3 rounded-2xl border border-white/10 space-y-1 text-xs font-mono shadow-inner">
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Recent Calculations</p>
          {history.map((h, i) => (
            <p key={i} className="text-zinc-400">{h}</p>
          ))}
        </div>
      )}
    </div>
  );
};
