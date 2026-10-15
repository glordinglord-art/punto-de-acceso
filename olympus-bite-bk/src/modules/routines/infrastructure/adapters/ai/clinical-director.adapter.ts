import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
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

  /** Del mas capaz al mas rapido; si uno esta saturado se prueba el siguiente. */
  private static readonly MODELS = [
    'gemini-3.6-flash',
    'gemini-2.5-flash',
    'gemini-3.5-flash-lite',
  ];

  onModuleInit() {
    const apiKey = (
      process.env.GEMINI_BACKUP_API_KEY ||
      process.env.GEMINI_API_KEY ||
      ''
    )
      .trim()
      .replace(/^["']|["']$/g, '');
    if (!apiKey) {
      this.logger.warn(
        '⚠️ GEMINI_API_KEY no configurada. El ajuste biomecánico IA no estará disponible.',
      );
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.logger.log('✅ Ajuste biomecánico IA conectado a Gemini');
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

    if (!this.genAI) {
      throw new ServiceUnavailableException(
        'El ajuste biomecánico IA no está configurado en el servidor.',
      );
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

    let lastError = '';
    for (const modelName of ClinicalDirectorAdapter.MODELS) {
      try {
        const model = this.genAI.getGenerativeModel(
          {
            model: modelName,
            generationConfig: { responseMimeType: 'application/json' },
          },
          { timeout: 30_000 },
        );
        const response = await model.generateContent([
          systemPrompt,
          userPrompt,
        ]);
        const cleaned = response.response
          .text()
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```$/i, '')
          .trim();
        const parsed = JSON.parse(cleaned) as {
          replacementExercise?: Record<string, unknown>;
          clinicalRationale?: string;
        };
        const proposed = parsed.replacementExercise ?? {};
        const name =
          typeof proposed.name === 'string' ? proposed.name.trim() : '';
        if (!name) throw new Error('la respuesta no trae ejercicio');

        return {
          // Siempre el ejercicio real: antes se tomaba el id que devolvia la IA
          // y, si lo inventaba, "Aplicar" fallaba con "ejercicio no encontrado"
          targetExerciseId: currentExercise.id,
          targetExerciseName: currentExercise.name,
          replacementExercise: {
            name,
            muscleGroup:
              typeof proposed.muscleGroup === 'string'
                ? proposed.muscleGroup
                : currentExercise.muscleGroup,
            sets:
              parseInt(String(proposed.sets), 10) || currentExercise.sets || 4,
            reps:
              typeof proposed.reps === 'string' ||
              typeof proposed.reps === 'number'
                ? String(proposed.reps)
                : currentExercise.reps || '10-12',
            restSeconds: parseInt(String(proposed.restSeconds), 10) || 90,
            observations:
              typeof proposed.observations === 'string'
                ? proposed.observations
                : '',
            intensity:
              typeof proposed.intensity === 'string'
                ? proposed.intensity
                : currentExercise.intensity || 'medium',
          },
          clinicalRationale: parsed.clinicalRationale || '',
        };
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Ajuste biomecánico con ${modelName} falló: ${lastError.slice(-160)}`,
        );
      }
    }

    throw new ServiceUnavailableException(
      'La IA no pudo generar la sustitución en este momento. Inténtalo de nuevo en unos segundos.',
    );
  }
}
