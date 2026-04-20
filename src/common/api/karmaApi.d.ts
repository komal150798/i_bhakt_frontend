/**
 * Karma API functions
 * Handles all karma-related API calls
 */

export interface KarmaData {
  action_text: string;
  timestamp?: string;
}

export interface KarmaEntry {
  id?: number;
  action_text?: string;
  score_delta?: number;
  timestamp?: string;
  [key: string]: any;
}

export interface KarmaDashboard {
  karma_score?: number;
  karma_grade?: string;
  trend?: string;
  total_actions?: number;
  summary?: {
    total_score?: number;
    positive_score?: number;
    negative_score?: number;
    [key: string]: any;
  };
  streak?: {
    current?: number;
    longest?: number;
    current_days?: number;
    longest_days?: number;
    level?: string;
    level_name?: string;
    next_level_threshold?: number;
    progress_to_next_level?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface KarmaSummary {
  total_score?: number;
  positive_score?: number;
  negative_score?: number;
  records?: KarmaEntry[];
  [key: string]: any;
}

/**
 * Add a new karma action (web: POST /customer/karma/add; app clients use /app/karma/input).
 * @param karmaData - { action_text, timestamp? }
 * @returns Promise<KarmaEntry> Created karma entry
 */
export function addKarmaAction(karmaData: KarmaData): Promise<KarmaEntry>;

/**
 * Get karma dashboard summary for authenticated user
 * Web: POST /customer/karma/dashboard only (app route is for native clients).
 * @returns Promise<KarmaDashboard> Karma dashboard data with streak information
 */
export function getKarmaDashboard(options?: { force?: boolean }): Promise<any>;

/**
 * Get karma summary for a user
 * @param userId - User ID (optional, defaults to authenticated user)
 * @returns Promise<KarmaSummary> Karma summary
 */
export function getKarmaSummary(userId?: number): Promise<KarmaSummary>;

/**
 * Get habit recommendations for a user
 * @param userId - User ID
 * @returns Promise<Object> Habit recommendations
 */
export function getHabitRecommendations(userId: number): Promise<any>;

/**
 * Get karma patterns for a user
 * @param userId - User ID
 * @returns Promise<Object> Pattern analysis
 */
export function getKarmaPatterns(userId: number): Promise<any>;

