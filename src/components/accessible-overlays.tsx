"use client";

import { useEffect, useRef, type Dispatch, type KeyboardEvent, type ReactNode, type SetStateAction } from "react";

const focusableSelector = "button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])";
function focusableWithin(element: HTMLElement) {
  return [...element.querySelectorAll<HTMLElement>(focusableSelector)].filter((item) => item.getClientRects().length > 0);
}

/** Native disclosure controls: Tab works normally; arrow keys are a convenience, not a menu-role promise. */
export function useDisclosure(open: boolean, setOpen: Dispatch<SetStateAction<boolean>>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    const trigger = triggerRef.current;
    let dismissedOutside = false;
    function dismissOutside(event: Event) {
      if (!containerRef.current?.contains(event.target as Node)) { dismissedOutside = true; setOpen(false); }
    }
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
      // Removed action buttons leave focus on body. Don't steal focus after Tab or an outside click.
      if (!dismissedOutside && (document.activeElement === document.body || container?.contains(document.activeElement))) trigger?.focus();
    };
  }, [open, setOpen]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      triggerRef.current?.focus();
      setOpen(false);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    if (!open) {
      if (event.target !== triggerRef.current || !event.key.startsWith("Arrow")) return;
      event.preventDefault();
      setOpen(true);
      const last = event.key === "ArrowUp";
      requestAnimationFrame(() => {
        const items = panelRef.current ? focusableWithin(panelRef.current) : [];
        (last ? items.at(-1) : items[0])?.focus();
      });
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const items = panelRef.current ? focusableWithin(panelRef.current) : [];
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 :
      event.key === "ArrowDown" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  }
  return { containerRef, triggerRef, panelRef, onKeyDown };
}

export function AccessibleDialog({ titleId, className, onClose, returnFocusTo, children }: {
  titleId: string;
  className?: string;
  onClose: () => void;
  returnFocusTo: HTMLElement | null;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current!;
    const backdrop = dialog.parentElement!;
    const siblings = [...backdrop.parentElement!.children].filter((item) => item !== backdrop) as HTMLElement[];
    const previousInert = siblings.map((item) => item.inert);
    siblings.forEach((item) => { item.inert = true; });
    const initial = dialog.querySelector<HTMLElement>("[data-dialog-initial-focus]") ?? focusableWithin(dialog)[0] ?? dialog;
    initial.focus();
    function containFocus(event: FocusEvent) {
      if (!dialog.contains(event.target as Node)) initial.focus();
    }
    document.addEventListener("focusin", containFocus);
    return () => {
      document.removeEventListener("focusin", containFocus);
      siblings.forEach((item, index) => { item.inert = previousInert[index]; });
      if (returnFocusTo?.isConnected) returnFocusTo.focus();
    };
  }, [returnFocusTo]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    } else if (event.key === "Tab") {
      const items = focusableWithin(event.currentTarget);
      if (!items.length) { event.preventDefault(); event.currentTarget.focus(); return; }
      // Explicit traversal also works when Safari's native Tab setting skips buttons.
      event.preventDefault();
      const index = items.indexOf(document.activeElement as HTMLElement);
      const next = index < 0 ? (event.shiftKey ? items.length - 1 : 0) : (index + (event.shiftKey ? items.length - 1 : 1)) % items.length;
      items[next].focus();
    }
  }

  return <div className="guide-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section aria-labelledby={titleId} aria-modal="true" className={`guide-dialog ${className ?? ""}`} onKeyDown={onKeyDown} ref={dialogRef} role="dialog" tabIndex={-1}>
      {children}
    </section>
  </div>;
}
