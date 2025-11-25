import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import {
  Song,
  DescribePlaylistRequest,
  DescribePlaylistResponse,
  RecommendSongsRequest,
  RecommendSongsResponse,
  GeneratePlaylistNameRequest,
  GeneratePlaylistNameResponse,
  AnalyzeMoodRequest,
  AnalyzeMoodResponse,
  SemanticSearchRequest,
  SemanticSearchResponse,
} from '../types/index.js';

export class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.AI_API_URL;
  }

  private async makeRequest<T>(endpoint: string, body: any): Promise<T> {
    let response: Response;
    
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new AppError(504, 'AI API request timeout. The service took too long to respond.');
      }
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new AppError(503, `AI API service unavailable. Could not connect to ${this.baseUrl}`);
      }
      throw new AppError(503, `Failed to connect to AI API: ${error.message || 'Unknown error'}`);
    }

    if (!response.ok) {
      let errorMessage = `AI API returned error status ${response.status}`;
      
      try {
        const errorData = await response.json() as { error?: string; message?: string };
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // Use default error message
        }
      }

      // Map HTTP status codes to appropriate error codes
      const statusCode = response.status >= 400 && response.status < 500 ? response.status : 502;
      throw new AppError(statusCode, `AI API error: ${errorMessage}`);
    }

    try {
      return await response.json() as T;
    } catch (error: any) {
      throw new AppError(502, `AI API returned invalid JSON response: ${error.message}`);
    }
  }

  async describePlaylist(songs: Song[]): Promise<DescribePlaylistResponse> {
    try {
      const request: DescribePlaylistRequest = { songs };
      return await this.makeRequest<DescribePlaylistResponse>('/describe-playlist', request);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, `Failed to describe playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async recommendSongs(
    currentSongs: Song[],
    numberOfRecommendations: number
  ): Promise<RecommendSongsResponse> {
    try {
      const request: RecommendSongsRequest = {
        current_songs: currentSongs,
        number_of_recommendations: numberOfRecommendations,
      };
      return await this.makeRequest<RecommendSongsResponse>('/recommend-songs', request);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, `Failed to get song recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePlaylistName(
    songs: Song[],
    style: 'creative' | 'descriptive' | 'fun'
  ): Promise<GeneratePlaylistNameResponse> {
    try {
      const request: GeneratePlaylistNameRequest = { songs, style };
      return await this.makeRequest<GeneratePlaylistNameResponse>('/generate-name', request);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, `Failed to generate playlist name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeMood(songs: Song[]): Promise<AnalyzeMoodResponse> {
    try {
      const request: AnalyzeMoodRequest = { songs };
      return await this.makeRequest<AnalyzeMoodResponse>('/analyze-mood', request);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, `Failed to analyze mood: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async semanticSearch(query: string, limit: number): Promise<SemanticSearchResponse> {
    try {
      const request: SemanticSearchRequest = { query, limit };
      return await this.makeRequest<SemanticSearchResponse>('/semantic-search', request);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, `Failed to perform semantic search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

