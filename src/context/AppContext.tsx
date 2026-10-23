import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  UserProfile,
  UserMode,
  Subject,
  Topic,
  StudySession,
  Simulation,
  Essay,
  TopicCompletion,
  ErrorNotebookEntry,
  VestibularTask,
  UniversitySubject,
  UniversityGrade,
  UniversityTask,
  UniversityStudySession,
  UniversityFlashcard,
  UniversitySessionType,
} from '../lib/supabase';
import { INITIAL_TOPIC_TEMPLATES } from '../lib/mockData';
import { createInitialUniversityData } from '../lib/universityMockData';
import { getSimulationDate } from '../lib/simulationUtils';

type ProfileUpdate = Partial<
  Pick<
    UserProfile,
    | 'display_name'
    | 'avatar_emoji'
    | 'bio'
    | 'goal_daily_minutes'
    | 'goal_weekly_minutes'
    | 'goal_weekly_questions'
    | 'notifications_enabled'
    | 'current_mode'
  >
>;

type AppState = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  currentMode: UserMode;
  setMode: (mode: UserMode) => Promise<void>;
  toggleMode: () => Promise<void>;

  // Vestibular Mode Data (Estritamente isolado)
  subjects: Subject[];
  topics: Topic[];
  sessions: StudySession[];
  simulations: Simulation[];
  essays: Essay[];
  topicCompletions: TopicCompletion[];
  errorNotebook: ErrorNotebookEntry[];
  vestibularTasks: VestibularTask[];

  // Vestibular Mode Actions
  addVestibularTask: (data: Omit<VestibularTask, 'id' | 'user_id' | 'created_at' | 'delivered_at'>) => Promise<VestibularTask | null>;
  updateVestibularTask: (id: string, updates: Partial<VestibularTask>) => Promise<void>;
  deleteVestibularTask: (id: string) => Promise<void>;

  // University Mode Data (Estritamente isolado)
  universitySubjects: UniversitySubject[];
  universityGrades: UniversityGrade[];
  universityTasks: UniversityTask[];
  universitySessions: UniversityStudySession[];
  universityFlashcards: UniversityFlashcard[];

  // University Mode Actions
  addUniversitySubject: (data: Omit<UniversitySubject, 'id' | 'user_id' | 'created_at'>) => Promise<UniversitySubject | null>;
  updateUniversitySubject: (id: string, updates: Partial<UniversitySubject>) => Promise<void>;
  deleteUniversitySubject: (id: string) => Promise<void>;

  addUniversityGrade: (data: Omit<UniversityGrade, 'id' | 'user_id' | 'created_at'>) => Promise<UniversityGrade | null>;
  updateUniversityGrade: (id: string, updates: Partial<UniversityGrade>) => Promise<void>;
  deleteUniversityGrade: (id: string) => Promise<void>;

  addUniversityTask: (data: Omit<UniversityTask, 'id' | 'user_id' | 'created_at' | 'delivered_at'>) => Promise<UniversityTask | null>;
  updateUniversityTask: (id: string, updates: Partial<UniversityTask>) => Promise<void>;
  deleteUniversityTask: (id: string) => Promise<void>;

  addUniversitySession: (data: {
    subject_id: string;
    duration_minutes: number;
    notes?: string;
    session_type?: UniversitySessionType;
    studied_at?: string;
  }) => Promise<UniversityStudySession | null>;
  deleteUniversitySession: (id: string) => Promise<void>;

  addUniversityFlashcard: (data: Omit<UniversityFlashcard, 'id' | 'user_id' | 'created_at' | 'last_reviewed_at'>) => Promise<UniversityFlashcard | null>;
  updateUniversityFlashcard: (id: string, updates: Partial<UniversityFlashcard>) => Promise<void>;
  deleteUniversityFlashcard: (id: string) => Promise<void>;

  loading: boolean;
  refreshData: () => Promise<void>;
  updateStreak: (targetMode?: UserMode) => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  toggleTopicCompletion: (topicId: string) => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Vestibular Mode State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [topicCompletions, setTopicCompletions] = useState<TopicCompletion[]>([]);
  const [errorNotebook, setErrorNotebook] = useState<ErrorNotebookEntry[]>([]);
  const [vestibularTasks, setVestibularTasks] = useState<VestibularTask[]>([]);

  // University Mode State
  const [universitySubjects, setUniversitySubjects] = useState<UniversitySubject[]>([]);
  const [universityGrades, setUniversityGrades] = useState<UniversityGrade[]>([]);
  const [universityTasks, setUniversityTasks] = useState<UniversityTask[]>([]);
  const [universitySessions, setUniversitySessions] = useState<UniversityStudySession[]>([]);
  const [universityFlashcards, setUniversityFlashcards] = useState<UniversityFlashcard[]>([]);

  const [loading, setLoading] = useState(true);

  const userRef = useRef<User | null>(null);
  const currentUser = () => userRef.current;

  const currentMode: UserMode = profile?.current_mode ?? 'vestibular';

  const fetchSubjects = useCallback(async () => {
    const { data } = await supabase.from('subjects').select('*').order('display_order');
    if (data) setSubjects(data);
  }, []);

  const fetchUserData = useCallback(async (uid: string) => {
    const [
      profileRes,
      topicsRes,
      sessionsRes,
      simulationsRes,
      essaysRes,
      completionsRes,
      errorNotebookRes,
      vestibularTasksRes,
      uniSubjectsRes,
      uniGradesRes,
      uniTasksRes,
      uniSessionsRes,
      uniFlashcardsRes,
    ] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.from('topics').select('*').eq('user_id', uid).order('order_index'),
      supabase.from('study_sessions').select('*').eq('user_id', uid).order('studied_at', { ascending: false }),
      supabase.from('simulations').select('*').eq('user_id', uid).order('simulation_date', { ascending: false }),
      supabase.from('essays').select('*').eq('user_id', uid).order('written_at', { ascending: false }),
      supabase.from('topic_completions').select('*').eq('user_id', uid),
      supabase.from('error_notebook_entries').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('vestibular_tasks').select('*').eq('user_id', uid).order('due_date', { ascending: true }),
      supabase.from('university_subjects').select('*').eq('user_id', uid).order('created_at', { ascending: true }),
      supabase.from('university_grades').select('*').eq('user_id', uid).order('date', { ascending: true }),
      supabase.from('university_tasks').select('*').eq('user_id', uid).order('due_date', { ascending: true }),
      supabase.from('university_study_sessions').select('*').eq('user_id', uid).order('studied_at', { ascending: false }),
      supabase.from('university_flashcards').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (topicsRes.data) setTopics(topicsRes.data);
    if (sessionsRes.data) setSessions(sessionsRes.data);
    if (simulationsRes.data) setSimulations(simulationsRes.data);
    if (essaysRes.data) setEssays(essaysRes.data);
    if (completionsRes.data) setTopicCompletions(completionsRes.data);
    if (errorNotebookRes.data) setErrorNotebook(errorNotebookRes.data);

    // Vestibular tasks (sem re-seeding automático para respeitar exclusões do usuário)
    setVestibularTasks(vestibularTasksRes.data || []);

    // University mode data
    if (uniSubjectsRes.data) setUniversitySubjects(uniSubjectsRes.data);
    if (uniGradesRes.data) setUniversityGrades(uniGradesRes.data);
    if (uniTasksRes.data) setUniversityTasks(uniTasksRes.data);
    if (uniSessionsRes.data) setUniversitySessions(uniSessionsRes.data);
    if (uniFlashcardsRes.data) setUniversityFlashcards(uniFlashcardsRes.data);

    // If user has zero university subjects yet, automatically seed rich initial university data
    if (!uniSubjectsRes.data || uniSubjectsRes.data.length === 0) {
      const initialUni = createInitialUniversityData(uid);
      await Promise.all([
        supabase.from('university_subjects').insert(initialUni.subjects),
        supabase.from('university_grades').insert(initialUni.grades),
        supabase.from('university_tasks').insert(initialUni.tasks),
        supabase.from('university_study_sessions').insert(initialUni.sessions),
        supabase.from('university_flashcards').insert(initialUni.flashcards),
      ]);
      setUniversitySubjects(initialUni.subjects);
      setUniversityGrades(initialUni.grades);
      setUniversityTasks(initialUni.tasks);
      setUniversitySessions(initialUni.sessions);
      setUniversityFlashcards(initialUni.flashcards);
    }
  }, []);

  const updateStreak = useCallback(async (targetMode?: UserMode) => {
    const targetUserId = currentUser()?.id;
    if (!targetUserId) return;

    const mode = targetMode ?? (profile?.current_mode ?? 'vestibular');

    const studiedDays = new Set<string>();

    if (mode === 'vestibular') {
      const [sessionsRes, simulationsRes] = await Promise.all([
        supabase.from('study_sessions').select('studied_at').eq('user_id', targetUserId),
        supabase.from('simulations').select('simulation_date, created_at, notes').eq('user_id', targetUserId),
      ]);

      (sessionsRes.data || []).forEach(s => {
        if (s.studied_at) studiedDays.add(s.studied_at.split('T')[0]);
      });
      (simulationsRes.data || []).forEach(sim => {
        const d = getSimulationDate(sim as any);
        if (d) studiedDays.add(d);
      });
    } else {
      const { data: uniSessionsData } = await supabase
        .from('university_study_sessions')
        .select('studied_at')
        .eq('user_id', targetUserId);

      (uniSessionsData || []).forEach(s => {
        if (s.studied_at) studiedDays.add(s.studied_at.split('T')[0]);
      });
    }

    const formatLocalDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    let streakCount = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    const todayKey = formatLocalDate(cursor);
    if (!studiedDays.has(todayKey)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (studiedDays.has(formatLocalDate(cursor))) {
      streakCount++;
      cursor.setDate(cursor.getDate() - 1);
    }

    const prevLongest = profile?.longest_streak ?? 0;
    const newLongest = Math.max(prevLongest, streakCount);

    if (profile?.current_streak === streakCount && prevLongest === newLongest) {
      return;
    }

    await supabase
      .from('user_profiles')
      .update({
        current_streak: streakCount,
        longest_streak: newLongest,
      })
      .eq('id', targetUserId);

    setProfile(prev => (prev ? { ...prev, current_streak: streakCount, longest_streak: newLongest } : prev));
  }, [profile?.current_mode, profile?.current_streak, profile?.longest_streak]);

  const refreshData = useCallback(async () => {
    const u = currentUser();
    if (!u) return;
    await fetchUserData(u.id);
    await updateStreak();
  }, [fetchUserData, updateStreak]);

  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    const u = currentUser();
    if (!u) return;
    const { error } = await supabase.from('user_profiles').update(updates).eq('id', u.id);
    if (!error) {
      setProfile(prev => (prev ? { ...prev, ...updates } : prev));
    }
  }, []);

  const setMode = useCallback(async (mode: UserMode) => {
    const u = currentUser();
    if (!u) return;
    setProfile(prev => (prev ? { ...prev, current_mode: mode } : prev));
    await supabase.from('user_profiles').update({ current_mode: mode }).eq('id', u.id);
    await updateStreak(mode);
  }, [updateStreak]);

  const toggleMode = useCallback(async () => {
    const nextMode: UserMode = currentMode === 'vestibular' ? 'universitario' : 'vestibular';
    await setMode(nextMode);
  }, [currentMode, setMode]);

  // Vestibular Tasks CRUD Methods (Estritamente isolado do Universitário)
  const addVestibularTask = useCallback(async (data: Omit<VestibularTask, 'id' | 'user_id' | 'created_at' | 'delivered_at'>) => {
    const u = currentUser();
    if (!u) return null;
    const newTaskPayload = {
      ...data,
      user_id: u.id,
      delivered_at: data.status === 'done' ? new Date().toISOString() : null,
    };
    const { data: inserted, error } = await supabase
      .from('vestibular_tasks')
      .insert(newTaskPayload)
      .select()
      .maybeSingle();

    if (!error && inserted) {
      setVestibularTasks(prev => [...prev, inserted]);
      return inserted;
    } else if (!error) {
      const fallbackTask: VestibularTask = {
        id: crypto.randomUUID(),
        ...newTaskPayload,
        created_at: new Date().toISOString(),
      };
      setVestibularTasks(prev => [...prev, fallbackTask]);
      return fallbackTask;
    }
    return null;
  }, []);

  const updateVestibularTask = useCallback(async (id: string, updates: Partial<VestibularTask>) => {
    const payload = { ...updates };
    if (updates.status === 'done' && !updates.delivered_at) {
      payload.delivered_at = new Date().toISOString();
    } else if (updates.status && updates.status !== 'done') {
      payload.delivered_at = null;
    }

    const { error } = await supabase.from('vestibular_tasks').update(payload).eq('id', id);
    if (!error) {
      setVestibularTasks(prev => prev.map(t => (t.id === id ? { ...t, ...payload } : t)));
    }
  }, []);

  const deleteVestibularTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('vestibular_tasks').delete().eq('id', id);
    if (!error) {
      setVestibularTasks(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  // University CRUD Methods
  const addUniversitySubject = useCallback(async (data: Omit<UniversitySubject, 'id' | 'user_id' | 'created_at'>) => {
    const u = currentUser();
    if (!u) return null;
    const { data: inserted, error } = await supabase
      .from('university_subjects')
      .insert({ ...data, user_id: u.id })
      .select()
      .maybeSingle();

    if (!error && inserted) {
      setUniversitySubjects(prev => [...prev, inserted]);
      return inserted;
    }
    return null;
  }, []);

  const updateUniversitySubject = useCallback(async (id: string, updates: Partial<UniversitySubject>) => {
    const { error } = await supabase.from('university_subjects').update(updates).eq('id', id);
    if (!error) {
      setUniversitySubjects(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    }
  }, []);

  const deleteUniversitySubject = useCallback(async (id: string) => {
    const { error } = await supabase.from('university_subjects').delete().eq('id', id);
    if (!error) {
      setUniversitySubjects(prev => prev.filter(s => s.id !== id));
      setUniversityGrades(prev => prev.filter(g => g.subject_id !== id));
      setUniversityTasks(prev => prev.filter(t => t.subject_id !== id));
      setUniversitySessions(prev => prev.filter(s => s.subject_id !== id));
      setUniversityFlashcards(prev => prev.filter(f => f.subject_id !== id));
    }
  }, []);

  const addUniversityGrade = useCallback(async (data: Omit<UniversityGrade, 'id' | 'user_id' | 'created_at'>) => {
    const u = currentUser();
    if (!u) return null;
    const { data: inserted, error } = await supabase
      .from('university_grades')
      .insert({ ...data, user_id: u.id })
      .select()
      .maybeSingle();

    if (!error && inserted) {
      setUniversityGrades(prev => [...prev, inserted]);
      return inserted;
    }
    return null;
  }, []);

  const updateUniversityGrade = useCallback(async (id: string, updates: Partial<UniversityGrade>) => {
    const { error } = await supabase.from('university_grades').update(updates).eq('id', id);
    if (!error) {
      setUniversityGrades(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
    }
  }, []);

  const deleteUniversityGrade = useCallback(async (id: string) => {
    const { error } = await supabase.from('university_grades').delete().eq('id', id);
    if (!error) {
      setUniversityGrades(prev => prev.filter(g => g.id !== id));
    }
  }, []);

  const addUniversityTask = useCallback(async (data: Omit<UniversityTask, 'id' | 'user_id' | 'created_at' | 'delivered_at'>) => {
    const u = currentUser();
    if (!u) return null;
    const { data: inserted, error } = await supabase
      .from('university_tasks')
      .insert({ ...data, user_id: u.id, delivered_at: null })
      .select()
      .maybeSingle();

    if (!error && inserted) {
      setUniversityTasks(prev => [...prev, inserted]);
      return inserted;
    }
    return null;
  }, []);

  const updateUniversityTask = useCallback(async (id: string, updates: Partial<UniversityTask>) => {
    const payload = { ...updates };
    if (updates.status === 'done' && !updates.delivered_at) {
      payload.delivered_at = new Date().toISOString();
    } else if (updates.status && updates.status !== 'done') {
      payload.delivered_at = null;
    }

    const { error } = await supabase.from('university_tasks').update(payload).eq('id', id);
    if (!error) {
      setUniversityTasks(prev => prev.map(t => (t.id === id ? { ...t, ...payload } : t)));
    }
  }, []);

  const deleteUniversityTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('university_tasks').delete().eq('id', id);
    if (!error) {
      setUniversityTasks(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  const addUniversitySession = useCallback(async (data: {
    subject_id: string;
    duration_minutes: number;
    notes?: string;
    session_type?: UniversitySessionType;
    studied_at?: string;
  }) => {
    const u = currentUser();
    if (!u) return null;
    const newSession = {
      user_id: u.id,
      subject_id: data.subject_id,
      duration_minutes: data.duration_minutes,
      notes: data.notes || '',
      session_type: data.session_type || 'estudo',
      studied_at: data.studied_at || new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from('university_study_sessions')
      .insert(newSession)
      .select()
      .maybeSingle();

    if (!error && inserted) {
      setUniversitySessions(prev => [inserted, ...prev]);
      await updateStreak('universitario');
      return inserted;
    }
    return null;
  }, [updateStreak]);

  const deleteUniversitySession = useCallback(async (id: string) => {
    const { error } = await supabase.from('university_study_sessions').delete().eq('id', id);
    if (!error) {
      setUniversitySessions(prev => prev.filter(s => s.id !== id));
      await updateStreak('universitario');
    }
  }, [updateStreak]);

  const addUniversityFlashcard = useCallback(async (data: Omit<UniversityFlashcard, 'id' | 'user_id' | 'created_at' | 'last_reviewed_at'>) => {
    const u = currentUser();
    if (!u) return null;
    const { data: inserted, error } = await supabase
      .from('university_flashcards')
      .insert({ ...data, user_id: u.id, last_reviewed_at: null })
      .select()
      .maybeSingle();

    if (!error && inserted) {
      setUniversityFlashcards(prev => [inserted, ...prev]);
      return inserted;
    }
    return null;
  }, []);

  const updateUniversityFlashcard = useCallback(async (id: string, updates: Partial<UniversityFlashcard>) => {
    const { error } = await supabase.from('university_flashcards').update(updates).eq('id', id);
    if (!error) {
      setUniversityFlashcards(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
    }
  }, []);

  const deleteUniversityFlashcard = useCallback(async (id: string) => {
    const { error } = await supabase.from('university_flashcards').delete().eq('id', id);
    if (!error) {
      setUniversityFlashcards(prev => prev.filter(f => f.id !== id));
    }
  }, []);

  const toggleTopicCompletion = useCallback(async (topicId: string) => {
    const u = currentUser();
    if (!u) return;
    const existing = topicCompletions.find(tc => tc.topic_id === topicId);
    if (existing) {
      await supabase.from('topic_completions').delete().eq('id', existing.id);
      setTopicCompletions(prev => prev.filter(tc => tc.topic_id !== topicId));
    } else {
      const { data } = await supabase.from('topic_completions').insert({ topic_id: topicId, user_id: u.id }).select().maybeSingle();
      if (data) setTopicCompletions(prev => [...prev, data]);
    }
  }, [topicCompletions]);

  useEffect(() => {
    let active = true;

    const clearUserData = () => {
      setProfile(null);
      setTopics([]);
      setSessions([]);
      setSimulations([]);
      setEssays([]);
      setTopicCompletions([]);
      setErrorNotebook([]);
      setUniversitySubjects([]);
      setUniversityGrades([]);
      setUniversityTasks([]);
      setUniversitySessions([]);
      setUniversityFlashcards([]);
    };

    const loadAuthenticatedData = async (authenticatedUser: User | null) => {
      if (!authenticatedUser) {
        clearUserData();
        if (active) setLoading(false);
        return;
      }

      await fetchSubjects();
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id, current_mode')
        .eq('id', authenticatedUser.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from('user_profiles').insert({
          id: authenticatedUser.id,
          display_name: authenticatedUser.email?.split('@')[0] ?? 'Estudante',
          current_mode: 'vestibular',
        });
      }

      // Check if user has topics in Supabase; if not, seed default topics
      const { data: userExistingTopics } = await supabase
        .from('topics')
        .select('id')
        .eq('user_id', authenticatedUser.id)
        .limit(1);

      if (!userExistingTopics || userExistingTopics.length === 0) {
        const { data: dbSubjects } = await supabase.from('subjects').select('id, name');
        if (dbSubjects && dbSubjects.length > 0) {
          const subMap = new Map(dbSubjects.map(s => [s.name, s.id]));
          const topicsToInsert = INITIAL_TOPIC_TEMPLATES.map(item => {
            const subjectId = subMap.get(item.subjectName) || dbSubjects[0].id;
            return {
              user_id: authenticatedUser.id,
              subject_id: subjectId,
              name: item.name,
              description: item.description,
              order_index: item.order,
            };
          });
          for (let i = 0; i < topicsToInsert.length; i += 20) {
            await supabase.from('topics').insert(topicsToInsert.slice(i, i + 20));
          }
        }
      }

      await fetchUserData(authenticatedUser.id);
      await updateStreak(existing?.current_mode ?? 'vestibular');
      if (active) setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!active) return;
      const u = currentSession?.user ?? null;
      userRef.current = u;
      setSession(currentSession);
      setUser(u);
      setLoading(false);
      void loadAuthenticatedData(u);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const u = nextSession?.user ?? null;
      userRef.current = u;
      setSession(nextSession);
      setUser(u);
      if (event === 'INITIAL_SESSION') return;
      window.setTimeout(() => {
        if (active) void loadAuthenticatedData(u);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchSubjects, fetchUserData, updateStreak]);

  return (
    <AppContext.Provider
      value={{
        session,
        user,
        profile,
        currentMode,
        setMode,
        toggleMode,
        subjects,
        topics,
        sessions,
        simulations,
        essays,
        topicCompletions,
        errorNotebook,
        vestibularTasks,
        addVestibularTask,
        updateVestibularTask,
        deleteVestibularTask,
        universitySubjects,
        universityGrades,
        universityTasks,
        universitySessions,
        universityFlashcards,
        addUniversitySubject,
        updateUniversitySubject,
        deleteUniversitySubject,
        addUniversityGrade,
        updateUniversityGrade,
        deleteUniversityGrade,
        addUniversityTask,
        updateUniversityTask,
        deleteUniversityTask,
        addUniversitySession,
        deleteUniversitySession,
        addUniversityFlashcard,
        updateUniversityFlashcard,
        deleteUniversityFlashcard,
        loading,
        refreshData,
        updateStreak,
        updateProfile,
        toggleTopicCompletion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
