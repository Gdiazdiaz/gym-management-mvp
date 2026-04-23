import { Router } from 'express';
import * as ctrl from '../controllers/memberships.controller';
import { validateBody } from '../middleware/validate';

const router = Router();

router.post('/', validateBody(ctrl.assingSchema), ctrl.assignPlan);
router.post('/:id/cancel', ctrl.cancelMembership);

export default router;