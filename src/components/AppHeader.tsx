interface AppHeaderProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
  }

  const AppHeader = ({ darkMode, toggleDarkMode }: AppHeaderProps) => {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-900 opacity-30"></div>

        <div className="relative flex justify-between items-center p-6">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-indigo-600 dark:text-indigo-300">Budget</span>
            <span className="text-fg">Tracker</span>
          </h1>

          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            className="px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-300 bg-white hover:bg-gray-100 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {darkMode ? (
              <>
                <span aria-hidden="true">☀️</span>
                <span>Light</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">🌙</span>
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  export default AppHeader;
