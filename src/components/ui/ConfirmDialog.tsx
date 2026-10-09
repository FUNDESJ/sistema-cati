import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled)',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    const timer = window.setTimeout(() => {
      cancelRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      window.clearTimeout(timer);
      previousFocus?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="relative w-full max-w-md bg-white rounded-xl shadow-[0_8px_28px_rgb(0_0_0/0.18)] border border-[#d8d8d8]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#e5e5e5]">
          <h2 id="confirm-title" className="text-lg font-semibold text-[#1a1a1a] leading-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-md text-[#595959] hover:text-[#1a1a1a] hover:bg-[#f4f4f4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 py-5">
          <p id="confirm-message" className="text-[0.9375rem] text-[#3d3d3d] leading-relaxed">
            {message}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2.5">
            <button
              ref={cancelRef}
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="min-h-[44px] px-5 py-2.5 text-[0.9375rem] font-semibold rounded-md border border-[#d8d8d8] bg-white text-[#3d3d3d] hover:bg-[#f4f4f4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`
                min-h-[44px] px-5 py-2.5 text-[0.9375rem] font-semibold rounded-md text-white transition-colors
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-55 disabled:cursor-not-allowed
                ${variant === 'danger'
                  ? 'bg-[#a61b1b] hover:bg-[#8a1616] focus:ring-[#a61b1b]'
                  : 'bg-[#7b1113] hover:bg-[#5c0d0f] focus:ring-[#7b1113]'
                }
              `}
            >
              {isLoading ? 'Processando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}