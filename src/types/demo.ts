export interface DemoHeader {
  demo_type: string;
  version: number;
  protocol: number;
  server: string;
  nick: string;
  map: string;
  game: string;
  duration: number;
  ticks: number;
  frames: number;
  signon: number;
}

export interface ChatMessage {
  kind: string;
  from: string;
  text: string;
  tick: number;
}

export interface User {
  classes: Record<string, number>;
  name: string;
  userId: number;
  steamId: string;
  team: 'red' | 'blue' | 'other';
}

export interface DeathEvent {
  weapon: string;
  victim: number;
  assister: number | null;
  killer: number;
  tick: number;
}

export interface Round {
  winner: 'red' | 'blue';
  length: number;
  end_tick: number;
}

export interface DemoData {
  header: DemoHeader;
  chat: ChatMessage[];
  users: Record<string, User>;
  deaths: DeathEvent[];
  rounds: Round[];
  startTick: number;
  intervalPerTick: number;
  pauses: any[];
}
