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

const CommunityScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTopTab, setActiveTopTab] = useState<"find-clubs" | "board">(
    "find-clubs"
  );
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  // 동아리 데이터 로드
  useEffect(() => {
    loadClubs();
    loadPosts();
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

  const loadPosts = async () => {
    try {
      // 게시글 데이터 로드 (club_personal_article 테이블에서)
      const { data: articles, error } = await supabase
        .from("club_personal_article")
        .select(
          `
          id,
          title,
          content,
          written_date,
          created_at,
          club_personal:club_personal_id (
            club_user:club_user_id (
              club_name,
              group_user:group_user_id (
                group_name
              )
            )
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("게시글 로드 오류:", error);
        return;
      }

      if (!articles) {
        setPosts([]);
        return;
      }

      // 게시글 데이터 변환
      const transformedPosts = await Promise.all(
        articles.map(async (article: any) => {
          // 좋아요 수
          const { count: likeCount } = await supabase
            .from("club_personal_like")
            .select("*", { count: "exact", head: true })
            .eq("club_personal_article_id", article.id);

          // 댓글 수
          const { count: commentCount } = await supabase
            .from("club_personal_comment")
            .select("*", { count: "exact", head: true })
            .eq("club_personal_article_id", article.id);

          const clubName =
            article.club_personal?.club_user?.club_name || "알 수 없음";
          const affiliation =
            article.club_personal?.club_user?.group_user?.group_name ||
            "미지정";

          return {
            id: article.id,
            clubId: article.club_personal?.club_user?.id || 0,
            clubName: clubName,
            clubLogo: "/profile-icon.png",
            clubAffiliation: affiliation,
            title: article.title || "",
            content: article.content || "",
            createdAt: article.written_date || article.created_at || "",
            views: 0, // 조회수는 별도 필드 필요
            likes: likeCount || 0,
            comments: commentCount || 0,
          };
        })
      );

      setPosts(transformedPosts);
    } catch (error) {
      console.error("게시글 로드 중 오류:", error);
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
                {posts
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
                {posts
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
                {posts
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
