import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import BottomTabBar from "./BottomTabBar";
import "./CommunityScreen.css";

// 샘플 동아리 데이터
const sampleClubs = [
  {
    id: 1,
    name: "HICC",
    category: "학술",
    description: "홍익대학교 컴퓨터공학 동아리",
    logo: "/profile-icon.png",
    cover: "/profile-icon.png",
    members: 120,
    activityScore: 850,
    isRecruiting: true,
    affiliation: "총동아리연합회",
    externalLinks: {
      instagram: "https://instagram.com/hicc",
      youtube: "https://youtube.com/hicc",
    },
  },
  {
    id: 2,
    name: "브레인스워즈",
    category: "학술",
    description: "토론과 학술 활동을 하는 동아리",
    logo: "/profile-icon.png",
    cover: "/profile-icon.png",
    members: 85,
    activityScore: 720,
    isRecruiting: true,
    affiliation: "경영대학 학생회",
  },
  {
    id: 3,
    name: "VOERA",
    category: "공연",
    description: "밴드 동아리",
    logo: "/profile-icon.png",
    cover: "/profile-icon.png",
    members: 45,
    activityScore: 680,
    isRecruiting: false,
    affiliation: "총동아리연합회",
  },
];

const CommunityScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTopTab, setActiveTopTab] = useState<"find-clubs" | "board">(
    "find-clubs"
  );

  return (
    <div className="community-screen" data-name="커뮤니티 화면">
      <Header />

      {/* Top Navigation */}
      <div className="top-navigation">
        <div className="top-nav-tabs">
          <div
            className={`top-nav-tab ${
              activeTopTab === "find-clubs" ? "active" : ""
            }`}
            onClick={() => setActiveTopTab("find-clubs")}
          >
            동아리 탐색
          </div>
          <div
            className={`top-nav-tab ${activeTopTab === "board" ? "active" : ""}`}
            onClick={() => setActiveTopTab("board")}
          >
            게시판
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="community-main-content">
        {activeTopTab === "find-clubs" ? (
          <>
            {/* Section A: 교내 동아리 찾기 */}
            <section className="community-section section-domestic">
              <div className="section-header">
                <h2 className="section-title">교내 동아리 찾기</h2>
                <button
                  className="more-btn"
                  onClick={() => navigate("/community/explore/domestic")}
                >
                  더보기
                </button>
              </div>
              <div className="club-cards-grid">
                {sampleClubs.slice(0, 3).map((club) => (
                  <div
                    key={club.id}
                    className="club-card"
                    onClick={() => navigate(`/community/club/${club.id}`)}
                  >
                    <div className="club-card-logo">
                      <img src={club.logo} alt={club.name} />
                    </div>
                    <div className="club-card-info">
                      <h3 className="club-card-name">{club.name}</h3>
                      <p className="club-card-desc">{club.description}</p>
                      <div className="club-card-meta">
                        <span className="club-card-category">{club.category}</span>
                        <span className="club-card-score">
                          활동점수: {club.activityScore}
                        </span>
                      </div>
                      {club.isRecruiting && (
                        <span className="recruiting-badge">모집중</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section B: 이번주 교내 동아리 랭킹 */}
            <section className="community-section section-ranking-domestic">
              <div className="section-header">
                <h2 className="section-title">이번주 교내 동아리 랭킹</h2>
                <button
                  className="more-btn"
                  onClick={() => navigate("/community/ranking/domestic")}
                >
                  더보기
                </button>
              </div>
              <div className="ranking-list">
                {sampleClubs
                  .slice(0, 3)
                  .sort((a, b) => b.activityScore - a.activityScore)
                  .map((club, index) => (
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
            </section>

            {/* Section C: 연합 동아리 찾기 */}
            <section className="community-section section-alliance">
              <div className="section-header">
                <h2 className="section-title">연합 동아리 찾기</h2>
                <button
                  className="more-btn"
                  onClick={() => navigate("/community/explore/alliance")}
                >
                  더보기
                </button>
              </div>
              <div className="club-cards-grid">
                {sampleClubs.slice(0, 3).map((club) => (
                  <div
                    key={club.id}
                    className="club-card"
                    onClick={() => navigate(`/community/club/${club.id}`)}
                  >
                    <div className="club-card-logo">
                      <img src={club.logo} alt={club.name} />
                    </div>
                    <div className="club-card-info">
                      <h3 className="club-card-name">{club.name}</h3>
                      <p className="club-card-desc">{club.description}</p>
                      <div className="club-card-meta">
                        <span className="club-card-category">{club.category}</span>
                        <span className="club-card-score">
                          활동점수: {club.activityScore}
                        </span>
                      </div>
                      {club.isRecruiting && (
                        <span className="recruiting-badge">모집중</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section D: 이번주 연합 동아리 랭킹 */}
            <section className="community-section section-ranking-alliance">
              <div className="section-header">
                <h2 className="section-title">이번주 연합 동아리 랭킹</h2>
                <button
                  className="more-btn"
                  onClick={() => navigate("/community/ranking/alliance")}
                >
                  더보기
                </button>
              </div>
              <div className="ranking-list">
                {sampleClubs
                  .slice(0, 3)
                  .sort((a, b) => b.activityScore - a.activityScore)
                  .map((club, index) => (
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
            </section>
          </>
        ) : (
          <div className="board-placeholder">
            <p>게시판 기능은 곧 업데이트됩니다.</p>
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
};

export default CommunityScreen;