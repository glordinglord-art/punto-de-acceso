import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ClinicalDirectorPort,
  ClinicalDirectorContext,
  ClinicalProposalResult,
} from '../../../domain/ports/clinical-director.port';

@Injectable()
export class ClinicalDirectorAdapter
  implements ClinicalDirectorPort, OnModuleInit
{
  private readonly logger = new Logger(ClinicalDirectorAdapter.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null =
    null;

  onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        '⚠️ GEMINI_API_KEY no configurada. El Director Clínico IA operará con reemplazos de respaldo.',
      );
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
    this.logger.log(
      '✅ Gemini 2.5 Flash conectado como Director Clínico de Vital Fit',
    );
  }

  async proposeAdjustment(
    context: ClinicalDirectorContext,
  ): Promise<ClinicalProposalResult> {
    const {
      clientName,
      medicalConditions,
      experienceLevel,
      dietaryGoal,
      routineName,
      dayFocusArea,
      currentExercise,
      coachNote,
    } = context;

    const fallbackResult: ClinicalProposalResult = {
      targetExerciseId: currentExercise.id,
      targetExerciseName: currentExercise.name,
      replacementExercise: {
        name: `${currentExercise.name} (Variante con Polea / Cable)`,
        muscleGroup: currentExercise.muscleGroup || 'shoulders',
        sets: currentExercise.sets || 4,
        reps: currentExercise.reps || '10-12',
        restSeconds: 75,
        observations:
          'Tensión continua en trayectoria convergente, evitando pinzamiento articular.',
        intensity: currentExercise.intensity || 'medium',
      },
      clinicalRationale:
        'Sustitución por polea para reducir la sobrecarga articular y carga axial directa, manteniendo la tensión mecánica en el músculo objetivo.',
    };

    if (!this.genAI || !this.model) {
      return fallbackResult;
    }

    const systemPrompt = `
Eres el Director Clínico y Máximo Especialista Biomecánico de Vital Fit.
Tu doctrina se fundamenta en la literatura científica de élite (Zatsiorsky & Kraemer "Science and Practice of Strength Training", Brad Schoenfeld, Chris Beardsley y Nordin & Frankel "Basic Biomechanics").
Tu propósito es maximizar el estímulo sarcomérico y la tensión mecánica mientras eliminas la fricción articular y el dolor lesivo.

LEYES BIOMECÁNICAS Y CLÍNICAS INNEGOCIABLES:
1. GESTIÓN DEL BRAZO DE MOMENTO Y VECTORES DE FUERZA:
   - Modula el brazo de momento externo para descomprimir la cápsula articular sin comprometer la activación miofibrilar.
   - En hombro / dolor de empuje: Si hay pinzamiento subacromial o supraespinoso irritado, traslada el vector al PLANO ESCAPULAR (30°-40° anterior) o selecciona poleas convergentes con agarre neutro/semipronado.
   - En columna / dolor lumbar: Elimina de inmediato el cizallamiento anterior en L4-S1 provocado por barras libres sobre la espalda. Sustituye por Prensa 45° con apoyo lumbar total, sentadilla búlgara con mancuernas al costado, o remos con soporte esternal en banco inclinado.
   - En rodilla / molestia femororrotuliana: Reduce el brazo de palanca de extensión pura de cuádriceps en ángulos profundos. Favorece la cadena cinética cerrada con ángulo de tibia neutro (sentadilla en cajón, hack squat con pies altos, o patrones de cadera dominante como peso muerto rumano).
2. PRESERVACIÓN DEL ESTÍMULO DE HIPERTROFIA:
   - La variante DEBE reclutar el mismo grupo muscular principal (${currentExercise.muscleGroup}) con igual o superior tensión mecánica e hipertrofia mediada por estiramiento.
3. AJUSTE DE VOLUMEN Y CADENCIA:
   - Establece series, repeticiones y descansos coherentes. En las observaciones, prescribe cadencia concéntrica/excéntrica controlada (ej. 3-0-1-0) y RIR (Reps in Reserve 1-2).
4. JUSTIFICACIÓN CLÍNICA (clinicalRationale):
   - Redacta un fundamento médico-biomecánico de 1 a 2 oraciones, de altísimo nivel técnico pero cristalino para el entrenador, citando la descompresión articular y la física del movimiento.

Devuelve ÚNICAMENTE un objeto JSON válido con este formato exacto:
{
  "targetExerciseId": "${currentExercise.id || ''}",
  "targetExerciseName": "${currentExercise.name}",
  "replacementExercise": {
    "name": "Nombre exacto del nuevo ejercicio en español",
    "muscleGroup": "${currentExercise.muscleGroup}",
    "sets": ${currentExercise.sets || 4},
    "reps": "${currentExercise.reps || '8-12'}",
    "restSeconds": 90,
    "observations": "Instrucción biomecánica específica (ángulo, cadencia, RIR)",
    "intensity": "${currentExercise.intensity || 'medium'}"
  },
  "clinicalRationale": "Fundamento biomecánico clínico exacto explicando el cambio de vector y la preservación de tensión mecánica"
}
`;

    const userPrompt = `
CONTEXTO DEL ATLETA:
- Nombre: ${clientName}
- Objetivo: ${dietaryGoal || 'Hipertrofia / Recomposición'}
- Nivel de experiencia: ${experienceLevel || 'Intermedio'}
- Condiciones médicas / lesiones previas: ${medicalConditions || 'Ninguna registrada'}

RUTINA Y ENTORNO:
- Rutina actual: ${routineName}
- Día y enfoque: ${dayFocusArea}

EJERCICIO QUE PRESENTA FRICCIÓN:
- Nombre: ${currentExercise.name}
- Grupo muscular: ${currentExercise.muscleGroup}
- Series y Reps actuales: ${currentExercise.sets}x${currentExercise.reps}
- Observaciones previas: ${currentExercise.observations || 'Ninguna'}

REPORTE DEL ENTRENADOR EN PISO (BITÁCORA CLÍNICA):
"${coachNote}"

Proporciona la sustitución biomecánica inmediata en formato JSON.
`;

    try {
      const response = await this.model.generateContent([
        systemPrompt,
        userPrompt,
      ]);
      const text = response.response.text();
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      return {
        targetExerciseId: parsed.targetExerciseId || currentExercise.id,
        targetExerciseName: parsed.targetExerciseName || currentExercise.name,
        replacementExercise: {
          name:
            parsed.replacementExercise?.name ||
            fallbackResult.replacementExercise.name,
          muscleGroup:
            parsed.replacementExercise?.muscleGroup ||
            currentExercise.muscleGroup,
          sets:
            Number(parsed.replacementExercise?.sets) ||
            currentExercise.sets ||
            4,
          reps: String(
            parsed.replacementExercise?.reps || currentExercise.reps || '10-12',
          ),
          restSeconds: Number(parsed.replacementExercise?.restSeconds) || 90,
          observations:
            parsed.replacementExercise?.observations ||
            fallbackResult.replacementExercise.observations,
          intensity:
            parsed.replacementExercise?.intensity ||
            currentExercise.intensity ||
            'medium',
        },
        clinicalRationale:
          parsed.clinicalRationale || fallbackResult.clinicalRationale,
      };
    } catch (err) {
      this.logger.error(
        `Error consultando al Director Clínico Gemini: ${err instanceof Error ? err.message : String(err)}`,
      );
      return fallbackResult;
    }
  }
}
