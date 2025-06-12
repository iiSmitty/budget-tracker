interface ProgressBarProps {
    label: string;
    value: number;
    color?: string;
    darkMode: boolean;
    max?: number;
}

const ProgressBar = ({
                         label,
                         value,
                         color = "bg-blue-500",
                         darkMode,
                         max = 100,
                     }: ProgressBarProps) => {

    const percentage = max === 0 ? 0 : (value / max) * 100;
    const barWidth = Math.min(percentage, 100);

    const displayPercentage = percentage >= 99.5 && percentage < 100
        ? percentage.toFixed(1)
        : Math.round(percentage);

    return (
        <div className="p-4">
            <div className="mb-2 flex justify-between">
                <span className="text-sm opacity-70">{label}</span>
                <span className="text-sm">{displayPercentage}%</span>
            </div>
            <div
                className={`h-2 w-full rounded-full ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
            >
                <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${barWidth}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;