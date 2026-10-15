import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  APPLIED_MARKER,
  extractActionBlocks,
  normalizeActionFormat,
  parseSetsReps,
  setBlockMarker,
  toRestSeconds,
} from './routine-action-markers';
import { pickUnique } from './clinical-action.service';

describe('routine-action-markers', () => {
  const crear = (name: string) =>
    `[ACCION_RUTINA: {"action":"crear_rutina","clientName":"${name}","days":[{"dayNumber":1,"exercises":[{"name":"Press [banca]","sets":4}]}]}]`;

  it('extrae varios bloques con corchetes y llaves anidados', () => {
    const text = `Propuesta para los dos:\n${crear('Miguel')}\ntexto\n${crear('Andrey')}`;
    const blocks = extractActionBlocks(text);
    expect(blocks).toHaveLength(2);
    expect(blocks.map((b) => b.data?.clientName)).toEqual(['Miguel', 'Andrey']);
    expect(blocks.every((b) => b.status === 'pending')).toBe(true);
  });

  it('marca como aplicada solo el bloque indicado', () => {
    const text = `${crear('Miguel')} ${crear('Andrey')}`;
    const updated = setBlockMarker(text, 1, APPLIED_MARKER);
    const blocks = extractActionBlocks(updated);
    expect(blocks.map((b) => b.status)).toEqual(['pending', 'applied']);
    expect(blocks[1].data?.clientName).toBe('Andrey');
  });

  it('detecta un bloque truncado', () => {
    const [block] = extractActionBlocks(
      '[ACCION_RUTINA: {"action":"crear_rutina","days":[{"dayNumber":1',
    );
    expect(block.data).toBeNull();
    expect(block.parseError).toMatch(/incompleto/);
  });

  it('convierte un bloque ```json``` y los formatos antiguos al marcador', () => {
    const fromCode = normalizeActionFormat(
      'Hola\n```json\n{"action":"agregar_ejercicio","clientName":"Ana"}\n```',
    );
    expect(extractActionBlocks(fromCode)[0].data?.clientName).toBe('Ana');

    const legacy = normalizeActionFormat(
      '[PROPUESTA_RUTINA: {"clientName":"Ana","currentExercise":{"name":"A"}}]',
    );
    expect(extractActionBlocks(legacy)[0].data?.action).toBe(
      'sustituir_ejercicio',
    );
  });

  it('interpreta series, repeticiones y descansos escritos a mano', () => {
    expect(parseSetsReps('4 x 10-12')).toEqual({ sets: 4, reps: '10-12' });
    expect(parseSetsReps('3 series de 12 reps')).toEqual({
      sets: 3,
      reps: '12',
    });
    expect(toRestSeconds(90)).toBe(90);
    expect(toRestSeconds('90s')).toBe(90);
    expect(toRestSeconds('2 min')).toBe(120);
    expect(toRestSeconds("90''")).toBe(90);
  });
});

describe('pickUnique', () => {
  const people = [
    { name: 'Miguel Ángel forero torres ' },
    { name: 'Jonathan sanchez' },
    { name: 'Juan David Velez' },
    { name: 'Juan Pablo Ríos' },
  ];
  const pick = (wanted: string) =>
    pickUnique(people, (p) => p.name, wanted, 'atleta', 'en tu cartera');

  it('ignora tildes, mayusculas y espacios sobrantes', () => {
    expect(pick('Jonathan Sánchez').name).toBe('Jonathan sanchez');
    expect(pick('miguel angel forero torres').name).toContain('Miguel');
  });

  it('acepta el nombre parcial cuando no hay ambiguedad', () => {
    expect(pick('Miguel').name).toContain('Miguel');
  });

  it('no adivina cuando hay varias coincidencias', () => {
    expect(() => pick('Juan')).toThrow(BadRequestException);
  });

  it('falla con un mensaje claro si no existe', () => {
    expect(() => pick('Pedro Pérez')).toThrow(NotFoundException);
  });

  it('empareja ejercicios por palabras significativas', () => {
    const exercises = [
      { name: 'Press Banca con Barra' },
      { name: 'Press Inclinado con Mancuernas' },
    ];
    const found = pickUnique(
      exercises,
      (e) => e.name,
      'press de banca barra',
      'ejercicio',
      '',
    );
    expect(found.name).toBe('Press Banca con Barra');
  });
});
