import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase, { USE_MOCK, supabaseAdmin } from '../services/supabaseClient';
import { mockUsers } from '../utils/mockData';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // user_profiles row (role, full_name…)
  const [loading, setLoading] = useState(true);  // true while restoring session

  // ── Fetch profile (role) from user_profiles table ──────────────────────
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser || !supabase) return null;
    
    // Create a 3-second timeout promise
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
    });

    try {
      // Use Admin client if available to bypass RLS during login phase
      const client = supabaseAdmin || supabase;
      const fetchPromise = client
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
      clearTimeout(timeoutHandle);
      
      if (error) {
        console.warn('[AuthContext] fetchProfile error:', error.code, error.message);
      }
      return data || null;
    } catch (err) {
      clearTimeout(timeoutHandle);
      console.warn('[AuthContext] fetchProfile timeout or error:', err.message);
      return null;
    }
  }, []);

  // ── Restore session on app load ─────────────────────────────────────────
  useEffect(() => {
    if (USE_MOCK || !supabase) {
      // Restore mock session from localStorage
      const saved = localStorage.getItem('sdc_mock_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setProfile(parsed);
      }
      setLoading(false);
      return;
    }

    // Get initial session (handles page refresh)
    supabase.auth.getSession().then(async (res) => {
      try {
        const session = res?.data?.session;
        if (session?.user) {
          setUser(session.user);
          // Small delay to ensure auth headers are ready
          await new Promise(r => setTimeout(r, 500));
          const p = await fetchProfile(session.user);
          setProfile(p);
        }
      } catch (err) {
        console.error('Session restore error:', err);
      } finally {
        setLoading(false);
      }
    });

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            setUser(session.user);
            
            // If we don't have a profile yet and it's not a master admin, fetch it
            const isRootAdmin = session.user.email?.toLowerCase() === 'admin@sdc.udn.vn';
            
            // We fetch profile but DON'T set loading to mid-session 
            // to avoid unmounting the entire app (which resets form state)
            const p = await fetchProfile(session.user);
            if (p) setProfile(p);
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
        } finally {
          // ensure loading is off after the first check
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── LOGIN ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // ── Mock mode (no Supabase configured) ──
    if (USE_MOCK || !supabase) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      // In mock mode username=email field value
      const found = mockUsers.find(u =>
        (u.username === cleanEmail || u.email === cleanEmail) && u.password === password
      );
      if (!found) {
        setLoading(false);
        throw new Error('Email hoặc mật khẩu không đúng');
      }
      if (found.status === 'inactive') {
        setLoading(false);
        throw new Error('Tài khoản đã bị vô hiệu hóa');
      }
      const userData = { ...found, role: found.role };
      delete userData.password;
      localStorage.setItem('sdc_mock_user', JSON.stringify(userData));
      setUser(userData);
      setProfile(userData);
      setLoading(false);
      return userData;
    }

    // ── Real Supabase Auth ──
    // Kiểm tra miền email hệ thống
    const emailDomain = cleanEmail.split('@')[1];
    if (cleanEmail !== 'admin@sdc.udn.vn' && emailDomain !== 'sdc.udn.vn') {
      throw new Error('Chỉ chấp nhận email nội bộ có đuôi @sdc.udn.vn');
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) {
      setLoading(false);
      // Translate Supabase error messages to Vietnamese
      if (error.message.includes('Invalid login credentials'))
        throw new Error('Email hoặc mật khẩu không đúng');
      if (error.message.includes('Email not confirmed'))
        throw new Error('Tài khoản chưa xác thực email');
      if (error.message.includes('Too many requests'))
        throw new Error('Đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút.');
      throw new Error(error.message);
    }

    // Wait 800ms before fetching profile to allow DB session to propagate
    await new Promise(r => setTimeout(r, 800));
    const p = await fetchProfile(data.user);
    console.log('[AuthContext] profile fetched:', p);

    // If profile is missing but it's not the root admin, assign viewer instead of failing
    if (!p && cleanEmail !== 'admin@sdc.udn.vn') {
      console.warn('Profile not found for user:', data.user.id);
      // We don't throw error here anymore, let them in as viewer to debug
    }
    
    if (p && p.status === 'inactive') {
      await supabase.auth.signOut();
      setLoading(false);
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }

    setProfile(p);
    return data.user;
  }, [fetchProfile]);

  // ── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (USE_MOCK || !supabase) {
      localStorage.removeItem('sdc_mock_user');
    } else {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Logout warning:', err.message);
      }
    }
    setUser(null);
    setProfile(null);
  }, []);

  // ── Derived role flags ────────────────────────────────────────────────────
  const userEmail = (user?.email || '').toLowerCase();
  const isMasterAdmin = userEmail === 'admin@sdc.udn.vn';
  const baseRole = profile?.role || user?.role || 'viewer';
  
  // Force admin role if they are the master email
  const role = isMasterAdmin ? 'admin' : baseRole;
  
  const isAdmin = role === 'admin';
  const isStaff = role === 'staff' || isAdmin;
  const isAuthenticated = !!user;

  // Display info: prefer profile, fallback to Supabase user email
  const displayName = profile?.full_name || user?.user_metadata?.full_name || (isMasterAdmin ? 'Super Admin' : user?.email) || '';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      displayName,
      login,
      logout,
      loading,
      isAdmin,
      isStaff,
      isAuthenticated,
      role,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
