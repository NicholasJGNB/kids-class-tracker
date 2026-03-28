import { useState } from 'react';

interface FamilyMember {
  name: string;
  avatar: string;
  role: 'admin' | 'member';
}

const MOCK_FAMILY_NAME = '快乐小家';
const MOCK_MEMBERS: FamilyMember[] = [
  { name: '爸爸', avatar: '👨', role: 'admin' },
  { name: '妈妈', avatar: '👩', role: 'member' },
  { name: '奶奶', avatar: '👵', role: 'member' },
];

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function FamilyPage() {
  const [familyName, setFamilyName] = useState(MOCK_FAMILY_NAME);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(familyName);
  const [members, setMembers] = useState<FamilyMember[]>(MOCK_MEMBERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleSaveName = () => {
    const trimmed = editValue.trim();
    if (trimmed) setFamilyName(trimmed);
    setEditing(false);
  };

  const handleInvite = () => {
    setInviteCode(generateInviteCode());
    setShowInvite(true);
  };

  const handleRemove = (index: number) => {
    const member = members[index];
    if (member.role === 'admin') return;
    if (window.confirm(`确定要移除「${member.name}」吗？`)) {
      setMembers(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="px-4 pt-4 pb-32">
      {/* 家庭名称 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-5 mb-4">
        <p className="text-xs text-gray-400 mb-2">家庭名称</p>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="flex-1 text-xl font-bold text-gray-800 border-b-2 border-pink-300 outline-none bg-transparent py-1"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            />
            <button
              onClick={handleSaveName}
              className="px-3 py-1.5 bg-pink-400 text-white rounded-lg text-sm font-medium"
            >
              保存
            </button>
            <button
              onClick={() => { setEditing(false); setEditValue(familyName); }}
              className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium"
            >
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); setEditValue(familyName); }}
            className="flex items-center gap-2 group"
          >
            <span className="text-xl font-bold text-gray-800">{familyName}</span>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      {/* 家庭成员列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">家庭成员</h2>
          <span className="text-xs text-gray-400">{members.length} 人</span>
        </div>
        <div className="space-y-3">
          {members.map((member, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{member.avatar}</span>
                <div>
                  <span className="text-sm font-medium text-gray-800">{member.name}</span>
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                      member.role === 'admin'
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {member.role === 'admin' ? '管理员' : '成员'}
                  </span>
                </div>
              </div>
              {/* 只有管理员能看到移除按钮，且不能移除自己 */}
              {member.role !== 'admin' && (
                <button
                  onClick={() => handleRemove(index)}
                  className="text-xs text-red-400 bg-red-50 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors"
                >
                  移除
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 邀请家人按钮 */}
        <button
          onClick={handleInvite}
          className="w-full mt-4 py-3 bg-pink-50 text-pink-500 rounded-xl text-sm font-medium hover:bg-pink-100 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          邀请家人加入
        </button>
      </div>

      {/* 权限说明 */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">权限说明</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-pink-400 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </span>
            <span><strong>管理员</strong>：可添加、编辑、删除课程，管理家庭成员</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </span>
            <span><strong>成员</strong>：可查看课程信息，标记上课记录</span>
          </div>
        </div>
      </div>

      {/* 个人信息卡片 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">个人信息</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center text-2xl">
            👨
          </div>
          <div>
            <p className="text-base font-bold text-gray-800">爸爸</p>
            <p className="text-xs text-gray-400 mt-0.5">管理员 · 加入于 2024-01-01</p>
          </div>
        </div>
      </div>

      {/* 退出登录 */}
      <button className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
        退出登录
      </button>

      {/* 邀请码弹窗 */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowInvite(false)}>
          <div
            className="bg-white rounded-2xl p-6 mx-6 w-full max-w-[360px] shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">邀请家人</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              将以下邀请码分享给家人，<br/>对方输入后即可加入家庭
            </p>
            <div className="bg-gray-50 rounded-xl py-4 px-6 text-center mb-5">
              <p className="text-3xl font-mono font-bold text-pink-500 tracking-widest">{inviteCode}</p>
            </div>
            <p className="text-xs text-gray-400 text-center mb-5">
              邀请码 24 小时内有效，仅可使用一次
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInvite(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(inviteCode);
                  setShowInvite(false);
                }}
                className="flex-1 py-3 bg-pink-400 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors"
              >
                复制邀请码
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
