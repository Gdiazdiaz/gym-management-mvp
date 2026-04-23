import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/check_ins.service';

export async function record(req: Request, res: Response, next: NextFunction) {
    try {
        const memberId = Number(req.body.member_id);
        if (!Number.isInteger(memberId) || memberId <= 0) {
            return res.status(400).json({ message: 'Invalid member ID' });
        }

        const checkIn = await svc.recordCheckIn(memberId);
        res.status(201).json(checkIn);
    } catch (error) {
        next(error);
    }
}