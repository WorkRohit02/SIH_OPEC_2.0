import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './mock/store.jsx';
import { BottomNav, Header } from './components/index.jsx';
import Login from './pages/Login.jsx'; import Dashboard from './pages/Dashboard.jsx'; import Library from './pages/Library.jsx'; import Detail from './pages/Detail.jsx';
import NewTest from './pages/NewTest.jsx'; import GuidedCapture from './pages/GuidedCapture.jsx'; import Result from './pages/Result.jsx'; import Secure from './pages/Secure.jsx';
import Audit from './pages/Audit.jsx'; import Help from './pages/Help.jsx'; import Profile from './pages/Profile.jsx'; import Verify from './pages/Verify.jsx';

function Shell() {
  const { session } = useStore(); const loc = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <div className="shell"><Header /><Outlet /><BottomNav /></div>;
}
function Guard({ children }) { const { session } = useStore(); return session ? children : <Navigate to="/login" replace />; }

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/test/capture" element={<Guard><GuidedCapture /></Guard>} />
        <Route element={<Shell />}>
          <Route index element={<Dashboard />} /><Route path="evidence" element={<Library />} /><Route path="evidence/:id" element={<Detail />} />
          <Route path="test/new" element={<NewTest />} /><Route path="test/result" element={<Result />} /><Route path="test/secure" element={<Secure />} />
          <Route path="audit" element={<Audit />} /><Route path="help" element={<Help />} /><Route path="profile" element={<Profile />} /><Route path="verify" element={<Verify />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  );
}
