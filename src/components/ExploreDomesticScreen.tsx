import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, ClubCategory } from "../lib/supabase";
import "./ExploreDomesticScreen.css";

const categories = [
  "전체",
  "학술",
  "공연",
  "체육",
  "종교",
  "봉사",
  "문화",
  "기타",
];

const sortOptions = ["최신순", "인기순", "활동순", "이름순"];

// 동아리 인터페이스
interface Club {
  id: number;
  name: string;
  affiliation: string;
  description: string;
  category: ClubCategory | null;
  activityScore: number;
  isRecruiting: boolean;
  logo: string;
  created_at?: string;
}

const ExploreDomesticScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedAffiliation, setSelectedAffiliation] = useState("전체");
  const [showAffiliationDropdown, setShowAffiliationDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("최신순");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [affiliations, setAffiliations] = useState<string[]>(["전체"]);
  const [loading, setLoading] = useState(true);

  // 동아리 데이터 로드
  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      // 승인된 동아리만 가져오기 (교내 동아리만 - 총동아리연합회가 아닌 것들)
      const { data: clubUsers, error } = await supabase
        .from("club_user")
        .select(
          `
          id,
          club_name,
          category,
          recruiting,
          created_at,
          score,
          club_simple_explanation,
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

      // 소속 목록 추출 (중복 제거)
      const affiliationSet = new Set<string>(["전체"]);
      clubUsers.forEach((club: any) => {
        const affiliation = club.group_user?.group_name || "미지정";
        if (affiliation !== "총동아리연합회") {
          affiliationSet.add(affiliation);
        }
      });
      setAffiliations(Array.from(affiliationSet));

      // 각 동아리의 멤버 수 계산 및 데이터 변환
      const clubsWithMembers = await Promise.all(
        clubUsers
          .filter((club: any) => {
            // 교내 동아리만 (총동아리연합회 제외)
            const affiliation = club.group_user?.group_name || "미지정";
            return affiliation !== "총동아리연합회";
          })
          .map(async (club: any) => {
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
              affiliation: affiliation,
              description:
                club.club_simple_explanation ||
                `${club.group_user?.university?.univ_name || ""} ${
                  club.club_name
                }`,
              category: club.category || ("기타" as ClubCategory),
              activityScore: activityScore,
              isRecruiting: club.recruiting || false,
              logo: club.profile_image_url || "/profile-icon.png",
              created_at: club.created_at,
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

  // 필터링 및 정렬된 동아리 목록
  const filteredClubs = clubs
    .filter((club) => {
      const matchCategory =
        selectedCategory === "전체" || club.category === selectedCategory;
      const matchAffiliation =
        selectedAffiliation === "전체" ||
        club.affiliation === selectedAffiliation;
      const matchSearch =
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchAffiliation && matchSearch;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "최신순":
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        case "인기순":
          return b.activityScore - a.activityScore;
        case "활동순":
          return b.activityScore - a.activityScore;
        case "이름순":
          return a.name.localeCompare(b.name, "ko");
        default:
          return 0;
      }
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
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>로딩 중...</div>
        ) : filteredClubs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            검색 결과가 없습니다.
          </div>
        ) : (
          filteredClubs.map((club) => (
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
                  <span className="club-list-category">
                    {club.category || "기타"}
                  </span>
                  <span className="club-list-score">
                    활동점수: {club.activityScore}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default ExploreDomesticScreen;
