export interface Image {
  id: string;
  title?: string;
  creator?: string;
  creator_url?: string;
  license: string;
  license_url: string;
  license_version: string;
  foreign_landing_url: string;
  url: string;
  thumbnail: string;
  source: string;
  tags?: Tag[];
  fields_matched?: string[];
  description?: string;
  width: number;
  height: number;
  attribution?: string;
  mature?: boolean;
  size?: string;
  filesize?: number;
  category?: string;
}

export interface PaginatedImageList {
  result_count: number;
  page_count: number;
  page_size: number;
  page: number;
  results: Image[];
  warnings?: any[];
}

export interface Tag {
  name: string;
  accuracy?: number;
  unstable__provider?: string;
}
