# 12_Cursor開発ルール.md

# Cursor Rules設計

Version: 1.0

---

# 概要

本プロジェクトではCursor Rulesを利用し、すべてのコード生成時に共通ルールを適用する。

ルールは `.cursor/rules/` ディレクトリへ配置する。

---

# ディレクトリ構成

```text
.cursor/
└── rules/
    ├── 01_project.mdc
    ├── 02_architecture.mdc
    ├── 03_typescript.mdc
    ├── 04_react.mdc
    ├── 05_api.mdc
    ├── 06_database.mdc
    ├── 07_ai.mdc
    ├── 08_prompt.mdc
    ├── 09_testing.mdc
    └── 10_review.mdc
```

---

# 01_project.mdc

## 目的

プロジェクト全体の方針を定義する。

### ルール

* doc配下の設計書を最優先する
* 設計書にない仕様は勝手に追加しない
* 不明点は確認を優先する
* MVPを最優先とする
* 保守性を重視する

---

# 02_architecture.mdc

### レイヤー構成

```text
UI
 ↓
Service
 ↓
Repository
 ↓
Database

UI
 ↓
Service
 ↓
AI
 ↓
OpenAI
```

### 禁止事項

* RepositoryからAIを呼ばない
* AIからRepositoryを呼ばない
* UIからDBへ直接アクセスしない
* UIからOpenAI APIを直接呼ばない

---

# 03_typescript.mdc

### TypeScriptルール

* anyは禁止
* unknownを優先
* Interfaceを定義する
* 型安全を最優先する
* Enumを積極的に利用する

---

# 04_react.mdc

### Reactルール

* Functional Componentのみ
* Hooksを利用する
* Props型を定義する
* コンポーネントは責務を分離する

---

# 05_api.mdc

API Routeは以下のみ行う。

* Validation
* Service呼び出し
* Response生成

禁止

* AIロジック
* DB処理
* 業務ロジック

---

# 06_database.mdc

DBアクセスはRepositoryのみ。

PrismaはRepository経由で利用する。

SQLを直接書かない。

---

# 07_ai.mdc

OpenAI APIは

src/ai/openai.ts

のみ利用する。

AIロジックは

src/ai

へ配置する。

Conversation AI

Evaluation AI

Profile AI

を分離する。

---

# 08_prompt.mdc

PromptはMarkdown管理。

コードへ直接記述しない。

Prompt Builderで組み立てる。

Structured Outputを利用する。

---

# 09_testing.mdc

コード生成後は以下を確認する。

* 型エラー
* ESLint
* 未使用Import
* console.log
* TODOコメント

---

# 10_review.mdc

Cursorはコード生成後にセルフレビューを行う。

レビュー項目

* doc準拠
* 命名規則
* 型安全
* エラーハンドリング
* 可読性

問題があれば修正してから完了とする。

---

# Cursorへの依頼方法

推奨

「ホーム画面のみ実装してください」

「Session APIのみ実装してください」

「Conversation AIのみ実装してください」

非推奨

「全部実装してください」

---

# 実装サイクル

1. Cursorへ依頼
2. Cursorが実装
3. ChatGPTでレビュー
4. 修正
5. 次タスクへ進む

このサイクルを繰り返すことで、品質を維持しながら開発を進める。
