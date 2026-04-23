import { Router } from 'express';
import * as ctrl from '../controllers/members.controller';
import { validateBody } from '../middleware/validate';

const router = Router();

router.post('/', validateBody(ctrl.createMemberSchema), ctrl.createMember);
router.get('/', ctrl.list);
router.get('/:id/summary', ctrl.summary);

export default router;