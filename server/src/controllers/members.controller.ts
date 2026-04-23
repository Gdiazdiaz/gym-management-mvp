import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as svc from '../services/members.service';

export const createMemberSchema = z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    email: z.string().email().max(255),
    phone_number: z.string().optional(),
});

export async function createMember(req: Request, res: Response, next: NextFunction) {
    try {
        const member = await svc.createMember(req.body);
        res.status(201).json(member);
    } catch (error) {
        next(error);
    }
}

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const q = typeof req.query.q === 'string' ? req.query.q : undefined;
        const members = await svc.searchMembers(q);
        res.json(members);
    } catch (error) {
        next(error);

    }
}

export async function summary(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if(!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid member ID' });

        const summary = await svc.getMemberSummary(id);
        res.json(summary);
    } catch (error) {
        next(error);
    }
}