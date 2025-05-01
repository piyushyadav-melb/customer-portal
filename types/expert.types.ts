export interface Expert {
  id: string;
  name: string;
  email: string;
  username: string;
  profile_picture_url: string;
  whatsapp_number: string;
  country: string;
  state: string;
  city: string;
  gender: string;
  consultation_language: string;
  consultation_charge: string;
  job_title: string;
  job_type: string;
  keywords: string[];
  age: number | null;
  intro_video_url: string;
  intro_video_title: string;
  is_expert_verified: boolean;
  problems_solved: number | null;
  created_at: string;
  category: string | null;
}

export interface ExpertMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

export interface ExpertResponse {
  status: boolean;
  message: string;
  data: {
    result: Expert[];
    meta: ExpertMeta;
  };
}

export interface ExpertState {
  experts: Expert[];
  loading: boolean;
  error: string | null;
  meta: ExpertMeta | null;
  filters: {
    searchText: string;
    country: string;
    state: string;
    city: string;
    gender: string;
    age: string;
    consultation_language: string;
    page: number;
    perPage: number;
  };
}
