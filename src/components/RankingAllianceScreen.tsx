import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import "./RankingAllianceScreen.css";

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

const sampleClubs = [
  {
    id: 1,
    name: "HICC",
    category: "학술",
    activityScore: 850,
    logo: "/profile-icon.png",
  },
  {
    id: 2,
    name: "브레인스워즈",
    category: "학술",
    activityScore: 720,
    logo: "/profile-icon.png",
  },
  {
    id: 3,
    name: "VOERA",
    category: "공연",
    activityScore: 680,
    logo: "/profile-icon.png",
  },
];

const RankingAllianceScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClubs = sampleClubs
    .filter((club) => {
      const matchCategory =
        selectedCategory === "전체" || club.category === selectedCategory;
      const matchSearch = club.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => b.activityScore - a.activityScore);

  return (
    <div className="ranking-alliance-screen">
      {/* 헤더: 뒤로가기 버튼 */}
      <div className="ranking-header-back">
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

      <div className="ranking-list">
        {filteredClubs.map((club, index) => (
          <div
            key={club.id}
            className="ranking-item"
            onClick={() => navigate(`/community/club/${club.id}`)}
          >
            <span className="ranking-number">{index + 1}</span>
            <div className="ranking-club-logo">
              <img src={club.logo} alt={club.name} />
            </div>
            <div className="ranking-club-info">
              <h3 className="ranking-club-name">{club.name}</h3>
              <span className="ranking-club-category">{club.category}</span>
            </div>
            <span className="ranking-score">{club.activityScore}</span>
          </div>
        ))}
      </div>

      <BottomTabBar />
    </div>
  );
};

export default RankingAllianceScreen;
