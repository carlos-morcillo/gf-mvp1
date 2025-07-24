export interface Agent {
  id: string;
  user_id: string;
  base_model_id: string;
  name: string;
  params: Record<string, any>;
  meta: {
    profile_image_url: string;
    description: string;
    capabilities: Record<string, any>;
    [key: string]: any;
  };
  access_control: Record<string, any>;
  is_active: boolean;
  updated_at: number;
  created_at: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profile_image_url: string;
  };
}
