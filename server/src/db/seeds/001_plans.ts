import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Delete in FK-safe order: children first, then parents
  await knex('check_ins').del();
  await knex('memberships').del();
  await knex('members').del();
  await knex('plans').del();

  // Reset sequences so IDs are predictable across re-seeds
  await knex.raw('ALTER SEQUENCE plans_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE members_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE memberships_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE check_ins_id_seq RESTART WITH 1');

  // ---------- Plans ----------
  const plans = await knex('plans')
    .insert([
      { name: 'Day Pass',       duration_days: 1,   price: 9.99,   is_active: true },
      { name: 'Monthly Basic',  duration_days: 30,  price: 29.99,  is_active: true },
      { name: 'Monthly Plus',   duration_days: 30,  price: 49.99,  is_active: true },
      { name: 'Quarterly',      duration_days: 90,  price: 79.99,  is_active: true },
      { name: 'Annual',         duration_days: 365, price: 299.99, is_active: true },
      { name: 'Legacy Student', duration_days: 30,  price: 19.99,  is_active: false }, // retired plan
    ])
    .returning('*');

  const planByName = Object.fromEntries(plans.map((p) => [p.name, p]));

  // ---------- Members ----------
  const members = await knex('members')
    .insert([
      { first_name: 'Ana',      last_name: 'Lopez',    email: 'ana.lopez@example.com',      phone_number: '555-0100' },
      { first_name: 'Carlos',   last_name: 'Martinez', email: 'carlos.m@example.com',       phone_number: '555-0101' },
      { first_name: 'Diana',    last_name: 'Reyes',    email: 'diana.reyes@example.com',    phone_number: '555-0102' },
      { first_name: 'Eduardo',  last_name: 'Garcia',   email: 'eduardo.g@example.com',      phone_number: null },
      { first_name: 'Fernanda', last_name: 'Ortiz',    email: 'fernanda.ortiz@example.com', phone_number: '555-0104' },
      { first_name: 'Gabriel',  last_name: 'Hernandez', email: 'gabriel.h@example.com',     phone_number: '555-0105' },
      { first_name: 'Helena',   last_name: 'Silva',    email: 'helena.silva@example.com',   phone_number: '555-0106' },
      { first_name: 'Isaac',    last_name: 'Nguyen',   email: 'isaac.nguyen@example.com',   phone_number: null },
    ])
    .returning('*');

  const memberByEmail = Object.fromEntries(members.map((m) => [m.email, m]));

  // Helper: format a Date as YYYY-MM-DD
  const d = (date: Date) => date.toISOString().slice(0, 10);
  const daysAgo = (n: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - n);
    return dt;
  };
  const daysFromNow = (n: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + n);
    return dt;
  };

  // ---------- Memberships ----------
  // Designed to exercise every state the UI & rules care about:
  //   Ana     — active Monthly Basic, frequent check-ins (30-day count demo)
  //   Carlos  — active Annual, occasional check-ins
  //   Diana   — active Quarterly, no check-ins yet (empty "last check-in")
  //   Eduardo — canceled last week (shows canceled history + no active plan)
  //   Fernanda — old canceled + current active (proves re-assignment works)
  //   Gabriel  — never had a membership (shows "No active membership" empty state)
  //   Helena   — active Monthly Plus, check-ins outside 30-day window (tests the window filter)
  //   Isaac    — canceled long ago, currently inactive

  const memberships = await knex('memberships')
    .insert([
      // Ana — active, started 10 days ago
      {
        member_id: memberByEmail['ana.lopez@example.com'].id,
        plan_id: planByName['Monthly Basic'].id,
        start_date: d(daysAgo(10)),
        end_date: d(daysFromNow(20)),
        status: 'active',
      },
      // Carlos — active annual, started 2 months ago
      {
        member_id: memberByEmail['carlos.m@example.com'].id,
        plan_id: planByName['Annual'].id,
        start_date: d(daysAgo(60)),
        end_date: d(daysFromNow(305)),
        status: 'active',
      },
      // Diana — active quarterly, just started
      {
        member_id: memberByEmail['diana.reyes@example.com'].id,
        plan_id: planByName['Quarterly'].id,
        start_date: d(daysAgo(2)),
        end_date: d(daysFromNow(88)),
        status: 'active',
      },
      // Eduardo — canceled last week
      {
        member_id: memberByEmail['eduardo.g@example.com'].id,
        plan_id: planByName['Monthly Basic'].id,
        start_date: d(daysAgo(20)),
        end_date: d(daysFromNow(10)),
        status: 'canceled',
        canceled_at: d(daysAgo(7)),
      },
      // Fernanda — old canceled membership (shows the rule lets new ones through)
      {
        member_id: memberByEmail['fernanda.ortiz@example.com'].id,
        plan_id: planByName['Monthly Basic'].id,
        start_date: d(daysAgo(90)),
        end_date: d(daysAgo(60)),
        status: 'canceled',
        canceled_at: d(daysAgo(65)),
      },
      // Fernanda — current active membership
      {
        member_id: memberByEmail['fernanda.ortiz@example.com'].id,
        plan_id: planByName['Monthly Plus'].id,
        start_date: d(daysAgo(5)),
        end_date: d(daysFromNow(25)),
        status: 'active',
      },
      // Helena — active Monthly Plus
      {
        member_id: memberByEmail['helena.silva@example.com'].id,
        plan_id: planByName['Monthly Plus'].id,
        start_date: d(daysAgo(15)),
        end_date: d(daysFromNow(15)),
        status: 'active',
      },
      // Isaac — canceled long ago
      {
        member_id: memberByEmail['isaac.nguyen@example.com'].id,
        plan_id: planByName['Day Pass'].id,
        start_date: d(daysAgo(120)),
        end_date: d(daysAgo(119)),
        status: 'canceled',
        canceled_at: d(daysAgo(119)),
      },
    ])
    .returning('*');

  // ---------- Check-ins ----------
  // Each check-in belongs to the active membership of that member
  const membershipByMemberActive = Object.fromEntries(
    memberships.filter((m) => m.status === 'active').map((m) => [m.member_id, m])
  );

  const ana    = memberByEmail['ana.lopez@example.com'];
  const carlos = memberByEmail['carlos.m@example.com'];
  const helena = memberByEmail['helena.silva@example.com'];

  // Helper to build a check-in timestamp N days ago at a given hour
  const checkInAt = (n: number, hour = 10) => {
    const dt = daysAgo(n);
    dt.setHours(hour, 0, 0, 0);
    return dt.toISOString();
  };

  await knex('check_ins').insert([
    // Ana — 5 check-ins in the last 30 days (frequent visitor)
    { member_id: ana.id,    membership_id: membershipByMemberActive[ana.id].id,    check_in_time: checkInAt(1, 7)  },
    { member_id: ana.id,    membership_id: membershipByMemberActive[ana.id].id,    check_in_time: checkInAt(3, 18) },
    { member_id: ana.id,    membership_id: membershipByMemberActive[ana.id].id,    check_in_time: checkInAt(5, 8)  },
    { member_id: ana.id,    membership_id: membershipByMemberActive[ana.id].id,    check_in_time: checkInAt(8, 19) },
    { member_id: ana.id,    membership_id: membershipByMemberActive[ana.id].id,    check_in_time: checkInAt(12, 7) },

    // Carlos — 2 check-ins in last 30 days, plus 1 older (outside window)
    { member_id: carlos.id, membership_id: membershipByMemberActive[carlos.id].id, check_in_time: checkInAt(4, 17) },
    { member_id: carlos.id, membership_id: membershipByMemberActive[carlos.id].id, check_in_time: checkInAt(18, 9) },
    { member_id: carlos.id, membership_id: membershipByMemberActive[carlos.id].id, check_in_time: checkInAt(45, 10) }, // outside 30d window

    // Helena — all check-ins outside 30-day window 
    { member_id: helena.id, membership_id: membershipByMemberActive[helena.id].id, check_in_time: checkInAt(35, 11) },
    { member_id: helena.id, membership_id: membershipByMemberActive[helena.id].id, check_in_time: checkInAt(40, 12) },
  ]);
}