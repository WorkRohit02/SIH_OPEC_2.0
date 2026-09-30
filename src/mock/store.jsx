import { createContext, useContext, useMemo, useState } from 'react';
import { RECORDS } from './records.js';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [session, setSession] = useState(() => sessionStorage.getItem('opec-session') === '1');
  const [records, setRecords] = useState(RECORDS);
  const [draft, setDraft] = useState({ attempt: 1, frame: null, analysis: null, reagent: 'Marquis reagent' });
  const value = useMemo(() => ({
    session,
    login: () => { sessionStorage.setItem('opec-session', '1'); setSession(true); },
    logout: () => { sessionStorage.removeItem('opec-session'); setSession(false); },
    records, addRecord: (r) => setRecords((p) => [r, ...p]),
    draft, setDraft, resetDraft: () => setDraft({ attempt: 1, frame: null, analysis: null, reagent: 'Marquis reagent' }),
    pending: 2,
    operator: { name: 'Demo Operator', id: 'OP-4587', org: 'Field Testing Unit', email: 'operator@opec.local', phone: '+91 98765 43210' },
  }), [session, records, draft]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
