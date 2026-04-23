import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { db } from '../db/knex';
import { Main } from '../server';

const app = Main();

describe('Memberships — one active at a time', () => {
  let memberId: number;
  let plan1Id: number;
  let plan2Id: number;

  beforeAll(async () => {
  await db.migrate.latest();
  await db('check_ins').del();
  await db('memberships').del();
  await db('members').del();
  await db('plans').del();
  
  const plans = await db('plans').insert([
    { name: 'Monthly Basic', duration_days: 30, price: 29.99, is_active: true },
    { name: 'Annual',        duration_days: 365, price: 299.99, is_active: true },
  ]).returning('*');
  
  plan1Id = plans[0].id;
  plan2Id = plans[1].id;
});

  beforeEach(async () => {
    await db('check_ins').del();
    await db('memberships').del();
    await db('members').del();
    const [m] = await db('members')
      .insert({ first_name: 'Test', last_name: 'User', email: 'test@example.com' })
      .returning('*');
    memberId = m.id;
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('assigns an active membership successfully', async () => {
    const res = await request(app)
      .post('/api/memberships')
      .send({ member_id: memberId, plan_id: plan1Id, start_date: '2026-01-01' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('active');
  });

  it('rejects a second active membership with 409', async () => {
  await request(app)
    .post('/api/memberships')
    .send({ member_id: memberId, plan_id: plan1Id, start_date: '2026-01-01' })
    .expect(201);

  const res = await request(app)
    .post('/api/memberships')
    .send({ member_id: memberId, plan_id: plan2Id, start_date: '2026-01-01' });
  expect(res.status).toBe(409);
  expect(res.body.error).toMatch(/active membership/i);
});

  it('allows a new membership after the previous is cancelled', async () => {
    const first = await request(app)
      .post('/api/memberships')
      .send({ member_id: memberId, plan_id: plan1Id, start_date: '2026-01-01' })
      .expect(201);

    await request(app)
      .post(`/api/memberships/${first.body.id}/cancel`)
      .expect(200);

    const res = await request(app)
      .post('/api/memberships')
      .send({ member_id: memberId, plan_id: plan2Id, start_date: '2026-02-01' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('active');
  });

  it('blocks check-in for a member with no active membership', async () => {
  const res = await request(app)
    .post('/api/check-ins')
    .send({ member_id: memberId });
  expect(res.status).toBe(409);
  expect(res.body.error).toMatch(/active membership/i);
});
});