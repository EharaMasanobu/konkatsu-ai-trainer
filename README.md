# 婚活AIトレーナー（Konkatsu AI Trainer）

> AIが婚活女性を演じる、本番さながらの会話トレーニング

## プロジェクト概要

婚活で初対面の女性との会話を練習し、会話終了後に AI 婚活アドバイザーからフィードバックを受けられる Web アプリケーションです。

### 主な機能

- 利用者・AI女性のプロフィール設定（女性プロフィールのランダム生成）
- AI とのリアルタイム会話（テキスト入力・音声入力）
- 会話エンジン（AIState / Topic / Memory / Prompt 制御）
- 性格考慮型の会話評価（減点方式）
- 婚活コーチング（改善点・模範回答・次回課題）

### 技術スタック

| 項目 | 技術 |
| --- | --- |
| Framework | Next.js 16（App Router） |
| Language | TypeScript |
| Style | Tailwind CSS 4 |
| DB | SQLite（Prisma） |
| AI | OpenAI API（GPT / Whisper） |

---

## セットアップ

### 前提条件

- Node.js 20 以上（推奨）
- npm 10 以上
- OpenAI API キー

### 1. リポジトリのクローン

```bash
git clone https://github.com/<your-org>/konkatsu-ai-trainer.git
cd konkatsu-ai-trainer
```

### 2. 依存パッケージのインストール

```bash
npm install
```

`postinstall` で Prisma Client が自動生成されます。

### 3. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、値を設定してください。

```bash
cp .env.example .env.local
```

**必須**: `OPENAI_API_KEY` に有効な API キーを設定してください。

### 4. データベースの初期化

```bash
npm run db:migrate
```

初回はマイグレーション名の入力を求められた場合、任意の名前（例: `init`）を入力してください。

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

---

## 開発方法

### よく使うコマンド

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバー起動（Turbopack） |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |
| `npm run type-check` | TypeScript 型チェック |
| `npm run format` | Prettier でフォーマット |
| `npm run format:check` | フォーマットチェック |
| `npm run db:generate` | Prisma Client 再生成 |
| `npm run db:migrate` | マイグレーション実行（開発） |
| `npm run db:studio` | Prisma Studio 起動 |

### 品質チェック（PR 前の推奨）

```bash
npm run lint
npm run type-check
npm run build
```

