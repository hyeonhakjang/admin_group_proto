import React from "react";
import "./HomeScreen.css";

// 이미지 상수들 (피그마에서 다운로드한 실제 아이콘들)
const imgTrailingIcon2 = "/search-icon.png"; // 검색 아이콘
const imgTrailingIcon1 = "/alarm-icon.png"; // 알림 아이콘
const imgIcon = "/home.png"; // 홈 아이콘
const imgIcon1 = "/community.png"; // 커뮤니티 아이콘
const imgIcon2 = "/myclub.png"; // 내 클럽 아이콘
const imgIcon3 = "/booking.png"; // 예약/구매 아이콘
const imgIcon4 = "/chat.png"; // 채팅 아이콘

// Props 인터페이스
interface HomeScreenProps {
  onScreenChange: (screen: "home" | "community" | "myclub") => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onScreenChange }) => {
  return (
    <div className="home-screen" data-name="홈 화면" data-node-id="9:2">
      {/* Header Navigation Bar */}
      <div
        className="header-nav-bar"
        data-name="Header Navigation Bar With Title"
        data-node-id="9:627"
      >
        {/* Navigation Bar */}
        <div
          className="nav-bar"
          data-name="Navigation Bar"
          data-node-id="9:629"
        >
          <p className="nav-title" data-node-id="9:632">
            홍익대 ▼
          </p>
          <div
            className="trailing-icons"
            data-name="Trailing Icon"
            data-node-id="9:633"
          >
            <div
              className="trailing-icon"
              data-name="trailingIcon2?"
              data-node-id="9:657"
            >
              <img
                alt="Trailing Icon 2"
                className="icon"
                src={imgTrailingIcon2}
              />
            </div>
            <div
              className="trailing-icon"
              data-name="trailingIcon1?"
              data-node-id="9:640"
            >
              <img
                alt="Trailing Icon 1"
                className="icon"
                src={imgTrailingIcon1}
              />
            </div>
            <div
              className="profile-icon"
              data-name="profileIcon"
              data-node-id="9:641"
            >
              <img
                alt="Profile Icon"
                className="icon"
                src="/profile-icon.png"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="main-content"
        data-name="Main Content"
        data-node-id="9:157"
      />

      {/* Bottom Tab Bar */}
      <div
        className="bottom-tab-bar"
        data-name="Bottom Tab Bar with Labels"
        data-node-id="9:462"
      >
        <div className="tabs" data-name="tabs" data-node-id="9:463">
          {/* Home Tab */}
          <div className="tab active" data-name="tab1" data-node-id="9:603">
            <div className="tab-icon" data-name="Icon" data-node-id="9:614">
              <img alt="Home Icon" className="icon" src={imgIcon} />
            </div>
            <p className="tab-label active" data-node-id="9:605">
              홈
            </p>
          </div>

          {/* Community Tab */}
          <div
            className="tab"
            data-name="tab2"
            data-node-id="9:559"
            onClick={() => onScreenChange("community")}
          >
            <div className="tab-icon" data-name="Icon" data-node-id="9:577">
              <img alt="Community Icon" className="icon" src={imgIcon1} />
            </div>
            <p className="tab-label" data-node-id="9:561">
              커뮤니티
            </p>
          </div>

          {/* My Club Tab */}
          <div
            className="tab"
            data-name="tab3?"
            data-node-id="9:524"
            onClick={() => onScreenChange("myclub")}
          >
            <div className="tab-icon" data-name="Icon" data-node-id="9:534">
              <img alt="My Club Icon" className="icon" src={imgIcon2} />
            </div>
            <p className="tab-label" data-node-id="9:526">
              내 동아리
            </p>
          </div>

          {/* Booking/Purchase Tab */}
          <div className="tab" data-name="tab4?" data-node-id="9:499">
            <div className="tab-icon" data-name="Icon" data-node-id="9:508">
              <img alt="Booking Icon" className="icon" src={imgIcon3} />
            </div>
            <p className="tab-label" data-node-id="9:501">
              예약/구매
            </p>
          </div>

          {/* Chat Tab */}
          <div className="tab" data-name="tab5?" data-node-id="9:479">
            <div className="tab-icon" data-name="Icon" data-node-id="9:486">
              <img alt="Chat Icon" className="icon" src={imgIcon4} />
            </div>
            <p className="tab-label" data-node-id="9:481">
              채팅
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
