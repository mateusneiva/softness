'use client';

import { Check, Circle, X } from 'lucide-react';
import { getPasswordCriteriaStatus, type PasswordCriterionStatus } from '@/src/utils/validations';

const statusStyles: Record<PasswordCriterionStatus, { icon: typeof Check; className: string }> = {
  neutral: {
    icon: Circle,
    className: 'text-neutral-400',
  },
  met: {
    icon: Check,
    className: 'text-emerald-600',
  },
  unmet: {
    icon: X,
    className: 'text-red-600',
  },
};

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const criteria = getPasswordCriteriaStatus(password);

  return (
    <ul className="space-y-1.5 -mt-1" aria-live="polite">
      {criteria.map((item) => {
        const style = statusStyles[item.status];
        const Icon = style.icon;

        return (
          <li
            key={item.id}
            className={`flex items-center gap-2 text-[11px] font-sans transition-colors ${style.className}`}
          >
            <Icon size={12} strokeWidth={item.status === 'neutral' ? 1.5 : 2.5} className="shrink-0" aria-hidden />
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
