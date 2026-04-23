import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/instance';
import type { MemberSummary, Plan } from '../../api/types';
import './MemberSummaryPage.css';

export default function MemberSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const memberId = Number(id);

  const [summary, setSummary] = useState<MemberSummary | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [planId, setPlanId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const load = async () => {
    const [s, p] = await Promise.all([
      api.get<MemberSummary>(`/members/${memberId}/summary`),
      api.get<Plan[]>('/plans'),
      
    ]);
    setSummary(s.data);
    setPlans(p.data);
  };

  useEffect(() => { load().catch(e => setError(e.message)); }, [memberId]);

  const assign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) return;
    setBusy(true); setError(null);
    try {
      await api.post('/memberships', {
        member_id: memberId,
        plan_id: Number(planId),
        start_date: startDate,
      });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign plan');
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!summary?.active_membership) return;
    if (!confirm('Cancel this membership?')) return;
    setBusy(true); setError(null);
    try {
      await api.post('/check-ins', { memberId: id });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setBusy(false);
    }
  };

  const checkIn = async () => {
    setBusy(true); setError(null);
    try {
        await api.post('/check-ins', { member_id: memberId });
        await load();
    } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to check in');
    } finally {
        setBusy(false);
    }
};

  if (!summary) return <div style={{ padding: 24 }}>Loading…</div>;

  const m = summary.member;
  const am = summary.active_membership;

  return (
    <div style={{ padding: 24, margin: '0 auto' }}>
      <p><Link to="/members">← Back to members</Link></p>
      <h1>{m.first_name} {m.last_name}</h1>
      <p className='email'>{m.email}{m.phone_number && ` · ${m.phone_number}`}</p>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <h2>Membership</h2>
      {am ? (
        <div className='membership-container'>
          <p><strong>Plan:</strong> {am.plan_name} (${am.plan_price})</p>
          <p><strong>Active from:</strong> {new Date(am.start_date).toLocaleDateString()} → {new Date(am.end_date).toLocaleDateString()}</p>
          <button className='cancel-btn' onClick={cancel} disabled={busy}>Cancel membership</button>
        </div>
      ) : (
        <form onSubmit={assign} style={{ border: '1px solid var(--accent)', padding: 12, marginBottom: 16 }}>
          <p>No active membership.</p>
          <div style={{ marginBottom: 8 }}>
            <label>Plan: </label>
            <select className='plan-select' value={planId} onChange={e => setPlanId(Number(e.target.value))} required>
              <option value="">Select a plan…</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} — ${p.price} ({p.duration_days}d)</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Start date: </label>
            <input
            className='date-input'
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
            />
          </div>
          <button className='assign-btn' type="submit" disabled={busy}>Assign plan</button>
        </form>
      )}

      <h2>Check-ins</h2>
      <div className='check-ins-container'>
      <p><strong>Last check-in:</strong> {summary.last_check_in_time
        ? new Date(summary.last_check_in_time).toLocaleString()
        : 'Never'}</p>
      <p><strong>Check-ins in last 30 days:</strong> <span className='check-ins'>{summary.check_ins_last_30_days}</span></p>
      <button className='check-in-btn' onClick={checkIn} disabled={busy || !am}>
        Record check-in
      </button>
      {!am && <p style={{ fontSize: 12, color: '#666' }}>
        (Requires an active membership)
      </p>}
      </div>
    </div>
  );
}