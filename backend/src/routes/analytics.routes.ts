import { Router } from 'express';
import { dashboard, personalBests, workoutsPerWeek, goalProgress, exerciseProgress, streaks } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/dashboard', dashboard);
router.get('/personal-bests', personalBests);
router.get('/workouts-per-week', workoutsPerWeek);
router.get('/goal-progress', goalProgress);
router.get('/exercise-progress/:exerciseId', exerciseProgress);
router.get('/streaks', streaks);

export default router;
