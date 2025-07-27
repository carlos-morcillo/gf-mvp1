export interface AgentChat {
  id: string;
  user_id: string;
  title: string;
  chat: Chat;
  updated_at: number;
  created_at: number;
  share_id: null;
  archived: boolean;
  pinned: boolean;
  meta: Meta;
  folder_id: null;
}

interface Meta {
  profile_image_url: string | null;
}

export interface Chat {
  agentId: string;
  models: string[];
  messages: Message[];
}

export interface Message {
  /** Message role */
  role: 'system' | 'user' | 'assistant';
  /** Textual content of the message */
  content: string;
  id?: string;
  parentId?: string | null;
  childrenIds?: string[];
  timestamp?: number;
}
