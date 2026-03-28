import { useState } from 'react';

interface Props {
  onConfirm: (name: string, avatar: string) => void;
  onCancel: () => void;
}

const AVATARS = ['👦', '👧', '👶', '🧒', '👦🏻', '👧🏻', '🧒🏻', '😊'];

export default function AddChildModal({ onConfirm, onCancel }: Props) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onConfirm(name.trim(), avatar);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">添加孩子</h3>

        {/* Avatar selection */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {AVATARS.map(a => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`text-3xl p-2 rounded-xl transition-all ${
                avatar === a ? 'bg-pink-50 ring-2 ring-pink-300 scale-110' : 'hover:bg-gray-50'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Name input */}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="请输入孩子姓名"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          autoFocus
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-3 bg-pink-400 text-white rounded-xl font-medium text-sm hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认添加
          </button>
        </div>
      </div>
    </div>
  );
}
