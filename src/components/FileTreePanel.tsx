import { useState } from 'react';
import { useStore, ProjectItem, ProjectFile, ProjectFolder } from '../store';
import { Folder, FileCode, FileJson, Plus, MoreVertical, Trash2, Edit3, FolderPlus } from 'lucide-react';

function FileItem({ item, depth = 0 }: { item: ProjectItem; depth?: number }) {
  const { setActiveFile, updateFileContent, renameItem, deleteItem, project } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [showMenu, setShowMenu] = useState(false);
  const isActive = project?.activeFileId === item.id;

  const handleRename = () => {
    if (editName.trim() && editName !== item.name) {
      renameItem(item.id, editName);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete "${item.name}"?`)) {
      deleteItem(item.id);
    }
    setShowMenu(false);
  };

  const handleClick = () => {
    if (item.type === 'file') {
      setActiveFile(item.id);
    }
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer text-[13px] hover:bg-[#2c313a] ${isActive ? 'bg-[#3e4451]' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
      >
        {item.type === 'folder' ? (
          <Folder size={14} className="text-[#e5c07b]" />
        ) : item.name.endsWith('.json') ? (
          <FileJson size={14} className="text-[#98c379]" />
        ) : (
          <FileCode size={14} className="text-[#61afef]" />
        )}
        {isEditing ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="bg-[#282c34] text-[#abb2bf] px-1 py-0.5 text-[13px] outline-none border border-purple-500 rounded w-full"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-[#abb2bf] truncate">{item.name}</span>
        )}
        {showMenu && (
          <div className="ml-auto flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }} className="p-1 hover:bg-[#3e4451] rounded">
              <Edit3 size={12} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-1 hover:bg-[#f85149]/20 text-[#f85149] rounded">
              <Trash2 size={12} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} className="p-1 hover:bg-[#3e4451] rounded text-[#5c6370]">
              ×
            </button>
          </div>
        )}
      </div>
      {item.type === 'folder' && 'children' in item && (
        <div>
          {item.children.map((child) => (
            <FileItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTreePanel() {
  const { project, createFile, createFolder, createNewProject, isProjectDirty } = useStore();
  const [showNewMenu, setShowNewMenu] = useState(false);

  const handleNewFile = () => {
    const name = prompt('File name:', 'script.py');
    if (name) createFile(null, name);
    setShowNewMenu(false);
  };

  const handleNewFolder = () => {
    const name = prompt('Folder name:', 'folder');
    if (name) createFolder(null, name);
    setShowNewMenu(false);
  };

  const handleNewProject = () => {
    const name = prompt('Project name:', 'My Project');
    if (name) createNewProject(name);
    setShowNewMenu(false);
  };

  return (
    <div className="w-[200px] bg-[#21252b] border-r border-[#181a1f] flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[#181a1f] flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#abb2bf] uppercase">Explorer</span>
        <div className="relative">
          <button 
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="p-1 hover:bg-[#2c313a] rounded text-[#5c6370] hover:text-[#abb2bf]"
          >
            <Plus size={14} />
          </button>
          {showNewMenu && (
            <div className="absolute right-0 top-full mt-1 bg-[#282c34] border border-[#181a1f] rounded shadow-lg z-50 min-w-[140px]">
              <button onClick={handleNewFile} className="w-full px-3 py-2 text-left text-[13px] hover:bg-[#2c313a] flex items-center gap-2">
                <FileCode size={14} /> New File
              </button>
              <button onClick={handleNewFolder} className="w-full px-3 py-2 text-left text-[13px] hover:bg-[#2c313a] flex items-center gap-2">
                <FolderPlus size={14} /> New Folder
              </button>
              <hr className="border-[#181a1f] my-1" />
              <button onClick={handleNewProject} className="w-full px-3 py-2 text-left text-[13px] hover:bg-[#2c313a] text-purple-400 flex items-center gap-2">
                <Plus size={14} /> New Project
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {project ? (
          <div>
            <div className="px-3 py-1 text-[12px] text-[#5c6370] font-semibold">
              {project.name}
              {isProjectDirty && <span className="text-purple-400 ml-1">*</span>}
            </div>
            {project.root.map((item) => (
              <FileItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-4 text-[#5c6370] text-[13px] text-center">
            <p className="mb-3">No project open</p>
            <button 
              onClick={handleNewProject}
              className="px-3 py-1.5 bg-purple-600 text-white rounded text-[13px] hover:bg-purple-700"
            >
              Create New Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}