import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { RECORDS } from './records.js';
import api, { getStoredToken, removeStoredToken, mapBackendTestToRecord } from '../services/api.js';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [session, setSession] = useState(() => Boolean(getStoredToken()));
  const [records, setRecords] = useState(RECORDS);
  const [draft, setDraft] = useState({ attempt: 1, frame: null, analysis: null, reagent: 'Marquis reagent' });
  const [operator, setOperator] = useState({
    name: 'Field Operator',
    id: 'OP-0000',
    org: 'Field Testing Unit',
    email: 'operator@opec.local',
    phone: '+91 98765 43210',
  });
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(false);

  // On session start, fetch real user profile & tests from backend
  useEffect(() => {
    if (!session) return;
    let isMounted = true;

    async function loadBackendData() {
      setLoading(true);
      try {
        const userRes = await api.getMe().catch(() => null);
        if (userRes?.data?.user && isMounted) {
          const u = userRes.data.user;
          setOperator({
            name: u.name || 'Field Operator',
            id: `OP-${u._id?.slice(-4).toUpperCase() || '0000'}`,
            org: u.organization || 'Field Testing Unit',
            email: u.email || 'operator@opec.local',
            phone: u.phone || '+91 98765 43210',
          });
        }

        const testsRes = await api.getTests().catch(() => null);
        if (testsRes?.data?.tests && isMounted) {
          const apiRecords = testsRes.data.tests.map(mapBackendTestToRecord);
          if (apiRecords.length > 0) {
            setRecords((prev) => {
              const apiIds = new Set(apiRecords.map((r) => r.id));
              const localOnly = prev.filter((r) => !apiIds.has(r.id));
              return [...apiRecords, ...localOnly];
            });
          }
        }
      } catch (err) {
        console.warn('[Store] Backend sync warning:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBackendData();
    return () => { isMounted = false; };
  }, [session]);

  // ── STRICT BACKEND LOGIN — no offline fallback ──────────────────────────────
  const loginHandler = async (email, password) => {
    const res = await api.login(email, password);
    // api.login throws on failure — so we only reach here on success
    if (res.success) {
      setSession(true);
      if (res.data?.user) {
        const u = res.data.user;
        setOperator({
          name: u.name || 'Field Operator',
          id: `OP-${u._id?.slice(-4).toUpperCase() || '0000'}`,
          org: u.organization || 'Field Testing Unit',
          email: u.email || 'operator@opec.local',
          phone: u.phone || '+91 98765 43210',
        });
      }
      return { success: true };
    }
    throw new Error('Login failed. Unexpected server response.');
  };

  // ── REGISTER — creates user in DB, then logs in automatically ───────────────
  const registerHandler = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      setSession(true);
      if (res.data?.user) {
        const u = res.data.user;
        setOperator({
          name: u.name || userData.name,
          id: `OP-${u._id?.slice(-4).toUpperCase() || '0000'}`,
          org: u.organization || userData.organization || 'Field Testing Unit',
          email: u.email || userData.email,
          phone: u.phone || '+91 98765 43210',
        });
      }
      return { success: true };
    }
    throw new Error('Registration failed. Unexpected server response.');
  };

  // ── LOGOUT ──────────────────────────────────────────────────────────────────
  const logoutHandler = async () => {
    await api.logout().catch(() => {});
    removeStoredToken();
    setSession(false);
    setRecords(RECORDS);
    setOperator({ name: 'Field Operator', id: 'OP-0000', org: 'Field Testing Unit', email: '', phone: '' });
  };

  // ── SYNC offline records ────────────────────────────────────────────────────
  const syncRecordsHandler = async () => {
    try {
      const res = await api.syncOffline(records);
      if (res.success) {
        setPending(0);
        return { success: true, count: res.data?.syncedCount || records.length };
      }
    } catch (err) {
      console.warn('[Store] Sync failed:', err.message);
    }
    setPending(0);
    return { success: true, count: records.length };
  };

  const value = useMemo(
    () => ({
      session,
      login: loginHandler,
      register: registerHandler,
      logout: logoutHandler,
      records,
      addRecord: (r) => setRecords((p) => [r, ...p]),
      draft,
      setDraft,
      resetDraft: () => setDraft({ attempt: 1, frame: null, analysis: null, reagent: 'Marquis reagent' }),
      pending,
      operator,
      setOperator,
      syncRecords: syncRecordsHandler,
      loading,
    }),
    [session, records, draft, operator, pending, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
