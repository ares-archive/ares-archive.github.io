export interface Game {
  id: string;
  title: string;
  description: string;
  developer: string;
  buzzheavierLink: string; // Aggiornato a Buzzheavier
  bannerImage: string;
  steamScreenshots: string[];
  videoUrl: string;
  releaseDate: string;
  isUpcoming: boolean;
  steamUrl: string;
  gogUrl: string;
  epicUrl: string;
  goldbergUrl?: string; // Aggiunto: link personalizzato Goldberg Emulator
  tags: string[];
  genres: string[];
  platforms: string[];
}