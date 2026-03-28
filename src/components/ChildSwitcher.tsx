import { Child } from '../types';

interface Props {
  children: Child[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export default function ChildSwitcher({ children, selectedId, onSelect, onAdd }: Props) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
      {children.map(child => (
        <button
          key={child.id}
          onClick={() => onSelect(child.id)}
          className={`flex flex-col items-center min-w-[64px] p-2 rounded-2xl transition-all ${
            child.id === selectedId
              ? 'bg-pink-50 ring-2 ring-pink-300 scale-105'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <span className="text-3xl">{child.avatar}</span>
          <span className={`text-sm mt-1 whitespace-nowrap ${
            child.id === selectedId ? 'font-bold text-pink-600' : 'text-gray-600'
          }`}>{child.name}</span>
        </button>
      ))}
      <button
        onClick={onAdd}
        className="flex flex-col items-center min-w-[64px] p-2 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-3xl text-gray-300">➕</span>
        <span className="text-sm mt-1 text-gray-400 whitespace-nowrap">添加</span>
      </button>
    </div>
  );
}
