import { Moon, Settings, Sun, Wallet } from "lucide-react";
import Button from "./ui/Button";

interface AppHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
}

const AppHeader = ({ darkMode, onToggleDarkMode, onOpenSettings }: AppHeaderProps) => (
  <header className="flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary text-white" aria-hidden="true">
        <Wallet size={20} />
      </span>
      <h1 className="text-xl font-bold tracking-tight">
        Budget<span className="text-indigo-600 dark:text-indigo-400">Tracker</span>
      </h1>
    </div>

    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleDarkMode}
        aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
        title={darkMode ? "Light theme" : "Dark theme"}
      >
        {darkMode ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={onOpenSettings} aria-label="Settings" title="Settings">
        <Settings size={20} aria-hidden="true" />
      </Button>
    </div>
  </header>
);

export default AppHeader;
