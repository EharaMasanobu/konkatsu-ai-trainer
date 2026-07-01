# 10_Cursor開発ガイド.md

# 婚活AIトレーナー

Version: 1.0

---

# 1. 目的

本ドキュメントは、Cursorを利用して本プロジェクトを開発する際の共通ルールを定義する。

Cursorは本ガイドおよび `doc/` 配下の設計書を最優先で参照し、設計に従って実装を行うこと。

---

# 2. プロジェクト概要

## プロジェクト名

konkatsu-ai-trainer

---

## キャッチコピー

AIが婚活女性を演じる、本番さながらの会話トレーニング

---

## プロジェクトの目的

婚活で初対面の女性との会話を練習し、改善点を知ることができるAIトレーニングアプリを開発する。

AIは単なるチャットボットではなく、一人の婚活女性として振る舞う。

---

# 3. 開発方針

以下を優先順位とする。

1. 設計書との整合性
2. 可読性
3. 保守性
4. 拡張性
5. パフォーマンス

短いコードよりも理解しやすいコードを優先する。

---

# 4. Cursorへの基本ルール

Cursorは以下を必ず守ること。

* docs配下の設計書を参照する
* 設計書に存在しない仕様を勝手に追加しない
* 不明点がある場合は実装前に確認する
* 変更は最小単位で行う
* 不要なリファクタリングを行わない

---

# 5. コーディングルール

## TypeScript

* anyは禁止
* unknownを優先する
* 型推論できてもInterfaceを利用する
* Enumを積極的に利用する

---

## React

* Functional Componentのみ利用
* Hooksを利用する
* Props型を必ず定義する

---

## 命名規則

Component

PascalCase

例

HomeForm.tsx

Hook

useConversation.ts

Service

ConversationService.ts

Repository

SessionRepository.ts

AI

ConversationAI.ts

---

# 6. ディレクトリルール

責務を跨いではならない。

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

RepositoryからAIを呼ばない。

AIからRepositoryを呼ばない。

---

# 7. AI関連ルール

OpenAI APIは

src/ai/openai.ts

からのみ呼び出す。

他ディレクトリから直接OpenAI APIを呼び出してはならない。

---

## Prompt

PromptはMarkdownファイルで管理する。

コードへ直接記述しない。

---

## Structured Output

Conversation AI

Evaluation AI

Profile AI

すべてJSON Schemaを利用する。

---

# 8. データベースルール

Prisma経由でアクセスする。

SQLを直接書かない。

Repository以外からPrismaを利用しない。

---

# 9. UIルール

画面は以下を分離する。

Container

Presentation

Business Logic

1ファイルへ大量の処理を書かない。

---

# 10. APIルール

API Routeでは

* 入力チェック
* Service呼び出し
* Response生成

のみ行う。

AIロジックを書かない。

DB処理を書かない。

---

# 11. エラー処理

try-catchを適切に利用する。

例外は握りつぶさない。

利用者へ分かりやすいエラーを返却する。

---

# 12. コメント

コメントは

「なぜ」

を書く。

コードの説明を書かない。

例

悪い例

```ts
// countをインクリメント
count++;
```

良い例

```ts
// OpenAIのレスポンス順序を維持するためインデックスを保持する
count++;
```

---

# 13. Git運用

コミットは小さく行う。

1コミット = 1目的

例

* feat: ホーム画面作成
* feat: Conversation API追加
* fix: 評価ロジック修正

---

# 14. 実装優先順位

以下の順序で開発を進める。

1. Next.js初期構築
2. Prisma設定
3. 型定義
4. API基盤
5. ホーム画面
6. AIプロフィール生成
7. 会話画面
8. Evaluation
9. 音声入力
10. UI改善

---

# 15. Cursorへの依頼方法

Cursorには一度に大きな変更を依頼しない。

推奨例

* Home画面を実装してください
* Session APIを実装してください
* Conversation AIを実装してください

避ける例

* アプリ全部作ってください

---

# 16. レビュー方針

実装後は必ず以下を確認する。

* 型安全
* 設計書との整合性
* 不要なコードがないか
* 命名規則
* エラーハンドリング

---

# 17. AI品質方針

Conversation AIは

「自然な返答」

ではなく、

「一人の婚活女性」

として振る舞うことを目的とする。

Hidden Goal

Emotion

Impression

Memory

を考慮して返答を生成する。

---

# 18. 将来の拡張を意識する

MVPでは必要最低限を実装する。

ただし、

* AI音声
* AIアバター
* 複数キャラクター
* 学習機能

を追加できる構造を維持する。

---

# 19. 実装中に迷った場合

以下の優先順位で判断する。

1. docsの設計書
2. このガイド
3. シンプルな実装
4. 拡張しやすい実装

---

# 20. プロジェクト理念

本プロジェクトは「AIチャットアプリ」の開発ではない。

「婚活の会話力を向上させるAIトレーニングシステム」を構築することが目的である。

設計・コード・プロンプトのすべてにおいて、一貫性・保守性・拡張性を重視し、将来の機能追加にも耐えられる構造を維持する。
