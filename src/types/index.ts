export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  year?: number;
  duration: number; // in seconds
  lyrics?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
  total_songs?: number; 
}

export interface PlaylistWithSongs extends Playlist {
  songs: Song[];
  total_duration: number; 
}

export interface PlaylistSong {
  playlist_id: string;
  song_id: string;
  position: number;
  added_at: string;
}

export interface DashboardStats {
  total_songs: number;
  total_playlists: number;
  unique_genres: number;
  unique_artists: number;
  songs_by_genre: { genre: string; count: number }[];
  songs_by_decade: { decade: string; count: number }[];
}

export interface AIRecommendation {
  title: string;
  artist: string;
  reason: string;
}

export interface ArtistInfo {
  name: string;
  total_songs: number;
  genres: string[];
}

// Request/Response types for AI endpoints
export interface DescribePlaylistRequest {
  songs: Song[];
}

export interface DescribePlaylistResponse {
  description: string;
}

export interface RecommendSongsRequest {
  current_songs: Song[];
  number_of_recommendations: number;
}

export interface RecommendSongsResponse {
  recommendations: AIRecommendation[];
}

export interface GeneratePlaylistNameRequest {
  songs: Song[];
  style: 'creative' | 'descriptive' | 'fun';
}

export interface GeneratePlaylistNameResponse {
  names: string[];
}

export interface AnalyzeMoodRequest {
  songs: Song[];
}

export interface AnalyzeMoodResponse {
  moods: string[];
  description: string;
}

export interface SemanticSearchRequest {
  query: string;
  limit: number;
}

export interface SemanticSearchResponse {
  songs: Song[];
  explanation: string;
}

