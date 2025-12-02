export type AppState = "upload" | "processing" | "dashboard";

export interface Article {
  article_id: string;
  page: number;
  title: string;
  content: string;
  keywords: string[];
  hashtags: string[];
  crop_image_base64: string;
  related_articles: string[];
  created_at?: string;
}

export interface KeywordSummary {
  keyword: string;
  count: number;
}

export interface ProcessResult {
  job_id: string;
  pages: number;
  articles: Article[];
  keywords_summary: KeywordSummary[];
}

export interface JobStatus {
  status: "pending" | "processing" | "completed" | "failed";
  step: string;
  progress: number;
  error?: string;
}

export interface ProcessResponse {
  job_id: string;
  message: string;
}
