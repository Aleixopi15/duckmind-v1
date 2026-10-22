import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile, Subject, Topic, StudySession, Simulation, Essay, TopicCompletion, ErrorNotebookEntry } from '../lib/supabase';
import { INITIAL_TOPIC_TEMPLATES } from '../lib/mockData';
import { getSimulationDate } from '../lib/simulationUtils';

type ProfileUpdate = Partial<Pick<UserProfile, 'display_name' | 'avatar_emoji' | 'bio' | 'goal_daily_minutes' | 'goal_weekly_minutes' | 'goal_weekly_questions' | 'notifications_enabled'>>;

type AppState = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  subjects: Subject[];
  topics: Topic[];
  sessions: StudySession[];
  simulations: Simulation[];
  essays: Essay[];
  topicCompletions: TopicCompletion[];
  errorNotebook: ErrorNotebookEntry[];
  loading: boolean;
  refreshData: () => Promise<void>;
  updateStreak: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  toggleTopicCompletion: (topicId: string) => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [topicCompletions, setTopicCompletions] = useState<TopicCompletion[]>([]);
  const [errorNotebook, setErrorNotebook] = useState<ErrorNotebookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const userRef = useRef<User | null>(null);
  const currentUser = () => userRef.current;

  const fetchSubjects = useCallback(async () => {
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .order('display_order');
    if (data) setSubjects(data);
  }, []);

  const fetchUserData = useCallback(async (uid: string) => {
    const [profileRes, topicsRes, sessionsRes, simulationsRes, essaysRes, completionsRes, errorNotebookRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.from('topics').select('*').eq('user_id', uid).order('order_index'),
      supabase.from('study_sessions').select('*').eq('user_id', uid).order('studied_at', { ascending: false }),
      supabase.from('simulations').select('*').eq('user_id', uid).order('simulation_date', { ascending: false }),
      supabase.from('essays').select('*').eq('user_id', uid).order('written_at', { ascending: false }),
      supabase.from('topic_completions').select('*').eq('user_id', uid),
      supabase.from('error_notebook_entries').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (topicsRes.data) setTopics(topicsRes.data);
    if (sessionsRes.data) setSessions(sessionsRes.data);
    if (simulationsRes.data) setSimulations(simulationsRes.data);
    if (essaysRes.data) setEssays(essaysRes.data);
    if (completionsRes.data) setTopicCompletions(completionsRes.data);
    if (errorNotebookRes.data) setErrorNotebook(errorNotebookRes.data);
  }, []);

  const updateStreak = useCallback(async (userId?: string) => {
    const targetUserId = userId ?? currentUser()?.id;
    if (!targetUserId) return;

    const [sessionsRes, simulationsRes, profileRes] = await Promise.all([
      supabase.from('study_sessions').select('studied_at').eq('user_id', targetUserId),
      supabase.from('simulations').select('simulation_date, created_at, notes').eq('user_id', targetUserId),
      supabase.from('user_profiles').select('current_streak, longest_streak').eq('id', targetUserId).maybeSingle(),
    ]);

    const studiedDays = new Set<string>();
    (sessionsRes.data || []).forEach(s => {
      if (s.studied_at) studiedDays.add(s.studied_at.split('T')[0]);
    });
    (simulationsRes.data || []).forEach(sim => {
      const d = getSimulationDate(sim as any);
      if (d) studiedDays.add(d);
    });

    const formatLocalDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    let currentStreak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    const todayKey = formatLocalDate(cursor);
    if (!studiedDays.has(todayKey)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (studiedDays.has(formatLocalDate(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    const prevLongest = profileRes.data?.longest_streak ?? 0;
    const newLongest = Math.max(prevLongest, currentStreak);

    if (profileRes.data?.current_streak === currentStreak && prevLongest === newLongest) {
      setProfile(prev => prev ? { ...prev, current_streak: currentStreak, longest_streak: newLongest } : prev);
      return;
    }

    await supabase.from('user_profiles').update({
      current_streak: currentStreak,
      longest_streak: newLongest,
    }).eq('id', targetUserId);

    setProfile(prev => prev ? { ...prev, current_streak: currentStreak, longest_streak: newLongest } : prev);
  }, []);

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
      setProfile(prev => prev ? { ...prev, ...updates } : prev);
    }
  }, []);

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
        .select('id')
        .eq('id', authenticatedUser.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from('user_profiles').insert({
          id: authenticatedUser.id,
          display_name: authenticatedUser.email?.split('@')[0] ?? 'Estudante',
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
          // Insert in chunks of 20 to avoid large payloads
          for (let i = 0; i < topicsToInsert.length; i += 20) {
            await supabase.from('topics').insert(topicsToInsert.slice(i, i + 20));
          }
        }
      }

      await fetchUserData(authenticatedUser.id);
      await updateStreak(authenticatedUser.id);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
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

  return (
    <AppContext.Provider value={{
      session, user, profile, subjects, topics, sessions, simulations, essays, topicCompletions, errorNotebook,
      loading, refreshData, updateStreak, updateProfile, toggleTopicCompletion,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
