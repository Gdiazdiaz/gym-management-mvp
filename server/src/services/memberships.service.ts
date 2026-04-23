import { db } from '../db/knex';
import { AppError } from '../middleware/errorHandler';

export async function assignMembership(input: {
    member_id: number;
    plan_id: number;
    start_date: string;
}) {

    return db.transaction(async (trx) => {
        const member = await trx('members').where({id: input.member_id}).first();
        if (!member) throw new AppError(404, 'Member not found');

        const plan = await trx('plans').where({id: input.plan_id, is_active: true}).first();
        if (!plan) throw new AppError(404, 'Plan not found');

        const start = new Date(input.start_date);
    if (Number.isNaN(start.getTime())) throw new AppError(400, 'Invalid start date');
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration_days);

    try {
        const [membership] = await trx('memberships').insert({
            member_id: input.member_id,
            plan_id: input.plan_id,
            start_date: input.start_date,
            end_date: end.toISOString().slice(0, 10),
            status: 'active',
        }).returning('*');
        return membership;
    } catch (error: any) {
        if (error.code === '23505') {
            throw new AppError(409, 'This member already has an active membership. Please cancel the existing one before assigning a new plan.');
        }
        throw error;
    }
    });
}

export async function cancelMembership(membershipId: number) {
    return db.transaction(async (trx) => {
        const m = await trx('memberships').where({id: membershipId}).first();
        if (!m) throw new AppError(404, 'Membership not found');
        if (m.status !== 'active') throw new AppError(409, 'Only active memberships can be canceled');

        const today = new Date().toISOString().slice(0, 10);
        const [updated] = await trx('memberships').where({id: membershipId}).update({
            status: 'canceled',
            canceled_at: today,
            end_date: db.fn.now(),
        }).returning('*');
        return updated;
    });
}