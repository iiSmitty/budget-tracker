import { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { ExpenseGroup } from "../types/budget";

// Define props interface
export interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  darkMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  groups?: ExpenseGroup[];
  onMoveToGroup?: (itemId: string, groupId: string) => void;
  isUngrouped?: boolean;
  itemId?: string;
}

const DropdownMenu = ({
                        isOpen,
                        onClose,
                        position,
                        darkMode,
                        onEdit,
                        onDelete,
                        groups = [],
                        onMoveToGroup,
                        isUngrouped = false,
                        itemId,
                      }: DropdownMenuProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close submenu when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setShowMoveSubmenu(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate position
  const style = {
    position: "fixed",
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 9999,
    minWidth: "140px",
  } as React.CSSProperties;

  return ReactDOM.createPortal(
      <div
          ref={dropdownRef}
          style={style}
          className={`py-2 rounded-lg shadow-lg border ${
              darkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-800 border-gray-200"
          }`}
          onClick={(e) => e.stopPropagation()}
      >
        <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className={`block w-full text-left px-4 py-2 text-sm ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
        >
          ✏️ Edit
        </button>

        {/* Move to Group Options for Ungrouped Items */}
        {isUngrouped && groups.length > 0 && (
            <div className="relative">
              <button
                  onClick={() => setShowMoveSubmenu(!showMoveSubmenu)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
              >
                📁 Move to Group ▶
              </button>

              {showMoveSubmenu && (
                  <div
                      className={`absolute left-full top-0 ml-1 py-2 rounded-lg shadow-lg border min-w-36 ${
                          darkMode
                              ? "bg-gray-800 text-white border-gray-700"
                              : "bg-white text-gray-800 border-gray-200"
                      }`}
                  >
                    {groups.map((group) => (
                        <button
                            key={group.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (itemId && onMoveToGroup) {
                                onMoveToGroup(itemId, group.id);
                              }
                              setShowMoveSubmenu(false);
                              onClose();
                            }}
                            className={`block w-full text-left px-3 py-2 text-sm ${
                                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                            }`}
                        >
                          📁 {group.name}
                        </button>
                    ))}
                  </div>
              )}
            </div>
        )}

        <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={`block w-full text-left px-4 py-2 text-sm text-red-500 ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
        >
          🗑️ Delete
        </button>
      </div>,
      document.body
  );
};

export default DropdownMenu;