import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<"find-clubs" | "community-board">(
    "find-clubs"
  );

  const handleTabClick = (tab: "find-clubs" | "community-board") => {
    setActiveTab(tab);
  };
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
            <div
              className={`tab ${activeTab === "find-clubs" ? "active" : ""}`}
              data-name="Tab"
              data-node-id="11:3345"
              onClick={() => handleTabClick("find-clubs")}
            >
              <div
                className={`tab-underline ${
                  activeTab === "find-clubs" ? "active" : ""
                }`}
                data-name="Underline"
                data-node-id="11:3347"
              >
                <p
                  className={`tab-text ${
                    activeTab === "find-clubs" ? "active" : ""
                  }`}
                  data-node-id="11:3348"
                >
                  동아리 찾기
                </p>
              </div>
            </div>

            {/* Community Board Tab */}
            <div
              className={`tab ${
                activeTab === "community-board" ? "active" : ""
              }`}
              data-name="Tab"
              data-node-id="11:3328"
              onClick={() => handleTabClick("community-board")}
            >
              <div
                className={`tab-underline ${
                  activeTab === "community-board" ? "active" : ""
                }`}
                data-name="Underline"
                data-node-id="11:3330"
              >
                <p
                  className={`tab-text ${
                    activeTab === "community-board" ? "active" : ""
                  }`}
                  data-node-id="11:3331"
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
        data-node-id="11:3039"
      >
        {activeTab === "find-clubs" && (
          <div className="find-clubs-content">
            {/* 교내 동아리 찾기 섹션 */}
            <div className="clubs-section">
              {/* 헤더 */}
              <div className="section-header">
                <h2 className="section-title">교내 동아리 찾기</h2>
                <button className="view-all-btn">더보기 &gt;</button>
              </div>

              {/* 동아리 리스트 */}
              <div className="clubs-list">
                {/* 동아리 1 */}
                <div className="club-item">
                  <div className="club-image">
                    <img src="/club1-image.png" alt="HICC LOGO" />
                  </div>
                  <div className="club-info">
                    <h3 className="club-name">HICC</h3>
                    <p className="club-description">
                      홍익대학교 컴퓨터동아리 HICC입니다.
                    </p>
                    <div className="club-details">
                      <span className="club-location">● 동아리</span>
                      <span className="club-field">학술</span>
                    </div>
                  </div>
                </div>

                {/* 동아리 2 */}
                <div className="club-item">
                  <div className="club-image">
                    <img src="/club2-image.png" alt="브레인스워즈 로고" />
                  </div>
                  <div className="club-info">
                    <h3 className="club-name">브레인스워즈</h3>
                    <p className="club-description">
                      홍익대학교 힙합 동아리 브레인스워즈입니다.
                    </p>
                    <div className="club-details">
                      <span className="club-location">● 동아리</span>
                      <span className="club-field">공연</span>
                    </div>
                  </div>
                </div>

                {/* 동아리 3 */}
                <div className="club-item">
                  <div className="club-image">
                    <img src="/club3-image.png" alt="VOERA 로고" />
                  </div>
                  <div className="club-info">
                    <h3 className="club-name">VOERA</h3>
                    <p className="club-description">
                      홍익대학교 금융 학회 동아리 VOERA입니다.
                    </p>
                    <div className="club-details">
                      <span className="club-location">● 동아리</span>
                      <span className="club-field">학술술</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 교내 동아리 랭킹 섹션 */}
            <div className="ranking-section">
              {/* 헤더 */}
              <div className="section-header">
                <h3 className="ranking-title">교내 동아리 랭킹</h3>
                <button className="view-all-btn">더보기 &gt;</button>
              </div>

              {/* 랭킹 리스트 */}
              <div className="ranking-list">
                {/* 1위 */}
                <div className="ranking-item">
                  <span className="ranking-number">1</span>
                  <div className="ranking-club-info">
                    <div className="ranking-club-name">HICC</div>
                    <div className="ranking-club-field">학술</div>
                  </div>
                  <span className="ranking-points">1,234점</span>
                </div>

                {/* 2위 */}
                <div className="ranking-item">
                  <span className="ranking-number">2</span>
                  <div className="ranking-club-info">
                    <div className="ranking-club-name">브레인스워즈</div>
                    <div className="ranking-club-field">공연</div>
                  </div>
                  <span className="ranking-points">987점</span>
                </div>

                {/* 3위 */}
                <div className="ranking-item">
                  <span className="ranking-number">3</span>
                  <div className="ranking-club-info">
                    <div className="ranking-club-name">VOERA</div>
                    <div className="ranking-club-field">학술</div>
                  </div>
                  <span className="ranking-points">876점</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "community-board" && (
          <div className="community-board-content">
            <h2>게시판</h2>
            <p>게시판 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        )}
      </div>

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
