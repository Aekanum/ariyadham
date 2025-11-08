/**
 * Anjali reaction type definitions
 * Story 5.1: Anjali Button & Reactions
 */

/**
 * Anjali reaction interface
 */
export interface AnjaliReaction {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

/**
 * Anjali status response (from get_anjali_status function)
 */
export interface AnjaliStatusResponse {
  anjali_count: number;
  user_has_anjalied: boolean;
}

/**
 * Toggle anjali response (from toggle_anjali_reaction function)
 */
export interface ToggleAnjaliResponse {
  has_anjalied: boolean;
  anjali_count: number;
}

/**
 * API response for anjali endpoints
 */
export interface AnjaliApiResponse {
  success: boolean;
  data: ToggleAnjaliResponse | AnjaliStatusResponse;
  error?: string;
}
