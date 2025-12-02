import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./LoginScreen.css";

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogin, setKeepLogin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 관리자 계정 확인 (가장 먼저 확인)
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_user")
        .select("id, admin_user_name, password, admin_name, email")
        .eq("admin_user_name", userId)
        .single();

      if (!adminError && adminUser) {
        // 비밀번호 확인
        if (adminUser.password === password) {
          // 관리자 로그인 성공 - 세션 저장
          const userData = {
            type: "admin",
            id: adminUser.id,
            username: adminUser.admin_user_name,
            name: adminUser.admin_name,
            email: adminUser.email,
          };
          if (keepLogin) {
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            sessionStorage.setItem("user", JSON.stringify(userData));
          }
          navigate("/");
          return;
        }
      }

      // 개인 사용자 확인
      const { data: personalUser, error: personalError } = await supabase
        .from("personal_user")
        .select("id, personal_user_name, password, personal_name, email")
        .eq("personal_user_name", userId)
        .single();

      if (!personalError && personalUser) {
        // 비밀번호 확인 (실제로는 해시된 비밀번호와 비교해야 함)
        if (personalUser.password === password) {
          // 로그인 성공 - 세션 저장
          const userData = {
            type: "personal",
            id: personalUser.id,
            username: personalUser.personal_user_name,
            name: personalUser.personal_name,
            email: personalUser.email,
          };
          if (keepLogin) {
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            sessionStorage.setItem("user", JSON.stringify(userData));
          }
          navigate("/");
          return;
        }
      }

      // 클럽 사용자 확인
      const { data: clubUser, error: clubError } = await supabase
        .from("club_user")
        .select("id, club_user_name, password, club_name, club_email, approved")
        .eq("club_user_name", userId)
        .single();

      if (!clubError && clubUser) {
        if (clubUser.password === password) {
          // 승인 상태 확인 (approved가 false이면 미승인)
          if (clubUser.approved === false) {
            setError(
              "아직 승인되지 않은 계정입니다.\n캠퍼스 공식 계정의 승인을 기다려주세요."
            );
            return;
          }
          const userData = {
            type: "club",
            id: clubUser.id,
            username: clubUser.club_user_name,
            name: clubUser.club_name,
            email: clubUser.club_email,
          };
          if (keepLogin) {
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            sessionStorage.setItem("user", JSON.stringify(userData));
          }
          navigate("/");
          return;
        }
      }

      // 그룹 사용자 확인
      const { data: groupUser, error: groupError } = await supabase
        .from("group_user")
        .select(
          "id, group_user_name, password, group_name, group_email, approved"
        )
        .eq("group_user_name", userId)
        .single();

      if (!groupError && groupUser) {
        if (groupUser.password === password) {
          // 승인 상태 확인 (approved가 false이면 미승인)
          if (groupUser.approved === false) {
            setError(
              "아직 승인되지 않은 계정입니다.\n관리자의 승인을 기다려주세요."
            );
            return;
          }
          const userData = {
            type: "group",
            id: groupUser.id,
            username: groupUser.group_user_name,
            name: groupUser.group_name,
            email: groupUser.group_email,
          };
          if (keepLogin) {
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            sessionStorage.setItem("user", JSON.stringify(userData));
          }
          navigate("/");
          return;
        }
      }

      // 모든 확인 실패
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } catch (err) {
      console.error("로그인 오류:", err);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: "kakao" | "naver" | "google") => {
    console.log(`${provider} 로그인 시도`);
    // 소셜 로그인 로직 구현 예정
    // 미가입자인 경우 회원가입 페이지로 이동
    // 임시로 미가입자로 가정하고 회원가입 페이지로 이동
    navigate("/signup/social-personal");
  };

  return (
    <div className="login-screen">
      {/* 섹션 A: 프로그램 로고 */}
      <div className="login-logo-section">
        <div className="login-logo">UNICLUB</div>
      </div>

      {/* 섹션 B: 아이디/비밀번호 입력 */}
      <div className="login-form-section">
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            className="login-input"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-input"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="login-options">
            <label className="keep-login-option">
              <input
                type="checkbox"
                checked={keepLogin}
                onChange={(e) => setKeepLogin(e.target.checked)}
              />
              <span>로그인 유지</span>
            </label>
            <div className="find-account">
              <Link to="/find-account" className="find-link">
                아이디/비밀번호 찾기
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* 섹션 C: 회원가입 */}
      <div className="signup-section">
        <button
          className="signup-btn"
          onClick={() => navigate("/signup/selection")}
        >
          회원가입
        </button>
      </div>

      {/* 섹션 D: 소셜 로그인 */}
      <div className="social-login-section">
        <button
          className="social-btn kakao"
          onClick={() => handleSocialLogin("kakao")}
        >
          카카오 로그인
        </button>
        <button
          className="social-btn naver"
          onClick={() => handleSocialLogin("naver")}
        >
          네이버 로그인
        </button>
        <button
          className="social-btn google"
          onClick={() => handleSocialLogin("google")}
        >
          구글 로그인
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
