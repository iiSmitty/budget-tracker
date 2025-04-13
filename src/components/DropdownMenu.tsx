import { useRef, useEffect } from "react";
import ReactDOM from "react-dom";

// Define props interface
export interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  darkMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const DropdownMenu = ({
  isOpen,
  onClose,
  position,
  darkMode,
  onEdit,
  onDelete,
}: DropdownMenuProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  // Calculate position
  const style = {
    position: "fixed",
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 9999,
    minWidth: "120px",
  } as React.CSSProperties;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      style={style}
      className={`py-2 rounded-lg shadow-lg ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
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
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`block w-full text-left px-4 py-2 text-sm text-red-500 ${
          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
      >
        Delete
      </button>
    </div>,
    document.body
  );
};

export default DropdownMenu;