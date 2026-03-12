'use client';

import { SeoAnalysis } from '@/lib/types';
import { scoreColor } from '@/lib/utils';

interface Props {
  seo: SeoAnalysis;
}

export function SeoPanel({ seo }: Props) {
  const color = scoreColor(seo.score);
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (seo.score / 100) * circumference;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={72} height={72} viewBox="0 0 72 72">
          <circle cx={36} cy={36} r={28} fill="none" stroke="var(--border)" strokeWidth={7} />
          <circle
            cx={36} cy={36} r={28}
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          <text x={36} y={41} textAnchor="middle" fill={color} fontSize={16} fontWeight="bold">
            {seo.score}
          </text>
        </svg>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>SEO Score</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 2 }}>
            {seo.score >= 80 ? '🚀 Excellent! Ready to rank.' : seo.score >= 50 ? '⚡ Good — a few tweaks needed.' : '🛠️ Needs work before publishing.'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {seo.checks.map((check) => (
          <div key={check.label} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 8,
            background: check.passed ? 'rgba(67,233,123,0.07)' : 'rgba(255,101,132,0.07)',
            border: `1px solid ${check.passed ? 'rgba(67,233,123,0.2)' : 'rgba(255,101,132,0.2)'}`
          }}>
            <span style={{ fontSize: '1rem', marginTop: 1 }}>{check.passed ? '✅' : '❌'}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{check.label}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>{check.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
