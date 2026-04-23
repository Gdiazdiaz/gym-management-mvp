import {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/instance';
import type { Member } from '../../api/types';
import './MembersPage.css';

export default function MemebersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const load = async (q = '') => {
        setLoading(true);
        try {
            const { data } = await api.get<Member[]>('/members', {params: { q }});
            setMembers(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        load(query);
    }

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>Members</h1>
      
      <div className='search-container'>

<form onSubmit={onSearch} style={{ marginBottom: 16 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email"
          style={{ padding: 8, width: 260 }}
        />
        <button type="submit" style={{ padding: 8, marginLeft: 8 }}>Search</button>
      </form>
        <p><Link to="/members/new">+ New member</Link></p>
      </div>

      

            {loading ? <p>Loading…</p> : (
        <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td>{m.first_name} {m.last_name}</td>
                <td>{m.email}</td>
                <td>{m.phone_number || '—'}</td>
                <td><Link to={`/members/${m.id}`}>View</Link></td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>No members found</td></tr>
            )}
          </tbody>
        </table>
      )}

            
        </div>
    )
}