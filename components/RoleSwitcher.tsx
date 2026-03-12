'use client';

import { Role } from '@/lib/types';

interface Props {
  role: Role;
  onChange: (r: Role) => void;
}

const roles: Role[] = ['writer', 'editor', 'admin'];

const roleEmoji: Record<Role, string> = {
  writer: '✍️',
  editor: '🔍',
  admin: '👑'
};

const roleDesc: Record<Role, string> = {
  writer: 'Create & save drafts',
  editor: 'Review & publish posts',
  admin: 'Full access + analytics'
};

export function RoleSwitcher({ role, onChange }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: 4 }}>Role:</span>
      {roles.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          title={roleDesc[r]}
          style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: '0.85rem',
            fontWeight: 600,
            background: role === r ? 'var(--accent)' : 'var(--surface2)',
            color: role === r ? '#fff' : 'var(--text-muted)',
            border: role === r ? '2px solid var(--accent)' : '2px solid var(--border)',
            transition: 'all 0.2s'
          }}
        >
          {roleEmoji[r]} {r.charAt(0).toUpperCase() + r.slice(1)}
        </button>
      ))}
    </div>
  );
}
