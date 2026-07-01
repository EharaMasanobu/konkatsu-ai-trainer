# 21_EvaluationAI_性格考慮型評価_V2.6.md

# 婚活AIトレーナー — EvaluationAI Character Aware Evaluation

Version: 2.6

---

# 1. 目的

EvaluationAI が**AI女性の性格**を考慮した採点を行う。

同じ返答でも相手の性格によって評価を変え、**相手に合わせた会話力**を測る。

---

# 2. Session から取得する情報

| 項目 | 取得元 |
| --- | --- |
| 性格 | `session.homeForm.personalitySetting.personality` |
| 会話スタイル | `session.homeForm.personalitySetting.conversationStyle` |
| 難易度 | `session.homeForm.personalitySetting.difficulty` |
| Hidden Goal | `aiState.hiddenGoal`（`EvaluationPromptBuilder` 経由） |

---

# 3. 性格別採点

定義: `src/constants/evaluationCharacterRules.ts`

| 性格 | 期待する会話 | 主な減点例 |
| --- | --- | --- |
| 明るい | リアクション・テンポ・質問・笑い | 淡白・短文・質問なし |
| おとなしい | 安心感・聞き役・急かさない | 質問攻め・テンション高すぎ |
| 大人 | 落ち着き・知的な会話 | 軽すぎる・大げさなリアクション |
| 活発 | エネルギー・会話を楽しむ | 盛り上がらない・一方通行 |
| クール | 落ち着き・空気を読む | オーバーリアクション・馴れ馴れしさ |
| 天然 | 柔らかいリアクション・否定しない | 訂正・話を切る・堅苦しさ |

※「おとなしい」は人見知り気質の評価基準を含む。

---

# 4. 会話スタイル補正

| UI選択 | 評価上の扱い | 減点例 |
| --- | --- | --- |
| よく話す | 積極的 | 受け身すぎる |
| 聞き上手 | 聞き上手 | 質問攻め・自分の話ばかり |
| バランス型 | 慎重 | 踏み込みすぎ・話題変更多い |

---

# 5. Hidden Goal 補正

Hidden Goal に自然に触れられなかった場合、該当項目から減点。

例:

- VALUE → 価値観に触れられない
- HOBBY → 趣味を深掘りできない

---

# 6. 採点方式

V2.5 と同様、**100点満点の減点方式**（加点禁止）。

性格適合の不足は `itemScores` と `characterAdaptationScore` の両方に反映。

---

# 7. 出力（JSON 追加）

| キー | 内容 |
| --- | --- |
| `characterAdaptationScore` | 性格適合度 0〜100 |
| `characterAdaptationStars` | 星 1〜5 |
| `characterAdaptationReason` | 適合理由 |
| `characterMismatches` | 合わなかった点 |
| `howToTalkWithThisType` | このタイプとの話し方 |
| `characterNextFocus` | 次回意識すること（3件） |
| `characterFeedback` | 表示用総合テキスト |

---

# 8. 実装構成

```
EvaluationPromptBuilder
  └── EvaluationCharacterContextBuilder
        └── evaluationCharacterRules.ts

EvaluationAI
  └── EvaluationScoreProcessor（難易度補正・判定）
```

プロンプトへ `{{character_evaluation_context}}` として注入。
