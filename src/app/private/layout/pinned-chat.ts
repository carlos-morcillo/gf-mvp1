export interface PinnedChat {
  id: string;
  title: string;
  lastMessage?: string;
  lastActivity: Date;
  unreadCount?: number;
}
