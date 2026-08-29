import fs from 'node:fs';
import path from 'node:path';
import {
  HIRAGANA,
  KATAKANA,
  HIRAGANA_AVANZADO,
  KATAKANA_AVANZADO,
  type KanaChar,
} from './kana-data.ts';
import { GRAMMAR_UNITS } from './grammar-data.ts';
import { withFurigana } from './furigana.ts';

export type CurriculumItem = {
  id: string;
  /** Lo que se muestra como pregunta. */
  prompt: string;
  /** Respuesta correcta. */
  answer: string;
  /** De dónde sacar los distractores: solo ítems del mismo grupo confunden de verdad. */
  group: string;
  /** Ayuda que se muestra siempre (lectura de un kanji, traducción de una oración). No se evalúa. */
  subtext?: string;
  /**
   * Distractores propios del ítem (conjugación: otras formas del mismo
   * verbo). Si está presente, reemplaza el sampling del pool general.
   */
  choices?: string[];
  /** Lectura de cada choice, para mostrar debajo del botón — sin esto es
   *  imposible saber cómo suena una forma conjugada con kanji sin leer. */
  choiceReadings?: Record<string, string>;
};

export type Unit = {
  id: string;
  title: string;
  level: 'hiragana' | 'katakana' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  order: number;
  items: CurriculumItem[];
};

function kanaToItems(chars: KanaChar[], group: string): CurriculumItem[] {
  return chars.map((k) => ({ id: k.id, prompt: k.char, answer: k.romaji, group }));
}

const VOCAB_UNIT_SIZE = 20;

type JlptWord = { lemma: string; reading: string; meaning: string };

function loadJlptLevel(level: string): JlptWord[] {
  const filePath = path.join(process.cwd(), 'data', 'jlpt', `${level}.json`);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as JlptWord[];
  } catch {
    return [];
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Genera unidades de vocabulario a partir de data/jlpt/{level}.json, en
 * grupos de VOCAB_UNIT_SIZE. Sin este archivo generado (falta correr
 * `npm run build:jlpt-vocab`), el nivel simplemente no aporta unidades —
 * la app no se rompe, solo no avanza más allá de lo que sí esté generado.
 */
function buildVocabUnits(
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
  idPrefix: string,
): Omit<Unit, 'order'>[] {
  const words = loadJlptLevel(idPrefix);
  const groups = chunk(words, VOCAB_UNIT_SIZE);

  return groups.map((group, i) => {
    const unitId = `${idPrefix}-vocab-${i + 1}`;
    return {
      id: unitId,
      title: `${level} — vocabulario ${i + 1}`,
      level,
      items: group.map((w) => ({
        id: `vocab:${w.lemma}`,
        // Furigana arriba del kanji (como Duolingo/un libro de texto), no
        // como texto aparte abajo — así se lee la palabra, no se traduce.
        prompt: withFurigana(w.lemma, w.reading),
        answer: w.meaning,
        group: unitId,
      })),
    };
  });
}

const HIRAGANA_UNIT: Unit = {
  id: 'hiragana-basico',
  title: 'Hiragana básico',
  level: 'hiragana',
  order: 0,
  items: kanaToItems(HIRAGANA, 'hiragana-basico'),
};

const KATAKANA_UNIT: Unit = {
  id: 'katakana-basico',
  title: 'Katakana básico',
  level: 'katakana',
  order: 1,
  items: kanaToItems(KATAKANA, 'katakana-basico'),
};

const HIRAGANA_AVANZADO_UNIT: Unit = {
  id: 'hiragana-avanzado',
  title: 'Hiragana avanzado (dakuten y yōon)',
  level: 'hiragana',
  order: 2,
  items: kanaToItems(HIRAGANA_AVANZADO, 'hiragana-avanzado'),
};

const KATAKANA_AVANZADO_UNIT: Unit = {
  id: 'katakana-avanzado',
  title: 'Katakana avanzado (dakuten y yōon)',
  level: 'katakana',
  order: 3,
  items: kanaToItems(KATAKANA_AVANZADO, 'katakana-avanzado'),
};

function grammarFor(level: Unit['level']): Omit<Unit, 'order'>[] {
  return GRAMMAR_UNITS.filter((u) => u.level === level);
}

/**
 * Progresión completa, ordenada: silabarios -> N5 (vocabulario + gramática)
 * -> N4 (vocabulario + gramática) -> N3 -> N2 -> N1. Cada bloque de
 * vocabulario es 100% datos (JSON generado desde listas públicas + JMdict);
 * agregar más contenido no requiere tocar código, solo regenerar los JSON.
 * El orden se asigna acumulando `next`, no con aritmética manual de índices
 * — agregar un bloque nuevo en el medio ya no rompe los siguientes.
 */
const blocks: Omit<Unit, 'order'>[] = [
  HIRAGANA_UNIT,
  KATAKANA_UNIT,
  HIRAGANA_AVANZADO_UNIT,
  KATAKANA_AVANZADO_UNIT,
  ...buildVocabUnits('N5', 'n5'),
  ...grammarFor('N5'),
  ...buildVocabUnits('N4', 'n4'),
  ...grammarFor('N4'),
  ...buildVocabUnits('N3', 'n3'),
  ...grammarFor('N3'),
  ...buildVocabUnits('N2', 'n2'),
  ...grammarFor('N2'),
  ...buildVocabUnits('N1', 'n1'),
  ...grammarFor('N1'),
];

export const UNITS: Unit[] = blocks.map((unit, i) => ({ ...unit, order: i }));

export function getUnit(unitId: string): Unit | undefined {
  return UNITS.find((u) => u.id === unitId);
}

export function getUnitItem(unitId: string, itemId: string): CurriculumItem | undefined {
  return getUnit(unitId)?.items.find((i) => i.id === itemId);
}

export function getNextUnit(unitId: string): Unit | undefined {
  const current = getUnit(unitId);
  if (!current) return undefined;
  return UNITS.find((u) => u.order === current.order + 1);
}

export function getFirstUnit(): Unit {
  return UNITS[0];
}
