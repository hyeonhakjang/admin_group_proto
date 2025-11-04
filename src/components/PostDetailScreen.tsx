import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import BottomTabBar from "./BottomTabBar";
import "./PostDetailScreen.css";

// 게시글 인터페이스
interface Post {
  id: number;
  clubId: number;
  clubName: string;
  clubLogo: string;
  title: string;
  content: string;
  fullContent: string;
  createdAt: string;
  views: number;
  likes: number;
}

// 샘플 게시글 상세 데이터
const samplePostDetails: { [key: number]: Post } = {
  1: {
    id: 1,
    clubId: 1,
    clubName: "HICC",
    clubLogo: "/profile-icon.png",
    title: "2024년 신입 부원 모집합니다!",
    content: "HICC에서 함께 성장할 신입 부원을 모집합니다. 웹 개발과 알고리즘에 관심이 있는 분들을 환영합니다.",
    fullContent: `안녕하세요, HICC입니다!

2024년 신입 부원을 모집합니다. HICC는 홍익대학교 컴퓨터공학 동아리로, 웹 개발, 알고리즘, 프로젝트 등 다양한 활동을 진행하고 있습니다.

📌 모집 분야
- 프론트엔드 개발
- 백엔드 개발
- 알고리즘 스터디
- 프로젝트 참여

📅 모집 일정
- 지원 기간: 2024년 1월 15일 ~ 1월 30일
- 면접 일정: 2024년 2월 초 (개별 안내)

💡 지원 방법
- 이메일: hicc@hongik.ac.kr
- 인스타그램 DM: @hicc_official

많은 지원 부탁드립니다!`,
    createdAt: "2024-01-15",
    views: 245,
    likes: 32,
  },
  2: {
    id: 2,
    clubId: 2,
    clubName: "브레인스워즈",
    clubLogo: "/profile-icon.png",
    title: "토론 대회 개최 안내",
    content: "이번 주말에 토론 대회를 개최합니다. 많은 관심 부탁드립니다.",
    fullContent: `안녕하세요, 브레인스워즈입니다!

이번 주말 토론 대회를 개최합니다.

📅 일정
- 날짜: 2024년 1월 20일 (토요일)
- 시간: 오후 2시 ~ 6시
- 장소: 경영대학 강의실 101호

📌 주제
- 경제 발전과 환경 보호의 균형
- 인공지능의 사회적 영향

🎯 참가 방법
- 사전 신청 필수
- 신청 기한: 1월 18일까지

많은 관심과 참여 부탁드립니다!`,
    createdAt: "2024-01-14",
    views: 189,
    likes: 28,
  },
  3: {
    id: 3,
    clubId: 3,
    clubName: "VOERA",
    clubLogo: "/profile-icon.png",
    title: "공연 연습 일정 공지",
    content: "다음 주 공연을 위한 연습 일정을 공지드립니다. 모든 부원분들의 참석 부탁드립니다.",
    fullContent: `안녕하세요, VOERA입니다!

다음 주 공연을 위한 연습 일정을 공지드립니다.

📅 연습 일정
- 월요일: 오후 7시 ~ 9시
- 수요일: 오후 7시 ~ 9시
- 금요일: 오후 7시 ~ 9시
- 토요일: 오전 10시 ~ 오후 2시

📍 장소
- 음악동 연습실

🎵 연습 곡
- 신청곡 리스트는 카카오톡 단체방에 공지

모든 부원분들의 참석 부탁드립니다!`,
    createdAt: "2024-01-13",
    views: 156,
    likes: 19,
  },
  4: {
    id: 4,
    clubId: 1,
    clubName: "HICC",
    clubLogo: "/profile-icon.png",
    title: "프로젝트 발표회 안내",
    content: "이번 학기 프로젝트 발표회를 개최합니다. 많은 관심 부탁드립니다.",
    fullContent: `안녕하세요, HICC입니다!

이번 학기 프로젝트 발표회를 개최합니다.

📅 일정
- 날짜: 2024년 1월 25일 (목요일)
- 시간: 오후 2시 ~ 5시
- 장소: 컴퓨터공학과 강의실

🎯 발표 팀
- 팀 1: 웹 애플리케이션 개발
- 팀 2: 모바일 앱 개발
- 팀 3: AI 프로젝트

많은 관심 부탁드립니다!`,
    createdAt: "2024-01-12",
    views: 312,
    likes: 45,
  },
  5: {
    id: 5,
    clubId: 2,
    clubName: "브레인스워즈",
    clubLogo: "/profile-icon.png",
    title: "학술 세미나 개최",
    content: "이번 주 금요일에 학술 세미나를 개최합니다. 주제는 '현대 경제학'입니다.",
    fullContent: `안녕하세요, 브레인스워즈입니다!

이번 주 금요일에 학술 세미나를 개최합니다.

📅 일정
- 날짜: 2024년 1월 19일 (금요일)
- 시간: 오후 4시 ~ 6시
- 장소: 경영대학 세미나실

📚 주제
- 현대 경제학의 주요 이론
- 경제 정책의 실제 사례

🎓 강사
- 홍익대학교 경제학과 교수

많은 관심 부탁드립니다!`,
    createdAt: "2024-01-11",
    views: 201,
    likes: 33,
  },
  6: {
    id: 6,
    clubId: 3,
    clubName: "VOERA",
    clubLogo: "/profile-icon.png",
    title: "봄 콘서트 티켓 예매 안내",
    content: "봄 콘서트 티켓 예매가 시작되었습니다. 많은 관심 부탁드립니다!",
    fullContent: `안녕하세요, VOERA입니다!

봄 콘서트 티켓 예매가 시작되었습니다.

🎵 콘서트 정보
- 날짜: 2024년 3월 15일 (금요일)
- 시간: 오후 7시
- 장소: 홍익대학교 대강당

💰 티켓 가격
- 학생: 5,000원
- 일반: 10,000원

📅 예매 일정
- 1차 예매: 1월 20일 ~ 1월 27일
- 2차 예매: 2월 1일 ~ 2월 10일

많은 관심과 참여 부탁드립니다!`,
    createdAt: "2024-01-10",
    views: 278,
    likes: 52,
  },
};

const PostDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const postId = id ? parseInt(id, 10) : 0;
  const [post, setPost] = useState<Post | null>(
    samplePostDetails[postId] || null
  );

  if (!post) {
    return (
      <div className="post-detail-screen" data-name="게시글 상세 화면">
        <Header />
        <div className="post-not-found">
          <p>게시글을 찾을 수 없습니다.</p>
          <button onClick={() => navigate("/community")}>목록으로</button>
        </div>
        <BottomTabBar />
      </div>
    );
  }

  return (
    <div className="post-detail-screen" data-name="게시글 상세 화면">
      <Header />

      <div className="post-detail-content">
        {/* 게시글 헤더 (동아리 정보) */}
        <div className="post-detail-header">
          <div className="post-detail-club-info">
            <img
              src={post.clubLogo}
              alt={post.clubName}
              className="post-detail-club-logo"
            />
            <span className="post-detail-club-name">{post.clubName}</span>
          </div>
        </div>

        {/* 게시글 제목 */}
        <h1 className="post-detail-title">{post.title}</h1>

        {/* 게시글 메타 정보 */}
        <div className="post-detail-meta">
          <span className="post-detail-date">{post.createdAt}</span>
          <div className="post-detail-stats">
            <span className="post-detail-views">조회 {post.views}</span>
            <span className="post-detail-likes">좋아요 {post.likes}</span>
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className="post-detail-body">
          <pre className="post-detail-content-text">{post.fullContent}</pre>
        </div>

        {/* 게시글 액션 버튼 */}
        <div className="post-detail-actions">
          <button className="post-detail-action-btn like-btn">
            좋아요 {post.likes}
          </button>
          <button
            className="post-detail-action-btn club-btn"
            onClick={() => navigate(`/community/club/${post.clubId}`)}
          >
            동아리 보기
          </button>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default PostDetailScreen;

