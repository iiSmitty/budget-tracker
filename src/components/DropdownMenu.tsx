import { RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FolderInput, FolderMinus, Pencil, Trash2 } from "lucide-react";

export interface MoveTarget {
    // undefined moves the item out of its group
    groupId: string | undefined;
    name: string;
}

export interface DropdownMenuProps {
    isOpen: boolean;
    onClose: () => void;
    // The button that opened the menu: it's anchored to it, and focus returns to it
    anchorRef: RefObject<HTMLButtonElement | null>;
    label: string;
    onEdit: () => void;
    onDelete: () => void;
    moveTargets?: MoveTarget[];
    onMove?: (groupId: string | undefined) => void;
}

const VIEWPORT_MARGIN = 8;

const itemClass =
    "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm rounded-md transition-colors hover:bg-surface-muted focus:outline-none focus-visible:bg-surface-muted";

/**
 * Actions menu for a budget item, following the ARIA menu pattern: arrow keys, Home/End,
 * Escape to close, focus returned to the trigger. Rendered in a portal, kept on screen and
 * attached to its trigger as the page scrolls, opening upwards when there isn't room below.
 */
const DropdownMenu = ({
                          isOpen,
                          onClose,
                          anchorRef,
                          label,
                          onEdit,
                          onDelete,
                          moveTargets = [],
                          onMove,
                      }: DropdownMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    // Place the menu under its trigger, right-aligned, flipped above if it would overflow
    const place = useCallback(() => {
        if (!anchorRef.current || !menuRef.current) return;
        const anchor = anchorRef.current.getBoundingClientRect();
        const menu = menuRef.current.getBoundingClientRect();

        const left = Math.min(
            Math.max(VIEWPORT_MARGIN, anchor.right - menu.width),
            window.innerWidth - menu.width - VIEWPORT_MARGIN
        );
        const below = anchor.bottom + 4;
        const top =
            below + menu.height > window.innerHeight - VIEWPORT_MARGIN
                ? Math.max(VIEWPORT_MARGIN, anchor.top - menu.height - 4)
                : below;

        setPosition({ top, left });
    }, [anchorRef]);

    useLayoutEffect(() => {
        if (isOpen) {
            place();
        } else {
            setPosition(null);
        }
    }, [isOpen, place]);

    // Focus the first item once the menu is first placed (not on every reposition)
    const isPlaced = position !== null;
    useEffect(() => {
        if (isOpen && isPlaced) {
            menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
        }
    }, [isOpen, isPlaced]);

    // Close on outside clicks; follow the trigger if the page scrolls or resizes underneath
    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (!menuRef.current?.contains(target) && !anchorRef.current?.contains(target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        window.addEventListener("resize", place);
        window.addEventListener("scroll", place, true);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            window.removeEventListener("resize", place);
            window.removeEventListener("scroll", place, true);
        };
    }, [isOpen, onClose, anchorRef, place]);

    if (!isOpen) return null;

    const closeAndRefocus = () => {
        onClose();
        anchorRef.current?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const items = Array.from(
            menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
        );
        const index = items.indexOf(document.activeElement as HTMLElement);
        const focusAt = (next: number) => items[(next + items.length) % items.length]?.focus();

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                focusAt(index + 1);
                break;
            case "ArrowUp":
                event.preventDefault();
                focusAt(index - 1);
                break;
            case "Home":
                event.preventDefault();
                focusAt(0);
                break;
            case "End":
                event.preventDefault();
                focusAt(items.length - 1);
                break;
            case "Escape":
                event.preventDefault();
                closeAndRefocus();
                break;
            case "Tab":
                onClose();
                break;
        }
    };

    const choose = (action: () => void) => () => {
        onClose();
        action();
    };

    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            onKeyDown={handleKeyDown}
            style={{
                position: "fixed",
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                visibility: position ? "visible" : "hidden",
            }}
            className="z-50 w-56 max-w-[calc(100vw-16px)] max-h-[60vh] overflow-y-auto p-1 rounded-xl border border-border bg-surface text-fg shadow-xl"
        >
            <button role="menuitem" tabIndex={-1} className={itemClass} onClick={choose(onEdit)}>
                <Pencil size={16} aria-hidden="true" className="text-fg-subtle" />
                Edit
            </button>

            {onMove && moveTargets.length > 0 && (
                <div role="group" aria-label="Move to" className="mt-1 pt-1 border-t border-border">
                    <div className="px-3 pt-1.5 pb-1 text-xs font-medium text-fg-subtle" aria-hidden="true">
                        Move to
                    </div>
                    {moveTargets.map((target) => (
                        <button
                            key={target.groupId ?? "none"}
                            role="menuitem"
                            tabIndex={-1}
                            className={itemClass}
                            onClick={choose(() => onMove(target.groupId))}
                        >
                            {target.groupId ? (
                                <FolderInput size={16} aria-hidden="true" className="text-fg-subtle" />
                            ) : (
                                <FolderMinus size={16} aria-hidden="true" className="text-fg-subtle" />
                            )}
                            <span className="truncate">{target.name}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-1 pt-1 border-t border-border">
                <button
                    role="menuitem"
                    tabIndex={-1}
                    className={`${itemClass} text-red-600 dark:text-red-400`}
                    onClick={choose(onDelete)}
                >
                    <Trash2 size={16} aria-hidden="true" />
                    Delete
                </button>
            </div>
        </div>,
        document.body
    );
};

export default DropdownMenu;
