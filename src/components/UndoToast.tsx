import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

interface UndoToastProps {
    message: string;
    onUndo: () => void;
    onDismiss: () => void;
    darkMode: boolean;
    durationMs?: number;
}

// Bottom-anchored toast offering a short window to reverse an action.
// The countdown pauses while the toast is hovered or focused so it can't vanish mid-reach.
const UndoToast = ({
                       message,
                       onUndo,
                       onDismiss,
                       darkMode,
                       durationMs = 10000,
                   }: UndoToastProps) => {
    const [isPaused, setIsPaused] = useState(false);

    const onDismissRef = useRef(onDismiss);
    useEffect(() => {
        onDismissRef.current = onDismiss;
    }, [onDismiss]);

    useEffect(() => {
        if (isPaused) return;
        const timer = setTimeout(() => onDismissRef.current(), durationMs);
        return () => clearTimeout(timer);
    }, [isPaused, durationMs]);

    return ReactDOM.createPortal(
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
            <div
                role="status"
                aria-live="polite"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                className={`pointer-events-auto flex items-center gap-3 w-full max-w-md pl-4 pr-2 py-2 rounded-xl shadow-2xl ${
                    darkMode
                        ? "bg-gray-100 text-gray-900"
                        : "bg-gray-900 text-white"
                }`}
            >
                <span className="flex-1 text-sm">{message}</span>
                <button
                    type="button"
                    onClick={onUndo}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        darkMode
                            ? "text-indigo-700 hover:bg-indigo-100"
                            : "text-indigo-300 hover:bg-white/10"
                    }`}
                >
                    Undo
                </button>
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss"
                    className={`w-8 h-8 rounded-lg text-lg leading-none transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        darkMode ? "hover:bg-gray-200" : "hover:bg-white/10"
                    }`}
                >
                    ×
                </button>
            </div>
        </div>,
        document.body
    );
};

export default UndoToast;
