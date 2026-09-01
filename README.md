# 日本語アプリ — Japanese Learning App

**[English](#english)** · **[Español](#español)** · **[日本語](#日本語)**

---

<a id="english"></a>
## English

A personal Japanese-learning app: sentence mining from anime subtitles, spaced-repetition curriculum (hiragana → katakana → JLPT N5–N1), scene-based phrase practice, speaking practice with speech recognition, a built-in dictionary search, and Anki sync — all running locally, with an optional AI teacher for grammar questions.

The interface supports **Spanish and English** (toggle in the nav bar). If you're a Japanese speaker interested in contributing a 日本語 UI translation, see [Contributing](#contributing-en) below — it would help learners get feedback in their own language.

### Features
- **Learn**: spaced-repetition curriculum from hiragana/katakana through JLPT N5–N1
- **Characters**: full kana board with real progress tracking
- **Themes**: scene-based phrase building (restaurant, shopping, work, etc.)
- **Speak**: pronunciation practice via browser speech recognition
- **Mine episode**: drop an `.srt`/`.ass` subtitle file (optionally with the matching video/audio) and mine new vocabulary sentence by sentence, with auto-generated audio clips
- **Search**: local Japanese↔English dictionary with pronunciation
- **Anki**: sync and track known vocabulary via [AnkiConnect](https://ankiweb.net/shared/info/2055492159)
- **AI teacher** (optional): ask grammar questions, get explanations for exercises — via [OpenRouter](https://openrouter.ai)

### Requirements
- Node.js 20+
- [ffmpeg](https://ffmpeg.org) on `PATH` — optional, only needed for audio clips when mining episodes
- [Anki](https://apps.ankiweb.net) with the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on — optional, only needed for the Anki sync and mining-to-Anki features
- An [OpenRouter](https://openrouter.ai) API key — optional, only needed for the AI teacher / grammar explanations

Everything else (curriculum, SRS progress, kana practice, scene phrases) works with zero external services.

### Setup
```bash
npm install
npm run build:jmdict   # generates the local JP↔EN dictionary (needed for Search)
npm run dev
```
Open `http://localhost:3000`. To enable the AI teacher, go to **Settings** in the app and paste an OpenRouter API key — it's saved to a gitignored `.env.local`, never to the database.

### Scripts
- `npm run dev` / `npm run build` / `npm start` — standard Next.js dev/build/start
- `npm run check` — runs the full validation suite (tokenizer, normalizer, curriculum data, furigana coverage, etc.)
- `npm run build:jmdict` — builds the local dictionary from JMdict
- `npm run build:jlpt-vocab` — builds the JLPT vocabulary lists

### Data & privacy
Everything runs locally in a SQLite database (`data/app.db`). No account, no telemetry. The only external calls are to OpenRouter (if you configure a key) and AnkiConnect (if Anki is running locally).

<a id="contributing-en"></a>
### Contributing
This is a personal project, but contributions are welcome — especially:
- A **日本語 UI translation** (see `lib/i18n/dictionary.ts` — same structure as the existing `es`/`en` dictionaries)
- Bug reports on exercise correctness or JLPT content
- New scene themes for the Themes practice mode

Open an issue or PR. The codebase is TypeScript + Next.js (App Router) + SQLite.

---

<a id="español"></a>
## Español

Una app personal para aprender japonés: sentence mining desde subtítulos de anime, currículum con repetición espaciada (hiragana → katakana → JLPT N5–N1), práctica de frases por escena, práctica de habla con reconocimiento de voz, buscador de diccionario integrado, y sincronización con Anki — todo corriendo local, con un profesor de IA opcional para dudas de gramática.

La interfaz soporta **español e inglés** (toggle en la barra de navegación). Si hablás japonés y te interesa colaborar con una traducción de la interfaz al 日本語, mirá [Cómo colaborar](#cómo-colaborar) más abajo — ayudaría a que más gente aprenda japonés recibiendo feedback en su propio idioma.

### Funcionalidades
- **Aprender**: currículum con repetición espaciada desde hiragana/katakana hasta JLPT N5–N1
- **Caracteres**: tablero completo de kana con progreso real
- **Temas**: armado de frases por escena (restaurante, compras, trabajo, etc.)
- **Hablar**: práctica de pronunciación vía reconocimiento de voz del navegador
- **Minar episodio**: soltá un archivo `.srt`/`.ass` (opcionalmente con el video/audio correspondiente) y mine vocabulario nuevo oración por oración, con clips de audio generados automáticamente
- **Buscar**: diccionario japonés↔inglés local con pronunciación
- **Anki**: sincronizá y trackeá vocabulario conocido vía [AnkiConnect](https://ankiweb.net/shared/info/2055492159)
- **Profesor IA** (opcional): preguntá dudas de gramática, pedí explicaciones de ejercicios — vía [OpenRouter](https://openrouter.ai)

### Requisitos
- Node.js 20+
- [ffmpeg](https://ffmpeg.org) en el `PATH` — opcional, solo hace falta para los clips de audio al minar episodios
- [Anki](https://apps.ankiweb.net) con el addon [AnkiConnect](https://ankiweb.net/shared/info/2055492159) — opcional, solo hace falta para sincronizar y agregar tarjetas desde el minado
- Una API key de [OpenRouter](https://openrouter.ai) — opcional, solo hace falta para el profesor IA / explicaciones de gramática

Todo lo demás (currículum, progreso SRS, práctica de kana, frases de escena) funciona sin ningún servicio externo.

### Instalación
```bash
npm install
npm run build:jmdict   # genera el diccionario local JP↔EN (necesario para Buscar)
npm run dev
```
Abrí `http://localhost:3000`. Para habilitar el profesor IA, andá a **Ajustes** dentro de la app y pegá una API key de OpenRouter — se guarda en un `.env.local` gitignoreado, nunca en la base de datos.

### Scripts
- `npm run dev` / `npm run build` / `npm start` — dev/build/start estándar de Next.js
- `npm run check` — corre toda la suite de validación (tokenizer, normalizador, datos de currículum, cobertura de furigana, etc.)
- `npm run build:jmdict` — genera el diccionario local a partir de JMdict
- `npm run build:jlpt-vocab` — genera las listas de vocabulario JLPT

### Datos y privacidad
Todo corre local en una base SQLite (`data/app.db`). Sin cuenta, sin telemetría. Las únicas llamadas externas son a OpenRouter (si configurás una key) y a AnkiConnect (si tenés Anki abierto local).

### Cómo colaborar
Es un proyecto personal, pero se aceptan contribuciones — especialmente:
- Una **traducción de la interfaz al 日本語** (ver `lib/i18n/dictionary.ts` — misma estructura que los diccionarios `es`/`en` existentes)
- Reportes de errores en la corrección de ejercicios o contenido JLPT
- Escenas nuevas para el modo de práctica Temas

Abrí un issue o PR. El código es TypeScript + Next.js (App Router) + SQLite.

---

<a id="日本語"></a>
## 日本語

個人用の日本語学習アプリです。アニメの字幕からセンテンスマイニング、間隔反復方式のカリキュラム（ひらがな→カタカナ→JLPT N5〜N1）、シーン別フレーズ練習、音声認識を使った発音練習、内蔵辞書検索、Anki同期などをすべてローカルで実行できます。文法の質問に答えるAI教師機能もあります（任意）。

インターフェースは**スペイン語と英語**に対応しています（ナビバーの切り替えボタン）。日本語話者の方でUI翻訳に協力していただける場合は、下の[貢献について](#貢献について)をご覧ください。学習者が自分の母語でフィードバックを受けられるようになります。

### 機能
- **学ぶ**：ひらがな/カタカナからJLPT N5〜N1までの間隔反復カリキュラム
- **文字**：進捗を反映したひらがな・カタカナ一覧表
- **テーマ**：シーン別のフレーズ組み立て練習（レストラン、買い物、仕事など）
- **話す**：ブラウザの音声認識を使った発音練習
- **エピソードをマイニング**：`.srt`/`.ass`字幕ファイル（動画・音声も可）をドロップして、文単位で新しい語彙を抽出。音声クリップも自動生成
- **検索**：発音付きのローカル日英辞書
- **Anki**：[AnkiConnect](https://ankiweb.net/shared/info/2055492159)経由で既知の語彙を同期・追跡
- **AI教師**（任意）：文法の質問や練習問題の解説を[OpenRouter](https://openrouter.ai)経由で取得

### 必要環境
- Node.js 20以上
- [ffmpeg](https://ffmpeg.org)（`PATH`に追加）— 任意、エピソードマイニング時の音声クリップ生成にのみ必要
- [Anki](https://apps.ankiweb.net) と [AnkiConnect](https://ankiweb.net/shared/info/2055492159) アドオン — 任意、Anki同期・マイニングからのカード追加にのみ必要
- [OpenRouter](https://openrouter.ai) のAPIキー — 任意、AI教師・文法解説機能にのみ必要

それ以外の機能（カリキュラム、SRS進捗、かな練習、シーンフレーズ）は外部サービスなしで動作します。

### セットアップ
```bash
npm install
npm run build:jmdict   # ローカル日英辞書を生成（検索機能に必要）
npm run dev
```
`http://localhost:3000` を開いてください。AI教師を有効にするには、アプリ内の**設定**でOpenRouterのAPIキーを入力します。キーはgitignore対象の`.env.local`に保存され、データベースには保存されません。

### スクリプト
- `npm run dev` / `npm run build` / `npm start` — Next.js標準のdev/build/start
- `npm run check` — 検証スイート一式を実行（トークナイザー、正規化、カリキュラムデータ、振り仮名カバレッジなど）
- `npm run build:jmdict` — JMdictからローカル辞書を生成
- `npm run build:jlpt-vocab` — JLPT語彙リストを生成

### データとプライバシー
すべてローカルのSQLiteデータベース（`data/app.db`）で動作します。アカウント登録もテレメトリもありません。外部への通信はOpenRouter（キーを設定した場合）とAnkiConnect（ローカルでAnkiを起動している場合）のみです。

<a id="貢献について"></a>
### 貢献について
個人プロジェクトですが、貢献を歓迎します。特に：
- **UIの日本語翻訳**（`lib/i18n/dictionary.ts` を参照 — 既存の `es`/`en` 辞書と同じ構造です）
- 練習問題の正誤やJLPTコンテンツに関するバグ報告
- 「テーマ」練習モード用の新しいシーン

IssueまたはPRをお送りください。技術スタックはTypeScript + Next.js（App Router）+ SQLiteです。
