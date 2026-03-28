export interface Child {
  id: string;
  name: string;
  avatar: string; // emoji
  createdAt: number;
}

export interface Course {
  id: string;
  childId: string;
  name: string;
  institution: string;
  teacher: string;
  totalSessions: number;
  usedSessions: number;
  sessionsPerClass: number;
  totalFee: number;
  feePerSession: number;
  weekdays: number[]; // 0=周日, 1=周一...6=周六
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  color: string;
  createdAt: number;
}

export interface ClassRecord {
  id: string;
  courseId: string;
  childId: string;
  date: string; // "YYYY-MM-DD"
  sessions: number;
  fee: number;
  createdAt: number;
}

export interface FamilyMember {
  name: string;
  avatar: string;
  role: 'admin' | 'member';
}

export interface Family {
  name: string;
  members: FamilyMember[];
}
