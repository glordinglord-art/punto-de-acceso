export interface ClinicalDirectorContext {
  clientName: string;
  medicalConditions?: string;
  experienceLevel?: string;
  dietaryGoal?: string;
  routineName: string;
  dayFocusArea: string;
  currentExercise: {
    id?: string;
    name: string;
    muscleGroup: string;
    sets: number;
    reps: string;
    observations?: string;
    targetWeight?: number;
    intensity?: string;
  };
  coachNote: string;
}

export interface ClinicalProposalResult {
  targetExerciseId?: string;
  targetExerciseName: string;
  replacementExercise: {
    name: string;
    muscleGroup: string;
    sets: number;
    reps: string;
    restSeconds: number;
    observations: string;
    intensity: string;
  };
  clinicalRationale: string;
}

export interface ClinicalDirectorPort {
  proposeAdjustment(
    context: ClinicalDirectorContext,
  ): Promise<ClinicalProposalResult>;
}

export const CLINICAL_DIRECTOR_PORT = Symbol('CLINICAL_DIRECTOR_PORT');
