import { useState, useEffect } from 'react';

export function DonutChart({ values, colors, center = 'Total', label = '', onClick }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(1), 50);
    return () => clearTimeout(t);
  }, [values.join(',')]);

  const total = values.reduce((a, b) => a + b, 0) || 1;
  let offset = 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return <div className={`donut-wrap ${onClick ? 'actionable' : ''}`} onClick={onClick}>
    <svg viewBox="0 0 120 120" className="donut">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#edf0f5" strokeWidth="16" />
      {values.map((value, i) => {
        const length = circumference * value / total;
        const node = <circle key={i} cx="60" cy="60" r={radius} fill="none" stroke={colors[i]} strokeWidth="16" strokeDasharray={`${length * progress} ${circumference}`} strokeDashoffset={-offset * progress} transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 1s cubic-bezier(0, 0, 0.2, 1), stroke-dashoffset 1s cubic-bezier(0, 0, 0.2, 1)' }} />;
        offset += length;
        return node;
      })}
      <text x="60" y="56" textAnchor="middle" className="donut-number">{Math.round(values.reduce((a,b)=>a+b,0) * progress)}</text>
      <text x="60" y="70" textAnchor="middle" className="donut-label">{label}</text>
    </svg>
  </div>
}

export function BarChart({ items, color = '#6457d2', onClick }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(1), 50);
    return () => clearTimeout(t);
  }, [items.map(x=>x.value).join(',')]);

  const max = Math.max(...items.map(x => Number(x.value) || 0), 1);
  return <div className={`bars ${onClick ? 'actionable' : ''}`} onClick={onClick}>
    {items.map((item, i) => <div className="bar-row" key={i}>
      <span>{item.label}</span>
      <div className="bar-track">
        <i style={{ width: `${Math.max(2, (Number(item.value) || 0) / max * 100) * progress}%`, background: item.color || color, transition: 'width 1s cubic-bezier(0, 0, 0.2, 1)' }} />
      </div>
      <strong>{Math.round((Number(item.value) || 0) * progress)}</strong>
    </div>)}
  </div>
}

export function ProgressRing({ value, color = '#6457d2', onClick }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(1), 50);
    return () => clearTimeout(t);
  }, [value]);

  const radius = 45;
  const length = 2 * Math.PI * radius;
  return <div className={`progress-ring ${onClick ? 'actionable' : ''}`} onClick={onClick}>
    <svg viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={radius} fill="none" stroke="#edf0f5" strokeWidth="10" />
      <circle cx="55" cy="55" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${length} ${length}`} strokeDashoffset={length - (length * (value * progress) / 100)} transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0, 0, 0.2, 1)' }} />
      <text x="55" y="61" textAnchor="middle">{Math.round(value * progress)}%</text>
    </svg>
  </div>
}
