// Shared types for Admin frontend
export type Course = {
  id: number;
  title: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
};

export type Lesson = {
  id: number;
  title: string;
  content?: string;
  material_link?: string;
  pdf_url?: string;
  sort_order?: number;
  created_at?: string;
};

export type Assignment = {
  id: number;
  title: string;
  description?: string;
  due_date?: string; // ISO string
  created_at?: string;
};

export type Enrollment = {
  id: number;
  user_id: number;
  course_id: number;
  status: string;
  enrolled_at: string;
};

export interface Program {
  id: number;
  title: string;
  description?: string;
  price: number;
  duration_days: number;
  is_active: boolean;
  created_at: string;
};
