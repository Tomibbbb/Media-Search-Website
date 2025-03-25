export interface Audio {
  id: string;
  title?: string;
  creator?: string;
  creator_url?: string;
  license: string;
  license_url: string;
  license_version: string;
  foreign_landing_url: string;
  url: string;
  thumbnail?: string;
  source: string;
  tags?: Tag[];
  fields_matched?: string[];
  description?: string;
  duration?: number;
  bit_rate?: number;
  sample_rate?: number;
  genres?: string[];
  audio_set?: string;
  filesize?: number;
  mature?: boolean;
  alt_files?: AltFile[];
  attribution?: string;
}

export interface PaginatedAudioList {
  result_count: number;
  page_count: number;
  page_size: number;
  page: number;
  results: Audio[];
  warnings?: any[];
}

export interface Tag {
  name: string;
  accuracy?: number;
  unstable__provider?: string;
}

export interface AltFile {
  url: string;
  filesize?: number;
  bit_rate?: number;
}
