import { HiddenGoal } from "@engine/state/HiddenGoal";

export enum Topic {
  SELF_INTRODUCTION = "SELF_INTRODUCTION",
  WORK = "WORK",
  COMMUTE = "COMMUTE",
  HOLIDAY = "HOLIDAY",
  HOBBY = "HOBBY",
  FOOD = "FOOD",
  TRAVEL = "TRAVEL",
  FAMILY = "FAMILY",
  VALUES = "VALUES",
  MARRIAGE = "MARRIAGE",
  LOVE = "LOVE",
  FUTURE = "FUTURE",
  LIFESTYLE = "LIFESTYLE",
  PET = "PET",
  OTHER = "OTHER",
}

export const ALL_TOPICS = Object.values(Topic);

export const TOPIC_LABELS: Record<Topic, string> = {
  [Topic.SELF_INTRODUCTION]: "自己紹介",
  [Topic.WORK]: "仕事",
  [Topic.COMMUTE]: "通勤・働き方",
  [Topic.HOLIDAY]: "休日",
  [Topic.HOBBY]: "趣味",
  [Topic.FOOD]: "食べ物",
  [Topic.TRAVEL]: "旅行",
  [Topic.FAMILY]: "家族",
  [Topic.MARRIAGE]: "結婚観",
  [Topic.VALUES]: "価値観",
  [Topic.LOVE]: "恋愛観",
  [Topic.FUTURE]: "将来",
  [Topic.LIFESTYLE]: "ライフスタイル",
  [Topic.PET]: "ペット",
  [Topic.OTHER]: "その他",
};

/** 話題ごとに深掘りしたい内容（Prompt 用ヒント） */
export const TOPIC_NEXT_HINTS: Record<Topic, string> = {
  [Topic.SELF_INTRODUCTION]: "仕事や趣味など、自然な自己紹介を深める",
  [Topic.WORK]: "仕事内容・やりがい・働き方について聞く",
  [Topic.COMMUTE]: "通勤時間や勤務地、リモートワークの話",
  [Topic.HOLIDAY]: "休日の過ごし方やリフレッシュ方法",
  [Topic.HOBBY]: "趣味の詳細やきっかけ、一緒に楽しめるか",
  [Topic.FOOD]: "好きな料理・お店・食の好み",
  [Topic.TRAVEL]: "旅行の好みや行きたい場所",
  [Topic.FAMILY]: "家族との関係や家族観",
  [Topic.MARRIAGE]: "結婚観やパートナーに求めること",
  [Topic.VALUES]: "大切にしている価値観や譲れないこと",
  [Topic.LOVE]: "恋愛観やこれまでの経験（無理に深掘りしない）",
  [Topic.FUTURE]: "将来の展望や生活イメージ",
  [Topic.LIFESTYLE]: "生活リズムや理想の暮らし方",
  [Topic.PET]: "ペットの有無や動物への思い",
  [Topic.OTHER]: "会話の流れに合わせて自然に広げる",
};

/** 現話題から自然に繋がる次話題（TopicShift用） */
export const TOPIC_RELATIONS: Record<Topic, readonly Topic[]> = {
  [Topic.SELF_INTRODUCTION]: [Topic.WORK, Topic.HOBBY, Topic.HOLIDAY],
  [Topic.WORK]: [Topic.COMMUTE, Topic.HOLIDAY, Topic.FUTURE],
  [Topic.COMMUTE]: [Topic.WORK, Topic.LIFESTYLE, Topic.HOLIDAY],
  [Topic.HOLIDAY]: [Topic.HOBBY, Topic.TRAVEL, Topic.FOOD, Topic.LIFESTYLE],
  [Topic.HOBBY]: [Topic.TRAVEL, Topic.HOLIDAY, Topic.FOOD],
  [Topic.FOOD]: [Topic.HOLIDAY, Topic.TRAVEL, Topic.LIFESTYLE],
  [Topic.TRAVEL]: [Topic.HOLIDAY, Topic.FOOD, Topic.HOBBY],
  [Topic.FAMILY]: [Topic.VALUES, Topic.MARRIAGE, Topic.FUTURE],
  [Topic.VALUES]: [Topic.MARRIAGE, Topic.LOVE, Topic.FUTURE],
  [Topic.MARRIAGE]: [Topic.LOVE, Topic.FAMILY, Topic.FUTURE, Topic.VALUES],
  [Topic.LOVE]: [Topic.MARRIAGE, Topic.VALUES],
  [Topic.FUTURE]: [Topic.WORK, Topic.LIFESTYLE, Topic.MARRIAGE],
  [Topic.LIFESTYLE]: [Topic.HOLIDAY, Topic.FOOD, Topic.COMMUTE],
  [Topic.PET]: [Topic.HOBBY, Topic.FAMILY, Topic.LIFESTYLE],
  [Topic.OTHER]: [Topic.HOBBY, Topic.HOLIDAY, Topic.FOOD],
};

export const HIDDEN_GOAL_TO_TOPIC: Record<HiddenGoal, Topic> = {
  [HiddenGoal.JOB]: Topic.WORK,
  [HiddenGoal.HOLIDAY]: Topic.HOLIDAY,
  [HiddenGoal.MARRIAGE]: Topic.MARRIAGE,
  [HiddenGoal.FAMILY]: Topic.FAMILY,
  [HiddenGoal.HOBBY]: Topic.HOBBY,
  [HiddenGoal.VALUE]: Topic.VALUES,
  [HiddenGoal.FOOD]: Topic.FOOD,
  [HiddenGoal.TRAVEL]: Topic.TRAVEL,
  [HiddenGoal.FUTURE]: Topic.FUTURE,
  [HiddenGoal.LOVE]: Topic.LOVE,
};

export function getTopicLabel(topic: Topic): string {
  return TOPIC_LABELS[topic];
}

export function getTopicNextHint(topic: Topic): string {
  return TOPIC_NEXT_HINTS[topic];
}

export function getTopicInstruction(topic: Topic, depth: number): string {
  return `現在の話題は「${getTopicLabel(topic)}」です（深さ: ${depth}）。${getTopicNextHint(topic)}。この話題を自然に深掘りしてください。`;
}
