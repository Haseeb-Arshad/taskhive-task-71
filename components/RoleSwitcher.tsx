import { Role } from '@/lib/types';

type RoleSwitcherProps = {
  role: Role;
  onChange: (role: Role) => void;
};

const roleDescriptions: Record<Role, string> = {
  writer: 'Can draft and schedule posts',
  editor: 'Can draft, publish, and refine content',
  admin: 'Full control: publish, schedule, and analytics governance'
};

export function RoleSwitcher({ role, onChange }: RoleSwitcherProps) {
  const roles: Role[] = ['writer', 'editor', 'admin'];

  return (
    <section className="panel role-panel" aria-label="Role Selection">
      <div>
        <h2 className="panel-title">Workspace Role</h2>
        <p className="panel-subtitle">Switch roles to preview permissions and workflow states.</p>
      </div>

      <div className="role-grid" role="radiogroup" aria-label="Select role">
        {roles.map((value) => {
          const active = value === role;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              className={`role-chip ${active ? 'active' : ''}`}
              onClick={() => onChange(value)}
            >
              <span className="role-chip-title">{value}</span>
              <span className="role-chip-desc">{roleDescriptions[value]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
