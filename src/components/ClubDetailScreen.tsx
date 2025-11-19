import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import { supabase } from "../lib/supabase";
import "./ClubDetailScreen.css";

// 동아리 데이터 인터페이스
interface ClubData {
  id: number;
  name: string;
  category: string | null;
  description: string;
  logo: string;
  cover: string;
  members: number;
  activityScore: number;
  isRecruiting: boolean;
  affiliation: string;
  externalLinks: {
    instagram?: string;
    youtube?: string;
  };
  feed: Array<{ id: number; image: string; caption: string }>;
  postCount: number;
}

const ClubDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showJoinSuccess, setShowJoinSuccess] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // 달력 관련 상태 (MyClubScreen에서 재사용)
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // 오늘 날짜의 월 첫날
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);

  // 일정 데이터 상태
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [scheduleParticipants, setScheduleParticipants] = useState<any[]>([]);

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

  // 일정이 있는 날짜들 (DB에서 로드된 데이터 기반)
  const eventsDates = useMemo(() => {
    return schedules.map((schedule) => {
      const dateStr = schedule.date;
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    });
  }, [schedules]);

  // 선택된 날짜의 일정 정보 (DB에서 로드된 데이터 기반)
  const selectedEvent = useMemo(() => {
    if (!selectedDate || !selectedSchedule) return null;

    const formatTime = (timeStr: string) => {
      if (!timeStr) return "";
      const [hours, minutes] = timeStr.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "오후" : "오전";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${period} ${displayHour}:${minutes}`;
    };

    const startTime = formatTime(selectedSchedule.started_at || "");
    const endTime = formatTime(selectedSchedule.ended_at || "");
    const timeRange = startTime && endTime ? `${startTime} ~ ${endTime}` : "";

    return {
      id: selectedSchedule.id,
      title: selectedSchedule.title || "일정",
      group: club?.name || "동아리",
      participants: scheduleParticipants.length,
      date: selectedDate,
      time: timeRange,
      location: "", // DB에 location 필드가 없으면 빈 문자열
      description: selectedSchedule.content || "",
      agenda: [], // DB에 agenda 필드가 없으면 빈 배열
      participantAvatars: scheduleParticipants.map(
        (p: any) =>
          p.club_personal?.personal_user?.profile_image_url ||
          "/profile-icon.png"
      ),
    };
  }, [selectedDate, selectedSchedule, club, scheduleParticipants]);

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

  const hasEvent = useCallback(
    (day: number, isCurrentMonth: boolean) => {
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
    },
    [currentDate, eventsDates]
  );

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

    // 해당 날짜의 일정 찾기
    const dateStr = `${clickedDate.getFullYear()}-${String(
      clickedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(clickedDate.getDate()).padStart(2, "0")}`;
    const schedule = schedules.find((s) => s.date === dateStr);
    setSelectedSchedule(schedule || null);

    // 일정이 있으면 참가자 정보 로드
    if (schedule) {
      loadScheduleParticipants(schedule.id);
    } else {
      setScheduleParticipants([]);
    }
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

  // 일정 로드 함수
  const loadSchedules = useCallback(async (clubId: number) => {
    try {
      const { data: schedulesData, error } = await supabase
        .from("club_personal_schedule")
        .select("*")
        .eq("club_user_id", clubId)
        .order("date", { ascending: true });

      if (error) {
        console.error("일정 로드 오류:", error);
        setSchedules([]);
      } else {
        setSchedules(schedulesData || []);
      }
    } catch (error) {
      console.error("일정 로드 중 오류:", error);
      setSchedules([]);
    }
  }, []);

  // 일정 참가자 로드 함수
  const loadScheduleParticipants = useCallback(async (scheduleId: number) => {
    try {
      const { data: participants, error } = await supabase
        .from("schedule_participant")
        .select(
          `
          *,
          club_personal:club_personal_id (
            personal_user:personal_user_id (
              id,
              personal_name,
              profile_image_url
            )
          )
        `
        )
        .eq("schedule_id", scheduleId);

      if (error) {
        console.error("참가자 로드 오류:", error);
        setScheduleParticipants([]);
      } else {
        setScheduleParticipants(participants || []);
      }
    } catch (error) {
      console.error("참가자 로드 중 오류:", error);
      setScheduleParticipants([]);
    }
  }, []);

  // 가입 신청 처리 함수
  const handleJoinRequest = async () => {
    if (!userData || userData.type !== "personal" || !club) {
      return;
    }

    try {
      // 이미 가입 신청한 경우 확인
      const { data: existingMembership, error: checkError } = await supabase
        .from("club_personal")
        .select("id")
        .eq("personal_user_id", userData.id)
        .eq("club_user_id", club.id)
        .single();

      if (existingMembership) {
        alert("이미 가입 신청하셨습니다.");
        return;
      }

      // club_personal 테이블에 추가
      const { error: insertError } = await supabase
        .from("club_personal")
        .insert({
          personal_user_id: userData.id,
          club_user_id: club.id,
          role: "member",
          approved: false,
        });

      if (insertError) {
        console.error("가입 신청 오류:", insertError);
        alert("가입 신청 중 오류가 발생했습니다.");
        return;
      }

      // 성공 메시지 표시
      setShowJoinSuccess(true);
      setShowJoinModal(false);
    } catch (error) {
      console.error("가입 신청 처리 중 오류:", error);
      alert("가입 신청 중 오류가 발생했습니다.");
    }
  };

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserData = () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
      }
    };
    loadUserData();
  }, []);

  // 동아리 데이터 로드
  useEffect(() => {
    if (id) {
      const clubId = parseInt(id);
      loadClubData(clubId);
      loadSchedules(clubId);
    }
  }, [id, loadSchedules]);

  const loadClubData = async (clubId: number) => {
    try {
      setLoading(true);
      // club_user에서 직접 모든 필드 가져오기
      const { data: clubUser, error: clubError } = await supabase
        .from("club_user")
        .select(
          `
          id,
          club_name,
          category,
          recruiting,
          score,
          club_explanation,
          club_simple_explanation,
          instagram_url,
          youtube_url,
          banner_image_url,
          profile_image_url,
          group_user_id,
          group_user:group_user_id (
            group_name
          )
        `
        )
        .eq("id", clubId)
        .eq("approved", true)
        .single();

      if (clubError) {
        console.error("동아리 로드 오류:", clubError);
        return;
      }

      if (!clubUser) {
        console.error("동아리를 찾을 수 없습니다.");
        return;
      }

      // 멤버 수 계산
      const { count: memberCount } = await supabase
        .from("club_personal")
        .select("*", { count: "exact", head: true })
        .eq("club_user_id", clubId)
        .eq("approved", true);

      // 게시물 수 계산
      const { data: clubPersonals } = await supabase
        .from("club_personal")
        .select("id")
        .eq("club_user_id", clubId)
        .eq("approved", true);

      let postCount = 0;
      if (clubPersonals && clubPersonals.length > 0) {
        const clubPersonalIds = clubPersonals.map((cp) => cp.id);
        const { count: articleCount } = await supabase
          .from("club_personal_article")
          .select("*", { count: "exact", head: true })
          .in("club_personal_id", clubPersonalIds);
        postCount = articleCount || 0;
      }

      const activityScore = clubUser.score || (memberCount || 0) * 10;
      const groupUser = Array.isArray(clubUser.group_user)
        ? clubUser.group_user[0]
        : clubUser.group_user;
      const affiliation = groupUser?.group_name || "미지정";

      // 동아리 데이터 구성
      const clubData: ClubData = {
        id: clubUser.id,
        name: clubUser.club_name,
        category: clubUser.category || "기타",
        description: clubUser.club_explanation || "",
        logo: clubUser.profile_image_url || "/profile-icon.png",
        cover: clubUser.banner_image_url || "/profile-icon.png",
        members: memberCount || 0,
        activityScore: activityScore,
        isRecruiting: clubUser.recruiting || false,
        affiliation: affiliation,
        externalLinks: {
          instagram: clubUser.instagram_url || undefined,
          youtube: clubUser.youtube_url || undefined,
        },
        feed: [], // 피드는 별도로 구현 필요
        postCount: postCount, // 게시물 수 추가
      };

      setClub(clubData);
    } catch (error) {
      console.error("동아리 데이터 로드 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="club-detail-screen">
        <div style={{ padding: "40px", textAlign: "center" }}>로딩 중...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="club-detail-screen">
        <div className="club-header-back">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
        </div>
        <div style={{ padding: "40px", textAlign: "center" }}>
          동아리를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="club-detail-screen">
      {/* 헤더: 뒤로가기 버튼 */}
      <div className="club-header-back">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      {/* Main Content */}
      <div className="club-detail-content">
        {/* 인스타그램 스타일 프로필 섹션 */}
        <div className="club-profile-section">
          {/* 프로필 로고와 이름/카테고리 */}
          <div className="club-logo-section">
            <img src={club.logo} alt={club.name} className="club-logo" />
            {/* 동아리 이름과 카테고리 (로고 아래에 배치) */}
            <div className="club-name-section">
              <h1 className="club-name">{club.name}</h1>
              <span className="club-category">{club.category}</span>
            </div>
          </div>

          {/* 통계 (피드, 멤버, 활동점수) */}
          <div className="club-stats-section">
            <div className="stat-item">
              <span className="stat-value">{club.postCount || 0}</span>
              <span className="stat-label">피드</span>
            </div>
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
            onClick={handleJoinRequest}
            disabled={!club.isRecruiting || userData?.type !== "personal"}
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
                          {selectedEvent.participants > 0 &&
                            selectedEvent.participantAvatars &&
                            selectedEvent.participantAvatars.length > 0 && (
                              <div className="schedule-event-participants">
                                {selectedEvent.participantAvatars
                                  .slice(0, 4)
                                  .map((avatar: string, index: number) => (
                                    <div
                                      key={index}
                                      className="participant-avatar"
                                    >
                                      <img
                                        src={avatar}
                                        alt={`참가자 ${index + 1}`}
                                      />
                                    </div>
                                  ))}
                              </div>
                            )}
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
                              {selectedEvent.location && (
                                <div className="event-detail-row">
                                  <span className="event-detail-label">
                                    장소:
                                  </span>
                                  <span className="event-detail-value">
                                    {selectedEvent.location}
                                  </span>
                                </div>
                              )}
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
                            {selectedEvent.description && (
                              <div className="event-detail-description">
                                <h5 className="event-detail-section-title">
                                  상세 내용
                                </h5>
                                <p>{selectedEvent.description}</p>
                              </div>
                            )}
                            {selectedEvent.agenda &&
                              selectedEvent.agenda.length > 0 && (
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
                              )}

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
          {club.feed.length > 0 ? (
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
          ) : (
            <div className="feed-empty-state">
              <p>아직 활동 피드가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 가입 신청 완료 모달 */}
      {showJoinSuccess && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowJoinSuccess(false)}
          ></div>
          <div className="join-modal">
            <div className="modal-header">
              <h2>가입 신청</h2>
              <button
                className="modal-close"
                onClick={() => setShowJoinSuccess(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ textAlign: "center", padding: "20px" }}>
                가입 신청이 완료되었습니다. 관리자의 승인 이후 활동하실 수
                있습니다.
              </p>
            </div>
          </div>
        </>
      )}

      <BottomTabBar />
    </div>
  );
};

export default ClubDetailScreen;
