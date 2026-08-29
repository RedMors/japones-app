import { getDictDb, isDictReady } from './db.ts';

export type DictEntry = {
  lemma: string;
  reading: string | null;
  glosses: string;
  pos: string | null;
  isCommon: boolean;
};

type Row = {
  lemma: string;
  reading: string | null;
  glosses: string;
  pos: string | null;
  is_common: number;
};

/**
 * Busca un lema en JMdict. Devuelve null si no está, o si el diccionario
 * todavía no se generó (`npm run build:jmdict`) — el miner debe seguir
 * funcionando sin significado en vez de romperse.
 */
export function lookupWord(lemma: string): DictEntry | null {
  const db = getDictDb();
  if (!db || !lemma) return null;

  const row = db
    .prepare(
      `SELECT lemma, reading, glosses, pos, is_common
       FROM entries WHERE lemma = ?
       ORDER BY is_common DESC LIMIT 1`,
    )
    .get(lemma) as Row | undefined;

  if (!row) return null;
  return rowToEntry(row);
}

/** Batch: evita N round-trips al minar un episodio con cientos de lemas. */
export function lookupWords(lemmas: string[]): Map<string, DictEntry> {
  const db = getDictDb();
  const out = new Map<string, DictEntry>();
  if (!db || lemmas.length === 0) return out;

  const unique = [...new Set(lemmas)];
  const CHUNK = 400; // debajo del límite de variables de SQLite (999)

  for (let i = 0; i < unique.length; i += CHUNK) {
    const batch = unique.slice(i, i + CHUNK);
    const placeholders = batch.map(() => '?').join(',');
    const rows = db
      .prepare(
        `SELECT lemma, reading, glosses, pos, is_common
         FROM entries WHERE lemma IN (${placeholders})
         ORDER BY is_common DESC`,
      )
      .all(...batch) as Row[];

    for (const row of rows) {
      // ORDER BY is_common DESC + set-once: la primera fila por lema es la común.
      if (out.has(row.lemma)) continue;
      out.set(row.lemma, rowToEntry(row));
    }
  }

  return out;
}

function rowToEntry(row: Row): DictEntry {
  return {
    lemma: row.lemma,
    reading: row.reading,
    glosses: row.glosses,
    pos: row.pos,
    isCommon: row.is_common === 1,
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

const JAPANESE_RE = /[぀-ゟ゠-ヿ㐀-䶿一-鿿]/;

type SearchState = { results: DictEntry[]; seen: Set<string> };

function runQuery(
  db: NonNullable<ReturnType<typeof getDictDb>>,
  state: SearchState,
  limit: number,
  whereSql: string,
  params: string[],
): void {
  if (state.results.length >= limit) return;
  const rows = db
    .prepare(`SELECT lemma, reading, glosses, pos, is_common FROM entries WHERE ${whereSql}
              ORDER BY is_common DESC LIMIT ?`)
    .all(...params, limit - state.results.length) as Row[];

  for (const row of rows) {
    const key = row.lemma + row.glosses;
    if (state.seen.has(key)) continue;
    state.seen.add(key);
    state.results.push(rowToEntry(row));
  }
}

/**
 * Búsqueda libre para el buscador: japonés compara por lema/lectura (strings
 * simples, la igualdad exacta tiene sentido); inglés busca dentro de las
 * glosas, que son compuestas — "cat (esp. the domestic cat...); feline;
 * shamisen; geisha" — así que la palabra se matchea como **cláusula
 * completa** de esa lista separada por "; ", no como substring del string
 * entero. Sin esto, buscar "cat" empataba por prefijo contra "catalog" o
 * "catheter" antes que contra el gato de verdad.
 */
export function searchWords(query: string, limit = 20): DictEntry[] {
  const db = getDictDb();
  const q = query.trim();
  if (!db || !q) return [];

  const state: SearchState = { results: [], seen: new Set() };
  const esc = escapeLike(q);

  if (JAPANESE_RE.test(q)) {
    runQuery(db, state, limit, 'lemma = ?', [q]);
    runQuery(db, state, limit, `lemma LIKE ? ESCAPE '\\'`, [`${esc}%`]);
    runQuery(db, state, limit, `lemma LIKE ? ESCAPE '\\'`, [`%${esc}%`]);
    // Por si buscan la lectura (かんじ) en vez del lema (漢字).
    runQuery(db, state, limit, 'reading = ?', [q]);
    runQuery(db, state, limit, `reading LIKE ? ESCAPE '\\'`, [`${esc}%`]);
  } else {
    // Cláusula exacta: "dog" sola, primera, del medio, o última de la lista.
    // "to dog" cubre verbos (JMdict los glosa como "to eat", no "eat"). El
    // calificador pegado ("dog (Canis (lupus) familiaris)") solo se acepta
    // en la PRIMERA cláusula — anclado al inicio del string completo, no
    // "LIKE %palabra (%", que también matchea menciones de paso en cláusulas
    // de otro sentido (agua) (ej. "water (or basin, etc.) for washing...").
    runQuery(
      db,
      state,
      limit,
      `(glosses = ? OR glosses = ?
        OR glosses LIKE ? ESCAPE '\\' OR glosses LIKE ? ESCAPE '\\' OR glosses LIKE ? ESCAPE '\\'
        OR glosses LIKE ? ESCAPE '\\' OR glosses LIKE ? ESCAPE '\\' OR glosses LIKE ? ESCAPE '\\'
        OR glosses LIKE ? ESCAPE '\\')`,
      [
        q,
        `to ${q}`,
        `${esc}; %`,
        `to ${esc}; %`,
        `%; ${esc}; %`,
        `%; to ${esc}; %`,
        `%; ${esc}`,
        `%; to ${esc}`,
        `${esc} (%`,
      ],
    );
    // Substring en cualquier parte de cualquier cláusula — más ancho
    // (agarra "domestic cat", "to eat"), va después de la cláusula exacta.
    runQuery(db, state, limit, `glosses LIKE ? ESCAPE '\\'`, [`%${esc}%`]);
  }

  return state.results.slice(0, limit);
}

export { isDictReady };
