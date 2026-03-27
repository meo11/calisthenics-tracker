import 'dotenv/config';
import { connectDB } from '../config/database';
import { Exercise } from '../models/Exercise';

const defaultExercises = [
  // Push
  { name: 'Push-Up', category: 'push', measurementType: 'reps' },
  { name: 'Diamond Push-Up', category: 'push', measurementType: 'reps' },
  { name: 'Wide Push-Up', category: 'push', measurementType: 'reps' },
  { name: 'Pike Push-Up', category: 'push', measurementType: 'reps' },
  { name: 'Handstand Push-Up', category: 'push', measurementType: 'reps' },
  { name: 'Dip', category: 'push', measurementType: 'reps' },
  { name: 'Ring Dip', category: 'push', measurementType: 'reps' },
  { name: 'Bench Press', category: 'push', measurementType: 'reps' },
  { name: 'Overhead Press', category: 'push', measurementType: 'reps' },
  { name: 'Pseudo Planche Push-Up', category: 'push', measurementType: 'reps' },

  // Pull
  { name: 'Pull-Up', category: 'pull', measurementType: 'reps' },
  { name: 'Chin-Up', category: 'pull', measurementType: 'reps' },
  { name: 'Neutral Grip Pull-Up', category: 'pull', measurementType: 'reps' },
  { name: 'Muscle-Up', category: 'pull', measurementType: 'reps' },
  { name: 'Ring Row', category: 'pull', measurementType: 'reps' },
  { name: 'Australian Pull-Up', category: 'pull', measurementType: 'reps' },
  { name: 'Face Pull', category: 'pull', measurementType: 'reps' },
  { name: 'Barbell Row', category: 'pull', measurementType: 'reps' },
  { name: 'Dead Hang', category: 'pull', measurementType: 'duration' },
  { name: 'Active Hang', category: 'pull', measurementType: 'duration' },

  // Legs
  { name: 'Squat', category: 'legs', measurementType: 'reps' },
  { name: 'Bulgarian Split Squat', category: 'legs', measurementType: 'reps' },
  { name: 'Pistol Squat', category: 'legs', measurementType: 'reps' },
  { name: 'Lunge', category: 'legs', measurementType: 'reps' },
  { name: 'Jump Squat', category: 'legs', measurementType: 'reps' },
  { name: 'Nordic Curl', category: 'legs', measurementType: 'reps' },
  { name: 'Glute Bridge', category: 'legs', measurementType: 'reps' },
  { name: 'Single-Leg Deadlift', category: 'legs', measurementType: 'reps' },
  { name: 'Calf Raise', category: 'legs', measurementType: 'reps' },
  { name: 'Step-Up', category: 'legs', measurementType: 'reps' },

  // Core
  { name: 'Plank', category: 'core', measurementType: 'duration' },
  { name: 'Side Plank', category: 'core', measurementType: 'duration' },
  { name: 'Hollow Body Hold', category: 'core', measurementType: 'duration' },
  { name: 'L-Sit', category: 'core', measurementType: 'duration' },
  { name: 'Dragon Flag', category: 'core', measurementType: 'reps' },
  { name: 'Hanging Leg Raise', category: 'core', measurementType: 'reps' },
  { name: 'Ab Wheel Rollout', category: 'core', measurementType: 'reps' },
  { name: 'V-Up', category: 'core', measurementType: 'reps' },
  { name: 'Bicycle Crunch', category: 'core', measurementType: 'reps' },
  { name: 'Toes-to-Bar', category: 'core', measurementType: 'reps' },

  // Cardio
  { name: 'Running', category: 'cardio', measurementType: 'distance' },
  { name: 'Jump Rope', category: 'cardio', measurementType: 'duration' },
  { name: 'Burpee', category: 'cardio', measurementType: 'reps' },
  { name: 'Mountain Climber', category: 'cardio', measurementType: 'reps' },
  { name: 'Box Jump', category: 'cardio', measurementType: 'reps' },
  { name: 'Cycling', category: 'cardio', measurementType: 'distance' },
  { name: 'Rowing', category: 'cardio', measurementType: 'distance' },

  // Mobility
  { name: 'Hip Flexor Stretch', category: 'mobility', measurementType: 'duration' },
  { name: 'Thoracic Bridge', category: 'mobility', measurementType: 'reps' },
  { name: 'Wrist Circles', category: 'mobility', measurementType: 'duration' },
  { name: 'Shoulder Dislocates', category: 'mobility', measurementType: 'reps' },
  { name: 'Deep Squat Hold', category: 'mobility', measurementType: 'duration' },
  { name: 'Cat-Cow', category: 'mobility', measurementType: 'reps' },

  // Skill
  { name: 'Handstand Hold', category: 'skill', measurementType: 'duration' },
  { name: 'Handstand Walk', category: 'skill', measurementType: 'distance' },
  { name: 'Front Lever', category: 'skill', measurementType: 'duration' },
  { name: 'Back Lever', category: 'skill', measurementType: 'duration' },
  { name: 'Human Flag', category: 'skill', measurementType: 'duration' },
  { name: 'Planche', category: 'skill', measurementType: 'duration' },
  { name: 'Planche Lean', category: 'skill', measurementType: 'duration' },
  { name: 'Tuck Planche', category: 'skill', measurementType: 'duration' },
];

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding default exercises...');

  await Exercise.deleteMany({ isDefault: true });

  const toInsert = defaultExercises.map(e => ({ ...e, isDefault: true }));
  await Exercise.insertMany(toInsert);

  console.log(`✅ Inserted ${toInsert.length} default exercises`);
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
