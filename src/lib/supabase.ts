import { createClient } from "@supabase/supabase-js";

// 환경 변수에서 Supabase URL과 키 가져오기
// 개발 서버 재시작 후 환경 변수가 로드됩니다
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  "https://rcabqtxdauddztzulclu.supabase.co";
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjYWJxdHhkYXVkZHp0enVsY2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTg4ODQsImV4cCI6MjA3NzgzNDg4NH0.AGcQTnZ8dlRnACxERBNBWaypx-jAr0MFUKLww-1lA4M";

// 환경 변수 검증 (기본값이 설정되어 있으므로 항상 통과)
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage =
    "Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인하고 개발 서버를 재시작해주세요.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

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
