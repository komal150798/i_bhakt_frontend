/**
 * Digital Twin API functions
 * Handles all digital twin-related API calls
 */

export interface TwinState {
  energy?: number;
  mood?: string;
  alignment?: number;
  aura?: string | { color: string; intensity: number; evolution_level: string };
  karma_score?: number;
  mfp_score?: number | null;
  highlights?: any;
  [key: string]: any;
}

/**
 * Get current digital twin state
 * @returns Promise<TwinState> Twin state with energy, mood, alignment, aura, etc.
 */
export function getTwinState(): Promise<any>;

declare const twinApi: {
  getTwinState: typeof getTwinState;
};

export default twinApi;

