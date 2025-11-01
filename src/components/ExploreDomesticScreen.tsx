import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import "./ExploreDomesticScreen.css";

const categories = [
  "전체",
  "학술",
  "공연",
  "스포츠",
  "종교",
  "봉사",
  "오락",
  "예술",
  "기타",
];
const affiliations = [
  "전체",
  "총동아리연합회",
  "경영대학 학생회",
  "공과대학 학생회",
  "문과대학 학생회",
];
const sortOptions = ["최신순", "인기순", "활동순", "이름순"];

const sampleClubs = [
  {
    id: 1,
    name: "HICC",
    affiliation: "총동아리연합회",
    description: "홍익대학교 컴퓨터공학 동아리",
    category: "학술",
    activityScore: 850,
    isRecruiting: true,
    logo: "/profile-icon.png",
  },
  {
    id: 2,
    name: "브레인스워즈",
    affiliation: "경영대학 학생회",
    description: "토론과 학술 활동을 하는 동아리",
    category: "학술",
    activityScore: 720,
    isRecruiting: true,
    logo: "/profile-icon.png",
  },
  {
    id: 3,
    name: "VOERA",
    affiliation: "총동아리연합회",
    description: "밴드 동아리",
    category: "공연",
    activityScore: 680,
    isRecruiting: false,
    logo: "/profile-icon.png",
  },
];

const ExploreDomesticScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedAffiliation, setSelectedAffiliation] = useState("전체");
  const [showAffiliationDropdown, setShowAffiliationDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("최신순");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClubs = sampleClubs.filter((club) => {
    const matchCategory =
      selectedCategory === "전체" || club.category === selectedCategory;
    const matchAffiliation =
      selectedAffiliation === "전체" ||
      club.affiliation === selectedAffiliation;
    const matchSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchAffiliation && matchSearch;
  });

  return (
    <div className="explore-domestic-screen">
      {/* 헤더: 뒤로가기 버튼 */}
      <div className="explore-header-back">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      {/* 검색 영역 */}
      <div className="search-section">
        <div className="search-container">
          <img src="/search-icon.png" alt="검색" className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="동아리 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Top Navigation: Categories */}
      <div className="category-tabs">
        {categories.map((category) => (
          <div
            key={category}
            className={`category-tab ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-wrapper">
          <button
            className="filter-btn"
            onClick={() => setShowAffiliationDropdown(!showAffiliationDropdown)}
          >
            소속: {selectedAffiliation} ▼
          </button>
          {showAffiliationDropdown && (
            <div className="dropdown-menu">
              {affiliations.map((aff) => (
                <div
                  key={aff}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedAffiliation(aff);
                    setShowAffiliationDropdown(false);
                  }}
                >
                  {aff}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="filter-wrapper">
          <button
            className="filter-btn"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            정렬: {selectedSort} ▼
          </button>
          {showSortDropdown && (
            <div className="dropdown-menu">
              {sortOptions.map((option) => (
                <div
                  key={option}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedSort(option);
                    setShowSortDropdown(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Club List */}
      <div className="club-list">
        {filteredClubs.map((club) => (
          <div
            key={club.id}
            className="club-list-item"
            onClick={() => navigate(`/community/club/${club.id}`)}
          >
            <div className="club-list-logo">
              <img src={club.logo} alt={club.name} />
            </div>
            <div className="club-list-info">
              <div className="club-list-header">
                <h3 className="club-list-name">{club.name}</h3>
                {club.isRecruiting && (
                  <span className="recruiting-badge">모집중</span>
                )}
              </div>
              <p className="club-list-affiliation">{club.affiliation}</p>
              <p className="club-list-description">{club.description}</p>
              <div className="club-list-footer">
                <span className="club-list-category">{club.category}</span>
                <span className="club-list-score">
                  활동점수: {club.activityScore}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomTabBar />
    </div>
  );
};

export default ExploreDomesticScreen;
