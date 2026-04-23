import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout';
import MembersPage from './pages/members-page/MembersPage';
import NewMemberPage from './pages/new-member/NewMemberPage';
import MemberSummaryPage from './pages/member-summary/MemberSummaryPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/members" replace />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/new" element={<NewMemberPage />} />
          <Route path="/members/:id" element={<MemberSummaryPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
