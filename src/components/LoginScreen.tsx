import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LoginScreen.css";

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogin, setKeepLogin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 로그인 로직 구현 예정
    console.log("로그인 시도:", { userId, password, keepLogin });
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
        <div className="login-logo">로고</div>
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
          <button type="submit" className="login-btn">
            로그인
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

