import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
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
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      window.clearTimeout(timer);
      previousFocus?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onClick={closeOnOverlayClick ? onClose : undefined}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-xl shadow-[0_8px_28px_rgb(0_0_0/0.18)] border border-[#d8d8d8] max-h-[calc(100vh-2rem)] overflow-hidden`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-[#e5e5e5]">
          <h2 id="modal-title" className="text-lg font-semibold text-[#1a1a1a] leading-tight">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-md text-[#595959] hover:text-[#1a1a1a] hover:bg-[#f4f4f4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5 overflow-y-auto max-h-[calc(100vh-5.5rem)]">
          {children}
        </div>
      </div>
    </div>
  );

  return content;
}