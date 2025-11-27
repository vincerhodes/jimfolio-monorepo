import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: 'genuine' | 'inconclusive' | 'false' | 'unable' | 'pending' | 'in-progress' | 'completed';
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'status-genuine': status === 'genuine',
          'status-inconclusive': status === 'inconclusive',
          'status-false': status === 'false',
          'status-unable': status === 'unable',
          'status-pending': status === 'pending',
          'status-in-progress': status === 'in-progress',
          'status-genuine': status === 'completed',
        }
      )}
    >
      {children}
    </span>
  );
}
