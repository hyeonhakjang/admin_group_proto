import { createClient } from "@supabase/supabase-js";

// 환경 변수에서 Supabase URL과 키 가져오기
// 개발 서버 재시작 후 환경 변수가 로드됩니다
// 환경 변수가 없을 경우 기본값 사용 (개발 편의용)
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  "https://rcabqtxdauddztzulclu.supabase.co";
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjYWJxdHhkYXVkZHp0enVsY2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTg4ODQsImV4cCI6MjA3NzgzNDg4NH0.AGcQTnZ8dlRnACxERBNBWaypx-jAr0MFUKLww-1lA4M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export interface PersonalUser {
  id?: number;
  personal_user_name: string;
  password: string;
  email: string;
  personal_name: string;
  university?: string;
  profile_image_url?: string;
  birthdate?: string;
  student_num?: string;
  department?: string;
  phone_num?: string;
  refresh_token?: string;
  univ_id?: number;
}

export interface ClubUser {
  id?: number;
  club_user_name: string;
  password: string;
  club_name: string;
  club_email: string;
  manager_name: string;
  manager_phone_num?: string;
  manager_student_num?: string;
  manager_department?: string;
  approved: number;
  refresh_token?: string;
  group_user_id?: number;
}

export interface GroupUser {
  id?: number;
  group_user_name: string;
  password: string;
  group_name: string;
  group_email: string;
  manager_name: string;
  manager_phone_num?: string;
  manager_student_num?: string;
  manager_department?: string;
  approved: boolean;
  refresh_token?: string;
  univ_id?: number;
}
