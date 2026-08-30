'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { mealsService } from '@/features/meals/services/meals.service';

interface PendingMeal {
  id: string;
  imageBase64: string;
  mealType: string;
  startedAt: number;
}

interface BackgroundAnalysisContextType {
  pendingMeals: PendingMeal[];
  startAnalysis: (params: {
    imagesBase64: string[];
    description: string;
    mealType: string;
    userId: string;
    userContext: {
      dietaryGoal?: string;
      weight?: number;
      height?: number;
      experienceLevel?: string;
      medicalConditions?: string;
      dietaryPreferences?: string;
    };
    onComplete?: () => void;
  }) => void;
}

const BackgroundAnalysisContext = createContext<BackgroundAnalysisContextType>({
  pendingMeals: [],
  startAnalysis: () => {},
});

export function useBackgroundAnalysis() {
  return useContext(BackgroundAnalysisContext);
}

export function BackgroundAnalysisProvider({ children }: { children: ReactNode }) {
  const [pendingMeals, setPendingMeals] = useState<PendingMeal[]>([]);

  const startAnalysis = useCallback(
    ({
      imagesBase64,
      description,
      mealType,
      userId,
      userContext,
      onComplete,
    }: {
      imagesBase64: string[];
      description: string;
      mealType: string;
      userId: string;
      userContext: {
        dietaryGoal?: string;
        weight?: number;
        height?: number;
        experienceLevel?: string;
        medicalConditions?: string;
        dietaryPreferences?: string;
      };
      onComplete?: () => void;
    }) => {
      const pendingId = `pending-${Date.now()}`;

      // Add to pending list
      if (imagesBase64.length > 0) {
        setPendingMeals((prev) => [
          ...prev,
          { id: pendingId, imageBase64: imagesBase64[0], mealType, startedAt: Date.now() },
        ]);
      }

      const toastId = toast.loading('🍽️ Analizando comida con IA...');

      // Fire-and-forget async — runs even if user navigates away
      (async () => {
        try {
          // 1. Analyze
          const res = await mealsService.analyzePhoto(imagesBase64, {
            goal: userContext.dietaryGoal || 'No especificado',
            description,
            weight: userContext.weight,
            height: userContext.height,
            experienceLevel: userContext.experienceLevel,
            medicalConditions: userContext.medicalConditions,
            dietaryPreferences: userContext.dietaryPreferences,
          });
          const analysis = res.data;

          // 2. Create meal
          await mealsService.create(userId, {
            name: analysis.foods.slice(0, 2).join(' + '),
            description: analysis.description,
            mealType,
            imagesBase64: imagesBase64.length > 0 ? imagesBase64 : undefined,
            foods: analysis.foods,
            calories: analysis.nutritionalInfo.calories,
            protein: analysis.nutritionalInfo.protein,
            carbs: analysis.nutritionalInfo.carbs,
            fat: analysis.nutritionalInfo.fat,
            fiber: analysis.nutritionalInfo.fiber,
            sugar: analysis.nutritionalInfo.sugar,
            recommendation: analysis.recommendation,
            goalRating: analysis.goalRating,
            date: new Date().toISOString(),
          });

          toast.success('¡Comida registrada exitosamente!', { id: toastId });
          onComplete?.();
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : 'Error analizando comida',
            { id: toastId },
          );
        } finally {
          setPendingMeals((prev) => prev.filter((p) => p.id !== pendingId));
        }
      })();
    },
    [],
  );

  return (
    <BackgroundAnalysisContext.Provider value={{ pendingMeals, startAnalysis }}>
      {children}
    </BackgroundAnalysisContext.Provider>
  );
}
