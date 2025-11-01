import React from "react";
import { useNavigate } from "react-router-dom";
import "./SignupSelectionScreen.css";

const SignupSelectionScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="signup-selection-screen">
      {/* 헤더: 뒤로가기 */}
      <div className="signup-selection-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      {/* 계정 타입 선택 */}
      <div className="account-type-selection">
        <h2 className="selection-title">계정 타입을 선택해주세요</h2>

        <button
          className="account-type-btn campus-official"
          onClick={() => navigate("/signup/campus-official")}
        >
          캠퍼스 공식 계정 가입
        </button>

        <button
          className="account-type-btn club"
          onClick={() => navigate("/signup/club")}
        >
          클럽 계정 가입
        </button>

        <button
          className="account-type-btn personal"
          onClick={() => navigate("/signup/personal")}
        >
          개인 계정 가입
        </button>
      </div>
    </div>
  );
};

export default SignupSelectionScreen;
