import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  DietRecommenderPort,
  DietRecommenderContext,
} from '../../../domain/ports/diet-recommender.port';

@Injectable()
export class GeminiDietRecommenderAdapter
  implements DietRecommenderPort, OnModuleInit
{
  private readonly logger = new Logger(GeminiDietRecommenderAdapter.name);
  private geminiKeys: string[] = [];
  private mimoApiKey: string | null = null;
  private mimoBaseUrl = 'https://api.xiaomimimo.com/v1';

  private getModelsForKey(key: string): string[] {
    if (key.startsWith('AQ.')) {
      return [
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3.6-flash',
        'gemini-3.7-flash',
        'gemini-3.5-flash',
      ];
    } else {
      return [
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3.6-flash',
        'gemini-3.7-flash',
        'gemini-3.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash',
      ];
    }
  }

  onModuleInit() {
    const keys: string[] = [];
    if (process.env.GEMINI_BACKUP_API_KEY) {
      keys.push(
        process.env.GEMINI_BACKUP_API_KEY.trim().replace(/^["']|["']$/g, ''),
      );
    }
    if (process.env.GEMINI_API_KEY) {
      keys.push(process.env.GEMINI_API_KEY.trim().replace(/^["']|["']$/g, ''));
    }
    this.geminiKeys = keys.filter(Boolean);

    this.mimoApiKey = process.env.MIMO_API_KEY
      ? process.env.MIMO_API_KEY.trim().replace(/^["']|["']$/g, '')
      : null;
    if (process.env.MIMO_BASE_URL) {
      this.mimoBaseUrl = process.env.MIMO_BASE_URL.trim().replace(
        /^["']|["']$/g,
        '',
      );
    }

    this.logger.log(
      `🥗 Pool de IA para Nutrición inicializado: ${this.geminiKeys.length} clave(s) Gemini + ${this.mimoApiKey ? 'Xiaomi MiMo v2.5' : 'Sin MiMo'}`,
    );
  }

  async generateRecommendation(
    promptStr: string,
    context?: DietRecommenderContext,
  ): Promise<string> {
    if (this.geminiKeys.length === 0 && !this.mimoApiKey) {
      throw new Error(
        'El servicio de IA no está configurado (falta API Key de Gemini y MiMo)',
      );
    }

    const {
      goal,
      weight,
      height,
      experienceLevel,
      medicalConditions,
      dietaryPreferences,
      targetCalories,
      recentMeals,
      activeRoutine,
      history = [],
    } = context || {};

    const goalLabels: Record<string, string> = {
      deficit: 'Déficit calórico (pérdida de grasa)',
      volumen: 'Volumen/Bulk (ganancia muscular)',
      mantenimiento: 'Mantenimiento de peso',
      recomposicion: 'Recomposición corporal',
    };

    const goalDescription = goal ? goalLabels[goal] || goal : 'No especificado';

    let userContextString = '';
    if (targetCalories)
      userContextString += `\n- Calorías Diarias Objetivo: ${targetCalories} kcal`;
    if (goal) userContextString += `\n- Objetivo: ${goalDescription}`;
    if (weight) userContextString += `\n- Peso: ${weight} kg`;
    if (height) userContextString += `\n- Estatura: ${height} cm`;
    if (experienceLevel)
      userContextString += `\n- Experiencia en entrenamiento: ${experienceLevel}`;
    if (medicalConditions)
      userContextString += `\n- Condiciones médicas o lesiones: ${medicalConditions}`;
    if (dietaryPreferences)
      userContextString += `\n- Preferencias alimentarias o alergias: ${dietaryPreferences}`;

    if (recentMeals && recentMeals.length > 0) {
      userContextString += `\n- ÚLTIMAS COMIDAS QUE EL CLIENTE REGISTRÓ (Tómalo en cuenta para no repetir o evaluar qué falta):\n`;
      recentMeals.forEach((m) => {
        userContextString += `  • ${m.date} - ${m.name} (${m.type}): ${m.calories} kcal [${m.macros}]\n`;
      });
    }

    if (activeRoutine) {
      userContextString += `\n- RUTINA DE ENTRENAMIENTO ACTIVA DEL USUARIO:\n  Nombre de la rutina: ${activeRoutine.name}\n  Descripción: ${activeRoutine.description || 'Sin descripción'}\n  Días configurados:\n`;
      activeRoutine.days.forEach((d: any) => {
        const restText = d.isRestDay ? ' (Día de descanso)' : '';
        userContextString += `    • Día ${d.dayNumber}: ${d.focusArea}${restText}\n`;
        if (d.exercises && d.exercises.length > 0) {
          d.exercises.forEach((ex: any) => {
            userContextString += `      - ${ex.name}: ${ex.sets}x${ex.reps} (Notas: ${ex.observations || 'Ninguna'})\n`;
          });
        }
      });
    }

    const systemInstruction = `
Eres un asistente experto en nutrición y fitness de clase mundial, conversando directamente con tu usuario (el cliente).
Tu objetivo es ayudarlo a lograr sus metas de salud basándote en su contexto (calorías, comidas previas, alergias, peso, y su rutina de entrenamiento activa).
Habla de forma directa, motivadora, empática y en primera persona. NO hables de un "cliente" ni menciones a un "entrenador". Tú estás hablando interactiva y directamente con la persona.
Devuelve tu respuesta SOLAMENTE en Markdown estructurado y amigable, usando listas, negritas y emojis relevantes. Si el usuario te pregunta por su rutina, qué comer según su día de entrenamiento o su historial, responde con inteligencia usando todo el contexto provisto.
    `;

    const mappedHistory = history.map((msg) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // 1. Cascada Multi-Modelo por todas las llaves de Gemini
    for (let k = 0; k < this.geminiKeys.length; k++) {
      const key = this.geminiKeys[k];
      const keyShort = `...${key.slice(-4)}`;
      const targetModels = this.getModelsForKey(key);

      for (const modelName of targetModels) {
        try {
          const genAI = new GoogleGenerativeAI(key);
          const model = genAI.getGenerativeModel({ model: modelName });
          const chat = model.startChat({
            history: [
              {
                role: 'user',
                parts: [
                  {
                    text:
                      systemInstruction +
                      '\n\n' +
                      'CONTEXTO NUTRICIONAL DEL USUARIO:\n' +
                      (userContextString
                        ? userContextString
                        : 'Ningún dato específico configurado.'),
                  },
                ],
              },
              {
                role: 'model',
                parts: [
                  {
                    text: 'Entendido. Estoy listo para platicar directamente contigo, entender tu cuerpo y ayudarte a alcanzar tus objetivos nutricionales usando toda mi sabiduría. ¡Hablemos! 🥦✨',
                  },
                ],
              },
              ...mappedHistory,
            ],
          });

          const generatePromise = chat.sendMessage(promptStr);
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Timeout de 6s en ${modelName}`)),
              6000,
            ),
          );

          const result = await Promise.race([generatePromise, timeoutPromise]);

          const reply = result.response.text();
          if (reply) {
            this.logger.log(
              `✅ Recomendación dietética generada exitosamente con [${modelName}] (Clave #${k + 1} ${keyShort})`,
            );
            return reply;
          }
        } catch (e: unknown) {
          const errMsg = e instanceof Error ? e.message : String(e);
          this.logger.warn(
            `⚠️ [${modelName}] en Clave #${k + 1} (${keyShort}) falló (${errMsg.slice(0, 80)}). Conmutando...`,
          );
        }
      }
    }

    // Failover a Xiaomi MiMo v2.5
    if (this.mimoApiKey) {
      try {
        const messages = [
          {
            role: 'system',
            content:
              systemInstruction +
              '\n\nCONTEXTO NUTRICIONAL DEL USUARIO:\n' +
              (userContextString || 'Ningún dato específico configurado.'),
          },
          ...history.map((h) => ({
            role: h.role === 'ai' ? ('assistant' as const) : ('user' as const),
            content: h.content,
          })),
          { role: 'user' as const, content: promptStr },
        ];

        const response = await fetch(`${this.mimoBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.mimoApiKey}`,
          },
          body: JSON.stringify({
            model: 'mimo-v2.5',
            messages,
            temperature: 0.6,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            this.logger.log(
              '✅ Recomendación dietética generada exitosamente con Xiaomi MiMo v2.5',
            );
            return content;
          }
        }
      } catch (mimoErr) {
        this.logger.error(
          '❌ Xiaomi MiMo también falló para recomendación dietética:',
          mimoErr,
        );
      }
    }

    throw new Error(
      'No se pudo generar la recomendación en este momento (motores de IA ocupados).',
    );
  }
}
