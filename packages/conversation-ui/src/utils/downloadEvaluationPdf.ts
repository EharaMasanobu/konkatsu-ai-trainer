import type { Evaluation } from "@konkatsu/shared-types";

import {
  EVALUATION_ITEM_LABELS,
  EVALUATION_ITEM_MAX,
} from "../constants/evaluationScoring";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMultiline(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function listItems(items: string[]): string {
  if (items.length === 0) {
    return "<p class='muted'>なし</p>";
  }
  return `<ul>${items.map((item) => `<li>${formatMultiline(item)}</li>`).join("")}</ul>`;
}

export function buildEvaluationReportHtml(evaluation: Evaluation): string {
  const itemRows = (
    Object.entries(EVALUATION_ITEM_LABELS) as Array<
      [keyof typeof EVALUATION_ITEM_LABELS, string]
    >
  )
    .map(
      ([key, label]) => `
      <tr>
        <td>${escapeHtml(label)}</td>
        <td class="score">${evaluation.itemScores[key]} / ${EVALUATION_ITEM_MAX[key]}</td>
      </tr>`,
    )
    .join("");

  const improvements = evaluation.improvements
    .map(
      (item, index) => `
      <div class="card">
        <h4>${index + 1}. ${escapeHtml(item.title)}</h4>
        <p>${formatMultiline(item.reason)}</p>
        <blockquote>「${escapeHtml(item.userQuote)}」</blockquote>
        <p class="label">模範回答</p>
        <p>${formatMultiline(item.modelAnswer)}</p>
      </div>`,
    )
    .join("");

  const dateLabel = new Date().toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <title>婚活AIトレーナー 会話結果</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      color: #18181b;
      font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", Meiryo, sans-serif;
      font-size: 13px;
      line-height: 1.7;
      background: #fff;
    }
    h1 { font-size: 22px; margin: 0 0 8px; }
    h2 {
      font-size: 16px;
      margin: 28px 0 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #f43f5e;
    }
    h3 { font-size: 14px; margin: 18px 0 8px; }
    h4 { font-size: 13px; margin: 0 0 8px; }
    p { margin: 0 0 10px; }
    .meta { color: #71717a; font-size: 12px; margin-bottom: 24px; }
    .hero {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .score-box, .romance-box {
      flex: 1;
      min-width: 220px;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 16px 18px;
    }
    .score-value {
      font-size: 40px;
      font-weight: 700;
      color: #e11d48;
      line-height: 1.1;
    }
    .romance-value {
      font-size: 20px;
      font-weight: 700;
      color: #6d28d9;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    th, td {
      border-bottom: 1px solid #e4e4e7;
      padding: 8px 6px;
      text-align: left;
    }
    td.score { text-align: right; font-weight: 600; white-space: nowrap; }
    .card {
      border: 1px solid #e4e4e7;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 12px;
      background: #fafafa;
    }
    blockquote {
      margin: 10px 0;
      padding: 8px 12px;
      border-left: 3px solid #fb923c;
      background: #fff7ed;
      color: #9a3412;
    }
    .label { font-size: 11px; font-weight: 700; color: #2563eb; margin-bottom: 4px; }
    ul { margin: 0; padding-left: 1.2em; }
    li { margin-bottom: 6px; }
    .muted { color: #a1a1aa; }
    @media print {
      body { padding: 12mm; }
      .card, .score-box, .romance-box { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>婚活AIトレーナー 会話結果</h1>
  <p class="meta">作成日時: ${escapeHtml(dateLabel)}</p>

  <div class="hero">
    <div class="score-box">
      <p class="muted">会話スコア</p>
      <div class="score-value">${evaluation.score}</div>
      <p>/ 100点</p>
      <p>${escapeHtml(evaluation.bandLabel)}</p>
      <p>判定: ${escapeHtml(evaluation.verdict)}（★${evaluation.stars}）</p>
      <p>また会いたい確率: ${evaluation.remeetProbability}%</p>
    </div>
    <div class="romance-box">
      <p class="muted">恋愛判定</p>
      <div class="romance-value">${escapeHtml(evaluation.romance.verdictLabel)}</div>
      <p class="muted">会話スコアとは別の、恋愛対象としての印象</p>
    </div>
  </div>

  <h2>項目別スコア</h2>
  <table>
    <thead>
      <tr><th>項目</th><th class="score">点数</th></tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <h2>総評</h2>
  <p>${formatMultiline(evaluation.summary)}</p>

  <h2>女性心理</h2>
  <p>${formatMultiline(evaluation.femalePsychology)}</p>

  <h2>恋愛判定の詳細</h2>
  <h3>理由</h3>
  ${listItems(evaluation.romance.reasons)}
  <h3>改善点</h3>
  ${listItems(evaluation.romance.improvements)}

  <h2>性格への適合度</h2>
  <p><strong>${evaluation.characterAdaptationScore} / 100</strong>（★${evaluation.characterAdaptationStars}）</p>
  <p>${formatMultiline(evaluation.characterAdaptationReason)}</p>
  <h3>性格に合わなかった点</h3>
  ${listItems(evaluation.characterMismatches)}
  <h3>このタイプの女性ともっと自然に話すには</h3>
  <p>${formatMultiline(evaluation.howToTalkWithThisType)}</p>
  <h3>次回意識すること</h3>
  ${listItems(evaluation.characterNextFocus)}
  ${
    evaluation.characterFeedback
      ? `<h3>性格適合フィードバック</h3><p>${formatMultiline(evaluation.characterFeedback)}</p>`
      : ""
  }

  <h2>改善ポイント</h2>
  ${improvements || "<p class='muted'>なし</p>"}

  <h2>次回の課題</h2>
  ${listItems(evaluation.nextChallenges)}
</body>
</html>`;
}

export function downloadEvaluationPdf(evaluation: Evaluation): void {
  const html = buildEvaluationReportHtml(evaluation);
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");

  if (!printWindow) {
    throw new Error(
      "ポップアップがブロックされました。ブラウザの設定を確認して再度お試しください。",
    );
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  if (printWindow.document.readyState === "complete") {
    window.setTimeout(triggerPrint, 250);
  } else {
    printWindow.addEventListener("load", () => {
      window.setTimeout(triggerPrint, 250);
    });
  }
}
