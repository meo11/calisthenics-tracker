import { Router } from 'express';
import { getExercises, createExercise, updateExercise, deleteExercise } from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getExercises);
router.post('/', createExercise);
router.patch('/:id', updateExercise);
router.delete('/:id', deleteExercise);

export default router;
