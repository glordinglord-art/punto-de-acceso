import type { ExerciseDict } from "../services/exercise-dictionary.service";

/**
 * Exact and reliable Spanish -> English exercise name mapping.
 * Connects standard Spanish fitness exercise terms to the exact
 * names present in the 1,318 exercise dictionary database.
 */
const SPANISH_TO_DICT_NAME: Record<string, string> = {
  // ─── PESO MUERTO / DEADLIFT ───
  "peso muerto convencional (deadlift)": "barbell deadlift",
  "peso muerto convencional": "barbell deadlift",
  "peso muerto con barra": "barbell deadlift",
  "peso muerto": "barbell deadlift",
  "deadlift": "barbell deadlift",
  "peso muerto rumano con barra": "barbell romanian deadlift",
  "peso muerto rumano con mancuernas": "dumbbell romanian deadlift",
  "peso muerto rumano": "barbell romanian deadlift",
  "peso muerto rumano deficit": "barbell romanian deadlift",
  "peso muerto con mancuerna": "dumbbell deadlift",
  "peso muerto con mancuernas": "dumbbell deadlift",
  "peso muerto mancuerna": "dumbbell deadlift",
  "romanian deadlift": "barbell romanian deadlift",

  // ─── PECHO / PECTORAL ───
  "press de banca plano con barra": "barbell bench press",
  "press de banca plano": "barbell bench press",
  "press de banca": "barbell bench press",
  "press banca con mancuernas": "dumbbell bench press",
  "press de banca con mancuernas": "dumbbell bench press",
  "press banca mancuernas": "dumbbell bench press",
  "press banca": "barbell bench press",
  "press plano con mancuerna": "dumbbell bench press",
  "press plano con mancuernas": "dumbbell bench press",
  "press plano": "barbell bench press",
  "press inclinado con mancuernas": "dumbbell incline bench press",
  "press inclinado con barra o smith": "smith incline bench press",
  "press inclinado con barra": "barbell incline bench press",
  "press inclinado mancuerna": "dumbbell incline bench press",
  "press inclinado mancuernas": "dumbbell incline bench press",
  "press inclinado": "barbell incline bench press",
  "press declinado con barra": "barbell decline bench press",
  "press declinado": "barbell decline bench press",
  "aperturas con mancuernas en banco plano": "dumbbell fly",
  "aperturas con mancuernas": "dumbbell fly",
  "aperturas en banco plano": "dumbbell fly",
  "aperturas": "dumbbell fly",
  "cruces en polea (cruces)": "cable cross-over variation",
  "cruces en polea media": "cable middle fly",
  "cruces en polea": "cable cross-over variation",
  "aperturas en polea (cruces)": "cable cross-over variation",
  "aperturas en polea": "cable cross-over variation",
  "pullover con mancuerna en banco": "dumbbell pullover",
  "pullover con mancuerna": "dumbbell pullover",
  "pullover": "dumbbell pullover",
  "fondos en paralelas (dips)": "chest dip",
  "fondos en paralelas": "chest dip",
  "fondos asistidos": "assisted chest dip (kneeling)",
  "fondos asisitidos": "assisted chest dip (kneeling)",
  "fondos": "chest dip",
  "flexiones": "wide hand push up",

  // ─── ESPALDA / BACK ───
  "dominadas o jalon al pecho": "cable pulldown",
  "dominadas agarre neutro": "twin handle parallel grip lat pulldown",
  "dominadas libres": "pull-up",
  "dominadas lastradas": "pull-up",
  "dominadas asistidas": "assisted pull-up",
  "dominadas": "pull-up",
  "pull-up": "pull-up",
  "chin-up": "chin-up",
  "jalon al pecho agarre supino cerrado": "cable pulldown",
  "jalon al pecho agarre neutro": "cable pulldown (pro lat bar)",
  "jalon al pecho agarre abierto": "cable pulldown",
  "jalon al pecho en polea": "cable pulldown",
  "jalon al pecho": "cable pulldown",
  "polea al pecho": "cable pulldown",
  "remo con barra prono": "barbell bent over row",
  "remo con barra pendlay": "barbell pendlay row",
  "remo con barra": "barbell bent over row",
  "remo pendlay": "barbell pendlay row",
  "remo unilateral con mancuerna": "dumbbell one arm bent-over row",
  "remo con mancuerna a una mano": "dumbbell one arm bent-over row",
  "remo con mancuerna": "dumbbell one arm bent-over row",
  "remo con apoyo en el pecho": "dumbbell incline row",
  "remo apoyado en banco": "dumbbell incline row",
  "remo gironda en polea baja": "cable seated row",
  "remo gironda al estomago": "cable seated row",
  "remo gironda": "cable seated row",
  "remo en polea baja": "cable seated row",
  "remo en polea con agarre estrecho": "cable seated wide-grip row",
  "remo en maquina o polea": "cable seated row",
  "remo sentado": "cable seated row",
  "hiperextensiones 45": "lever back extension",
  "hiperextensiones 45 lastre": "lever back extension",
  "hiperextensiones a 45": "lever back extension",
  "hiperextensiones": "lever back extension",

  // ─── PIERNAS & GLÚTEOS / LEGS & GLUTES ───
  "sentadilla con barra trasera": "barbell bench squat",
  "sentadilla trasera profunda": "barbell bench squat",
  "sentadilla frontal o trasera": "barbell front squat",
  "sentadilla con barra frontal o trasera": "barbell front squat",
  "sentadilla con barra": "barbell front squat",
  "sentadilla hacka": "sled hack squat",
  "sentadilla hack": "sled hack squat",
  "sentadilla goblet o con barra": "dumbbell goblet squat",
  "sentadilla goblet": "dumbbell goblet squat",
  "sentadilla bulgara con mancuernas": "dumbbell single leg split squat",
  "sentadilla bulgara enfasis gluteo": "dumbbell single leg split squat",
  "sentadilla bulgara en deficit": "dumbbell single leg split squat",
  "sentadilla bulgara deficit": "dumbbell single leg split squat",
  "sentadilla bulgara": "dumbbell single leg split squat",
  "tijera bulgara": "dumbbell single leg split squat",
  "prensa de piernas 45 grados": "sled 45в° leg press",
  "prensa inclinada de piernas": "sled 45в° leg press",
  "prensa de piernas pies bajos": "sled 45в° leg press",
  "prensa de piernas": "sled 45в° leg press",
  "prensa 45": "sled 45в° leg press",
  "prensa": "sled 45в° leg press",
  "extensiones de cuadriceps": "lever leg extension",
  "extension de cuadriceps": "lever leg extension",
  "extension de rodillas": "lever leg extension",
  "extension de pierna": "lever leg extension",
  "curl femoral tumbado": "lever lying leg curl",
  "curl de pierna tumbado femoral": "lever lying leg curl",
  "curl de pierna tumbado": "lever lying leg curl",
  "curl femoral acostado": "lever lying leg curl",
  "curl femoral sentado": "lever seated leg curl",
  "curl de pierna": "lever lying leg curl",
  "hip thrust con barra": "barbell glute bridge",
  "hip thrust pesado con barra": "barbell glute bridge",
  "hip thrust": "barbell glute bridge",
  "hip trusht": "barbell glute bridge",
  "puente de gluteo con barra": "glute bridge march",
  "puente de gluteo": "barbell glute bridge",
  "elevacion de gemelos en maquina": "lever standing calf raise",
  "elevacion de gemelos en prensa": "sled 45в° calf press",
  "elevacion de talones en maquina gemelos": "lever standing calf raise",
  "elevacion de talones en maquina": "lever standing calf raise",
  "elevacion de talones de pie": "lever seated calf raise",
  "elevacion de talones": "lever seated calf raise",
  "gemelos sentado en maquina": "lever seated calf raise",
  "gemelos en maquina": "lever standing calf raise",
  "zancadas caminando con mancuernas": "dumbbell lunge",
  "zancadas": "dumbbell lunge",
  "zancada en cajon": "dumbbell step-up",
  "subida al cajon": "dumbbell step-up",
  "step up": "dumbbell step-up",
  "desplantes": "dumbbell lunge",
  "patada de gluteo polea": "cable pull through (with rope)",
  "patada de gluteo": "cable pull through (with rope)",
  "patada gluteo 45": "cable pull through (with rope)",
  "patada gluteo": "cable pull through (with rope)",
  "abducciones en maquina drop set": "lever seated hip abduction",
  "abducciones en maquina": "lever seated hip abduction",
  "abduccion en maquina": "lever seated hip abduction",
  "abductores en maquina inclinado": "lever seated hip abduction",
  "abductores en maquina": "lever seated hip abduction",
  "abductores": "lever seated hip abduction",
  "aductores en maquina": "lever seated hip adduction",
  "aductores": "lever seated hip adduction",
  "paso de cangrejo con banda elastica": "monster walk",

  // ─── HOMBROS / SHOULDERS ───
  "press militar con barra de pie": "barbell standing close grip military press",
  "press militar con barra": "barbell standing close grip military press",
  "press militar con mancuernas sentado": "dumbbell seated shoulder press",
  "press militar con mancuernas": "dumbbell seated shoulder press",
  "pres militar con mancuernas": "dumbbell seated shoulder press",
  "press militar mancuerna": "dumbbell seated shoulder press",
  "press militar sentada manc": "dumbbell seated shoulder press",
  "press militar sentada": "dumbbell seated shoulder press",
  "press militar": "dumbbell seated shoulder press",
  "elevaciones laterales con mancuerna": "dumbbell lateral raise",
  "elevaciones laterales con mancuernas": "dumbbell lateral raise",
  "elevacion lateral con mancuerna": "dumbbell lateral raise",
  "elevacion lateral en polea": "cable lateral raise",
  "elevaciones laterales en polea": "cable lateral raise",
  "elevaciones laterales mancuerna": "dumbbell lateral raise",
  "elevaciones laterales inclinadas": "dumbbell incline one arm lateral raise",
  "elevaciones laterales": "dumbbell lateral raise",
  "vuelos laterales": "dumbbell lateral raise",
  "pajaros con mancuernas deltoides posterior": "dumbbell rear lateral raise",
  "pajaros con mancuerna en banco": "dumbbell rear lateral raise",
  "pajaros con mancuerna": "dumbbell rear lateral raise",
  "pajaros con mancuernas": "dumbbell rear lateral raise",
  "pajaros": "dumbbell rear lateral raise",
  "face pulls con cuerda": "cable rear delt row (with rope)",
  "face pulls": "cable rear delt row (with rope)",
  "face pull": "cable rear delt row (with rope)",

  // ─── BÍCEPS & TRÍCEPS / ARMS ───
  "curl de biceps con barra z": "ez barbell curl",
  "curl con barra recta": "barbell curl",
  "curl con barra": "barbell curl",
  "curl martillo con mancuernas": "dumbbell hammer curl",
  "curl martillo": "dumbbell hammer curl",
  "curl de biceps en banco inclinado": "dumbbell incline biceps curl",
  "curl de biceps con mancuerna": "dumbbell biceps curl",
  "curl de biceps con mancuernas": "dumbbell biceps curl",
  "curl de biceps manc": "dumbbell biceps curl",
  "curl de biceps": "dumbbell biceps curl",
  "curl biceps": "dumbbell biceps curl",
  "biceps predicador": "dumbbell preacher curl",
  "curl de biceps en banco scott predicador": "dumbbell preacher curl",
  "curl de biceps en banco scott": "dumbbell preacher curl",
  "curl en banco scott": "dumbbell preacher curl",
  "curl predicador": "dumbbell preacher curl",
  "extension de triceps en polea alta": "cable pushdown (with rope attachment)",
  "extension de triceps en polea": "cable pushdown (with rope attachment)",
  "extension de triceps con cuerda en polea": "cable pushdown (with rope attachment)",
  "extension de triceps con cuerda": "cable pushdown (with rope attachment)",
  "extension de triceps trasnuca": "cable overhead triceps extension (rope attachment)",
  "extension de triceps": "cable pushdown (with rope attachment)",
  "triceps polea": "cable pushdown (with rope attachment)",
  "press frances con barra z": "barbell lying triceps extension skull crusher",
  "press frances": "barbell lying triceps extension skull crusher",
  "fondos en paralelas dips con lastre": "triceps dip",
  "fondos en paralelas para triceps": "triceps dip",

  // ─── ABDOMEN & CARDIO / CORE & CARDIO ───
  "crunches abdominales en polea alta": "cable seated crunch",
  "crunches en polea alta": "cable seated crunch",
  "crunches": "cable seated crunch",
  "crunch": "cable seated crunch",
  "plancha abdominal frontal": "weighted front plank",
  "plancha abdominal": "weighted front plank",
  "plancha": "weighted front plank",
  "plank": "weighted front plank",
  "elevaciones de piernas colgado o suelo": "vertical leg raise (on parallel bars)",
  "elevaciones de piernas colgado": "vertical leg raise (on parallel bars)",
  "elevaciones de piernas": "vertical leg raise (on parallel bars)",
  "rueda abdominal": "wheel rollerout",
  "caminadora inclinada": "walking on incline treadmill",
  "caminadora": "walking on incline treadmill",
  "cardio liss": "walking on incline treadmill",
};

