import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import BottomTabBar from "./BottomTabBar";
import "./ClubDetailScreen.css";

// 샘플 동아리 데이터 (실제로는 API에서 가져올 데이터)
const sampleClubData = {
  id: 1,
  name: "HICC",
  category: "학술",
  description:
    "홍익대학교 컴퓨터공학 동아리로, 웹 개발, 알고리즘, 프로젝트 등 다양한 활동을 진행합니다.",
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
  calendar: [], // 일정 데이터는 MyClubScreen의 달력 컴포넌트 재사용
  feed: [
    { id: 1, image: "/profile-icon.png", caption: "정기 세션 진행 중" },
    { id: 2, image: "/profile-icon.png", caption: "프로젝트 발표" },
    { id: 3, image: "/profile-icon.png", caption: "동아리 MT" },
    { id: 4, image: "/profile-icon.png", caption: "해커톤 참가" },
  ],
};

const ClubDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [club, setClub] = useState(sampleClubData);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // 실제로는 API에서 동아리 데이터를 가져옴
  useEffect(() => {
    // setClub(fetchClubData(id));
  }, [id]);

  return (
    <div className="club-detail-screen">
      <Header />

      {/* Section Hero: 커버 이미지 */}
      <div className="club-hero-section">
        <img src={club.cover} alt={club.name} className="club-cover-image" />
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      {/* Main Content */}
      <div className="club-detail-content">
        {/* Section A: 로고 */}
        <div className="club-logo-section">
          <img src={club.logo} alt={club.name} className="club-logo" />
        </div>

        {/* Section B & C: 정보 + 통계 */}
        <div className="club-info-wrapper">
          <div className="club-info-section">
            <span className="club-category">{club.category}</span>
            <h1 className="club-name">{club.name}</h1>
          </div>
          <div className="club-stats-section">
            <div className="stat-item">
              <span className="stat-value">{club.members}</span>
              <span className="stat-label">멤버</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{club.activityScore}</span>
              <span className="stat-label">활동점수</span>
            </div>
          </div>
        </div>

        {/* Section D: 소개글 */}
        <div className="club-description-section">
          <p className="club-description">{club.description}</p>
        </div>

        {/* Section E: 외부 링크 */}
        {club.externalLinks && (
          <div className="club-links-section">
            {club.externalLinks.instagram && (
              <a
                href={club.externalLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link instagram"
              >
                Instagram
              </a>
            )}
            {club.externalLinks.youtube && (
              <a
                href={club.externalLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link youtube"
              >
                YouTube
              </a>
            )}
          </div>
        )}

        {/* Section F: 가입 신청 + 채팅 문의 */}
        <div className="club-action-section">
          <button
            className="join-btn"
            onClick={() => setShowJoinModal(true)}
            disabled={!club.isRecruiting}
          >
            가입 신청
          </button>
          <button className="chat-btn" onClick={() => navigate("/chat")}>
            채팅 문의
          </button>
        </div>

        {/* Section G: 일정 달력 */}
        <div className="club-calendar-section">
          <h2 className="section-title">동아리 일정</h2>
          <div className="calendar-placeholder">
            <p>일정 컴포넌트는 MyClubScreen의 달력을 재사용합니다.</p>
          </div>
        </div>

        {/* Section H: 활동 피드 */}
        <div className="club-feed-section">
          <h2 className="section-title">동아리 활동 피드</h2>
          <div className="feed-grid">
            {club.feed.map((item) => (
              <div key={item.id} className="feed-item">
                <img
                  src={item.image}
                  alt={item.caption}
                  className="feed-image"
                />
                <div className="feed-caption">{item.caption}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 가입 신청 모달 */}
      {showJoinModal && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowJoinModal(false)}
          ></div>
          <div className="join-modal">
            <div className="modal-header">
              <h2>가입 신청</h2>
              <button
                className="modal-close"
                onClick={() => setShowJoinModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>가입 신청서 폼이 여기에 표시됩니다.</p>
            </div>
          </div>
        </>
      )}

      <BottomTabBar />
    </div>
  );
};

export default ClubDetailScreen;
