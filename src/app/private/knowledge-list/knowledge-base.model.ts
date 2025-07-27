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
  files: Array<File>;
}

interface File {
  id: string;
  meta: FileMeta;
  created_at: number;
  updated_at: number;
}

interface FileMeta {
  name: string;
  content_type: string;
  size: number;
  data: any;
  collection_name: string;
}
