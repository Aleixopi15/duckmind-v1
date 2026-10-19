import { INITIAL_SUBJECTS, createInitialTopics } from './mockData';
import type {
  Subject,
  Topic,
  UserProfile,
  StudySession,
  Simulation,
  Essay,
  TopicCompletion,
  ErrorNotebookEntry,
  RepertorioCustomEntry,
  RepertorioFavoriteEntry,
} from './supabase';

type StoredData = {
  subjects: Subject[];
  topics: Topic[];
  user_profiles: UserProfile[];
  study_sessions: StudySession[];
  simulations: Simulation[];
  essays: Essay[];
  topic_completions: TopicCompletion[];
  error_notebook_entries: ErrorNotebookEntry[];
  repertorios_custom: RepertorioCustomEntry[];
  repertorio_favorites: RepertorioFavoriteEntry[];
  storage_files: Record<string, string>; // path -> dataUrl
};

const STORAGE_KEY = 'duckmind_mock_db_v1';
const SESSION_KEY = 'duckmind_mock_session_v1';

function loadDB(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
        if (!parsed.repertorios_custom) parsed.repertorios_custom = [];
        if (!parsed.repertorio_favorites) parsed.repertorio_favorites = [];
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  const initial: StoredData = {
    subjects: INITIAL_SUBJECTS,
    topics: [],
    user_profiles: [],
    study_sessions: [],
    simulations: [],
    essays: [],
    topic_completions: [],
    error_notebook_entries: [],
    repertorios_custom: [],
    repertorio_favorites: [],
    storage_files: {},
  };
  saveDB(initial);
  return initial;
}

function saveDB(db: StoredData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // storage might be full for images
  }
}

type AuthListener = (event: string, session: any) => void;
let authListeners: AuthListener[] = [];

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

function setStoredSession(session: any) {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // ignore
  }
}

class MockQueryBuilder {
  private tableName: keyof StoredData;
  private filters: Array<(item: any) => boolean> = [];
  private orderConfig?: { col: string; ascending: boolean };
  private operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private payload: any = null;
  private returnSingle: 'single' | 'maybeSingle' | null = null;
  private limitCount?: number;

  constructor(tableName: keyof StoredData) {
    this.tableName = tableName;
  }

  select(_columns = '*') {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item: any) => item[column] === value);
    return this;
  }

  in(column: string, values: any[]) {
    const set = new Set(values);
    this.filters.push((item: any) => set.has(item[column]));
    return this;
  }

  limit(count: number) {
    // handled during execute
    this.limitCount = count;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderConfig = {
      col: column,
      ascending: options?.ascending !== false,
    };
    return this;
  }

  single() {
    this.returnSingle = 'single';
    return this;
  }

  maybeSingle() {
    this.returnSingle = 'maybeSingle';
    return this;
  }

  insert(data: any) {
    this.operation = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.operation = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  upsert(data: any) {
    this.operation = 'upsert';
    this.payload = data;
    return this;
  }

  async execute(): Promise<{ data: any; error: any }> {
    const db = loadDB();
    const tableList = (db[this.tableName] as any[]) || [];

    if (this.operation === 'insert') {
      const session = getStoredSession();
      const currentUserId = session?.user?.id;
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted: any[] = [];
      for (const item of items) {
        const newItem = {
          id: item.id || crypto.randomUUID(),
          created_at: item.created_at || new Date().toISOString(),
          ...(currentUserId && !item.user_id && this.tableName !== 'subjects' ? { user_id: currentUserId } : {}),
          ...item,
        };
        tableList.push(newItem);
        inserted.push(newItem);
      }
      saveDB(db);
      const res = Array.isArray(this.payload) ? inserted : inserted[0];
      return { data: res, error: null };
    }

    if (this.operation === 'upsert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const result: any[] = [];
      for (const item of items) {
        const idx = tableList.findIndex((t: any) => t.id === item.id);
        if (idx >= 0) {
          tableList[idx] = { ...tableList[idx], ...item };
          result.push(tableList[idx]);
        } else {
          const newItem = {
            id: item.id || crypto.randomUUID(),
            created_at: item.created_at || new Date().toISOString(),
            ...item,
          };
          tableList.push(newItem);
          result.push(newItem);
        }
      }
      saveDB(db);
      return { data: Array.isArray(this.payload) ? result : result[0], error: null };
    }

    if (this.operation === 'update') {
      let lastUpdated: any = null;
      for (let i = 0; i < tableList.length; i++) {
        if (this.filters.every(fn => fn(tableList[i]))) {
          tableList[i] = { ...tableList[i], ...this.payload };
          lastUpdated = tableList[i];
        }
      }
      saveDB(db);
      return { data: lastUpdated, error: null };
    }

    if (this.operation === 'delete') {
      const remaining = tableList.filter(item => !this.filters.every(fn => fn(item)));
      (db as any)[this.tableName] = remaining;
      saveDB(db);
      return { data: null, error: null };
    }

    // Default: select
    let results = tableList.filter(item => this.filters.every(fn => fn(item)));

    if (this.orderConfig) {
      const { col, ascending } = this.orderConfig;
      results = [...results].sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (ascending) return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
    }

    if (typeof this.limitCount === 'number') {
      results = results.slice(0, this.limitCount);
    }

    if (this.returnSingle === 'single') {
      return { data: results[0] ?? null, error: results.length === 0 ? { message: 'Row not found' } : null };
    }
    if (this.returnSingle === 'maybeSingle') {
      return { data: results[0] ?? null, error: null };
    }

    return { data: results, error: null };
  }

  // Makes the query builder thenable so await builder works directly
  then(onFulfilled?: ((value: any) => any) | null, onRejected?: ((reason: any) => any) | null) {
    return this.execute().then(onFulfilled, onRejected);
  }
}

