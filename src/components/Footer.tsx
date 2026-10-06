import { TriangleAlert } from "lucide-react";
import { formatTimeAgo } from "../utils/utils";

interface FooterProps {
  // Show a reminder to back up, because data only lives in this browser
  isBackupDue: boolean;
  lastBackupAt: Date | null;
  onBackUpNow: () => void;
}

const Footer = ({ isBackupDue, lastBackupAt, onBackUpNow }: FooterProps) => (
  <footer className="pt-2 pb-6 text-center text-sm text-fg-subtle space-y-3">
    {isBackupDue && (
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-amber-700 dark:text-amber-400">
        <TriangleAlert size={16} aria-hidden="true" />
        <span>
          {lastBackupAt ? `Last backup ${formatTimeAgo(lastBackupAt)}.` : "Your budget hasn't been backed up yet."}
        </span>
        <button
          type="button"
          onClick={onBackUpNow}
          className="font-medium underline underline-offset-2 rounded hover:text-amber-800 dark:hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Back up now
        </button>
      </p>
    )}
    <p>
      Financial clarity by design ·{" "}
      <a
        href="https://andresmit.co.za/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium rounded text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        andresmit.co.za
      </a>
    </p>
  </footer>
);

export default Footer;
