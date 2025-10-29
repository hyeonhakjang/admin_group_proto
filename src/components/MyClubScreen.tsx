import React, { useState } from "react";
import "./MyClubScreen.css";

// 이미지 상수들 (피그마에서 다운로드한 실제 아이콘들)
const imgTrailingIcon2 = "/search-icon.png"; // 검색 아이콘
const imgTrailingIcon1 = "/alarm-icon.png"; // 알림 아이콘
const imgIcon = "/home.png"; // 홈 아이콘
const imgIcon1 = "/community.png"; // 커뮤니티 아이콘
const imgIcon2 = "/myclub.png"; // 내 클럽 아이콘
const imgIcon3 = "/booking.png"; // 예약/구매 아이콘
const imgIcon4 = "/chat.png"; // 채팅 아이콘

// Props 인터페이스
interface MyClubScreenProps {
  onScreenChange: (screen: "home" | "community" | "myclub") => void;
}

const MyClubScreen: React.FC<MyClubScreenProps> = ({ onScreenChange }) => {
  const [activeTab, setActiveTab] = useState<"my-clubs" | "club-board">(
    "my-clubs"
  );

  const handleTabClick = (tab: "my-clubs" | "club-board") => {
    setActiveTab(tab);
  };

  return (
    <div
      className="myclub-screen"
      data-name="내 동아리 화면"
      data-node-id="12:2999"
    >
      {/* Header Navigation Bar */}
      <div
        className="header-nav-bar"
        data-name="Header Navigation Bar With Title"
        data-node-id="12:3000"
      >
        {/* Navigation Bar */}
        <div
          className="nav-bar"
          data-name="Navigation Bar"
          data-node-id="12:3017"
        >
          <p className="nav-title" data-node-id="12:3019">
            홍익대 ▼
          </p>
          <div
            className="trailing-icons"
            data-name="Trailing Icon"
            data-node-id="12:3020"
          >
            <div
              className="trailing-icon"
              data-name="trailingIcon2?"
              data-node-id="12:3021"
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
              data-node-id="12:3034"
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

      {/* Inline Segment Tabs */}
      <div
        className="segment-tabs"
        data-name="Inline Segment Tabs Minimal with Icon"
        data-node-id="12:3315"
      >
        <div
          className="tabs-container"
          data-name="Tabs Minimal with Icon"
          data-node-id="12:3316"
        >
          <div className="tabs-wrapper">
            {/* My Clubs Tab */}
            <div
              className={`tab ${activeTab === "my-clubs" ? "active" : ""}`}
              data-name="Tab"
              data-node-id="12:3345"
              onClick={() => handleTabClick("my-clubs")}
            >
              <div
                className={`tab-underline ${
                  activeTab === "my-clubs" ? "active" : ""
                }`}
                data-name="Underline"
                data-node-id="12:3347"
              >
                <p
                  className={`tab-text ${
                    activeTab === "my-clubs" ? "active" : ""
                  }`}
                  data-node-id="12:3348"
                >
                  내 동아리
                </p>
              </div>
            </div>

            {/* Club Board Tab */}
            <div
              className={`tab ${activeTab === "club-board" ? "active" : ""}`}
              data-name="Tab"
              data-node-id="12:3328"
              onClick={() => handleTabClick("club-board")}
            >
              <div
                className={`tab-underline ${
                  activeTab === "club-board" ? "active" : ""
                }`}
                data-name="Underline"
                data-node-id="12:3330"
              >
                <p
                  className={`tab-text ${
                    activeTab === "club-board" ? "active" : ""
                  }`}
                  data-node-id="12:3331"
                >
                  게시판
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="main-content"
        data-name="Main Content"
        data-node-id="12:3039"
      >
        {activeTab === "my-clubs" && (
          <div className="my-clubs-content">
            <h2>내 동아리</h2>
            <p>내 동아리 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        )}
        {activeTab === "club-board" && (
          <div className="club-board-content">
            <h2>게시판</h2>
            <p>게시판 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div
        className="bottom-tab-bar"
        data-name="Bottom Tab Bar with Labels"
        data-node-id="12:3040"
      >
        <div className="tabs" data-name="tabs" data-node-id="12:3041">
          {/* Home Tab */}
          <div
            className="tab"
            data-name="tab1"
            data-node-id="12:3042"
            onClick={() => onScreenChange("home")}
          >
            <div className="tab-icon" data-name="Icon" data-node-id="12:3043">
              <img alt="Home Icon" className="icon" src={imgIcon} />
            </div>
            <p className="tab-label" data-node-id="12:3052">
              홈
            </p>
          </div>

          {/* Community Tab */}
          <div
            className="tab"
            data-name="tab2"
            data-node-id="12:3053"
            onClick={() => onScreenChange("community")}
          >
            <div className="tab-icon" data-name="Icon" data-node-id="12:3054">
              <img alt="Community Icon" className="icon" src={imgIcon1} />
            </div>
            <p className="tab-label" data-node-id="12:3070">
              커뮤니티
            </p>
          </div>

          {/* My Club Tab */}
          <div className="tab active" data-name="tab3" data-node-id="12:3071">
            <div className="tab-icon" data-name="Icon" data-node-id="12:3072">
              <img alt="My Club Icon" className="icon" src={imgIcon2} />
            </div>
            <p className="tab-label active" data-node-id="12:3080">
              내 동아리
            </p>
          </div>

          {/* Booking/Purchase Tab */}
          <div className="tab" data-name="tab4?" data-node-id="12:3081">
            <div className="tab-icon" data-name="Icon" data-node-id="12:3082">
              <img alt="Booking Icon" className="icon" src={imgIcon3} />
            </div>
            <p className="tab-label" data-node-id="12:3089">
              예약/구매
            </p>
          </div>

          {/* Chat Tab */}
          <div className="tab" data-name="tab5?" data-node-id="12:3090">
            <div className="tab-icon" data-name="Icon" data-node-id="12:3091">
              <img alt="Chat Icon" className="icon" src={imgIcon4} />
            </div>
            <p className="tab-label" data-node-id="12:3096">
              채팅
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyClubScreen;