ローカルでも上記と同じ順序で確認できます。`main` への push 時は [GitHub Actions](#github-actions) が自動実行します。

### GitHub Actions

`main` / `master` への **push** および **pull request** 時に CI が実行されます。

| ワークフロー | ファイル | 内容 |
| --- | --- | --- |
| CI | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | `npm install` → `lint` → `type-check` → `build` |

いずれかのステップが失敗するとワークフロー全体が **失敗（赤）** になります。

#### Railway デプロイとの連携（CI 失敗時はデプロイしない）

Railway で GitHub 連携デプロイを使う場合、**CI 成功後のみデプロイ**する設定を推奨します。

1. Railway → 対象 Service → **Settings**
2. **Deploy** セクションで **Wait for CI**（または同等の「GitHub チェック待ち」）を有効化
3. 必要に応じて GitHub リポジトリの **Branch protection rules** で `CI` チェックを必須に設定

これにより、lint / 型チェック / ビルドが通らないコミットは本番へデプロイされません。

#### CI 結果の確認

- GitHub リポジトリ → **Actions** タブ → ワークフロー **CI**
- 各 push / PR の Checks 欄（✓ / ✗）からも確認可能

### 設計書

設計書は `doc/` ディレクトリに格納されています。一覧と名称ルールは [`doc/README.md`](doc/README.md) を参照してください。

---

## 環境変数

| 変数名 | 必須 | 説明 | 例 |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | はい | OpenAI API キー | `sk-...` |
| `DATABASE_URL` | はい | Prisma / SQLite 接続文字列 | `file:./dev.db` |
| `NODE_ENV` | いいえ | 実行環境 | `development` |

`.env.local` は Git にコミットしないでください（`.gitignore` で除外済み）。

ローカル・Railway ともに `src/lib/env.ts` 経由で `process.env` から読み込みます。

---

## ビルド方法

```bash
npm run build
```

成功後、本番サーバーを起動します。

```bash
npm run start
```

デフォルトは [http://localhost:3000](http://localhost:3000) です。

---

## デプロイ方法（Railway）

GitHub に push するだけで [Railway](https://railway.app/) が自動ビルド・デプロイします。  
リポジトリルートの [`railway.toml`](railway.toml) でビルド／起動コマンドとヘルスチェックを定義しています。

### 前提

- GitHub リポジトリに本プロジェクトが push 済みであること
- [Railway](https://railway.app/) アカウント
- 有効な OpenAI API キー

### 1. Railway プロジェクト作成

1. Railway ダッシュボード → **New Project**
2. **Deploy from GitHub repo** を選択
3. `konkatsu-ai-trainer` リポジトリを接続
4. `main` ブランチをデプロイ対象に設定（デフォルト）

以降、`main` への push ごとに自動デプロイされます（**GitHub Actions CI が成功した場合**）。

> CI が失敗した push はデプロイしないよう、Railway の **Wait for CI** を有効にしてください（[GitHub Actions](#github-actions) 参照）。

### 2. Environment Variables（必須）

Railway の **Project → Service → Variables** に以下を設定します。

| 変数名 | 必須 | ローカル（`.env.local`） | Railway（Variables） | 説明 |
| --- | --- | --- | --- | --- |
| `OPENAI_API_KEY` | **はい** | `sk-...` | 同左 | OpenAI API キー |
| `DATABASE_URL` | はい* | `file:./prisma/dev.db` | `file:/data/prod.db` | Prisma ビルド用（\*将来 DB 利用時） |
| `NODE_ENV` | いいえ | `development` | `production`（自動） | 実行環境 |

> **OPENAI_API_KEY** はローカルでは `.env.local`、本番では Railway Variables のどちらでも `process.env.OPENAI_API_KEY` として読み込まれます。

#### SQLite + Volume（任意・将来の DB 永続化向け）

1. Railway で **Volume** を追加し、マウントパス `/data` を指定
2. `DATABASE_URL=file:/data/prod.db` を設定
3. 初回デプロイ後、One-off コマンドで `npx prisma migrate deploy` を実行

現状のアプリはセッションをクライアント側で保持するため、Volume なしでも会話機能は動作します。

### 3. ビルド・起動（`railway.toml` / `package.json`）

| フェーズ | コマンド |
| --- | --- |
| Install | `npm ci`（Nixpacks 自動） |
| Build | `npm run build`（`prisma generate && next build`） |
| Start | `npm run start`（`next start -H 0.0.0.0`、PORT は Railway が注入） |
| Healthcheck | `GET /api/health` |

Node.js **20 以上**（`package.json` の `engines` 参照）。

### 4. デプロイ後の確認（本番チェックリスト）

| # | 確認項目 | 期待結果 |
| --- | --- | --- |
| 1 | トップページ | `https://<your-app>.up.railway.app/` が表示される |
| 2 | ヘルスチェック | `GET /api/health` → 常に `200`（プロセス生存確認） |
| 3 | システムチェック | `GET /api/system/check` → OpenAI 設定確認（未設定時 `503`） |
| 4 | 会話 API | ホームで設定 → 会話開始 → AI が返答する |
| 5 | HTTPS | 音声入力は HTTPS 環境で動作（Railway 標準対応） |

#### ヘルスチェック例

```bash
curl https://<your-app>.up.railway.app/api/health
```

```json
{
  "status": "ok",
  "timestamp": "2026-06-28T12:00:00.000Z",
  "version": "0.1.0",
  "environment": "production",
  "openaiConfigured": true
}
```

`OPENAI_API_KEY` が未設定でも `/api/health` は **常に HTTP 200** です（Railway の Health Check 互換）。  
OpenAI 設定の確認は `/api/system/check` を使用してください。

#### 会話 API の手動確認（任意）

ブラウザで会話を1ターン送るか、以下で確認します（`session` は実際のペイロードに置き換え）。

```bash
curl -X POST https://<your-app>.up.railway.app/api/message \
  -H "Content-Type: application/json" \
  -d '{"message":"こんにちは","session":{...},"conversationHistory":[]}'
```

`reply` フィールドに AI の返答が含まれれば OpenAI 連携は正常です。

### 5. トラブルシューティング

| 症状 | 対処 |
| --- | --- |
| ビルド失敗 | Railway の Deploy Logs で `npm run build` のエラーを確認 |
| `503` / OpenAI エラー | `OPENAI_API_KEY` が Variables に設定されているか確認 |
| ヘルスチェック失敗 | `/api/health` が `200` か確認（OpenAI 未設定でも `200` が正常） |
| OpenAI 未設定 | `/api/system/check` が `503` → Variables に `OPENAI_API_KEY` を設定 |
| 会話が始まらない | ブラウザの Network タブで `/api/message` のステータスを確認 |

---

## ディレクトリ構成

```text
konkatsu-ai-trainer/
├── doc/                    # 設計書
├── prisma/
│   ├── schema.prisma       # DB スキーマ
│   └── migrations/         # マイグレーション
├── public/                 # 静的ファイル
├── src/
│   ├── app/                # Next.js App Router（ページ・API）
│   ├── ai/                 # 会話・評価 AI ロジック
│   ├── components/         # React コンポーネント
│   ├── constants/          # 定数
│   ├── contexts/           # React Context
│   ├── hooks/              # カスタムフック
│   ├── lib/                # ユーティリティ
│   ├── prompts/            # プロンプトテンプレート（.md）
│   ├── schemas/            # Zod スキーマ
│   ├── services/           # API 呼び出し・ビジネスロジック
│   └── types/              # TypeScript 型定義
├── .github/workflows/ci.yml  # GitHub Actions（品質チェック）
├── railway.toml            # Railway ビルド・デプロイ設定
├── .env.example            # 環境変数テンプレート
├── package.json
└── README.md
```

詳細は [`doc/09_プロジェクト構成.md`](doc/09_プロジェクト構成.md) を参照してください。

---

## ライセンス

公開時にライセンスを設定してください（未設定）。
