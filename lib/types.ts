export interface Job {
  id: string;
  name_hr: string;
  category_id?: string;
  translations?: Record<string, string>;
  image_url?: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  native_language?: string;
  eu_language?: string;
  current_job_id?: string;
  xp_points?: number;
  role?: 'worker' | 'agency' | 'admin';
  organization_id?: string;
}

export interface Word {
  id: string;
  word_hr: string;
  translations?: Record<string, string>;
  image_url?: string;
  audio_url?: string;
  job_id?: string;
}

export interface Category {
  id: string;
  name_hr: string;
  translations?: Record<string, string>;
  image_url?: string;
  icon_name?: string;
}