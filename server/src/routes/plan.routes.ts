import { Router } from 'express';
import { db } from '../db/knex';

const router = Router();

router.get('/', async (_req, res, next) => {
    try {
        const plans = await db('plans').where({ is_active: true }).orderBy('price', 'asc')
        res.json(plans);
    } catch (err) {
        next(err);
    }
});

export default router;