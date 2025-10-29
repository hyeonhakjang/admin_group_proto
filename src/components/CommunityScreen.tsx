import React from "react";
import "./CommunityScreen.css";

// 이미지 상수들 (피그마에서 다운로드한 실제 아이콘들)
const imgTrailingIcon2 = "/search-icon.png"; // 검색 아이콘
const imgTrailingIcon1 = "/alarm-icon.png"; // 알림 아이콘
const imgIcon = "/home.png"; // 홈 아이콘
const imgIcon1 = "/community.png"; // 커뮤니티 아이콘
const imgIcon2 = "/myclub.png"; // 내 클럽 아이콘
const imgIcon3 = "/booking.png"; // 예약/구매 아이콘
const imgIcon4 = "/chat.png"; // 채팅 아이콘

// Props 인터페이스
interface CommunityScreenProps {
  onScreenChange: (screen: "home" | "community") => void;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({
  onScreenChange,
}) => {
  return (
    <div
      className="community-screen"
      data-name="커뮤니티 화면"
      data-node-id="11:2999"
    >
      {/* Header Navigation Bar */}
      <div
        className="header-nav-bar"
        data-name="Header Navigation Bar With Title"
        data-node-id="11:3000"
      >
        {/* Navigation Bar */}
        <div
          className="nav-bar"
          data-name="Navigation Bar"
          data-node-id="11:3017"
        >
          <p className="nav-title" data-node-id="11:3019">
            홍익대 ▼
          </p>
          <div
            className="trailing-icons"
            data-name="Trailing Icon"
            data-node-id="11:3020"
          >
            <div
              className="trailing-icon"
              data-name="trailingIcon2?"
              data-node-id="11:3021"
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
              data-node-id="11:3034"
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
        data-node-id="11:3315"
      >
        <div
          className="tabs-container"
          data-name="Tabs Minimal with Icon"
          data-node-id="11:3316"
        >
          <div className="tabs-wrapper">
            {/* Find Clubs Tab */}
            <div className="tab active" data-name="Tab" data-node-id="11:3345">
              <div
                className="tab-underline active"
                data-name="Underline"
                data-node-id="11:3347"
              >
                <p className="tab-text active" data-node-id="11:3348">
                  Find Clubs
                </p>
              </div>
            </div>

            {/* Community Board Tab */}
            <div className="tab" data-name="Tab" data-node-id="11:3328">
              <div
                className="tab-underline"
                data-name="Underline"
                data-node-id="11:3330"
              >
                <p className="tab-text" data-node-id="11:3331">
                  Community Board
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
        data-node-id="11:3039"
      />

      {/* Bottom Tab Bar */}
      <div
        className="bottom-tab-bar"
        data-name="Bottom Tab Bar with Labels"
        data-node-id="11:3040"
      >
        <div className="tabs" data-name="tabs" data-node-id="11:3041">
          {/* Home Tab */}
          <div
            className="tab"
            data-name="tab1"
            data-node-id="11:3042"
            onClick={() => onScreenChange("home")}
          >
            <div className="tab-icon" data-name="Icon" data-node-id="11:3043">
              <img alt="Home Icon" className="icon" src={imgIcon} />
            </div>
            <p className="tab-label" data-node-id="11:3052">
              홈
            </p>
          </div>

          {/* Community Tab */}
          <div className="tab active" data-name="tab2" data-node-id="11:3053">
            <div className="tab-icon" data-name="Icon" data-node-id="11:3054">
              <img alt="Community Icon" className="icon" src={imgIcon1} />
            </div>
            <p className="tab-label active" data-node-id="11:3070">
              커뮤니티
            </p>
          </div>

          {/* My Club Tab */}
          <div className="tab" data-name="tab3?" data-node-id="11:3071">
            <div className="tab-icon" data-name="Icon" data-node-id="11:3072">
              <img alt="My Club Icon" className="icon" src={imgIcon2} />
            </div>
            <p className="tab-label" data-node-id="11:3080">
              내 동아리
            </p>
          </div>

          {/* Booking/Purchase Tab */}
          <div className="tab" data-name="tab4?" data-node-id="11:3081">
            <div className="tab-icon" data-name="Icon" data-node-id="11:3082">
              <img alt="Booking Icon" className="icon" src={imgIcon3} />
            </div>
            <p className="tab-label" data-node-id="11:3089">
              예약/구매
            </p>
          </div>

          {/* Chat Tab */}
          <div className="tab" data-name="tab5?" data-node-id="11:3090">
            <div className="tab-icon" data-name="Icon" data-node-id="11:3091">
              <img alt="Chat Icon" className="icon" src={imgIcon4} />
            </div>
            <p className="tab-label" data-node-id="11:3096">
              채팅
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityScreen;
