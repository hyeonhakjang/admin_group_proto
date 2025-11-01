import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  // 달력 관련 상태 (MyClubScreen에서 재사용)
  const [currentDate, setCurrentDate] = useState(new Date(2024, 8, 7)); // 2024년 9월 7일
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);

  // 댓글 상태
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "김홍익",
      avatar: "/profile-icon.png",
      content: "참여하겠습니다!",
      time: "오늘 18:30",
    },
    {
      id: 2,
      author: "이동아리",
      avatar: "/profile-icon.png",
      content: "노트북 필수인가요?",
      time: "오늘 18:25",
    },
  ]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: "홍익대 HICC",
        avatar: "/profile-icon.png",
        content: newComment,
        time: "방금 전",
      };
      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  // 일정이 있는 날짜들 (샘플 데이터)
  const eventsDates = [
    new Date(2024, 8, 7), // 9월 7일
    new Date(2024, 8, 14), // 9월 14일
    new Date(2024, 8, 21), // 9월 21일
    new Date(2024, 8, 28), // 9월 28일
  ];

  // 선택된 날짜의 일정 정보
  const selectedEvent = selectedDate
    ? {
        title: "HICC 정기 세션",
        group: "HICC",
        participants: 21,
        date: selectedDate,
        time: "오후 01:00 ~ 오후 05:00",
        location: "홍익대학교 공학관 301호",
        description:
          "이번 정기 세션에서는 웹 개발 기초와 React 프레임워크에 대해 다룹니다. 초보자도 참여 가능하며, 실습 시간도 포함되어 있습니다. 노트북을 지참해 주시기 바랍니다.",
        agenda: [
          "14:00 - 14:30: 웹 개발 기초 강의",
          "14:30 - 15:30: React 소개 및 환경 설정",
          "15:30 - 16:00: 실습 시간",
          "16:00 - 17:00: Q&A 및 네트워킹",
        ],
      }
    : null;

  // 달력 관련 함수 (MyClubScreen에서 재사용)
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // 이전 달의 마지막 날짜들
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: prevMonthDays - i, isCurrentMonth: false });
    }
    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, isCurrentMonth: true });
    }
    // 다음 달의 날짜들 (캘린더 그리드를 채우기 위해)
    const totalCells = 35; // 5주 * 7일
    const remainingDays = totalCells - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: i, isCurrentMonth: false });
    }

    return days;
  };

  const hasEvent = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    const checkDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return eventsDates.some(
      (eventDate) =>
        eventDate.getFullYear() === checkDate.getFullYear() &&
        eventDate.getMonth() === checkDate.getMonth() &&
        eventDate.getDate() === checkDate.getDate()
    );
  };

  const isSelected = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || !selectedDate) return false;
    return (
      selectedDate.getFullYear() === currentDate.getFullYear() &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getDate() === day
    );
  };

  const handleDateClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null); // 월 변경 시 선택 상태 초기화
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null); // 월 변경 시 선택 상태 초기화
  };

  const getKoreanMonthYear = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${month}월`;
  };

  const getKoreanDayName = (dayIndex: number) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[dayIndex];
  };

  const formatDateForEvent = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = getKoreanDayName(date.getDay());
    return `${month}월 ${day}일 ${dayName}`;
  };

  // 실제로는 API에서 동아리 데이터를 가져옴
  useEffect(() => {
    // setClub(fetchClubData(id));
  }, [id]);

  return (
    <div className="club-detail-screen">
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
          <div className="schedule-content">
            {/* 달력 뷰 */}
            <div className="calendar-container">
              {/* 달력 헤더 */}
              <div className="calendar-header">
                <button
                  className="calendar-nav-btn"
                  onClick={goToPreviousMonth}
                  aria-label="이전 달"
                >
                  &lt;
                </button>
                <h2 className="calendar-month-year">
                  {getKoreanMonthYear(currentDate)}
                </h2>
                <button
                  className="calendar-nav-btn"
                  onClick={goToNextMonth}
                  aria-label="다음 달"
                >
                  &gt;
                </button>
              </div>

              {/* 요일 행 */}
              <div className="calendar-weekdays">
                {["일", "월", "화", "수", "목", "금", "토"].map(
                  (day, index) => (
                    <div key={index} className="calendar-weekday">
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* 날짜 그리드 */}
              <div className="calendar-grid">
                {getDaysInMonth(currentDate).map((dayData, index) => {
                  const hasEventOnDay = hasEvent(
                    dayData.date,
                    dayData.isCurrentMonth
                  );
                  const isSelectedDay = isSelected(
                    dayData.date,
                    dayData.isCurrentMonth
                  );

                  return (
                    <div
                      key={index}
                      className={`calendar-day ${
                        !dayData.isCurrentMonth ? "other-month" : ""
                      } ${isSelectedDay ? "selected" : ""}`}
                      onClick={() =>
                        handleDateClick(dayData.date, dayData.isCurrentMonth)
                      }
                    >
                      <span className="calendar-day-number">
                        {dayData.date}
                      </span>
                      {hasEventOnDay && (
                        <div className="calendar-event-dot"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 일정 상세 정보 */}
            {selectedDate && (
              <div className="schedule-details">
                <h3 className="schedule-details-title">
                  {formatDateForEvent(selectedDate)} 일정
                </h3>
                {selectedEvent &&
                hasEvent(
                  selectedDate.getDate(),
                  selectedDate.getMonth() === currentDate.getMonth() &&
                    selectedDate.getFullYear() === currentDate.getFullYear()
                ) ? (
                  <>
                    {!showEventDetail ? (
                      <div className="schedule-event-card">
                        <h4 className="schedule-event-title">
                          {selectedEvent.title}
                        </h4>
                        <div className="schedule-event-info">
                          <span className="schedule-event-group">
                            {selectedEvent.group} · {selectedEvent.participants}
                            명
                          </span>
                          <div className="schedule-event-participants">
                            <div className="participant-avatar">👤</div>
                            <div className="participant-avatar">👤</div>
                            <div className="participant-avatar">👤</div>
                            <div className="participant-avatar">👤</div>
                          </div>
                        </div>
                        <div className="schedule-event-time">
                          • {selectedEvent.date.getFullYear()}년{" "}
                          {selectedEvent.date.getMonth() + 1}월{" "}
                          {selectedEvent.date.getDate()}일 {selectedEvent.time}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="event-detail-overlay"
                          onClick={() => setShowEventDetail(false)}
                        ></div>
                        <div className="schedule-event-detail-card">
                          <div className="schedule-event-detail-card-inner">
                            <button
                              className="event-back-btn"
                              onClick={() => setShowEventDetail(false)}
                            >
                              ← 뒤로가기
                            </button>
                            <h4 className="event-detail-title">
                              {selectedEvent.title}
                            </h4>
                            <div className="event-detail-info">
                              <div className="event-detail-row">
                                <span className="event-detail-label">
                                  날짜:
                                </span>
                                <span className="event-detail-value">
                                  {selectedEvent.date.getFullYear()}년{" "}
                                  {selectedEvent.date.getMonth() + 1}월{" "}
                                  {selectedEvent.date.getDate()}일
                                </span>
                              </div>
                              <div className="event-detail-row">
                                <span className="event-detail-label">
                                  시간:
                                </span>
                                <span className="event-detail-value">
                                  {selectedEvent.time}
                                </span>
                              </div>
                              <div className="event-detail-row">
                                <span className="event-detail-label">
                                  장소:
                                </span>
                                <span className="event-detail-value">
                                  {selectedEvent.location}
                                </span>
                              </div>
                              <div className="event-detail-row">
                                <span className="event-detail-label">
                                  참가자:
                                </span>
                                <span className="event-detail-value">
                                  {selectedEvent.group} ·{" "}
                                  {selectedEvent.participants}명
                                </span>
                              </div>
                            </div>
                            <div className="event-detail-description">
                              <h5 className="event-detail-section-title">
                                상세 내용
                              </h5>
                              <p>{selectedEvent.description}</p>
                            </div>
                            <div className="event-detail-agenda">
                              <h5 className="event-detail-section-title">
                                일정표
                              </h5>
                              <ul className="event-agenda-list">
                                {selectedEvent.agenda.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            {/* 댓글 섹션 */}
                            <div className="event-comments-section">
                              <h5 className="event-detail-section-title">
                                댓글 ({comments.length})
                              </h5>

                              {/* 댓글 입력 */}
                              <div className="comment-input-container">
                                <div className="comment-input-avatar">
                                  <img src="/profile-icon.png" alt="프로필" />
                                </div>
                                <div className="comment-input-wrapper">
                                  <input
                                    type="text"
                                    className="comment-input"
                                    placeholder="댓글을 입력하세요..."
                                    value={newComment}
                                    onChange={(e) =>
                                      setNewComment(e.target.value)
                                    }
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        handleAddComment();
                                      }
                                    }}
                                  />
                                  <button
                                    className="comment-submit-btn"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                  >
                                    등록
                                  </button>
                                </div>
                              </div>

                              {/* 댓글 리스트 */}
                              <div className="comments-list">
                                {comments.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="comment-item"
                                  >
                                    <div className="comment-avatar">
                                      <img
                                        src={comment.avatar}
                                        alt={comment.author}
                                      />
                                    </div>
                                    <div className="comment-content-wrapper">
                                      <div className="comment-header">
                                        <span className="comment-author">
                                          {comment.author}
                                        </span>
                                        <span className="comment-time">
                                          {comment.time}
                                        </span>
                                      </div>
                                      <p className="comment-text">
                                        {comment.content}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="schedule-event-card">
                    <p className="no-event-message">일정이 없습니다.</p>
                  </div>
                )}
              </div>
            )}
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
