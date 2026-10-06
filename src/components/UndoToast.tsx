import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

interface UndoToastProps {
    message: string;
    onUndo: () => void;
    onDismiss: () => void;
    durationMs?: number;
}

// Bottom-anchored toast offering a short window to reverse an action.
// The countdown pauses while the toast is hovered or focused so it can't vanish mid-reach.
// Colours are inverted relative to the page so it stands out in either theme.
const UndoToast = ({
                       message,
                       onUndo,
                       onDismiss,
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
                className="pointer-events-auto flex items-center gap-3 w-full max-w-md pl-4 pr-2 py-2 rounded-xl shadow-2xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
            >
                <span className="flex-1 text-sm">{message}</span>
                <button
                    type="button"
                    onClick={onUndo}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors text-indigo-300 hover:bg-white/10 dark:text-indigo-700 dark:hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    Undo
                </button>
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss"
                    className="w-8 h-8 rounded-lg text-lg leading-none transition-colors hover:bg-white/10 dark:hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    ×
                </button>
            </div>
        </div>,
        document.body
    );
};

export default UndoToast;
