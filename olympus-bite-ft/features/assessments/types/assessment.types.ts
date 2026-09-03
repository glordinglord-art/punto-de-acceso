export interface PhysicalAssessment {
  id: string;
  clientId: string;
  trainerId: string;
  date: string;

  // Perímetros (cm)
  neck: number | null;
  back: number | null;
  rightArm: number | null;
  leftArm: number | null;
  waist: number | null;
  hip: number | null;
  rightThigh: number | null;
  leftThigh: number | null;
  rightKnee: number | null;
  leftKnee: number | null;
  rightCalf: number | null;
  leftCalf: number | null;

  // Composición Corporal
  weight: number | null;
  fatPercentage: number | null;
  musclePercentage: number | null;
  waterPercentage: number | null;
  bonePercentage: number | null;

  notes: string | null;
  createdAt: string;
  updatedAt: string;

  trainer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AssessmentProgressSummary {
  hasComparison: boolean;
  deltaWeight: number | null;
  deltaFat: number | null;
  deltaMuscle: number | null;
  deltaWaist: number | null;
  deltaHip: number | null;
  deltaRightArm: number | null;
  deltaRightThigh: number | null;
  smartInsights: string[];
}

export interface ClientAssessmentsResponse {
  client: {
    id: string;
    name: string;
    email: string;
  };
  assessments: PhysicalAssessment[];
  progressSummary: AssessmentProgressSummary | null;
}
