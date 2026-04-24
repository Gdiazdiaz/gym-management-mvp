import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/instance';

export default function NewMemberPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post('/members', {
        ...form,
        phone_number: form.phone_number || undefined,
      });
      navigate(`/members/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create member');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (label: string, name: keyof typeof form, type = 'text', required = true) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        required={required}
        value={form[name]}
        onChange={e => setForm({ ...form, [name]: e.target.value })}
        style={{ padding: 8, width: '100%' }}
      />
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
      <h1>New member</h1>
      <form onSubmit={submit}>
        {field('First name', 'first_name')}
        {field('Last name', 'last_name')}
        {field('Email', 'email', 'email')}
        {field('Phone (optional)', 'phone_number', 'text', false)}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" disabled={submitting} style={{ padding: 10 }}>
          {submitting ? 'Creating…' : 'Create member'}
        </button>
      </form>
    </div>
  );
}