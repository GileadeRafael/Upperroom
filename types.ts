
export type Mode = 'devocional' | 'estudo' | 'professor';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentMode: Mode;
}

export interface SavedMoment {
  id: string;
  title: string;
  content: string;
  mode: Mode;
  timestamp: number;
}
