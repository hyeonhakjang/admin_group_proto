import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import BottomTabBar from "./BottomTabBar";
import { supabase, ClubCategory } from "../lib/supabase";
import "./CommunityScreen.css";

// 동아리 인터페이스
interface Club {
  id: number;
  name: string;
  category: ClubCategory | null;
  description?: string;
  logo: string;
  cover: string;
  members: number;
  activityScore: number;
  isRecruiting: boolean;
  affiliation: string;
  externalLinks?: {
    instagram?: string;
    youtube?: string;
  };
}


const CommunityScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTopTab, setActiveTopTab] = useState<"find-clubs" | "board">(
    "find-clubs"
  );
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  // 동아리 데이터 로드
  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      // 승인된 동아리만 가져오기
      const { data: clubUsers, error } = await supabase
        .from("club_user")
        .select(
          `
          id,
          club_name,
          category,
          recruiting,
          score,
          profile_image_url,
          group_user_id,
          group_user:group_user_id (
            group_name,
            university:univ_id (
              univ_name
            )
          )
        `
        )
        .eq("approved", true);

      if (error) {
        console.error("동아리 로드 오류:", error);
        return;
      }

      if (!clubUsers) {
        setClubs([]);
        setLoading(false);
        return;
      }

      // 각 동아리의 멤버 수 계산
      const clubsWithMembers = await Promise.all(
        clubUsers.map(async (club: any) => {
          // club_personal 테이블에서 멤버 수 계산
          const { count: memberCount } = await supabase
            .from("club_personal")
            .select("*", { count: "exact", head: true })
            .eq("club_user_id", club.id)
            .eq("approved", true);

          // 활동 점수는 club_user의 score 우선, 없으면 멤버 수 * 10
          const activityScore = club.score || (memberCount || 0) * 10;

          // 소속 정보
          const affiliation = club.group_user?.group_name || "미지정";

          return {
            id: club.id,
            name: club.club_name,
            category: club.category || ("기타" as ClubCategory),
            description: `${club.group_user?.university?.univ_name || ""} ${
              club.club_name
            }`,
            logo: club.profile_image_url || "/profile-icon.png",
            cover: club.profile_image_url || "/profile-icon.png",
            members: memberCount || 0,
            activityScore: activityScore,
            isRecruiting: club.recruiting || false,
            affiliation: affiliation,
          };
        })
      );

      setClubs(clubsWithMembers);
    } catch (error) {
      console.error("동아리 로드 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };


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
                {loading ? (
                  <div>로딩 중...</div>
                ) : (
                  clubs
                    .filter((club) => club.affiliation !== "총동아리연합회")
                    .slice(0, 3)
                    .map((club) => (
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
                          <p className="club-card-desc">
                            {club.description || club.name}
                          </p>
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
                    ))
                )}
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
                {loading ? (
                  <div>로딩 중...</div>
                ) : (
                  clubs
                    .filter((club) => club.affiliation !== "총동아리연합회")
                    .sort((a, b) => b.activityScore - a.activityScore)
                    .slice(0, 3)
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
                    ))
                )}
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
                {loading ? (
                  <div>로딩 중...</div>
                ) : (
                  clubs
                    .filter((club) => club.affiliation === "총동아리연합회")
                    .slice(0, 3)
                    .map((club) => (
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
                          <p className="club-card-desc">
                            {club.description || club.name}
                          </p>
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
                    ))
                )}
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
                {loading ? (
                  <div>로딩 중...</div>
                ) : (
                  clubs
                    .filter((club) => club.affiliation === "총동아리연합회")
                    .sort((a, b) => b.activityScore - a.activityScore)
                    .slice(0, 3)
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
                    ))
                )}
              </div>
            </section>
          </>
        ) : (
          <div className="board-empty-state">
            <p>게시판 기능은 준비 중입니다.</p>
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
};

export default CommunityScreen;
