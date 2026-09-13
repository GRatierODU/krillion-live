export type TierId =
  | "plancton"
  | "trop_malin"
  | "banc"
  | "rare"
  | "coupe"
  | "krillion";

export type AnswerSpec = {
  display: string;
  aliases: string[];
  tier: TierId;
};

export type Prompt = {
  id: string;
  category: string;
  text: string;
  answers: AnswerSpec[];
};

export type Grade =
  | {
      ok: true;
      display: string;
      tier: TierId;
      points: number;
      meters: number;
    }
  | {
      ok: false;
      display: string;
      points: 0;
      meters: 0;
      reason: "timeout";
    };

export type DiveResult = {
  promptId: string;
  promptText: string;
  answer: string;
  grade: Grade;
  catalog: AnswerSpec[];
};

export type Phase =
  | "home"
  | "prompt"
  | "sink"
  | "result"
  | "handoff"
  | "review";
