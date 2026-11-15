/**
 * storage.js
 * localStorage abstraction layer for Memory Helper.
 * All keys prefixed with 'mh_' to avoid collisions.
 * Schools / Subjects / Teachers / Homework have been removed.
 */

const STORAGE_KEYS = {
  reminders:   'mh_reminders',
  users:       'mh_users',
  currentUser: 'mh_current_user',
  theme:       'mh_theme',
  lang:        'mh_lang',
  messages:    'mh_messages',
  readNotifs:  'mh_read_notifs',
  subjects:    'mh_subjects',
  teachers:    'mh_teachers',
};

// ── Generic helpers ───────────────────────────────────────────────────────────

function storageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.error('Storage write failed for key:', key);
    return false;
  }
}

function storageRemove(key) {
  localStorage.removeItem(key);
}

// ── Reminder storage ──────────────────────────────────────────────────────────

function getRemindersRaw()        { return storageGet(STORAGE_KEYS.reminders, []); }
function saveRemindersRaw(data)   { return storageSet(STORAGE_KEYS.reminders, data); }

// ── User storage ──────────────────────────────────────────────────────────────

function getUsersRaw()            { return storageGet(STORAGE_KEYS.users, []); }
function saveUsersRaw(users)      { return storageSet(STORAGE_KEYS.users, users); }
function getCurrentUserRaw()      { return storageGet(STORAGE_KEYS.currentUser, null); }
function saveCurrentUserRaw(user) { return storageSet(STORAGE_KEYS.currentUser, user); }
function clearCurrentUser()       { storageRemove(STORAGE_KEYS.currentUser); }

// ── Notification read-state ───────────────────────────────────────────────────

function getReadNotifIds()        { return storageGet(STORAGE_KEYS.readNotifs, []); }
function saveReadNotifIds(ids)    { return storageSet(STORAGE_KEYS.readNotifs, ids); }

// ── Message storage ───────────────────────────────────────────────────────────

function getMessagesRaw()         { return storageGet(STORAGE_KEYS.messages, []); }
function saveMessagesRaw(msgs)    { return storageSet(STORAGE_KEYS.messages, msgs); }

// ── Subject / Teacher storage (user-created only, no seed data) ───────────────

function getSubjectsRaw()         { return storageGet(STORAGE_KEYS.subjects, []); }
function saveSubjectsRaw(data)    { return storageSet(STORAGE_KEYS.subjects, data); }
function getTeachersRaw()         { return storageGet(STORAGE_KEYS.teachers, []); }
function saveTeachersRaw(data)    { return storageSet(STORAGE_KEYS.teachers, data); }

// ── Theme / Lang ──────────────────────────────────────────────────────────────

function getTheme()               { return storageGet(STORAGE_KEYS.theme, 'light'); }
function saveTheme(theme)         { return storageSet(STORAGE_KEYS.theme, theme); }

// ── Export / Import ───────────────────────────────────────────────────────────

function exportAllData() {
  return {
    reminders:  getRemindersRaw(),
    messages:   getMessagesRaw(),
    subjects:   getSubjectsRaw(),
    teachers:   getTeachersRaw(),
    exportedAt: new Date().toISOString(),
    version:    '2.1',
  };
}

function importAllData(data) {
  if (Array.isArray(data.reminders)) saveRemindersRaw(data.reminders);
  if (Array.isArray(data.messages))  saveMessagesRaw(data.messages);
  if (Array.isArray(data.subjects))  saveSubjectsRaw(data.subjects);
  if (Array.isArray(data.teachers))  saveTeachersRaw(data.teachers);
}

// ── Clear app data (keeps user accounts) ─────────────────────────────────────
// Wipes tasks, messages, notification read-state, and saved subjects/teachers
// for a completely fresh start — the user account itself is preserved.

function clearAppData() {
  storageRemove(STORAGE_KEYS.reminders);
  storageRemove(STORAGE_KEYS.messages);
  storageRemove(STORAGE_KEYS.readNotifs);
  storageRemove(STORAGE_KEYS.subjects);
  storageRemove(STORAGE_KEYS.teachers);
  // Also wipe legacy keys from old versions so no leftover demo data appears
  ['mh_schools','mh_homework','mh_notifications','mh_sent_notifs'].forEach(k => localStorage.removeItem(k));
}

// ── Wipe everything including accounts ───────────────────────────────────────

function clearAllStorage() {
  Object.values(STORAGE_KEYS).forEach(k => storageRemove(k));
  ['mh_schools','mh_homework','mh_notifications','mh_sent_notifs'].forEach(k => localStorage.removeItem(k));
}

// ── ID generator ─────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ── Stubs for legacy calls from removed School/Homework entities ─────────────
// Schools and Homework-as-a-separate-entity have been intentionally left out
// (their functionality lives in Tasks + Subjects + Teachers now). These no-op
// stubs just prevent reference errors if anything still calls them.

function getSchoolsRaw()       { return []; }
function saveSchoolsRaw()      {}
function getHomeworkRaw()      { return []; }
function saveHomeworkRaw()     {}
