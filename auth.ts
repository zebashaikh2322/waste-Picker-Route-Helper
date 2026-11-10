import { AuthUser } from '../types';

const USERS_STORAGE_KEY = 'swach_pune_users_v1';
export const AUTH_SESSION_KEY = 'swach_pune_authenticated_user_v1';

const DEMO_USERS: Array<Omit<AuthUser, 'pinHash' | 'zone'>> = [
  {
    id: 'picker-1',
    fullName: 'Sunita',
    mobile: '9000000001',
    memberId: 'SW-4192',
    status: 'verified',
  },
  {
    id: 'picker-2',
    fullName: 'Babasaheb',
    mobile: '9000000002',
    memberId: 'SW-3004',
    status: 'verified',
  },
  {
    id: 'picker-4',
    fullName: 'Rahul',
    mobile: '9000000003',
    memberId: 'SW-6621',
    status: 'verified',
  },
];

// Demo uses localStorage and PIN. Production needs a server database and OTP.
export async function hashPin(pin: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function loadUsers(): AuthUser[] {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Stored user data is invalid. Clear the app data and register again.');
  }
  return parsed as AuthUser[];
}

function saveUsers(users: AuthUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export async function seedDemoUsers(): Promise<AuthUser[]> {
  const users = loadUsers();
  let changed = false;
  for (const demo of DEMO_USERS) {
    const existing = users.find((user) => user.mobile === demo.mobile);
    if (existing) continue;
    users.push({ ...demo, pinHash: await hashPin('1234') });
    changed = true;
  }
  if (changed) saveUsers(users);
  return users;
}

export async function registerUser(input: {
  fullName: string;
  mobile: string;
  pin: string;
}): Promise<AuthUser> {
  const users = loadUsers();
  if (users.some((user) => user.mobile === input.mobile)) {
    throw new Error('Already registered, please login');
  }

  const assignedIds = new Set(users.map((user) => user.memberId));
  const availableIdCount = 10_000 - [...assignedIds].filter((id) => /^SW-\d{4}$/.test(id)).length;
  if (availableIdCount <= 0) throw new Error('No SWaCH Member IDs are available. Please contact support.');

  let memberId = '';
  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const randomValue = new Uint32Array(1);
    crypto.getRandomValues(randomValue);
    const candidate = `SW-${(randomValue[0] % 10_000).toString().padStart(4, '0')}`;
    if (!assignedIds.has(candidate)) {
      memberId = candidate;
      break;
    }
  }
  if (!memberId) throw new Error('Could not allocate a Member ID. Please try again.');

  const user: AuthUser = {
    id: `picker-${crypto.randomUUID()}`,
    fullName: input.fullName.trim(),
    mobile: input.mobile,
    memberId,
    pinHash: await hashPin(input.pin),
    status: 'verified',
  };
  saveUsers([...users, user]);
  return user;
}

export async function authenticateUser(mobile: string, pin: string): Promise<AuthUser | null> {
  const user = loadUsers().find((candidate) => candidate.mobile === mobile);
  if (!user || (await hashPin(pin)) !== user.pinHash) return null;
  return user;
}

export function saveAuthenticatedUser(userId: string): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.setItem(AUTH_SESSION_KEY, userId);
}

export function loadAuthenticatedUser(users: AuthUser[]): AuthUser | null {
  const legacyUserId = localStorage.getItem(AUTH_SESSION_KEY);
  if (legacyUserId) localStorage.removeItem(AUTH_SESSION_KEY);
  const userId = sessionStorage.getItem(AUTH_SESSION_KEY);
  return users.find((user) => user.id === userId) || null;
}

export function clearAuthenticatedUser(): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}
