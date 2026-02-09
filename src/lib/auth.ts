// Simple authentication utility using localStorage
// In production, this would connect to a backend API

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

// Simple password hashing (for demo purposes - in production use proper hashing)
function hashPassword(password: string): string {
  // Simple hash - in production use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// User storage key
const USERS_STORAGE_KEY = 'pathway_users';
const SESSION_STORAGE_KEY = 'pathway_session';

// Get all users from storage
export function getUsers(): Array<User & { passwordHash: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

// Save users to storage
function saveUsers(users: Array<User & { passwordHash: string }>): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Create a new user
export function createUser(name: string, email: string, password: string): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  
  // Check if user already exists
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists' };
  }

  // Validate password
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  // Create new user
  const newUser: User & { passwordHash: string } = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Return user without password hash
  const { passwordHash, ...user } = newUser;
  return { success: true, user };
}

// Authenticate user
export function loginUser(email: string, password: string): { success: boolean; error?: string; session?: AuthSession } {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Create session
  const { passwordHash: _, ...userWithoutPassword } = user;
  const session: AuthSession = {
    user: userWithoutPassword,
    token: crypto.randomUUID(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return { success: true, session };
}

// Get current session
export function getSession(): AuthSession | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionStr) return null;

    const session: AuthSession = JSON.parse(sessionStr);
    
    // Check if session expired
    if (Date.now() > session.expiresAt) {
      logout();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Get current user
export function getCurrentUser(): User | null {
  const session = getSession();
  return session ? session.user : null;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

// Logout
export function logout(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// Update user profile
export function updateUser(userId: string, updates: Partial<User>): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  // Update user
  users[userIndex] = { ...users[userIndex], ...updates };
  saveUsers(users);

  // Update session if it's the current user
  const session = getSession();
  if (session && session.user.id === userId) {
    const { passwordHash, ...userWithoutPassword } = users[userIndex];
    session.user = userWithoutPassword;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  const { passwordHash, ...user } = users[userIndex];
  return { success: true, user };
}

