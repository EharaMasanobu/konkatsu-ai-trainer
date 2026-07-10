export enum HiddenGoal {
  JOB = "JOB",
  HOLIDAY = "HOLIDAY",
  MARRIAGE = "MARRIAGE",
  FAMILY = "FAMILY",
  HOBBY = "HOBBY",
  VALUE = "VALUE",
  FOOD = "FOOD",
  TRAVEL = "TRAVEL",
  FUTURE = "FUTURE",
  LOVE = "LOVE",
}

const HIDDEN_GOAL_DESCRIPTIONS: Record<HiddenGoal, string> = {
  [HiddenGoal.JOB]: "相手の仕事や働き方について自然に知りたい",
  [HiddenGoal.HOLIDAY]: "相手の休日の過ごし方について自然に知りたい",
  [HiddenGoal.MARRIAGE]: "相手の結婚観について自然に知りたい",
  [HiddenGoal.FAMILY]: "相手の家族との関係や家族観について自然に知りたい",
  [HiddenGoal.HOBBY]: "相手の趣味や好きなことについて自然に知りたい",
  [HiddenGoal.VALUE]: "相手の大切にしている価値観について自然に知りたい",
  [HiddenGoal.FOOD]: "相手の食の好みや食事の楽しみ方について自然に知りたい",
  [HiddenGoal.TRAVEL]: "相手の旅行の好みや行きたい場所について自然に知りたい",
  [HiddenGoal.FUTURE]: "相手の将来の展望や生活イメージについて自然に知りたい",
  [HiddenGoal.LOVE]: "相手の恋愛観について自然に知りたい",
};

const HIDDEN_GOAL_VALUES = Object.values(HiddenGoal);

export function pickRandomHiddenGoal(): HiddenGoal {
  return HIDDEN_GOAL_VALUES[
    Math.floor(Math.random() * HIDDEN_GOAL_VALUES.length)
  ];
}

export function getHiddenGoalDescription(goal: HiddenGoal): string {
  return HIDDEN_GOAL_DESCRIPTIONS[goal];
}
