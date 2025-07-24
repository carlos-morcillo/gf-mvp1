export interface KnowledgeBase {
  id: string;
  user_id: string;
  name: string;
  description: string;
  data: Record<string, any>;
  meta: Record<string, any>;
  access_control: Record<string, any>;
  created_at: number;
  updated_at: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profile_image_url: string;
  };
  files: {
    id: string;
    meta: Record<string, any>;
    created_at: number;
    updated_at: number;
  }[];
}
