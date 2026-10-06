import { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { ExpenseGroup } from "../types/budget";

// Define props interface
export interface DropdownMenuProps {
    isOpen: boolean;
    onClose: () => void;
    position: { top: number; left: number };
    onEdit: () => void;
    onDelete: () => void;
    groups?: ExpenseGroup[];
    onMoveToGroup?: (itemId: string, groupId: string) => void;
    isUngrouped?: boolean;
    itemId?: string;
    isIncome?: boolean;
}

const menuItemClass =
    "block w-full text-left px-4 py-3 text-sm transition-colors hover:bg-surface-muted focus:outline-none focus-visible:bg-surface-muted";

const DropdownMenu = ({
                          isOpen,
                          onClose,
                          position,
                          onEdit,
                          onDelete,
                          groups = [],
                          onMoveToGroup,
                          isUngrouped = false,
                          itemId,
                          isIncome = false,
                      }: DropdownMenuProps) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile on mount
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Close on clicks outside the menu or on Escape
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Close submenu when dropdown closes
    useEffect(() => {
        if (!isOpen) {
            setShowMoveSubmenu(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Calculate position - adjust for mobile to prevent off-screen issues
    const adjustedPosition = { ...position };

    if (isMobile) {
        // Ensure dropdown doesn't go off screen on mobile
        const viewportWidth = window.innerWidth;
        const dropdownWidth = 200; // Approximate width

        if (adjustedPosition.left + dropdownWidth > viewportWidth) {
            adjustedPosition.left = viewportWidth - dropdownWidth - 10;
        }
        if (adjustedPosition.left < 10) {
            adjustedPosition.left = 10;
        }
    }

    const style = {
        position: "fixed",
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        zIndex: 9999,
        minWidth: isMobile ? "180px" : "140px",
        maxWidth: isMobile ? "calc(100vw - 20px)" : "200px",
    } as React.CSSProperties;

    const moveToGroup = (groupId: string) => {
        if (itemId && onMoveToGroup) {
            onMoveToGroup(itemId, groupId);
        }
        setShowMoveSubmenu(false);
        onClose();
    };

    return ReactDOM.createPortal(
        <div
            ref={dropdownRef}
            style={style}
            className="py-2 rounded-lg shadow-lg border bg-surface text-fg border-border"
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                }}
                className={menuItemClass}
            >
                ✏️ Edit
            </button>

            {/* Move to Group Options - Different approach for mobile vs desktop */}
            {isUngrouped && !isIncome && groups.length > 0 && (
                <>
                    {/* Mobile: Show groups directly in main menu */}
                    {isMobile ? (
                        <>
                            <div className="px-4 py-2 text-xs font-medium border-t border-b text-fg-subtle border-border bg-surface-muted/50">
                                Move to Group:
                            </div>
                            {groups.map((group) => (
                                <button
                                    key={group.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        moveToGroup(group.id);
                                    }}
                                    className={menuItemClass}
                                >
                                    📁 {group.name}
                                </button>
                            ))}
                        </>
                    ) : (
                        /* Desktop: Keep the submenu approach */
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMoveSubmenu(!showMoveSubmenu);
                                }}
                                aria-expanded={showMoveSubmenu}
                                className={menuItemClass}
                            >
                                📁 Move to Group ▶
                            </button>

                            {showMoveSubmenu && (
                                <div className="absolute left-full top-0 ml-1 py-2 rounded-lg shadow-lg border min-w-36 bg-surface text-fg border-border">
                                    {groups.map((group) => (
                                        <button
                                            key={group.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveToGroup(group.id);
                                            }}
                                            className="block w-full text-left px-3 py-2 text-sm transition-colors hover:bg-surface-muted focus:outline-none focus-visible:bg-surface-muted"
                                        >
                                            📁 {group.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className={`${menuItemClass} text-red-600 dark:text-red-400`}
            >
                🗑️ Delete
            </button>
        </div>,
        document.body
    );
};

export default DropdownMenu;
