import { ReactNode, RefObject, useEffect, useId, useRef } from "react";
import ReactDOM from "react-dom";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    // Decorative element shown beside the title (e.g. an emoji badge)
    icon?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
    // "alertdialog" for confirmations that interrupt the user
    role?: "dialog" | "alertdialog";
    // When false, Escape and backdrop clicks don't close it (the user must use the dialog's own actions)
    dismissible?: boolean;
    showCloseButton?: boolean;
    // Element to focus on open; defaults to the first focusable element
    initialFocusRef?: RefObject<HTMLElement | null>;
    // Width of the panel from the `sm` breakpoint up
    size?: "sm" | "md" | "lg";
}

const FOCUSABLE =
    'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
};

// Open dialogs, top-most last. Only the top dialog reacts to the keyboard, and page
// scrolling stays locked until the last one closes.
const openDialogs: symbol[] = [];

const getFocusable = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.getClientRects().length > 0
    );

/**
 * Accessible modal shell used by every dialog in the app: portal, backdrop, Escape to close,
 * focus trapping and restoration, and scroll lock. A bottom sheet on phones, centred above.
 */
const Dialog = ({
                    isOpen,
                    onClose,
                    title,
                    description,
                    icon,
                    footer,
                    children,
                    role = "dialog",
                    dismissible = true,
                    showCloseButton = dismissible,
                    initialFocusRef,
                    size = "md",
                }: DialogProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    // Latest values for the keyboard handler, so the open/close effect only re-runs on isOpen
    const onCloseRef = useRef(onClose);
    const dismissibleRef = useRef(dismissible);
    useEffect(() => {
        onCloseRef.current = onClose;
        dismissibleRef.current = dismissible;
    }, [onClose, dismissible]);

    useEffect(() => {
        if (!isOpen || !panelRef.current) return;

        const panel = panelRef.current;
        const token = Symbol("dialog");
        const previouslyFocused = document.activeElement as HTMLElement | null;

        openDialogs.push(token);
        if (openDialogs.length === 1) {
            document.body.style.overflow = "hidden";
        }

        // Prefer the content (e.g. the first field), then the footer actions; the close button is a last resort
        const initialFocus =
            initialFocusRef?.current ??
            (bodyRef.current && getFocusable(bodyRef.current)[0]) ??
            (footerRef.current && getFocusable(footerRef.current)[0]) ??
            panel;
        initialFocus.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore keys meant for a dialog stacked above this one, or already handled by a child
            if (openDialogs[openDialogs.length - 1] !== token || event.defaultPrevented) return;

            if (event.key === "Escape") {
                if (dismissibleRef.current) {
                    event.preventDefault();
                    onCloseRef.current();
                }
                return;
            }

            if (event.key !== "Tab") return;

            const focusable = getFocusable(panel);
            if (focusable.length === 0) {
                event.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || active === panel)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            openDialogs.splice(openDialogs.indexOf(token), 1);
            if (openDialogs.length === 0) {
                document.body.style.overflow = "";
            }
            previouslyFocused?.focus();
        };
        // initialFocusRef is a stable ref object; only opening/closing should re-run this
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={dismissible ? onClose : undefined}
                aria-hidden="true"
            />

            <div
                ref={panelRef}
                role={role}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
                className={`relative flex flex-col w-full max-h-[92dvh] sm:max-h-[90dvh] rounded-t-2xl sm:rounded-2xl bg-surface text-fg shadow-2xl focus:outline-none ${sizeClasses[size]}`}
            >
                <div className="flex items-start gap-4 px-6 pt-6 pb-4">
                    {icon && (
                        <div
                            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg bg-surface-muted"
                            aria-hidden="true"
                        >
                            {icon}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h2 id={titleId} className="text-lg font-semibold">
                            {title}
                        </h2>
                        {description && (
                            <p id={descriptionId} className="mt-1 text-sm text-fg-muted">
                                {description}
                            </p>
                        )}
                    </div>
                    {showCloseButton && (
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="-mr-2 -mt-1 w-9 h-9 flex-shrink-0 rounded-lg text-2xl leading-none text-fg-subtle hover:text-fg hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            ×
                        </button>
                    )}
                </div>

                {children && (
                    <div ref={bodyRef} className="flex-1 overflow-y-auto px-6 pb-6">
                        {children}
                    </div>
                )}

                {footer && (
                    <div
                        ref={footerRef}
                        className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4 rounded-b-2xl border-t border-border bg-surface-muted/40"
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Dialog;
