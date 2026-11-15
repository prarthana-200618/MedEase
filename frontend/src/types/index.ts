export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  preferred_language: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DocumentItem {
  id: number;
  user_id?: number;
  access_token?: string;
  is_public: boolean;
  title: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: number;
  document_id: number;
  name: string;
  dosage?: string;
  frequency?: string;
  timing?: string;
  duration?: string;
  raw_line?: string;
  confidence_score: number;
  status: 'extracted' | 'needs_review' | 'patient_confirmed' | 'clinician_verified';
  user_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Flag {
  id: number;
  flag_type: string;
  description: string;
  severity: 'info' | 'warning' | 'high';
  medication_id?: number;
  created_at: string;
}

export interface Explanation {
  id: number;
  document_id: number;
  malayalam_summary: string;
  english_summary?: string;
  terminology_breakdown?: Array<{
    term: string;
    english_meaning?: string;
    malayalam_meaning: string;
    simple_explanation: string;
  }>;
  audio_url?: string;
  created_at: string;
}

export interface DocumentDetail extends DocumentItem {
  raw_texts: string[];
  medications: Medication[];
  flags: Flag[];
  explanation?: Explanation;
}

export interface Reminder {
  id: number;
  user_id: number;
  document_id?: number;
  medication_name: string;
  dosage?: string;
  frequency: string;
  time_of_day: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaregiverItem {
  id: number;
  patient_user_id: number;
  caregiver_email: string;
  caregiver_user_id?: number;
  status: 'pending' | 'accepted' | 'revoked';
  permissions: any;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}
