import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';

/**
 * Access control entry describing users or groups with a given permission.
 */
export interface AccessControlEntry {
  group_ids: string[];
  user_ids: string[];
}

/**
 * Full access control information for an agent or knowledge base.
 */
export interface AccessControl {
  read: AccessControlEntry;
  write: AccessControlEntry;
}

/**
 * Parameters passed to the model when executing the agent.
 */
export interface AgentParams {
  system: string;
  [key: string]: any;
}

/**
 * Capabilities supported by an agent. Each property indicates whether the
 * capability is enabled.
 */
export interface AgentCapabilities {
  vision: boolean;
  file_upload: boolean;
  web_search: boolean;
  image_generation: boolean;
  code_interpreter: boolean;
  citations: boolean;
  usage: boolean;
  [key: string]: boolean;
}

/**
 * Metadata attached to an agent. It contains auxiliary information like
 * description, capabilities or linked knowledge bases.
 */
export interface AgentMeta {
  profile_image_url: string;
  description: string;
  capabilities: AgentCapabilities;
  suggestion_prompts: any[];
  tags: string[];
  knowledge: KnowledgeBase[];
  [key: string]: any;
}

/**
 * Basic information about a user linked to an agent or knowledge item.
 */
export interface AgentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_image_url: string;
}

/**
 * Full Agent definition used by the backend. The structure mirrors the
 * payload returned by and sent to the API.
 */
export interface Agent {
  id: string;
  user_id: string;
  base_model_id: string;
  name: string;
  params: AgentParams;
  meta: AgentMeta;
  access_control: AccessControl;
  is_active: boolean;
  updated_at: number;
  created_at: number;
  user?: AgentUser;
  avatar?: any;
  type?: any;
  preset?: boolean;
}
