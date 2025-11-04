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

// 게시글 인터페이스
interface Post {
  id: number;
  clubId: number;
  clubName: string;
  clubLogo: string;
  clubAffiliation: string;
  title: string;
  content: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
}

// 샘플 게시글 데이터
const samplePosts: Post[] = [
  {
    id: 1,
    clubId: 1,
    clubName: "HICC",
    clubLogo: "/profile-icon.png",
    clubAffiliation: "총동아리연합회",
    title: "2024년 신입 부원 모집합니다!",
    content:
      "HICC에서 함께 성장할 신입 부원을 모집합니다. 웹 개발과 알고리즘에 관심이 있는 분들을 환영합니다.",
    createdAt: "2024-01-15",
    views: 245,
    likes: 32,
    comments: 12,
  },
  {
    id: 2,
    clubId: 2,
    clubName: "브레인스워즈",
    clubLogo: "/profile-icon.png",
    clubAffiliation: "경영대학 학생회",
    title: "토론 대회 개최 안내",
    content: "이번 주말에 토론 대회를 개최합니다. 많은 관심 부탁드립니다.",
    createdAt: "2024-01-14",
    views: 189,
    likes: 28,
    comments: 8,
  },
  {
    id: 3,
    clubId: 3,
    clubName: "VOERA",
    clubLogo: "/profile-icon.png",
    clubAffiliation: "총동아리연합회",
    title: "공연 연습 일정 공지",
    content:
      "다음 주 공연을 위한 연습 일정을 공지드립니다. 모든 부원분들의 참석 부탁드립니다.",
    createdAt: "2024-01-13",
    views: 156,
    likes: 19,
    comments: 5,
  },
  {
    id: 4,
    clubId: 1,
    clubName: "HICC",
    clubLogo: "/profile-icon.png",
    clubAffiliation: "총동아리연합회",
    title: "프로젝트 발표회 안내",
    content: "이번 학기 프로젝트 발표회를 개최합니다. 많은 관심 부탁드립니다.",
    createdAt: "2024-01-12",
    views: 312,
    likes: 45,
    comments: 18,
  },
  {
    id: 5,
    clubId: 2,
    clubName: "브레인스워즈",
    clubLogo: "/profile-icon.png",
    clubAffiliation: "경영대학 학생회",
    title: "학술 세미나 개최",
    content:
      "이번 주 금요일에 학술 세미나를 개최합니다. 주제는 '현대 경제학'입니다.",
    createdAt: "2024-01-11",
    views: 201,
    likes: 33,
    comments: 10,
  },
  {
    id: 6,
    clubId: 3,
    clubName: "VOERA",
    clubLogo: "/profile-icon.png",
    clubAffiliation: "총동아리연합회",
    title: "봄 콘서트 티켓 예매 안내",
    content: "봄 콘서트 티켓 예매가 시작되었습니다. 많은 관심 부탁드립니다!",
    createdAt: "2024-01-10",
    views: 278,
    likes: 52,
    comments: 24,
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
            className={`top-nav-tab ${
              activeTopTab === "board" ? "active" : ""
            }`}
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
                        <span className="club-card-category">
                          {club.category}
                        </span>
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
                        <span className="ranking-club-category">
                          {club.category}
                        </span>
                      </div>
                      <span className="ranking-score">
                        {club.activityScore}
                      </span>
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
                        <span className="club-card-category">
                          {club.category}
                        </span>
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
                        <span className="ranking-club-category">
                          {club.category}
                        </span>
                      </div>
                      <span className="ranking-score">
                        {club.activityScore}
                      </span>
                    </div>
                  ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Section A: 모집 게시판 */}
            <section className="community-section section-recruiting">
              <div className="section-header">
                <h2 className="section-title">모집 게시판</h2>
                <button className="more-btn" onClick={() => {}}>
                  더보기
                </button>
              </div>
              <div className="post-list">
                {samplePosts
                  .filter((post) => post.title.includes("모집"))
                  .slice(0, 3)
                  .map((post) => (
                    <div
                      key={post.id}
                      className="post-card"
                      onClick={() => navigate(`/community/post/${post.id}`)}
                    >
                      <div className="post-header">
                        <div className="post-club-info">
                          <img
                            src={post.clubLogo}
                            alt={post.clubName}
                            className="post-club-logo"
                          />
                          <span className="post-club-name">
                            {post.clubName}
                          </span>
                        </div>
                        <span className="post-date">{post.createdAt}</span>
                      </div>
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-content">{post.content}</p>
                      <div className="post-footer">
                        <span className="post-affiliation">
                          {post.clubAffiliation}
                        </span>
                        <div className="post-stats">
                          <span className="post-likes">
                            좋아요 {post.likes}
                          </span>
                          <span className="post-comments">
                            댓글 {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Section B: 홍보 게시판 */}
            <section className="community-section section-promotion">
              <div className="section-header">
                <h2 className="section-title">홍보 게시판</h2>
                <button className="more-btn" onClick={() => {}}>
                  더보기
                </button>
              </div>
              <div className="post-list">
                {samplePosts
                  .filter(
                    (post) =>
                      post.title.includes("공연") ||
                      post.title.includes("콘서트") ||
                      post.title.includes("발표")
                  )
                  .slice(0, 3)
                  .map((post) => (
                    <div
                      key={post.id}
                      className="post-card"
                      onClick={() => navigate(`/community/post/${post.id}`)}
                    >
                      <div className="post-header">
                        <div className="post-club-info">
                          <img
                            src={post.clubLogo}
                            alt={post.clubName}
                            className="post-club-logo"
                          />
                          <span className="post-club-name">
                            {post.clubName}
                          </span>
                        </div>
                        <span className="post-date">{post.createdAt}</span>
                      </div>
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-content">{post.content}</p>
                      <div className="post-footer">
                        <span className="post-affiliation">
                          {post.clubAffiliation}
                        </span>
                        <div className="post-stats">
                          <span className="post-likes">
                            좋아요 {post.likes}
                          </span>
                          <span className="post-comments">
                            댓글 {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Section C: 실시간 인기글 */}
            <section className="community-section section-popular">
              <div className="section-header">
                <h2 className="section-title">실시간 인기글</h2>
                <button className="more-btn" onClick={() => {}}>
                  더보기
                </button>
              </div>
              <div className="post-list">
                {samplePosts
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 3)
                  .map((post) => (
                    <div
                      key={post.id}
                      className="post-card"
                      onClick={() => navigate(`/community/post/${post.id}`)}
                    >
                      <div className="post-header">
                        <div className="post-club-info">
                          <img
                            src={post.clubLogo}
                            alt={post.clubName}
                            className="post-club-logo"
                          />
                          <span className="post-club-name">
                            {post.clubName}
                          </span>
                        </div>
                        <span className="post-date">{post.createdAt}</span>
                      </div>
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-content">{post.content}</p>
                      <div className="post-footer">
                        <span className="post-affiliation">
                          {post.clubAffiliation}
                        </span>
                        <div className="post-stats">
                          <span className="post-likes">
                            좋아요 {post.likes}
                          </span>
                          <span className="post-comments">
                            댓글 {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
};

export default CommunityScreen;
