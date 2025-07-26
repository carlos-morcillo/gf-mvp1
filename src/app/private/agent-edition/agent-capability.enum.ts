/**
 * Enum listing the available agent capabilities. The string values match the
 * payload keys used by the backend service.
 */
export enum AgentCapability {
  VISION = 'vision',
  FILE_UPLOAD = 'file_upload',
  WEB_SEARCH = 'web_search',
  IMAGE_GENERATION = 'image_generation',
  CODE_INTERPRETER = 'code_interpreter',
  CITATIONS = 'citations',
  USAGE = 'usage',
}

/** Convenience array with all capability keys */
export const AGENT_CAPABILITIES = [
  AgentCapability.VISION,
  AgentCapability.FILE_UPLOAD,
  AgentCapability.WEB_SEARCH,
  AgentCapability.IMAGE_GENERATION,
  AgentCapability.CODE_INTERPRETER,
  AgentCapability.CITATIONS,
  AgentCapability.USAGE,
] as const;

