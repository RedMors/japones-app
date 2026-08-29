/**
 * Parsers de subtítulos con casos que aparecen en archivos reales.
 * Correr: npm run check:parsers
 */
import {
  parseSubtitles,
  parseSrt,
  parseAss,
  detectFormat,
  guessEpisodeMeta,
  decodeSubtitleBuffer,
  hashContent,
} from '../lib/parsers/index.ts';

let failed = 0;

function eq(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FALLA'} ${label}`);
  if (!ok) console.log(`      esperado ${JSON.stringify(want)}\n      obtenido ${JSON.stringify(got)}`);
}

// --- SRT ------------------------------------------------------------------
// CRLF, tags HTML, entidades, línea repetida, cue en inglés, índices ausentes,
// milisegundos de un dígito y línea partida en dos.
const SRT = [
  '1',
  '00:00:01,000 --> 00:00:03,500',
  '<i>お前はもう</i>',
  '死んでいる。',
  '',
  '2',
  '00:00:04,000 --> 00:00:06,000',
  '- はい&nbsp;',
  '',
  '00:00:07,5 --> 00:00:09,000',
  'いいえ',
  '',
  '4',
  '00:01:00.500 --> 00:01:02,000',
  '{\\an8}Next episode',
  '',
  '5',
  '00:01:03,000 --> 00:01:05,000',
  '猫が好きです。',
  '',
].join('\r\n');

const srt = parseSrt(SRT);
eq('srt: líneas japonesas', srt.lines.map((l) => l.text), [
  'お前はもう死んでいる。',
  'はい',
  'いいえ',
  '猫が好きです。',
]);
eq('srt: dos líneas se unen sin espacio', srt.lines[0].text, 'お前はもう死んでいる。');
eq('srt: timestamps', [srt.lines[0].startMs, srt.lines[0].endMs], [1000, 3500]);
eq('srt: quita guion y &nbsp;', srt.lines[1].text, 'はい');
// "00:00:07,5" son 7500ms: el 5 es décima de segundo, no 5 milésimas.
eq('srt: ms de un dígito', srt.lines[2].startMs, 7500);
// El cue de いいえ viene sin número de índice en el fixture.
eq('srt: sobrevive sin número de índice', srt.lines[2].text, 'いいえ');
eq('srt: cues totales', srt.totalCues, 5);
eq('srt: descartados sin japonés', srt.droppedNonJapanese, 1);

const srtSinFiltro = parseSrt(SRT, { requireJapanese: false });
eq('srt: sin filtro entra el inglés', srtSinFiltro.lines.length, 5);

// Dedupe de líneas repetidas en cues seguidos
const repetido = parseSrt(
  [
    '1', '00:00:01,000 --> 00:00:02,000', 'はい', '',
    '2', '00:00:03,000 --> 00:00:04,000', 'はい', '',
  ].join('\n'),
);
eq('srt: dedupe consecutivo', repetido.lines.length, 1);

// --- ASS ------------------------------------------------------------------
const ASS = [
  '[Script Info]',
  'ScriptType: v4.00+',
  '',
  '[V4+ Styles]',
  'Format: Name, Fontname',
  'Style: Default,Arial',
  '',
  '[Events]',
  'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  'Dialogue: 0,0:00:01.00,0:00:03.50,Default,,0,0,0,,{\\an8}こんにちは、田中さん。',
  'Dialogue: 0,0:00:04.00,0:00:06.00,Default,,0,0,0,,今日は\\N学校へ行く。',
  'Comment: 0,0:00:07.00,0:00:08.00,Default,,0,0,0,,これは コメント。',
  'Dialogue: 0,0:00:09.00,0:00:10.00,Sign,,0,0,0,,看板の文字',
  'Dialogue: 0,0:00:11.00,0:00:12.00,Default,,0,0,0,,{\\p1}m 0 0 l 100 0{\\p0}',
  'Dialogue: 0,0:00:13.00,0:00:14.00,Default,,0,0,0,,{\\k30}う{\\k20}た',
  'Dialogue: 0,0:00:15.00,0:00:16.00,Default,,0,0,0,,カンマ, dentro del texto です。',
  'Dialogue: 0,0:00:15.00,0:00:16.00,Default,,0,0,0,,カンマ, dentro del texto です。',
].join('\n');

const ass = parseAss(ASS);
eq('ass: solo diálogo real', ass.lines.map((l) => l.text), [
  'こんにちは、田中さん。',
  '今日は学校へ行く。',
  'カンマ, dentro del texto です。',
]);
eq('ass: centésimas -> ms', [ass.lines[0].startMs, ass.lines[0].endMs], [1000, 3500]);
eq('ass: dedupe de capas', ass.lines.filter((l) => l.text.includes('カンマ')).length, 1);

// --- detección y metadatos ------------------------------------------------
eq('detecta ass por extensión', detectFormat('a.ass', ''), 'ass');
eq('detecta ass por contenido', detectFormat('a.txt', '[Script Info]\n'), 'ass');
eq('detecta srt por defecto', detectFormat('a.srt', ''), 'srt');
eq('dispatch', parseSubtitles('x.ass', ASS).format, 'ass');

eq('meta: fansub', guessEpisodeMeta('[SubsPlease] Frieren - 05 (1080p) [A1B2].srt'), {
  animeName: 'Frieren',
  episodeLabel: 'E05',
});
eq('meta: temporada', guessEpisodeMeta('Jujutsu.Kaisen.S02E14.ja.srt'), {
  animeName: 'Jujutsu Kaisen',
  episodeLabel: 'S02E14',
});
eq('meta: sin episodio', guessEpisodeMeta('Sword of the Stranger.ass'), {
  animeName: 'Sword of the Stranger',
  episodeLabel: null,
});

// --- encoding -------------------------------------------------------------
const utf8 = new TextEncoder().encode('こんにちは');
eq('decodifica utf-8', decodeSubtitleBuffer(utf8), 'こんにちは');

// こんにちは en Shift-JIS
const sjis = new Uint8Array([0x82, 0xb1, 0x82, 0xf1, 0x82, 0xc9, 0x82, 0xbf, 0x82, 0xcd]);
eq('decodifica shift-jis', decodeSubtitleBuffer(sjis), 'こんにちは');

const bom = new Uint8Array([0xef, 0xbb, 0xbf, ...utf8]);
eq('quita BOM', decodeSubtitleBuffer(bom), 'こんにちは');

eq('hash estable', hashContent('abc') === hashContent('abc'), true);
eq('hash distinto', hashContent('abc') !== hashContent('abd'), true);
eq('hash largo', hashContent('abc').length, 32);

console.log(failed === 0 ? '\nTodo pasa.' : `\n${failed} casos fallando.`);
process.exit(failed === 0 ? 0 : 1);
