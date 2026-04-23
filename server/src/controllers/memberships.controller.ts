import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as svc from '../services/memberships.service';

export const assingSchema = z.object({
    member_id: z.number().int().positive(),
    plan_id: z.number().int().positive(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
});

export async function assignPlan(req: Request, res: Response, next: NextFunction) {
    try {
        const membership = await svc.assignMembership(req.body);
        res.status(201).json(membership);
    } catch (error) {
        next(error);
    }
}

export async function cancelMembership(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if(!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Invalid membership ID' });
        const membership = await svc.cancelMembership(id);
        res.json(membership);
    } catch (error) {
        next(error);
    }

}