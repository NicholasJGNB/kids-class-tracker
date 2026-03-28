const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function weekdayName(day: number): string {
  return WEEKDAY_NAMES[day] || '';
}

export function formatWeekdays(weekdays: number[]): string {
  return weekdays.map(weekdayName).join('、');
}

export function formatTimeRange(start: string, end: string): string {
  return `${start}-${end}`;
}

export function remainingSessions(totalSessions: number, usedSessions: number): number {
  return Math.max(0, totalSessions - usedSessions);
}

export function spentAmount(usedSessions: number, feePerSession: number): number {
  return usedSessions * feePerSession;
}

export function estimateEndDate(
  remaining: number,
  weeklyCount: number,
  sessionsPerClass: number
): string {
  if (weeklyCount === 0 || remaining <= 0) return '—';
  const weeksNeeded = remaining / (weeklyCount * sessionsPerClass);
  const daysNeeded = Math.ceil(weeksNeeded * 7);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysNeeded);
  return `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
}

export function progressPercent(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
