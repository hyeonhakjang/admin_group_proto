import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./HomeScreen.css";

// 이미지 상수들 (피그마에서 다운로드한 실제 아이콘들)
const imgTrailingIcon2 = "/search-icon.png"; // 검색 아이콘
const imgTrailingIcon1 = "/alarm-icon.png"; // 알림 아이콘
const imgIcon = "/home.png"; // 홈 아이콘
const imgIcon1 = "/community.png"; // 커뮤니티 아이콘
const imgIcon2 = "/myclub.png"; // 내 클럽 아이콘
const imgIcon3 = "/booking.png"; // 예약/구매 아이콘
const imgIcon4 = "/chat.png"; // 채팅 아이콘

const HomeScreen: React.FC = () => {
  const location = useLocation();
  const [selectedUniversity, setSelectedUniversity] = useState("홍익대");
  const [showUniversityModal, setShowUniversityModal] = useState(false);
  const [universitySearch, setUniversitySearch] = useState("");

  // 대학교 목록 (샘플 데이터)
  const universities = [
    "홍익대학교",
    "서울대학교",
    "연세대학교",
    "고려대학교",
    "한국과학기술원",
    "포스텍",
    "성균관대학교",
    "중앙대학교",
    "경희대학교",
    "한양대학교",
    "서강대학교",
    "이화여자대학교",
    "건국대학교",
    "동국대학교",
    "부산대학교",
    "경북대학교",
    "전남대학교",
    "충남대학교",
    "인하대학교",
    "아주대학교",
  ];

  const filteredUniversities = universities.filter((univ) =>
    univ.toLowerCase().includes(universitySearch.toLowerCase())
  );

  const handleUniversitySelect = (university: string) => {
    setSelectedUniversity(university.replace("학교", ""));
    setShowUniversityModal(false);
    setUniversitySearch("");
  };
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
          <p
            className="nav-title"
            data-node-id="9:632"
            onClick={() => setShowUniversityModal(true)}
            style={{ cursor: "pointer" }}
          >
            {selectedUniversity} ▼
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
          <Link
            to="/"
            className={`tab ${location.pathname === "/" ? "active" : ""}`}
            data-name="tab1"
            data-node-id="9:603"
          >
            <div className="tab-icon" data-name="Icon" data-node-id="9:614">
              <img alt="Home Icon" className="icon" src={imgIcon} />
            </div>
            <p
              className={`tab-label ${
                location.pathname === "/" ? "active" : ""
              }`}
              data-node-id="9:605"
            >
              홈
            </p>
          </Link>

          {/* Community Tab */}
          <Link
            to="/community"
            className={`tab ${
              location.pathname === "/community" ? "active" : ""
            }`}
            data-name="tab2"
            data-node-id="9:559"
          >
            <div className="tab-icon" data-name="Icon" data-node-id="9:577">
              <img alt="Community Icon" className="icon" src={imgIcon1} />
            </div>
            <p
              className={`tab-label ${
                location.pathname === "/community" ? "active" : ""
              }`}
              data-node-id="9:561"
            >
              커뮤니티
            </p>
          </Link>

          {/* My Club Tab */}
          <Link
            to="/myclub"
            className={`tab ${location.pathname === "/myclub" ? "active" : ""}`}
            data-name="tab3?"
            data-node-id="9:524"
          >
            <div className="tab-icon" data-name="Icon" data-node-id="9:534">
              <img alt="My Club Icon" className="icon" src={imgIcon2} />
            </div>
            <p
              className={`tab-label ${
                location.pathname === "/myclub" ? "active" : ""
              }`}
              data-node-id="9:526"
            >
              내 동아리
            </p>
          </Link>

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

      {/* 대학교 선택 모달 */}
      {showUniversityModal && (
        <>
          <div
            className="university-modal-overlay"
            onClick={() => {
              setShowUniversityModal(false);
              setUniversitySearch("");
            }}
          ></div>
          <div className="university-modal">
            <div className="university-modal-header">
              <h2 className="university-modal-title">소속 대학교 선택</h2>
              <button
                className="university-modal-close"
                onClick={() => {
                  setShowUniversityModal(false);
                  setUniversitySearch("");
                }}
              >
                ✕
              </button>
            </div>
            <div className="university-search-container">
              <img
                src="/search-icon.png"
                alt="검색"
                className="university-search-icon"
              />
              <input
                type="text"
                className="university-search-input"
                placeholder="대학교 검색"
                value={universitySearch}
                onChange={(e) => setUniversitySearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="university-list">
              {filteredUniversities.length > 0 ? (
                filteredUniversities.map((university, index) => (
                  <div
                    key={index}
                    className="university-item"
                    onClick={() => handleUniversitySelect(university)}
                  >
                    {university}
                  </div>
                ))
              ) : (
                <div className="university-empty">검색 결과가 없습니다</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomeScreen;
