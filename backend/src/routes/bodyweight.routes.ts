import { Router } from 'express';
import { getBodyWeightLogs, createBodyWeightLog, deleteBodyWeightLog } from '../controllers/bodyweight.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getBodyWeightLogs);
router.post('/', createBodyWeightLog);
router.delete('/:id', deleteBodyWeightLog);

export default router;
