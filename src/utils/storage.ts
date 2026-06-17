import { Scheme } from '@/types';

const STORAGE_KEY = 'balcony-garden-schemes';
const CURRENT_KEY = 'balcony-garden-current';

export function loadSchemes(): Scheme[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSchemes(schemes: Scheme[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schemes));
  } catch (e) {
    console.error('保存方案失败:', e);
  }
}

export function loadCurrentSchemeId(): string | null {
  return localStorage.getItem(CURRENT_KEY);
}

export function saveCurrentSchemeId(id: string | null): void {
  if (id) {
    localStorage.setItem(CURRENT_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_KEY);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(str: string): Date {
  return new Date(str);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
