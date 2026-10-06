import { useEffect, useId, useState } from "react";
import { Check, Folder, FolderCog, FolderOpen, Pencil, Trash2, X } from "lucide-react";
import { ExpenseGroup } from "../types/budget";
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";
import { fieldClass } from "./ui/fieldClass";

interface ExpenseGroupManagerProps {
    isOpen: boolean;
    onClose: () => void;
    groups: ExpenseGroup[];
    onCreateGroup: (groupName: string) => void;
    onDeleteGroup: (groupId: string) => void;
    onEditGroup: (groupId: string, newName: string) => void;
}

const iconButtonClass =
    "w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const ExpenseGroupManager = ({
                                 isOpen,
                                 onClose,
                                 groups,
                                 onCreateGroup,
                                 onDeleteGroup,
                                 onEditGroup,
                             }: ExpenseGroupManagerProps) => {
    const newGroupInputId = useId();
    const [newGroupName, setNewGroupName] = useState("");
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

    // Start each visit with no half-finished edit or pending delete
    useEffect(() => {
        if (isOpen) {
            setEditingGroupId(null);
            setConfirmingDeleteId(null);
        }
    }, [isOpen]);

    const handleCreateGroup = () => {
        if (newGroupName.trim() === "") return;

        onCreateGroup(newGroupName.trim());
        setNewGroupName("");
    };

    const startEdit = (group: ExpenseGroup) => {
        setConfirmingDeleteId(null);
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
        onDeleteGroup(groupId);
        setConfirmingDeleteId(null);
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            icon={<FolderCog size={20} />}
            title="Manage groups"
            footer={
                <Button variant="secondary" onClick={onClose} className="w-full">
                    Done
                </Button>
            }
        >
            {/* Create new group */}
            <div className="mb-6">
                <label htmlFor={newGroupInputId} className="block text-sm font-medium mb-2">
                    Create New Group
                </label>
                <div className="flex gap-2">
                    <input
                        id={newGroupInputId}
                        type="text"
                        placeholder="e.g., Entertainment, Transport"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                        className={fieldClass()}
                    />
                    <Button
                        variant="primary"
                        onClick={handleCreateGroup}
                        disabled={!newGroupName.trim()}
                    >
                        Add
                    </Button>
                </div>
            </div>

            {/* Existing groups */}
            <div>
                <h3 className="text-sm font-medium mb-3">Existing Groups</h3>

                {groups.length === 0 ? (
                    <div className="text-center py-8 text-fg-subtle">
                        <FolderOpen size={32} aria-hidden="true" className="mx-auto mb-2" />
                        <p>No groups created yet</p>
                        <p className="text-sm">Create your first group above!</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {groups.map((group) => (
                            <li
                                key={group.id}
                                className="p-3 rounded-lg border border-border bg-surface-muted/50"
                            >
                                {editingGroupId === group.id ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editingName}
                                            aria-label={`New name for ${group.name}`}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleEditSave();
                                                if (e.key === "Escape") {
                                                    // Cancel just the rename, not the whole dialog
                                                    e.preventDefault();
                                                    cancelEdit();
                                                }
                                            }}
                                            className={fieldClass()}
                                            autoFocus
                                        />
                                        <Button variant="success" size="sm" onClick={handleEditSave} aria-label="Save name">
                                            <Check size={16} aria-hidden="true" />
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={cancelEdit} aria-label="Cancel rename">
                                            <X size={16} aria-hidden="true" />
                                        </Button>
                                    </div>
                                ) : confirmingDeleteId === group.id ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <p className="flex-1 text-sm">
                                            Delete <strong>{group.name}</strong>? Its items become ungrouped.
                                        </p>
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="secondary" size="sm" onClick={() => setConfirmingDeleteId(null)}>
                                                Cancel
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteGroup(group.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Folder size={18} aria-hidden="true" className="shrink-0 text-fg-subtle" />
                                            <span className="font-medium truncate">{group.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(group)}
                                                className={`${iconButtonClass} text-fg-muted hover:text-fg hover:bg-surface-hover`}
                                                title="Rename group"
                                                aria-label={`Rename ${group.name}`}
                                            >
                                                <Pencil size={16} aria-hidden="true" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingGroupId(null);
                                                    setConfirmingDeleteId(group.id);
                                                }}
                                                className={`${iconButtonClass} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30`}
                                                title="Delete group"
                                                aria-label={`Delete ${group.name}`}
                                            >
                                                <Trash2 size={16} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Dialog>
    );
};

export default ExpenseGroupManager;
