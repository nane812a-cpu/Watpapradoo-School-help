/**
 * auth.js
 * Prototype authentication using localStorage.
 * NOTE: localStorage is NOT secure for production.
 *       Replace with real backend API calls when deploying.
 */

// ── Utility ───────────────────────────────────────────────────────────────────

function hashPassword(password) {
  // Simple obfuscation for prototype — NOT cryptographically secure.
  // Replace with bcrypt/argon2 on a real server.
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const chr = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(16);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Returns { success: true, user } or { success: false, error: 'key' }
 */
function registerUser({ fullName, username, email, password }) {
  const users = getUsersRaw();

  // Check duplicates
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase() ||
                      u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'userExists' };
  }

  const user = {
    id:          generateId(),
    fullName:    fullName.trim(),
    username:    username.trim(),
    email:       email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    avatar:      null,
    createdAt:   new Date().toISOString(),
    bio:         '',
    school:      '',
    grade:       '',
  };

  users.push(user);
  saveUsersRaw(users);

  // Auto-login
  const sessionUser = { ...user };
  delete sessionUser.passwordHash;
  saveCurrentUserRaw(sessionUser);

  return { success: true, user: sessionUser };
}

/**
 * Login an existing user.
 * Accepts email or username.
 */
function loginUser({ emailOrUsername, password, remember }) {
  const users = getUsersRaw();
  const ident = emailOrUsername.trim().toLowerCase();

  const found = users.find(u =>
    u.email === ident || u.username.toLowerCase() === ident
  );

  if (!found || found.passwordHash !== hashPassword(password)) {
    return { success: false, error: 'loginFailed' };
  }

  const sessionUser = { ...found };
  delete sessionUser.passwordHash;
  saveCurrentUserRaw(sessionUser);

  if (remember) {
    localStorage.setItem('mh_remember', '1');
  } else {
    localStorage.removeItem('mh_remember');
  }

  return { success: true, user: sessionUser };
}

/** Logout current user. */
function logoutUser() {
  clearCurrentUser();
  localStorage.removeItem('mh_remember');
}

/** Get current logged-in user (or null). */
function getCurrentUser() {
  return getCurrentUserRaw();
}

/** Check if a user session exists. */
function isLoggedIn() {
  return getCurrentUserRaw() !== null;
}

/**
 * Update the current user's profile fields.
 * Does NOT update password — use changePassword() for that.
 */
function updateProfile(fields) {
  const current = getCurrentUserRaw();
  if (!current) return { success: false };

  const users = getUsersRaw();
  const idx = users.findIndex(u => u.id === current.id);
  if (idx === -1) return { success: false };

  const allowed = ['fullName', 'username', 'email', 'bio', 'school', 'grade', 'avatar'];
  allowed.forEach(k => {
    if (fields[k] !== undefined) {
      users[idx][k] = fields[k];
    }
  });

  saveUsersRaw(users);

  const updated = { ...users[idx] };
  delete updated.passwordHash;
  saveCurrentUserRaw(updated);

  return { success: true, user: updated };
}

/**
 * Change current user's password.
 */
function changePassword({ currentPassword, newPassword }) {
  const current = getCurrentUserRaw();
  if (!current) return { success: false, error: 'fieldRequired' };

  const users = getUsersRaw();
  const idx = users.findIndex(u => u.id === current.id);
  if (idx === -1) return { success: false };

  if (users[idx].passwordHash !== hashPassword(currentPassword)) {
    return { success: false, error: 'loginFailed' };
  }

  users[idx].passwordHash = hashPassword(newPassword);
  saveUsersRaw(users);

  return { success: true };
}

// ── Demo account seeder ───────────────────────────────────────────────────────

/**
 * Seed a demo account if no users exist.
 * Demo: email: demo@memoryhelper.app  password: demo1234
 */
function seedDemoAccount() {
  const users = getUsersRaw();
  if (users.length > 0) return;

  registerUser({
    fullName: 'Demo Student',
    username: 'demostudent',
    email:    'demo@memoryhelper.app',
    password: 'demo1234',
  });

  // Clear the auto-login from register so the login page is shown
  clearCurrentUser();
}
