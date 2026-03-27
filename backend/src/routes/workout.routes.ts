import { Router } from 'express';
import { getWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout } from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getWorkouts);
router.post('/', createWorkout);
router.get('/:id', getWorkout);
router.patch('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

export default router;
