import { useState } from "react";
import ReactDOM from "react-dom";
import { ExpenseGroup } from "../types/budget";

interface ExpenseGroupManagerProps {
    isOpen: boolean;
    onClose: () => void;
    groups: ExpenseGroup[];
    onCreateGroup: (groupName: string) => void;
    onDeleteGroup: (groupId: string) => void;
    onEditGroup: (groupId: string, newName: string) => void;
    darkMode: boolean;
}

const ExpenseGroupManager = ({
                                 isOpen,
                                 onClose,
                                 groups,
                                 onCreateGroup,
                                 onDeleteGroup,
                                 onEditGroup,
                                 darkMode,
                             }: ExpenseGroupManagerProps) => {
    const [newGroupName, setNewGroupName] = useState("");
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    const handleCreateGroup = () => {
        if (newGroupName.trim() === "") return;

        onCreateGroup(newGroupName.trim());
        setNewGroupName("");
    };

    const startEdit = (group: ExpenseGroup) => {
        setEditingGroupId(group.id);
        setEditingName(group.name);
    };

    const handleEditSave = () => {
        if (editingName.trim() === "" || !editingGroupId) return;

        onEditGroup(editingGroupId, editingName.trim());
        setEditingGroupId(null);
        setEditingName("");
    };

    const cancelEdit = () => {
        setEditingGroupId(null);
        setEditingName("");
    };

    const handleDeleteGroup = (groupId: string) => {
        if (window.confirm("Are you sure you want to delete this group? Items in this group will become ungrouped.")) {
            onDeleteGroup(groupId);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-50"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div
                className={`relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden transition-all transform ${
                    darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                }`}
            >
                {/* Header */}
                <div
                    className={`p-4 ${
                        darkMode
                            ? "bg-gradient-to-r from-purple-900 to-indigo-900"
                            : "bg-gradient-to-r from-purple-600 to-indigo-600"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <span className="mr-2">📁</span>
                            Manage Groups
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-300 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 max-h-96 overflow-y-auto">
                    {/* Create new group */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Create New Group
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g., Entertainment, Transport"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleCreateGroup()}
                                className={`flex-1 px-3 py-2 rounded-lg ${
                                    darkMode
                                        ? "bg-gray-700 text-white border-gray-600"
                                        : "bg-gray-50 text-gray-900 border-gray-300"
                                } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            />
                            <button
                                onClick={handleCreateGroup}
                                disabled={!newGroupName.trim()}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    newGroupName.trim()
                                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                                        : "bg-gray-400 cursor-not-allowed text-gray-200"
                                }`}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Existing groups */}
                    <div>
                        <h3 className="text-sm font-medium mb-3">Existing Groups</h3>

                        {groups.length === 0 ? (
                            <div className={`text-center py-8 ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                            }`}>
                                <div className="text-4xl mb-2">📂</div>
                                <p>No groups created yet</p>
                                <p className="text-sm">Create your first group above!</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {groups.map((group) => (
                                    <div
                                        key={group.id}
                                        className={`p-3 rounded-lg border ${
                                            darkMode
                                                ? "bg-gray-700 border-gray-600"
                                                : "bg-gray-50 border-gray-200"
                                        }`}
                                    >
                                        {editingGroupId === group.id ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onKeyPress={(e) => e.key === "Enter" && handleEditSave()}
                                                    className={`flex-1 px-2 py-1 rounded ${
                                                        darkMode
                                                            ? "bg-gray-800 text-white border-gray-700"
                                                            : "bg-white text-gray-900 border-gray-300"
                                                    } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleEditSave}
                                                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">📁</span>
                                                    <span className="font-medium">{group.name}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => startEdit(group)}
                                                        className={`p-1 rounded text-sm ${
                                                            darkMode
                                                                ? "bg-gray-600 hover:bg-gray-500 text-gray-300"
                                                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                                        }`}
                                                        title="Edit group"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGroup(group.id)}
                                                        className="p-1 rounded text-sm bg-red-600 hover:bg-red-700 text-white"
                                                        title="Delete group"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${
                    darkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"
                }`}>
                    <button
                        onClick={onClose}
                        className={`w-full py-2 rounded-lg font-medium transition ${
                            darkMode
                                ? "bg-gray-700 hover:bg-gray-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        }`}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ExpenseGroupManager;