/**
 * Clean a string by removing accents, extra whitespace and lowercasing.
 */
function cleanText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents (á -> a, etc.)
    .replace(/[|•·*#_]/g, " ") // remove bullet markers
    .replace(/[^\w\s-]/g, "") // remove symbols & punctuation
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Strips coach notes like (1.5), (déficit), (lastre), (manc), etc.
 */
function stripParentheses(text: string): string {
  return text
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Finds the exact or highly-confident ExerciseDict entry for an exercise name.
 * 
 * STRICT RULES:
 * 1. If an exact match exists in the dictionary, return it.
 * 2. If a clean Spanish alias mapping exists, return the mapped dictionary entry.
 * 3. If stripped of coach qualifiers like (1.5) or (déficit) it matches an alias, return it.
 * 4. NEVER fall back to random exercises of the same muscle group.
 * 5. NEVER fall back to a random exercise with gifUrl.
 * 6. If no confident match is found, return NULL (shows the stylized fallback card).
 */
export function findPreciseDictEntry(
  exerciseName: string,
  dictByName: Map<string, ExerciseDict>,
  dictionary: ExerciseDict[],
): ExerciseDict | null {
  if (!exerciseName) return null;

  const rawLower = exerciseName.toLowerCase().trim();
  const cleaned = cleanText(exerciseName);
  const withoutNotes = cleanText(stripParentheses(exerciseName));

  // 1. Direct match on raw lowercase name
  const directMatch = dictByName.get(rawLower);
  if (directMatch?.gifUrl) return directMatch;

  // 2. Direct match on cleaned name
  const cleanMatch = dictByName.get(cleaned);
  if (cleanMatch?.gifUrl) return cleanMatch;

  // 3. Direct match without coach notes (e.g. "Sentadilla Hacka" from "Sentadilla Hacka (1.5)")
  const noNotesMatch = dictByName.get(withoutNotes);
  if (noNotesMatch?.gifUrl) return noNotesMatch;

  // 4. Spanish dictionary mapping on cleaned name
  const targetFromClean = SPANISH_TO_DICT_NAME[cleaned];
  if (targetFromClean) {
    const found = dictByName.get(targetFromClean.toLowerCase());
    if (found?.gifUrl) return found;
  }

  // 5. Spanish dictionary mapping on name without notes
  const targetFromNoNotes = SPANISH_TO_DICT_NAME[withoutNotes];
  if (targetFromNoNotes) {
    const found = dictByName.get(targetFromNoNotes.toLowerCase());
    if (found?.gifUrl) return found;
  }

  // 6. Substring phrase match against known Spanish aliases
  for (const [spanishKey, englishTarget] of Object.entries(SPANISH_TO_DICT_NAME)) {
    if (spanishKey.length >= 4 && (withoutNotes.includes(spanishKey) || spanishKey.includes(withoutNotes))) {
      const match = dictByName.get(englishTarget.toLowerCase());
      if (match?.gifUrl) return match;
    }
  }

  // 7. Exact normalized comparison against dictionary entries
  if (withoutNotes.length >= 4) {
    for (const d of dictionary) {
      if (!d.gifUrl) continue;
      const dClean = cleanText(d.name);
      if (dClean === withoutNotes || dClean === cleaned) return d;
    }
  }

  // STRICT: No random fallbacks! Return null so the UI shows the clean technique card
  return null;
}
