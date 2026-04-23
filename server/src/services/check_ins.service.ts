import { db } from '../db/knex';
import { AppError } from '../middleware/errorHandler';

export async function recordCheckIn(memberId: number) {
    return db.transaction(async (trx) => {
        const member = await trx('members').where({id: memberId}).first();
        if (!member) throw new AppError(404, 'Member not found');

        const active = await trx('memberships').where({member_id: memberId, status: 'active'}).first();
        if (!active) throw new AppError(409, 'Member does not have an active membership');

        const [checkIn] = await trx('check_ins').insert({
            member_id: memberId,
            membership_id: active.id,
        }).returning('*');
        return checkIn;
    }

)
}