import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SheetDialogProps {
  label: string;
  onClose: () => void;
  locked?: boolean;
  children: ReactNode;
}

export default function SheetDialog({ label, onClose, locked = false, children }: SheetDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    dialog?.showModal();
    dialog?.focus();
    return () => {
      dialog?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);

  return createPortal(
    <dialog ref={dialogRef} aria-label={label} tabIndex={-1}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const dialog = event.currentTarget;
        const controls = [...dialog.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, a[href], summary, [tabindex]',
        )].filter(control => control.tabIndex >= 0 && !control.matches(':disabled') && control.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (!first || event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault();
          (last ?? dialog).focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={event => { event.preventDefault(); if (!locked) onClose(); }}
      onClick={event => { if (event.target === event.currentTarget && !locked) onClose(); }}
      className="fixed inset-0 m-0 h-dvh w-full max-h-none max-w-none border-0 bg-transparent p-0 open:flex flex-col items-center justify-end backdrop:bg-black/60 backdrop:backdrop-blur-xs">
      {children}
    </dialog>, document.body,
  );
}
