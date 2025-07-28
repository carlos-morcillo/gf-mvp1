export interface MarketplaceAgent {
  id: string;
  name: string;
  object: string;
  created: number;
  owned_by: string;
  info: Info;
  preset: boolean;
  actions: any[];
  filters: any[];
  tags: any[];
}

interface Info {
  id: string;
  user_id: string;
  base_model_id: string;
  name: string;
  params: Params;
  meta: Meta2;
  access_control: null;
  is_active: boolean;
  updated_at: number;
  created_at: number;
}

interface Meta2 {
  profile_image_url: string;
  description: null;
  capabilities: Capabilities;
  suggestion_prompts: null;
  tags: any[];
  toolIds: string[];
  knowledge: Knowledge[];
}

interface Knowledge {
  id: string;
  user_id: string;
  name: string;
  description: string;
  data: Data;
  meta: null;
  access_control: Accesscontrol;
  created_at: number;
  updated_at: number;
  user: User;
  files: File[];
  type: string;
}

interface File {
  id: string;
  meta: Meta;
  created_at: number;
  updated_at: number;
}

interface Meta {
  name: string;
  content_type: string;
  size: number;
  data: Data2;
  collection_name: string;
}

interface Data2 {}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_image_url: string;
}

interface Accesscontrol {
  read: Read;
  write: Read;
}

interface Read {
  group_ids: any[];
  user_ids: any[];
}

interface Data {
  file_ids: string[];
}

interface Capabilities {
  vision: boolean;
  file_upload: boolean;
  web_search: boolean;
  image_generation: boolean;
  code_interpreter: boolean;
  citations: boolean;
  usage: boolean;
}

interface Params {
  system: string;
}
