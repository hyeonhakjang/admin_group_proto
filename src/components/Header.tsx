import React, { useState } from "react";
import "./Header.css";

// 이미지 상수들
const imgTrailingIcon2 = "/search-icon.png"; // 검색 아이콘
const imgTrailingIcon1 = "/alarm-icon.png"; // 알림 아이콘

const Header: React.FC = () => {
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
    <>
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
    </>
  );
};

export default Header;
