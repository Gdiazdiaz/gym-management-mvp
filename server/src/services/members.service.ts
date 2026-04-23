import { db } from '../db/knex';
import { AppError } from '../middleware/errorHandler';

export async function createMember(input: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
}) {
    try {
        const [newMember] = await db('members').insert(input).returning('*');
        return newMember;
    } catch (error: any) {
        if (error.code === '23505') {
            throw new AppError(400, 'A member with this email already exists.');
    }
    throw error;
    }
}

export async function searchMembers(query?: string) {
    const q = db('members').select('*').orderBy('created_at', 'desc').limit(50);
    if (query && query.trim()) {
        const patter = `%${query.trim().toLowerCase()}%`;
        q.whereRaw(`
            lower(first_name) LIKE ? OR
            lower(last_name) LIKE ? OR
            lower(email) LIKE ?
        `, [patter, patter, patter]);
    }
    return q;
}

export async function getMemberSummary(memberId: number) {
    const member = await db('members').where({ id: memberId }).first();
    if (!member) {
        throw new AppError(404, 'Member not found');
    }

    const activeMembership = await db('memberships as m').join('plans as p', 'm.plan_id', 'p.id').where('m.member_id', memberId).where('m.status', 'active').select(
        'm.id as membership_id',
        'm.start_date',
        'm.end_date',
        'p.id as plan_id',
        'p.name as plan_name',
        'p.price as plan_price'
    ).first();

    const lastCheckIn = await db('check_ins').where({member_id: memberId}).orderBy('check_in_time', 'desc').select('check_in_time').first();

    const countResult = await db('check_ins').where({member_id: memberId}).where('check_in_time', '>=', db.raw("CURRENT_DATE - INTERVAL '30 days'")).count<{ count: string }[]>('id as count').first();

    return {
        member,
        active_membership: activeMembership || null,
        last_check_in_time: lastCheckIn?.check_in_time || null,
        check_ins_last_30_days: Number(countResult?.count || 0),
    };
}