import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../lib/theme';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  headerLeft?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  hideCloseOnBody?: boolean;
};

export default function Modal({ open, onClose, title, headerLeft, children, size = 'md', footer, hideCloseOnBody }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!open || !mounted) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  const modalContent = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in">
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={hideCloseOnBody ? undefined : onClose}
      />
      <div
        className={cn(
          'relative my-auto flex w-full max-h-[90vh] flex-col overflow-hidden rounded-[28px] animate-scale-in',
          'bg-white text-tinta dark:bg-[#151226] dark:text-texto',
          'border border-slate-200/80 dark:border-white/10 shadow-[0_20px_50px_rgba(20,16,42,0.18)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.7)]',
          sizeClass
        )}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-6 py-4.5 dark:border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              {headerLeft}
              <h2 className="truncate font-display text-xl font-bold text-[#14102A] dark:text-white sm:text-2xl">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-gray-100 hover:text-tinta dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/50 px-6 py-3.5 dark:border-white/5 dark:bg-white/[0.02]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
