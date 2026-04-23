import { Router } from 'express';
import * as ctrl from '../controllers/checkIns.controller';

const router = Router();

router.post('/', ctrl.record);

export default router;