import { createClient } from "@supabase/supabase-js";

// 환경 변수에서 Supabase URL과 키 가져오기
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

// 디버깅: 환경 변수 확인
console.log("Supabase URL:", supabaseUrl ? "설정됨" : "없음");
console.log("Supabase Key:", supabaseAnonKey ? "설정됨" : "없음");
console.log("모든 환경 변수:", Object.keys(process.env).filter(key => key.startsWith("REACT_APP_")));

// 환경 변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage =
    "Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인하고 개발 서버를 재시작해주세요.";
  console.error(errorMessage);
  console.error("현재 REACT_APP_SUPABASE_URL:", process.env.REACT_APP_SUPABASE_URL);
  console.error("현재 REACT_APP_SUPABASE_ANON_KEY:", process.env.REACT_APP_SUPABASE_ANON_KEY ? "설정됨" : "없음");
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
