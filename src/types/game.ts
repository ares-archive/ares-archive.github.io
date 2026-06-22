export interface Game {
  id: string;
  title: string;
  description: string;
  pearcryptLink: string;
  steamScreenshots: string[];
  bannerImage: string;
  videoUrl?: string;
  releaseDate: string;
  developer: string;
  publisher: string;
  tags: string[];
  genres?: string[]; // Added optional genres for filtering
  platforms: ('windows' | 'mac' | 'linux')[];
}

export interface AdminState {
  isAuthenticated: boolean;
  token: string | null;
}
