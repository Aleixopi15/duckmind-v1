import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/theme';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
  hideCloseOnBody?: boolean;
};

export default function Modal({ open, onClose, title, children, size = 'md', footer, hideCloseOnBody }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-3 sm:p-5 animate-fade-in">
      <div
        className="fixed inset-0 bg-tinta/60"
        onClick={hideCloseOnBody ? undefined : onClose}
      />
      <div
        className={cn(
          'relative my-auto flex w-full max-h-[90vh] flex-col overflow-hidden animate-scale-in',
          'border-[3px] border-tinta bg-papel dark:border-papel dark:bg-surface-dark-card',
          sizeClass,
        )}
        style={{ borderRadius: 28, boxShadow: '8px 8px 0 #00D64B' }}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b-[3px] border-tinta px-5 pb-3 pt-4 sm:px-6 dark:border-papel/50">
            <h2 className="truncate font-display text-xl font-bold text-tinta dark:text-papel sm:text-2xl">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-tinta bg-white text-tinta transition-all hover:bg-pato active:translate-x-[2px] active:translate-y-[2px] dark:border-papel dark:bg-transparent dark:text-papel"
            >
              <X size={18} strokeWidth={2.6} />
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2.5 border-t-[3px] border-tinta px-5 py-3.5 sm:px-6 sm:py-4 dark:border-papel/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
