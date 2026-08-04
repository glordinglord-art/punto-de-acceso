/**
 * Seed script: imports 1,324 exercises from hasaneyldrm/exercises-dataset
 *
 * Usage:
 *   npx ts-node prisma/seed-exercises.ts
 *
 * Prerequisites:
 *   1. Download exercises.json from:
 *      https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json
 *   2. Save it as prisma/exercises.json
 *
 * Or the script will attempt to fetch it automatically.
 */

import { PrismaClient, MuscleGroup } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const EXERCISES_JSON_PATH = path.join(__dirname, 'exercises.json');
const EXERCISES_JSON_URL =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';
const GITHUB_RAW_BASE =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main';

interface DatasetExercise {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  instructions: {
    en?: string;
    es?: string;
    [key: string]: string | undefined;
  };
  instruction_steps?: {
    es?: string[];
    [key: string]: string[] | undefined;
  };
  muscle_group: string;
  secondary_muscles: string[];
  target: string;
  media_id: string;
  image: string;
  gif_url: string;
  attribution: string;
  created_at: string;
}

/**
 * Maps body_part + target from the dataset to our MuscleGroup enum
 */
function mapMuscleGroup(bodyPart: string, target: string): MuscleGroup {
  const bp = bodyPart.toLowerCase();
  const tgt = target.toLowerCase();

  switch (bp) {
    case 'chest':
      return MuscleGroup.chest;
    case 'back':
      return MuscleGroup.back;
    case 'shoulders':
      return MuscleGroup.shoulders;
    case 'waist':
      return MuscleGroup.abs;
    case 'cardio':
      return MuscleGroup.cardio;
    case 'neck':
      return MuscleGroup.traps;
    case 'lower legs':
      return MuscleGroup.calves;
    case 'lower arms':
      return MuscleGroup.forearms;
    case 'upper arms':
      if (tgt.includes('triceps')) return MuscleGroup.triceps;
      return MuscleGroup.biceps;
    case 'upper legs':
      if (tgt.includes('glute')) return MuscleGroup.glutes;
      if (tgt.includes('hamstring')) return MuscleGroup.hamstrings;
      if (tgt.includes('quad')) return MuscleGroup.quads;
      if (tgt.includes('abductor')) return MuscleGroup.abductors;
      if (tgt.includes('adductor')) return MuscleGroup.adductors;
      if (tgt.includes('calve') || tgt.includes('calf'))
        return MuscleGroup.calves;
      return MuscleGroup.legs;
    default:
      return MuscleGroup.full_body;
  }
}

async function loadExercises(): Promise<DatasetExercise[]> {
  // Try local file first
  if (fs.existsSync(EXERCISES_JSON_PATH)) {
    console.log(`📂 Loading exercises from local file: ${EXERCISES_JSON_PATH}`);
    const raw = fs.readFileSync(EXERCISES_JSON_PATH, 'utf-8');
    return JSON.parse(raw);
  }

  // Fetch from GitHub
  console.log(`🌐 Downloading exercises.json from GitHub...`);
  const response = await fetch(EXERCISES_JSON_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to download exercises.json: ${response.status} ${response.statusText}. ` +
      `Please download manually from ${EXERCISES_JSON_URL} and save as ${EXERCISES_JSON_PATH}`,
    );
  }
  const data = await response.json();

  // Cache locally for next run
  fs.writeFileSync(EXERCISES_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 Cached to ${EXERCISES_JSON_PATH}`);

  return data as DatasetExercise[];
}

async function main() {
  console.log('⚡ Starting Ultra-Fast Exercise Dictionary Seed...\n');

  const exercises = await loadExercises();
  console.log(`📊 Loaded ${exercises.length} exercises from dataset`);

  const records = exercises.map((ex) => ({
    name: ex.name,
    muscleGroup: mapMuscleGroup(ex.body_part, ex.target),
    equipment: ex.equipment || null,
    category: ex.body_part || null,
    target: ex.target || null,
    gifUrl: `${GITHUB_RAW_BASE}/videos/${ex.id}-${ex.media_id}.gif`,
    imageUrl: `${GITHUB_RAW_BASE}/images/${ex.id}-${ex.media_id}.jpg`,
    instructionsEs: ex.instructions?.es || null,
    instructionStepsEs: ex.instruction_steps?.es || [],
    secondaryMuscles: ex.secondary_muscles || [],
    attribution: ex.attribution || null,
  }));

  const CHUNK_SIZE = 250;
  let inserted = 0;

  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    const result = await prisma.exerciseDictionary.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    inserted += result.count;
    console.log(
      `  🚀 Batch ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(records.length / CHUNK_SIZE)} (+${result.count} new)`,
    );
  }

  const total = await prisma.exerciseDictionary.count();
  console.log(`\n✅ Seed complete!`);
  console.log(`   📥 New records inserted: ${inserted}`);
  console.log(`   📊 Total exercises in database: ${total}\n`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