export function createMockSupabaseClient() {
  return {
    auth: {
      async getSession() {
        const session = getStoredSession();
        return { data: { session }, error: null };
      },

      onAuthStateChange(callback: AuthListener) {
        authListeners.push(callback);
        // Call immediately with current session
        const currentSession = getStoredSession();
        setTimeout(() => {
          callback(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession);
        }, 0);

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners = authListeners.filter(l => l !== callback);
              },
            },
          },
        };
      },

      async signInWithPassword({ email, password: _password }: { email: string; password?: string }) {
        const cleanEmail = email.trim().toLowerCase();
        const userId = 'usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_');
        const session = {
          access_token: 'mock_jwt_token',
          token_type: 'bearer',
          user: {
            id: userId,
            email: cleanEmail,
            created_at: new Date().toISOString(),
          },
        };
        setStoredSession(session);

        // Ensure user has edital topics initialized
        const db = loadDB();
        const userTopics = db.topics.filter(t => t.user_id === userId);
        if (userTopics.length === 0) {
          const newTopics = createInitialTopics(userId);
          db.topics.push(...newTopics);
          saveDB(db);
        }

        authListeners.forEach(listener => listener('SIGNED_IN', session));
        return { data: { user: session.user, session }, error: null };
      },

      async signUp({ email, password }: { email: string; password?: string }) {
        return this.signInWithPassword({ email, password });
      },

      async signOut() {
        setStoredSession(null);
        authListeners.forEach(listener => listener('SIGNED_OUT', null));
        return { error: null };
      },

      async getUser() {
        const session = getStoredSession();
        return { data: { user: session?.user ?? null }, error: null };
      },
    },

    from(tableName: string) {
      return new MockQueryBuilder(tableName as keyof StoredData);
    },

    storage: {
      from(bucket: string) {
        return {
          async upload(filePath: string, file: File | Blob) {
            try {
              const reader = new FileReader();
              const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
              });
              const base64 = await base64Promise;
              const db = loadDB();
              db.storage_files[`${bucket}/${filePath}`] = base64;
              saveDB(db);
              return { data: { path: filePath }, error: null };
            } catch (err: any) {
              return { data: null, error: { message: err?.message || 'Upload failed' } };
            }
          },

          async remove(paths: string[]) {
            const db = loadDB();
            for (const p of paths) {
              delete db.storage_files[`${bucket}/${p}`];
            }
            saveDB(db);
            return { data: paths, error: null };
          },

          async createSignedUrl(filePath: string, _expiry = 3600) {
            const db = loadDB();
            const dataUrl = db.storage_files[`${bucket}/${filePath}`];
            if (dataUrl) {
              return { data: { signedUrl: dataUrl }, error: null };
            }
            return { data: { signedUrl: '' }, error: { message: 'File not found' } };
          },
        };
      },
    },
  };
}
