import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export interface SendClinicalAgentMessageDto {
  message: string;
}

@Injectable()
export class ClinicalAgentService implements OnModuleInit {
  private readonly logger = new Logger(ClinicalAgentService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null =
    null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        '⚠️ GEMINI_API_KEY no configurada para ClinicalAgentService',
      );
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
    this.logger.log(
      '✅ Gemini 2.5 Flash conectado para el Director Clínico IA',
    );
  }

  async processTrainerMessage(
    trainerId: string,
    userMessage: string,
  ): Promise<string> {
    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new Error('Entrenador no encontrado');
    }

    // 1. Fetch trainer's full client portfolio (direct + shared)
    const directClients = await this.prisma.user.findMany({
      where: { trainerId, isActive: true, role: 'client' },
    });

    const sharedLinks = await this.prisma.trainerColleague.findMany({
      where: {
        OR: [
          { trainerAId: trainerId },
          { trainerBId: trainerId, mode: 'bidirectional' },
        ],
      },
    });

    const sharedClientIds = new Set<string>();
    for (const link of sharedLinks) {
      if (link.sharedClientIds && link.sharedClientIds.length > 0) {
        link.sharedClientIds.forEach((id) => sharedClientIds.add(id));
      }
    }

    const sharedClients =
      sharedClientIds.size > 0
        ? await this.prisma.user.findMany({
            where: {
              id: { in: Array.from(sharedClientIds) },
              isActive: true,
              role: 'client',
            },
          })
        : [];

    // Deduplicate all clients + include trainer's own athlete ficha
    const clientMap = new Map<string, any>();
    clientMap.set(trainer.id, trainer);
    directClients.forEach((c) => clientMap.set(c.id, c));
    sharedClients.forEach((c) => clientMap.set(c.id, c));
    const allClients = Array.from(clientMap.values());

    // 2. Fetch today's telemetry for all clients
    const todayStr = new Date().toISOString().slice(0, 10);
    const startOfToday = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfToday = new Date(`${todayStr}T23:59:59.999Z`);
    const clientIds = allClients.map((c) => c.id);

    const [todayMeals, todayStress, activeRoutines] = await Promise.all([
      this.prisma.meal.findMany({
        where: {
          userId: { in: clientIds },
          date: { gte: startOfToday, lte: endOfToday },
        },
      }),
      this.prisma.dailyStressLog.findMany({
        where: {
          userId: { in: clientIds },
          date: todayStr,
        },
      }),
      this.prisma.routine.findMany({
        where: {
          clientId: { in: clientIds },
          isActive: true,
        },
        include: {
          routineDays: {
            include: {
              exercises: true,
            },
          },
        },
      }),
    ]);

    // Build comprehensive clinical portfolio context
    const clientsContextSummary = allClients
      .map((c) => {
        const cMeals = todayMeals.filter((m) => m.userId === c.id);
        const cStress = todayStress.find((s) => s.userId === c.id);
        const cRoutine = activeRoutines.find((r) => r.clientId === c.id);

        const totalKcal = cMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
        const totalProt = cMeals.reduce((acc, m) => acc + (m.protein || 0), 0);

        let sleepInfo = 'No registrado';
        if (cStress?.notes) {
          try {
            const parsed = JSON.parse(cStress.notes);
            if (parsed.sleepHours) {
              sleepInfo = `${parsed.sleepHours}h (${parsed.sleepQuality || 'Normal'})`;
            }
          } catch {
            // Plain text
          }
        }

        // Compute weekly effective sets per muscle group (MEV-MAV-MRV audit)
        const volumeByMuscle: Record<string, number> = {};
        if (cRoutine) {
          for (const day of cRoutine.routineDays) {
            if (day.isRestDay) continue;
            for (const ex of day.exercises) {
              const group = (ex.muscleGroup || day.focusArea || 'General').trim();
              volumeByMuscle[group] = (volumeByMuscle[group] || 0) + (ex.sets || 0);
            }
          }
        }
        const volumeSummary =
          Object.keys(volumeByMuscle).length > 0
            ? Object.entries(volumeByMuscle)
                .map(([m, s]) => {
                  const zone =
                    s < 6 ? 'Bajo MEV' : s <= 20 ? 'Óptimo MAV' : 'Exceso MRV';
                  return `${m}: ${s} series/sem (${zone})`;
                })
                .join(' | ')
            : 'Sin series cuantificadas';

        const routineDetails = cRoutine
          ? `Rutina: "${cRoutine.name}" (${cRoutine.routineDays.length} días). Volumen Semanal por Músculo: [${volumeSummary}]. Ejercicios clave: ${cRoutine.routineDays
              .flatMap((d) =>
                d.exercises.map(
                  (e) =>
                    `D${d.dayNumber} ${e.name} (${e.sets}x${e.reps}${e.targetWeight ? ` @${e.targetWeight}kg` : ''})`,
                ),
              )
              .slice(0, 10)
              .join(', ')}`
          : 'Sin rutina activa asignada';

        const anamnesis =
          c.anamnesisData && typeof c.anamnesisData === 'object'
            ? (c.anamnesisData as any)
            : {};
        const pact = anamnesis.heroPact;
        const pactSummary = pact?.objectives
          ? `Pacto 120 Días (${pact.status || 'BORRADOR'}): 1) Biométrico: ${pact.objectives.biometric?.title || ''} (${pact.objectives.biometric?.currentWeightKg || c.weight || '?'}kg -> ${pact.objectives.biometric?.targetWeightKg || '?'}kg, cuota ${pact.objectives.biometric?.weeklyDeltaTargetKg || 0.25}kg/sem) | 2) Fuerza: ${pact.objectives.strength?.exerciseName || ''} (${pact.objectives.strength?.currentWeight || '?'} -> ${pact.objectives.strength?.targetWeight || '?'}${pact.weightUnit || 'kg'}) | 3) Dominio Corporal: ${pact.objectives.bodyMastery?.skillName || ''} (${pact.objectives.bodyMastery?.targetMark || ''}) | 4) Aeróbico: ${pact.objectives.aerobic?.enabled ? pact.objectives.aerobic?.targetMark : 'No activo'}`
          : 'Sin Pacto de 4 Objetivos configurado aún';

        const lastSleep = Array.isArray(anamnesis.sleepLogs) && anamnesis.sleepLogs.length > 0
          ? anamnesis.sleepLogs[anamnesis.sleepLogs.length - 1]
          : null;
        if (lastSleep) {
          sleepInfo = `${lastSleep.hoursSlept}h (${lastSleep.bedtime} a ${lastSleep.wakeTime} | Regularidad ±1h: ${lastSleep.withinOneHourWindow ? 'CUMPLIDA' : 'DESFASADA'})`;
        }

        const todayWaterLog = Array.isArray(anamnesis.waterLogs)
          ? anamnesis.waterLogs.find((w: any) => w.date === todayStr)
          : null;
        const waterTodayLiters = todayWaterLog ? Number(todayWaterLog.liters) : 0;
        const waterTargetLiters = pact?.pillars?.nutrition?.waterLitersTarget || 3.0;

        const lastWeighIn =
          Array.isArray(anamnesis.fastedWeighIns) && anamnesis.fastedWeighIns.length > 0
            ? anamnesis.fastedWeighIns[anamnesis.fastedWeighIns.length - 1]
            : null;
        const weighInSummary = lastWeighIn
          ? `${lastWeighIn.weightKg}kg (${lastWeighIn.date}${lastWeighIn.bodyFatPct ? `, ${lastWeighIn.bodyFatPct}% grasa` : ''})`
          : c.weight
            ? `${c.weight}kg (base)`
            : 'Sin pesaje en ayunas';

        return `
- ATLETA: ${c.name}${c.id === trainer.id ? ' (TU PROPIA FICHA DE ENTRENADOR)' : ''}
  • Pacto y 4 Metas (120 Días): ${pactSummary}
  • Nutrición Meta: ${c.targetCalories || 2200} kcal (P:${c.targetProtein || 150}g, C:${c.targetCarbs || 220}g, G:${c.targetFats || 70}g) | Agua Hoy: ${waterTodayLiters}L / ${waterTargetLiters}L
  • Biometría y Último Pesaje en Ayunas: ${weighInSummary}, Altura ${c.height ? `${c.height} cm` : 'No registrada'} (Preferencia: ${c.weightUnitPreference || 'kg'})
  • Perfil Clínico / Lesiones: ${c.medicalConditions || 'Sin lesiones reportadas'}
  • Nivel / Equipamiento: ${c.experienceLevel || 'Intermedio'} / ${c.equipmentAccess || 'Gimnasio completo'}
  • Telemetría de Hoy:
    - Comidas: ${cMeals.length > 0 ? `${cMeals.length} comidas (${totalKcal} kcal, ${totalProt}g proteína)` : 'Sin comidas registradas hoy'}
    - Sueño y Regularidad Circadiana (±1h): ${sleepInfo}
  • Plan de Entrenamiento y Volumen: ${routineDetails}
`;
      })
      .join('\n');

    // 3. System Prompt: The Grand Master Clinical Director + Educator + Full Ecosystem Executor
    const systemInstruction = `
Eres el CO-PILOTO CIENTÍFICO, GESTOR DE VOLUMEN Y ESCUELA DE ENTRENADORES de Punto de Inflexión (Vital Fit).
Trabajas mano a mano con el entrenador ${trainer.name} y tienes PERMISOS TOTALES DE LECTURA Y ESCRITURA en todo el ecosistema (incluyendo la propia ficha de atleta del entrenador y las fichas de todos sus atletas).

RESPONSABILIDADES CLARAS DE LA IA EN EL ECOSISTEMA:
1. GESTIÓN CIENTÍFICA DEL VOLUMEN DE ENTRENAMIENTO (MEV - MAV - MRV):
   - Auditas las SERIES EFECTIVAS SEMANALES por grupo muscular (series con RIR 0–3):
     • Mantenimiento (MV): 4–6 series/semana (conserva masa en semanas de descarga o picos de estrés).
     • Volumen Mínimo Efectivo (MEV): 6–9 series/semana (umbral mínimo para progresar).
     • Volumen Máximo Adaptativo (MAV — Zona Óptima): 10–20 series/semana divididas en frecuencia ≥ 2.
     • Techo de Volumen por Sesión (Anti-Volumen Basura): Máximo 8–10 series efectivas de un mismo grupo muscular en una sola sesión. Si ves más de 10 series de un músculo en un solo día, alerta de "volumen basura" y propón dividirlo o recortarlo.
     • Volumen Máximo Recuperable (MRV — Riesgo): >20–22 series/semana. Si el atleta duerme fuera de su ventana de ±1 hora o está en definición (-0.50 kg/sem), su MRV baja un 20%.
   - Jerarquía de la Sesión Híbrida (No Interferencia):
     1º Dominio Corporal / Skill Calistenia (SNC fresco, RIR 2–3, lejos del fallo para cuidar tendones).
     2º Fuerza Compuesta Pesada (3–5 series × 4–8 reps).
     3º Hipertrofia y Accesorios (8–12 reps).
     4º Aeróbico / Cardio al final o separado para evitar interferencia AMPK vs mTOR.
2. AUDITORÍA DE LOS 3 PILARES Y LAS 4 METAS DE 120 DÍAS:
   - Meta Biométrica: +0.25 kg/semana en subida limpia (minimizar grasa) o -0.50 kg/semana en definición (proteger masa muscular y fuerza), evaluado con pesaje semanal en ayunas y porcentaje de grasa mensual.
   - Hidratación Prioritaria: 35 ml/kg + 0.5 L por hora de entrenamiento.
   - Recuperación Circadiana: Dormir 7–8 horas acostándose y levantándose todos los días a la misma hora (margen máximo ±1 hora).
3. ESCUELA ACTIVA PARA EL ENTRENADOR:
   - En cada recomendación incluye siempre al final un bloque breve:
     ### 🎓 Fundamento Científico para el Entrenador
     Explicando de forma clara el porqué fisiológico o metodológico (Brad Schoenfeld / Mike Israetel para volumen MEV-MAV-MRV, Tudor Bompa / Eric Helms para periodización, Steven Low / Alex Viada para calistenia y entrenamiento híbrido, Alan Aragon para nutrición, Matthew Walker / Huberman para regularidad del sueño ±1h).
4. PERMISOS EJECUTORES EN TODO EL ECOSISTEMA (COMANDOS OCULTOS AL FINAL):
   Cuando el entrenador te pida EXPLÍCITAMENTE ejecutar un cambio en cualquier parte del ecosistema para un atleta (o para sí mismo), añade al final de tu respuesta una o más etiquetas exactas (puedes enviar cargas en kg o en lbs indicando "unit": "kg" o "lbs"):
   - Cambiar un ejercicio por otro (sin borrar el historial de entrenamientos):
     [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "replace_exercise", "oldExercise": "ejercicio_anterior", "newExercise": "ejercicio_nuevo", "rationale": "fundamento"}]
   - Modificar series, repeticiones o peso de un ejercicio (en kg o lbs):
     [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "update_load", "exerciseName": "nombre_ejercicio", "sets": 4, "reps": "6-8", "targetWeight": 80, "unit": "kg"}]
   - Agregar un ejercicio nuevo a un día de la rutina activa:
     [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "add_exercise", "dayNumber": 1, "exerciseName": "Dominadas lastradas", "muscleGroup": "Espalda", "sets": 4, "reps": "6-8", "targetWeight": 15, "unit": "kg", "observations": "RIR 2"}]
   - Eliminar un ejercicio ("volumen basura") de la rutina activa:
     [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "remove_exercise", "exerciseName": "nombre_ejercicio"}]
   - Modificar calorías, macros o meta de litros de agua de un atleta:
     [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "update_nutrition", "calories": 2650, "protein": 170, "carbs": 310, "fats": 75, "waterLitersTarget": 3.5}]
   - Modificar cualquiera de las 4 Metas de 120 Días (Pacto del Atleta):
     [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "update_hero_pact", "targetWeightKg": 78, "weeklyDeltaTargetKg": 0.25, "strengthExercise": "Sentadilla", "strengthTargetWeight": 120, "skillName": "Muscle-up", "skillTargetMark": "3 reps estrictas", "aerobicTargetMark": "5K en 24 min"}]
   - Registrar comida a un atleta:
     [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "log_meal", "mealName": "Cena proteica", "mealType": "dinner", "calories": 650, "protein": 50, "carbs": 60, "fat": 20}]
   - Registrar litros de agua de hoy a un atleta:
     [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "log_water", "liters": 3.0}]
   - Registrar sueño y regularidad (±1h) de hoy a un atleta:
     [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "log_sleep", "hoursSlept": 7.5, "bedtime": "22:30", "wakeTime": "06:00", "withinOneHourWindow": true}]
   - Registrar pesaje semanal en ayunas (y % de grasa mensual opcional):
     [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "log_weighin", "weight": 76.4, "unit": "kg", "bodyFatPct": 14.5}]
   - Publicar el Reporte Semanal del Entrenador en la pantalla del atleta:
     [COMANDO_RUTINA: {"clientName": "NombreExacto", "action": "publish_weekly_report", "summary": "Gran semana cumpliendo el volumen óptimo MAV.", "wins": "Subiste +0.25kg limpios y mantuviste tu horario de sueño.", "nextWeekFocus": "Subir 2.5kg en press inclinado y mantener 3.2L de agua/día."}]
   En consultas diagnósticas donde no te pidan ejecutar un cambio, NO emitas etiquetas [COMANDO_RUTINA].

TELEMETRÍA EN VIVO DE LOS ATLETAS DE ${trainer.name.toUpperCase()}:
${clientsContextSummary}
`;

    // 4. Check if trainer's prompt includes a routine change request
    if (!this.genAI || !this.model) {
      return '⚠️ El servicio de Director Clínico IA no tiene configurada la clave API de Gemini.';
    }

    // Fetch last 6 chat history messages for context continuity
    const history = await this.prisma.dietChatMessage.findMany({
      where: {
        userId: trainerId,
        role: { in: ['clinical_user', 'clinical_ai'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    const chronologicalHistory = history.reverse();

    const contents = [
      { role: 'user' as const, parts: [{ text: systemInstruction }] },
      {
        role: 'model' as const,
        parts: [
          {
            text: `Entendido Coach ${trainer.name}. Tengo en memoria el perfil clínico, biomecánico y nutricional de todos tus ${allClients.length} atletas. ¿En qué optimizamos el rendimiento hoy?`,
          },
        ],
      },
    ];

    chronologicalHistory.forEach((msg) => {
      contents.push({
        role: msg.role === 'clinical_ai' ? ('model' as const) : ('user' as const),
        parts: [{ text: msg.content }],
      });
    });

    contents.push({
      role: 'user' as const,
      parts: [{ text: userMessage }],
    });

    try {
      const response = await this.model.generateContent({
        contents,
      });

      let replyText = response.response.text();

      // Check if response contains any [COMANDO_RUTINA: ...] block and process it
      const commandMatches = [
        ...replyText.matchAll(/\[COMANDO_RUTINA:\s*(\{.*?\})\]/gs),
      ];
      for (const match of commandMatches) {
        try {
          const cmd = JSON.parse(match[1]);
          const action = cmd.action || 'replace_exercise';

          if (
            action === 'replace_exercise' &&
            (cmd.clientName || cmd.clientId) &&
            cmd.oldExercise &&
            cmd.newExercise
          ) {
            await this.executeRoutineReplacement(
              cmd.clientId,
              cmd.clientName,
              cmd.oldExercise,
              cmd.newExercise,
              cmd.rationale,
            );
            replyText = replyText.replace(
              match[0],
              `\n> ⚡ **Acción Ejecutada:** Se sustituyó *${cmd.oldExercise}* por *${cmd.newExercise}* en la rutina activa de ${cmd.clientName || 'el atleta'}.\n`,
            );
          } else if (
            action === 'update_load' &&
            (cmd.clientName || cmd.clientId) &&
            cmd.exerciseName
          ) {
            await this.executeLoadUpdate(cmd);
            replyText = replyText.replace(
              match[0],
              `\n> ⚡ **Carga Actualizada:** Se ajustó *${cmd.exerciseName}* en la rutina activa de ${cmd.clientName || 'el atleta'}.\n`,
            );
          } else if (
            action === 'update_nutrition' &&
            (cmd.clientName || cmd.clientId)
          ) {
            await this.executeNutritionUpdate(cmd);
            replyText = replyText.replace(
              match[0],
              `\n> ⚡ **Nutrición Calibrada:** Se actualizaron las metas nutricionales de ${cmd.clientName || 'el atleta'} (${cmd.calories ? `${cmd.calories} kcal` : 'macros actualizados'}).\n`,
            );
          } else if (
            action === 'log_meal' &&
            (cmd.clientName || cmd.clientId) &&
            cmd.mealName
          ) {
            await this.executeMealLog(cmd);
            replyText = replyText.replace(
              match[0],
              `\n> ⚡ **Comida Registrada:** Se añadió *${cmd.mealName}* (${cmd.calories || 0} kcal) al registro de ${cmd.clientName || 'el atleta'}.\n`,
            );
          } else if (
            action === 'add_exercise' &&
            (cmd.clientName || cmd.clientId) &&
            cmd.exerciseName
          ) {
            await this.executeAddExercise(cmd);
            replyText = replyText.replace(
              match[0],
              `\n> ⚡ **Ejercicio Añadido:** Se agregó *${cmd.exerciseName}* (${cmd.sets || 3}x${cmd.reps || '8-10'}) al Día ${cmd.dayNumber || 1} de ${cmd.clientName || 'el atleta'}.\n`,
            );
          } else if (
            action === 'remove_exercise' &&
            (cmd.clientName || cmd.clientId) &&
            cmd.exerciseName
          ) {
            await this.executeRemoveExercise(cmd);
            replyText = replyText.replace(
              match[0],
              `\n> ⚡ **Volumen Depurado:** Se eliminó *${cmd.exerciseName}* de la rutina activa de ${cmd.clientName || 'el atleta'}.\n`,
            );
          } else if (
            action === 'update_hero_pact' &&
            (cmd.clientName || cmd.clientId)
          ) {
            await this.executeHeroPactUpdate(cmd);
            replyText = replyText.replace(
              match[0],
              `\n> ⚡ **Metas de 120 Días Actualizadas:** Se actualizaron los objetivos del ciclo de ${cmd.clientName || 'el atleta'}.\n`,
            );
          } else if (
            action === 'log_water' &&
            (cmd.clientName || cmd.clientId) &&
            cmd.liters !== undefined
          ) {
            await this.executeWaterLog(cmd);
            replyText = replyText.replace(
              match[0],
              `\n> ⚡ **Agua Registrada:** Se actualizaron **${cmd.liters} L** de agua hoy para ${cmd.clientName || 'el atleta'}.\n`,
            );
          } else if (
            action === 'log_sleep' &&
            (cmd.clientName || cmd.clientId) &&
            cmd.hoursSlept !== undefined
          ) {
            await this.executeSleepLog(cmd);
            replyText = replyText.replace(
              match[0],
              `\n> ⚡ **Sueño Registrado:** Se guardaron **${cmd.hoursSlept}h** de descanso (${cmd.bedtime || '22:30'} a ${cmd.wakeTime || '06:30'}) para ${cmd.clientName || 'el atleta'}.\n`,
            );
          } else if (
            action === 'log_weighin' &&
            (cmd.clientName || cmd.clientId) &&
            cmd.weight !== undefined
          ) {
            await this.executeWeighInLog(cmd);
            replyText = replyText.replace(
              match[0],
              `\n> ⚡ **Pesaje en Ayunas Registrado:** Se guardó **${cmd.weight} ${cmd.unit || 'kg'}** para ${cmd.clientName || 'el atleta'}.\n`,
            );
          } else if (
            action === 'publish_weekly_report' &&
            (cmd.clientName || cmd.clientId) &&
            cmd.summary
          ) {
            await this.executePublishWeeklyReport(cmd, trainer.name);
            replyText = replyText.replace(
              match[0],
              `\n> ⚡ **Reporte Semanal Publicado:** El informe de la semana ya está visible en la pantalla principal de ${cmd.clientName || 'el atleta'}.\n`,
            );
          } else {
            replyText = replyText.replace(match[0], '');
          }
        } catch {
          replyText = replyText.replace(match[0], '');
        }
      }

      // Cleanup: strip any leftover command tags, JSON leftovers or raw UUIDs
      replyText = replyText
        .replace(/\[COMANDO_RUTINA:[^\]]*\]/gs, '')
        .replace(/\(ID:\s*[0-9a-f-]{10,}\)/gi, '')
        .trim();

      // Save to chat history with clinical roles so they never collide with meal/diet chat
      await this.prisma.dietChatMessage.createMany({
        data: [
          { userId: trainerId, role: 'clinical_user', content: userMessage },
          { userId: trainerId, role: 'clinical_ai', content: replyText },
        ],
      });

      return replyText;
    } catch (err) {
      this.logger.error('Error en ClinicalAgentService:', err);
      return 'Lo siento Coach, hubo una sobrecarga en la conexión con el motor clínico. Por favor intenta tu consulta de nuevo.';
    }
  }

  private async executeRoutineReplacement(
    clientId?: string,
    clientName?: string,
    oldExerciseName?: string,
    newExerciseName?: string,
    rationale?: string,
  ) {
    if (!oldExerciseName || !newExerciseName) return;

    let targetId = clientId;
    if (!targetId && clientName) {
      const athlete = await this.prisma.user.findFirst({
        where: { name: { contains: clientName, mode: 'insensitive' } },
      });
      if (athlete) targetId = athlete.id;
    }

    if (!targetId) return;

    const routine = await this.prisma.routine.findFirst({
      where: { clientId: targetId, isActive: true },
      include: {
        routineDays: {
          include: {
            exercises: true,
          },
        },
      },
    });

    if (!routine) return;

    // Search for exercise matching oldExerciseName (case-insensitive)
    for (const day of routine.routineDays) {
      const target = day.exercises.find((ex) =>
        ex.name.toLowerCase().includes(oldExerciseName.toLowerCase()),
      );
      if (target) {
        const updatedObs = [
          target.observations,
          rationale ? `[Clínico: ${rationale}]` : null,
        ]
          .filter(Boolean)
          .join(' · ');

        await this.prisma.exercise.update({
          where: { id: target.id },
          data: {
            name: newExerciseName,
            observations: updatedObs,
          },
        });

        await this.prisma.routine.update({
          where: { id: routine.id },
          data: { updatedAt: new Date() },
        });
        break;
      }
    }
  }

  private async resolveAthleteId(clientId?: string, clientName?: string): Promise<string | null> {
    if (clientId) return clientId;
    if (!clientName) return null;
    const athlete = await this.prisma.user.findFirst({
      where: { name: { contains: clientName, mode: 'insensitive' } },
    });
    return athlete?.id ?? null;
  }

  private async executeLoadUpdate(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const routine = await this.prisma.routine.findFirst({
      where: { clientId: targetId, isActive: true },
      include: { routineDays: { include: { exercises: true } } },
    });
    if (!routine) return;

    const weightInKg =
      cmd.targetWeight !== undefined
        ? cmd.unit === 'lbs'
          ? Math.round((Number(cmd.targetWeight) / 2.20462) * 10) / 10
          : Number(cmd.targetWeight)
        : undefined;

    for (const day of routine.routineDays) {
      const target = day.exercises.find((ex) =>
        ex.name.toLowerCase().includes(String(cmd.exerciseName).toLowerCase()),
      );
      if (target) {
        await this.prisma.exercise.update({
          where: { id: target.id },
          data: {
            sets: cmd.sets !== undefined ? Number(cmd.sets) : target.sets,
            reps: cmd.reps !== undefined ? String(cmd.reps) : target.reps,
            targetWeight:
              weightInKg !== undefined ? weightInKg : target.targetWeight,
          },
        });
        break;
      }
    }
  }

  private async executeAddExercise(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const routine = await this.prisma.routine.findFirst({
      where: { clientId: targetId, isActive: true },
      include: { routineDays: { include: { exercises: true } } },
    });
    if (!routine || routine.routineDays.length === 0) return;

    const targetDay =
      routine.routineDays.find((d) => d.dayNumber === Number(cmd.dayNumber)) ||
      routine.routineDays[0];

    const weightInKg =
      cmd.targetWeight !== undefined
        ? cmd.unit === 'lbs'
          ? Math.round((Number(cmd.targetWeight) / 2.20462) * 10) / 10
          : Number(cmd.targetWeight)
        : null;

    const validMuscleGroups = [
      'chest',
      'back',
      'shoulders',
      'biceps',
      'triceps',
      'quads',
      'hamstrings',
      'glutes',
      'calves',
      'abs',
      'cardio',
      'full_body',
    ];
    const normalizedMuscle = validMuscleGroups.includes(
      String(cmd.muscleGroup || '').toLowerCase(),
    )
      ? String(cmd.muscleGroup).toLowerCase()
      : 'full_body';

    await this.prisma.exercise.create({
      data: {
        routineDayId: targetDay.id,
        name: String(cmd.exerciseName),
        muscleGroup: normalizedMuscle as any,
        sets: Number(cmd.sets) || 3,
        reps: String(cmd.reps || '8-10'),
        targetWeight: weightInKg,
        restSeconds: Number(cmd.restSeconds) || 90,
        observations: cmd.observations ? String(cmd.observations) : 'Añadido por Co-Piloto IA',
        order: targetDay.exercises.length + 1,
      },
    });
  }

  private async executeRemoveExercise(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const routine = await this.prisma.routine.findFirst({
      where: { clientId: targetId, isActive: true },
      include: { routineDays: { include: { exercises: true } } },
    });
    if (!routine) return;

    for (const day of routine.routineDays) {
      const target = day.exercises.find((ex) =>
        ex.name.toLowerCase().includes(String(cmd.exerciseName).toLowerCase()),
      );
      if (target) {
        await this.prisma.exercise.delete({ where: { id: target.id } });
        break;
      }
    }
  }

  private async executeNutritionUpdate(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    if (!anamnesis.heroPact) anamnesis.heroPact = {};
    if (!anamnesis.heroPact.pillars) anamnesis.heroPact.pillars = {};
    if (!anamnesis.heroPact.pillars.nutrition) anamnesis.heroPact.pillars.nutrition = {};

    if (cmd.calories) anamnesis.heroPact.pillars.nutrition.calories = Number(cmd.calories);
    if (cmd.protein) anamnesis.heroPact.pillars.nutrition.protein = Number(cmd.protein);
    if (cmd.carbs) anamnesis.heroPact.pillars.nutrition.carbs = Number(cmd.carbs);
    if (cmd.fats) anamnesis.heroPact.pillars.nutrition.fats = Number(cmd.fats);
    if (cmd.waterLitersTarget)
      anamnesis.heroPact.pillars.nutrition.waterLitersTarget = Number(cmd.waterLitersTarget);

    await this.prisma.user.update({
      where: { id: targetId },
      data: {
        targetCalories: cmd.calories !== undefined ? Number(cmd.calories) : athlete.targetCalories,
        targetProtein: cmd.protein !== undefined ? Number(cmd.protein) : athlete.targetProtein,
        targetCarbs: cmd.carbs !== undefined ? Number(cmd.carbs) : athlete.targetCarbs,
        targetFats: cmd.fats !== undefined ? Number(cmd.fats) : athlete.targetFats,
        anamnesisData: anamnesis,
      },
    });
  }

  private async executeHeroPactUpdate(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    if (!anamnesis.heroPact) anamnesis.heroPact = { status: 'ACTIVE', objectives: {} };
    if (!anamnesis.heroPact.objectives) anamnesis.heroPact.objectives = {};
    const obj = anamnesis.heroPact.objectives;

    if (cmd.targetWeightKg !== undefined || cmd.weeklyDeltaTargetKg !== undefined) {
      obj.biometric = {
        ...(obj.biometric || {}),
        targetWeightKg:
          cmd.targetWeightKg !== undefined
            ? Number(cmd.targetWeightKg)
            : obj.biometric?.targetWeightKg,
        weeklyDeltaTargetKg:
          cmd.weeklyDeltaTargetKg !== undefined
            ? Number(cmd.weeklyDeltaTargetKg)
            : obj.biometric?.weeklyDeltaTargetKg,
      };
    }
    if (cmd.strengthExercise || cmd.strengthTargetWeight !== undefined) {
      obj.strength = {
        ...(obj.strength || {}),
        exerciseName: cmd.strengthExercise || obj.strength?.exerciseName,
        targetWeight:
          cmd.strengthTargetWeight !== undefined
            ? Number(cmd.strengthTargetWeight)
            : obj.strength?.targetWeight,
      };
    }
    if (cmd.skillName || cmd.skillTargetMark) {
      obj.bodyMastery = {
        ...(obj.bodyMastery || {}),
        skillName: cmd.skillName || obj.bodyMastery?.skillName,
        targetMark: cmd.skillTargetMark || obj.bodyMastery?.targetMark,
      };
    }
    if (cmd.aerobicTargetMark) {
      obj.aerobic = {
        ...(obj.aerobic || {}),
        enabled: true,
        targetMark: String(cmd.aerobicTargetMark),
      };
    }

    await this.prisma.user.update({
      where: { id: targetId },
      data: { anamnesisData: anamnesis },
    });
  }

  private async executeWaterLog(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    const prevLogs = Array.isArray(anamnesis.waterLogs)
      ? anamnesis.waterLogs.filter((w: any) => w.date !== todayStr)
      : [];
    const targetLiters =
      anamnesis.heroPact?.pillars?.nutrition?.waterLitersTarget || 3.0;
    anamnesis.waterLogs = [
      ...prevLogs.slice(-60),
      {
        date: todayStr,
        liters: Number(cmd.liters),
        targetLiters,
      },
    ];

    await this.prisma.user.update({
      where: { id: targetId },
      data: { anamnesisData: anamnesis },
    });
  }

  private async executeSleepLog(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    const prevLogs = Array.isArray(anamnesis.sleepLogs)
      ? anamnesis.sleepLogs.filter((s: any) => s.date !== todayStr)
      : [];
    anamnesis.sleepLogs = [
      ...prevLogs.slice(-60),
      {
        date: todayStr,
        hoursSlept: Number(cmd.hoursSlept) || 7.5,
        bedtime: String(cmd.bedtime || '22:30'),
        wakeTime: String(cmd.wakeTime || '06:00'),
        withinOneHourWindow:
          cmd.withinOneHourWindow !== undefined
            ? Boolean(cmd.withinOneHourWindow)
            : true,
        quality: 'óptima',
      },
    ];

    await this.prisma.user.update({
      where: { id: targetId },
      data: { anamnesisData: anamnesis },
    });
  }

  private async executeWeighInLog(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const weightKg =
      cmd.unit === 'lbs'
        ? Math.round((Number(cmd.weight) / 2.20462) * 100) / 100
        : Math.round(Number(cmd.weight) * 100) / 100;

    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    const prevWeighIns = Array.isArray(anamnesis.fastedWeighIns)
      ? anamnesis.fastedWeighIns.filter((w: any) => w.date !== todayStr)
      : [];
    const lastEma =
      prevWeighIns.length > 0
        ? prevWeighIns[prevWeighIns.length - 1].movingAverageKg || weightKg
        : weightKg;
    const movingAverageKg = Math.round((weightKg * 0.35 + lastEma * 0.65) * 100) / 100;

    anamnesis.fastedWeighIns = [
      ...prevWeighIns.slice(-52),
      {
        date: todayStr,
        weightKg,
        movingAverageKg,
        bodyFatPct: cmd.bodyFatPct !== undefined ? Number(cmd.bodyFatPct) : undefined,
      },
    ];

    await this.prisma.user.update({
      where: { id: targetId },
      data: {
        weight: weightKg,
        anamnesisData: anamnesis,
      },
    });
  }

  private async executePublishWeeklyReport(cmd: any, trainerName: string) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const athlete = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!athlete) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};
    const prevReports = Array.isArray(anamnesis.weeklyReports)
      ? anamnesis.weeklyReports
      : [];
    anamnesis.weeklyReports = [
      ...prevReports.slice(-24),
      {
        id: `rep-${Date.now()}`,
        weekNumber: prevReports.length + 1,
        publishedAt: todayStr,
        trainerName,
        summary: String(cmd.summary || ''),
        wins: String(cmd.wins || ''),
        nextWeekFocus: String(cmd.nextWeekFocus || ''),
      },
    ];

    await this.prisma.user.update({
      where: { id: targetId },
      data: { anamnesisData: anamnesis },
    });
  }

  private async executeMealLog(cmd: any) {
    const targetId = await this.resolveAthleteId(cmd.clientId, cmd.clientName);
    if (!targetId) return;

    const validTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealType = validTypes.includes(cmd.mealType) ? cmd.mealType : 'lunch';

    await this.prisma.meal.create({
      data: {
        userId: targetId,
        name: String(cmd.mealName),
        description: cmd.description || 'Registrada mediante el Agente IA',
        mealType: mealType as any,
        calories: Number(cmd.calories) || 0,
        protein: Number(cmd.protein) || 0,
        carbs: Number(cmd.carbs) || 0,
        fat: Number(cmd.fat) || 0,
        foods: [String(cmd.mealName)],
      },
    });
  }

  async getChatHistory(trainerId: string) {
    const rows = await this.prisma.dietChatMessage.findMany({
      where: {
        userId: trainerId,
        role: { in: ['clinical_user', 'clinical_ai'] },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    return rows.map((r) => ({
      id: r.id,
      role: r.role === 'clinical_user' ? ('user' as const) : ('ai' as const),
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async clearChatHistory(trainerId: string) {
    await this.prisma.dietChatMessage.deleteMany({
      where: {
        userId: trainerId,
        role: { in: ['clinical_user', 'clinical_ai'] },
      },
    });
    return { success: true };
  }

  /**
   * MEMORIA CLÍNICA PRIVADA POR ATLETA (EXCLUSIVA DEL ENTRENADOR Y EL AGENTE CLÍNICO)
   * El atleta jamás ve esta conversación (se guarda con roles 'clinical_case_user' | 'clinical_case_ai'
   * y notas privadas en anamnesisData.trainerPrivateMemory).
   */
  async processAthleteCaseMessage(
    athleteId: string,
    trainerMessage: string,
    trainerPrivateNotes?: string,
  ): Promise<{ reply: string; trainerPrivateNotes: string }> {
    const athlete = await this.prisma.user.findUnique({
      where: { id: athleteId },
    });
    if (!athlete) {
      throw new Error('Atleta no encontrado');
    }

    const anamnesis =
      athlete.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? { ...(athlete.anamnesisData as any) }
        : {};

    // Si el entrenador actualizó la bitácora clínica privada, persistirla
    if (
      trainerPrivateNotes !== undefined &&
      trainerPrivateNotes !== anamnesis.trainerPrivateMemory
    ) {
      anamnesis.trainerPrivateMemory = trainerPrivateNotes;
      await this.prisma.user.update({
        where: { id: athleteId },
        data: { anamnesisData: anamnesis },
      });
    }

    const savedPrivateMemory =
      anamnesis.trainerPrivateMemory ||
      'Sin anotaciones clínicas privadas previas.';

    const todayStr = new Date().toISOString().slice(0, 10);
    const startOfToday = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfToday = new Date(`${todayStr}T23:59:59.999Z`);

    const [recentMeals, activeRoutine] = await Promise.all([
      this.prisma.meal.findMany({
        where: { userId: athleteId },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      this.prisma.routine.findFirst({
        where: { clientId: athleteId, isActive: true },
        include: { routineDays: { include: { exercises: true } } },
      }),
    ]);

    const todayMeals = recentMeals.filter(
      (m) => m.date >= startOfToday && m.date <= endOfToday,
    );
    const totalKcalToday = todayMeals.reduce(
      (acc, m) => acc + (m.calories || 0),
      0,
    );
    const totalProtToday = todayMeals.reduce(
      (acc, m) => acc + (m.protein || 0),
      0,
    );

    const volumeByMuscle: Record<string, number> = {};
    if (activeRoutine) {
      for (const day of activeRoutine.routineDays) {
        if (day.isRestDay) continue;
        for (const ex of day.exercises) {
          const group = (ex.muscleGroup || day.focusArea || 'General').trim();
          volumeByMuscle[group] = (volumeByMuscle[group] || 0) + (ex.sets || 0);
        }
      }
    }
    const volumeSummary =
      Object.keys(volumeByMuscle).length > 0
        ? Object.entries(volumeByMuscle)
            .map(
              ([m, s]) =>
                `${m}: ${s} series/sem (${s < 6 ? 'Bajo MEV' : s <= 20 ? 'Óptimo MAV' : 'Exceso MRV'})`,
            )
            .join(' | ')
        : 'Sin series cuantificadas';

    const routineDetails = activeRoutine
      ? `Rutina Activa: "${activeRoutine.name}" | Volumen Semanal: [${volumeSummary}]\n` +
        activeRoutine.routineDays
          .map(
            (d) =>
              `  • Día ${d.dayNumber} (${d.focusArea}): ` +
              d.exercises
                .map(
                  (e) =>
                    `${e.name} ${e.sets}x${e.reps}${e.targetWeight ? ` @${e.targetWeight}kg` : ''}`,
                )
                .join(', '),
          )
          .join('\n')
      : 'Sin rutina activa asignada';

    const pact = anamnesis.heroPact || {};
    const sleepLogs = Array.isArray(anamnesis.sleepLogs)
      ? anamnesis.sleepLogs.slice(-5)
      : [];
    const weighIns = Array.isArray(anamnesis.fastedWeighIns)
      ? anamnesis.fastedWeighIns.slice(-5)
      : [];
    const waterLogs = Array.isArray(anamnesis.waterLogs)
      ? anamnesis.waterLogs.slice(-5)
      : [];

    const systemInstruction = `
Eres el AGENTE CLÍNICO Y CO-PILOTO CIENTÍFICO PRIVADO DEL ENTRENADOR analizando el caso exclusivo del atleta **${athlete.name}**.
IMPORTANTE: Esta es la MEMORIA CLÍNICA PRIVADA de la Ficha Técnica de ${athlete.name}. El atleta NUNCA ve este chat. Aquí puedes discutir con total franqueza clínica y biomecánica con el entrenador sobre adherencia, estancamientos, psicología del atleta, ajustes de volumen semanal (MEV-MAV-MRV), cargas y nutrición.

EXPEDIENTE COMPLETO EN VIVO DE ${athlete.name.toUpperCase()}:
- Bitácora / Memoria Clínica Privada del Entrenador: "${savedPrivateMemory}"
- Radiografía / Descubrimiento: Propósito profundo: "${anamnesis.deepWhy || 'No especificado'}" | Obstáculos: "${anamnesis.mainObstacle || 'No especificado'}" | Lesiones: "${athlete.medicalConditions || 'Ninguna'}"
- Pacto de 120 Días (4 Metas):
  1) Biométrico: ${pact.objectives?.biometric?.currentWeightKg || athlete.weight || '?'}kg -> ${pact.objectives?.biometric?.targetWeightKg || '?'}kg (Ritmo meta: ${pact.objectives?.biometric?.weeklyDeltaTargetKg || 0.25}kg/sem)
  2) Fuerza: ${pact.objectives?.strength?.exerciseName || 'No definido'} (${pact.objectives?.strength?.currentWeight || '?'} -> ${pact.objectives?.strength?.targetWeight || '?'}${pact.weightUnit || 'kg'})
  3) Dominio Corporal: ${pact.objectives?.bodyMastery?.skillName || 'No definido'} (${pact.objectives?.bodyMastery?.targetMark || ''})
  4) Aeróbico: ${pact.objectives?.aerobic?.targetMark || 'No definido'}
- Pilares y Telemetría Reciente:
  • Nutrición hoy: ${todayMeals.length} comidas (${totalKcalToday} / ${athlete.targetCalories || 2200} kcal | ${totalProtToday} / ${athlete.targetProtein || 150}g Proteína)
  • Últimos registros de Agua: ${waterLogs.length > 0 ? waterLogs.map((w: any) => `${w.date}: ${w.liters}L`).join(', ') : 'Sin registros'} (Meta: ${pact.pillars?.nutrition?.waterLitersTarget || 3.0}L)
  • Últimos registros de Sueño (±1h): ${sleepLogs.length > 0 ? sleepLogs.map((s: any) => `${s.date}: ${s.hoursSlept}h (${s.bedtime}-${s.wakeTime}, ±1h:${s.withinOneHourWindow ? 'OK' : 'FALLÓ'})`).join(' | ') : 'Sin registros'}
  • Últimos Pesajes en Ayunas: ${weighIns.length > 0 ? weighIns.map((w: any) => `${w.date}: ${w.weightKg}kg (EMA:${w.movingAverageKg || w.trendWeightKg || w.weightKg}kg)`).join(' | ') : 'Sin pesajes'}
- Plan de Entrenamiento y Volumen Semanal (MEV 6-9, MAV 10-20, MRV >20, máx 8-10 series/sesión por músculo):
${routineDetails}

REGLAS Y PERMISOS EJECUTORES SOBRE ${athlete.name.toUpperCase()}:
1. Incluye siempre al final una breve cápsula: ### 🎓 Fundamento Científico para el Entrenador.
2. Si el entrenador te pide ejecutar cualquier cambio sobre ${athlete.name}, emite al final la etiqueta exacta (usando siempre "clientId": "${athlete.id}"):
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "replace_exercise", "oldExercise": "...", "newExercise": "...", "rationale": "..."}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "update_load", "exerciseName": "...", "sets": 4, "reps": "6-8", "targetWeight": 80, "unit": "kg"}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "add_exercise", "dayNumber": 1, "exerciseName": "...", "muscleGroup": "chest", "sets": 3, "reps": "8-10", "targetWeight": 20, "unit": "kg"}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "remove_exercise", "exerciseName": "..."}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "update_nutrition", "calories": 2500, "protein": 170, "carbs": 280, "fats": 70, "waterLitersTarget": 3.2}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "update_hero_pact", "targetWeightKg": 76, "weeklyDeltaTargetKg": 0.25}]
   - [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "publish_weekly_report", "summary": "...", "wins": "...", "nextWeekFocus": "..."}]
   - Si el entrenador menciona un dato clínico nuevo importante para recordar en el futuro, puedes guardarlo en la bitácora privada con:
     [COMANDO_RUTINA: {"clientId": "${athlete.id}", "action": "append_private_note", "note": "Resumen corto del hallazgo o acuerdo clínico"}]
`;

    if (!this.genAI || !this.model) {
      return {
        reply: '⚠️ El servicio de IA no tiene configurada la clave GEMINI_API_KEY.',
        trainerPrivateNotes: savedPrivateMemory,
      };
    }

    const history = await this.prisma.dietChatMessage.findMany({
      where: {
        userId: athleteId,
        role: { in: ['clinical_case_user', 'clinical_case_ai'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const chronologicalHistory = history.reverse();

    const contents = [
      { role: 'user' as const, parts: [{ text: systemInstruction }] },
      {
        role: 'model' as const,
        parts: [
          {
            text: `Memoria clínica privada de ${athlete.name} sincronizada. Lista para discutir su evolución y ejecutar ajustes en su plan.`,
          },
        ],
      },
      ...chronologicalHistory.map((m) => ({
        role:
          m.role === 'clinical_case_ai'
            ? ('model' as const)
            : ('user' as const),
        parts: [{ text: m.content }],
      })),
      { role: 'user' as const, parts: [{ text: trainerMessage }] },
    ];

    const response = await this.model.generateContent({ contents });
    let replyText = response.response.text();
    let updatedNotes = anamnesis.trainerPrivateMemory || '';

    const commandMatches = [
      ...replyText.matchAll(/\[COMANDO_RUTINA:\s*(\{.*?\})\]/gs),
    ];
    for (const match of commandMatches) {
      try {
        const cmd = JSON.parse(match[1]);
        cmd.clientId = athlete.id;
        cmd.clientName = athlete.name;
        const action = cmd.action;

        if (action === 'replace_exercise' && cmd.oldExercise && cmd.newExercise) {
          await this.executeRoutineReplacement(
            athlete.id,
            athlete.name,
            cmd.oldExercise,
            cmd.newExercise,
            cmd.rationale,
          );
          replyText = replyText.replace(
            match[0],
            `\n> ⚡ **Acción Ejecutada:** Se cambió *${cmd.oldExercise}* por *${cmd.newExercise}* en la rutina de ${athlete.name}.\n`,
          );
        } else if (action === 'update_load' && cmd.exerciseName) {
          await this.executeLoadUpdate(cmd);
          replyText = replyText.replace(
            match[0],
            `\n> ⚡ **Carga Actualizada:** Se ajustó *${cmd.exerciseName}* en la rutina de ${athlete.name}.\n`,
          );
        } else if (action === 'add_exercise' && cmd.exerciseName) {
          await this.executeAddExercise(cmd);
          replyText = replyText.replace(
            match[0],
            `\n> ⚡ **Ejercicio Añadido:** Se agregó *${cmd.exerciseName}* al Día ${cmd.dayNumber || 1} de ${athlete.name}.\n`,
          );
        } else if (action === 'remove_exercise' && cmd.exerciseName) {
          await this.executeRemoveExercise(cmd);
          replyText = replyText.replace(
            match[0],
            `\n> ⚡ **Volumen Depurado:** Se eliminó *${cmd.exerciseName}* de la rutina de ${athlete.name}.\n`,
          );
        } else if (action === 'update_nutrition') {
          await this.executeNutritionUpdate(cmd);
          replyText = replyText.replace(
            match[0],
            `\n> ⚡ **Nutrición/Agua Calibrada:** Metas actualizadas en la ficha de ${athlete.name}.\n`,
          );
        } else if (action === 'update_hero_pact') {
          await this.executeHeroPactUpdate(cmd);
          replyText = replyText.replace(
            match[0],
            `\n> ⚡ **Pacto de 120 Días Actualizado:** Se recalibraron las metas de ${athlete.name}.\n`,
          );
        } else if (action === 'publish_weekly_report' && cmd.summary) {
          await this.executePublishWeeklyReport(cmd, 'Tu Entrenador');
          replyText = replyText.replace(
            match[0],
            `\n> ⚡ **Reporte Semanal Publicado:** Ya visible en el panel de ${athlete.name}.\n`,
          );
        } else if (action === 'append_private_note' && cmd.note) {
          const freshUser = await this.prisma.user.findUnique({
            where: { id: athlete.id },
          });
          const freshAnamnesis =
            freshUser?.anamnesisData &&
            typeof freshUser.anamnesisData === 'object'
              ? { ...(freshUser.anamnesisData as any) }
              : {};
          const dateTag = new Date().toISOString().slice(0, 10);
          updatedNotes = [
            freshAnamnesis.trainerPrivateMemory,
            `[${dateTag}] ${cmd.note}`,
          ]
            .filter(Boolean)
            .join('\n');
          freshAnamnesis.trainerPrivateMemory = updatedNotes;
          await this.prisma.user.update({
            where: { id: athlete.id },
            data: { anamnesisData: freshAnamnesis },
          });
          replyText = replyText.replace(
            match[0],
            `\n> 🔒 **Guardado en Memoria Clínica Privada:** *"${cmd.note}"*\n`,
          );
        } else {
          replyText = replyText.replace(match[0], '');
        }
      } catch {
        replyText = replyText.replace(match[0], '');
      }
    }

    replyText = replyText
      .replace(/\[COMANDO_RUTINA:[^\]]*\]/gs, '')
      .replace(/\(ID:\s*[0-9a-f-]{10,}\)/gi, '')
      .trim();

    await this.prisma.dietChatMessage.createMany({
      data: [
        {
          userId: athleteId,
          role: 'clinical_case_user',
          content: trainerMessage,
        },
        {
          userId: athleteId,
          role: 'clinical_case_ai',
          content: replyText,
        },
      ],
    });

    return {
      reply: replyText,
      trainerPrivateNotes: updatedNotes,
    };
  }

  async getAthleteCaseHistory(athleteId: string) {
    const [athlete, rows] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: athleteId } }),
      this.prisma.dietChatMessage.findMany({
        where: {
          userId: athleteId,
          role: { in: ['clinical_case_user', 'clinical_case_ai'] },
        },
        orderBy: { createdAt: 'asc' },
        take: 60,
      }),
    ]);

    const anamnesis =
      athlete?.anamnesisData && typeof athlete.anamnesisData === 'object'
        ? (athlete.anamnesisData as any)
        : {};

    return {
      trainerPrivateNotes: anamnesis.trainerPrivateMemory || '',
      messages: rows.map((r) => ({
        id: r.id,
        role:
          r.role === 'clinical_case_user'
            ? ('user' as const)
            : ('ai' as const),
        content: r.content,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  async clearAthleteCaseHistory(athleteId: string) {
    await this.prisma.dietChatMessage.deleteMany({
      where: {
        userId: athleteId,
        role: { in: ['clinical_case_user', 'clinical_case_ai'] },
      },
    });
    return { success: true };
  }
}
