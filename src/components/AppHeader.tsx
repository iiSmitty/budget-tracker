interface AppHeaderProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
  }
  
  const AppHeader = ({ darkMode, toggleDarkMode }: AppHeaderProps) => {
    return (
      <div className="relative overflow-hidden">
        <div
          className={`absolute inset-0 ${
            darkMode ? "bg-indigo-900" : "bg-indigo-600"
          } opacity-30`}
        ></div>
  
        <div className="relative flex justify-between items-center p-6">
          <h1 className="text-3xl font-bold tracking-tight">
            <span
              className={`${
                darkMode ? "text-indigo-300" : "text-indigo-600"
              }`}
            >
              Budget
            </span>
            <span className="text-white">Tracker</span>
          </h1>
  
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-white hover:bg-gray-100 text-gray-800"
            }`}
          >
            {darkMode ? (
              <>
                <span className="text-yellow-300">☀️</span>
                <span>Light</span>
              </>
            ) : (
              <>
                <span>🌙</span>
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  export default AppHeader;