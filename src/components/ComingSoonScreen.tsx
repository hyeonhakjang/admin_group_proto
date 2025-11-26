import React from "react";
import { useNavigate } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import "./ComingSoonScreen.css";

interface ComingSoonScreenProps {
  title: string;
  showBottomTabBar?: boolean;
}

const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({
  title,
  showBottomTabBar = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="coming-soon-screen" data-name="준비중 화면">
      {/* 헤더: 뒤로가기 버튼 */}
      <div className="coming-soon-header-back">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      <div className="coming-soon-content">
        <div className="coming-soon-icon">🚧</div>
        <h1 className="coming-soon-title">{title}</h1>
        <p className="coming-soon-message">준비중입니다</p>
        <p className="coming-soon-description">
          빠른 시일 내에 만나볼 수 있도록 준비하고 있습니다.
        </p>
        <button
          className="coming-soon-back-button"
          onClick={() => navigate(-1)}
        >
          이전 페이지로
        </button>
      </div>

      {showBottomTabBar && <BottomTabBar />}
    </div>
  );
};

export default ComingSoonScreen;
