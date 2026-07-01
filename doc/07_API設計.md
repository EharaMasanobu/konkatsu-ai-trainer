# 07_API設計.md

# 婚活AIトレーナー

Version: 1.0

---

# 1. API設計方針

本システムではREST APIを採用する。

ただし、会話は「Conversation Session」を単位として管理する。

すべての会話・評価・状態管理はSession単位で行う。

---

# 2. API一覧

| Method | Path                       | 概要         |
| ------ | -------------------------- | ---------- |
| POST   | /api/session               | 会話開始       |
| POST   | /api/session/{id}/message  | 会話送信       |
| POST   | /api/session/{id}/evaluate | 評価取得       |
| GET    | /api/session/{id}          | セッション取得    |
| DELETE | /api/session/{id}          | セッション終了    |
| POST   | /api/profile/random        | AIプロフィール生成 |
| POST   | /api/speech/transcribe     | 音声文字起こし    |

---

# 3. 会話フロー

```text
ホーム画面
      │
      ▼
POST /api/session
      │
      ▼
sessionId取得
      │
      ▼
POST /message
      │
      ▼
POST /message
      │
      ▼
POST /message
      │
      ▼
Evaluate
      │
      ▼
DELETE Session
```

---

# 4. POST /api/session

## 目的

新しいConversation Sessionを作成する。

---

## Request

```json
{
  "userProfile": {},
  "femaleProfile": {},
  "personality": {},
  "conversationSetting": {}
}
```

---

## Response

```json
{
  "sessionId": "uuid",

  "femaleProfile": {},

  "personality": {},

  "hiddenGoalPreview": null
}
```

Hidden Goalは返却しない。

---

# 5. POST /message

## Request

```json
{
  "message": "こんにちは。"
}
```

---

## Response

```json
{
  "reply": "...",

  "turn": 3,

  "shouldEnd": false
}
```

内部状態はサーバー側のみ保持する。

---

# 6. POST /evaluate

## Request

```json
{}
```

評価時はRequest不要。

---

## Response

```json
{
  "evaluation": {}
}
```

EvaluationResultを返却する。

---

# 7. POST /profile/random

## Request

```json
{
  "ageRange": "30-35",

  "difficulty": "Normal"
}
```

---

## Response

```json
{
  "femaleProfile": {},

  "personality": {}
}
```

---

# 8. POST /speech/transcribe

## Request

音声ファイル

multipart/form-data

---

## Response

```json
{
  "text": "こんにちは"
}
```

---

# 9. GET /session

セッション状態を取得する。

Response

```json
{
  "currentTurn": 7,

  "status": "ACTIVE"
}
```

---

# 10. DELETE /session

セッションを終了する。

Response

```json
{
  "success": true
}
```

---

# 11. エラーコード

| Code | 意味        |
| ---- | --------- |
| 400  | 入力エラー     |
| 401  | 認証エラー     |
| 404  | Sessionなし |
| 429  | API制限     |
| 500  | サーバーエラー   |

---

# 12. APIレスポンス共通形式

成功

```json
{
  "success": true,

  "data": {}
}
```

失敗

```json
{
  "success": false,

  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "..."
  }
}
```

---

# 13. セッション管理

Sessionには以下を保持する。

* UserProfile
* FemaleProfile
* Personality
* HiddenGoal
* ConversationHistory
* Fact
* Insight
* Emotion
* Impression

クライアントはSession IDのみ保持する。

---

# 14. API設計方針

APIはできる限りシンプルに保つ。

OpenAIとのやり取りはすべてサーバー側で行い、クライアントはAIの内部状態を意識しない。

---

# 15. 将来拡張

Phase2

* ログイン
* ユーザー履歴取得
* お気に入りAI
* 会話履歴一覧

Phase3

* 複数シナリオ
* AIキャラクター管理
* ランキング
* PDF出力
