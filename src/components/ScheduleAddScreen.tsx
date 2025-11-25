import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ScheduleAddScreen.css";

interface UserData {
  type: "personal" | "club" | "group" | "admin";
  id: number;
  username: string;
  name: string;
  email: string;
}

const ScheduleAddScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [clubPersonalId, setClubPersonalId] = useState<number | null>(null);
  const [clubUserId, setClubUserId] = useState<number | null>(null);

  // 폼 상태
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [scheduleLocation, setScheduleLocation] = useState("");
  const [participationEnabled, setParticipationEnabled] = useState(false);
  const [content, setContent] = useState("");
  const [agenda, setAgenda] = useState("");

  // URL에서 날짜 파라미터 가져오기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateParam = params.get("date");
    if (dateParam) {
      // 시간대 문제 방지를 위해 날짜 문자열을 직접 파싱
      const date = new Date(dateParam);
      // 로컬 시간대로 날짜 설정 (시간은 00:00:00으로 설정)
      const localDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      setSelectedDate(localDate);
      // 해당 날짜가 포함된 월로 달력 이동
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }

    // 사용자 정보 로드
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  // club_personal_id와 club_user_id 로드
  useEffect(() => {
    const loadClubInfo = async () => {
      if (!userData) return;

      try {
        if (userData.type === "personal") {
          // 개인 계정: club_personal에서 정보 가져오기
          const { data: clubPersonals, error } = await supabase
            .from("club_personal")
            .select("id, club_user_id")
            .eq("personal_user_id", userData.id)
            .eq("approved", true)
            .limit(1);

          if (error) {
            console.error("club_personal 조회 오류:", error);
            return;
          }

          if (clubPersonals && clubPersonals.length > 0) {
            setClubPersonalId(clubPersonals[0].id);
            setClubUserId(clubPersonals[0].club_user_id);
          }
        } else if (userData.type === "club") {
          // 클럽 계정: club_user_id 직접 사용
          setClubUserId(userData.id);
        }
      } catch (error) {
        console.error("동아리 정보 로드 오류:", error);
      }
    };

    loadClubInfo();
  }, [userData]);

  // 완료 버튼 활성화 여부 (제목이 필수)
  const isSubmitEnabled = title.trim().length > 0;

  // 일정 저장
  const handleSubmit = async () => {
    if (!title.trim() || !selectedDate || !clubUserId) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    try {
      // 시간 형식 변환 (HH:MM)
      const startTimeFormatted = startTime || null;
      const endTimeFormatted = endTime || null;

      // 일정표를 배열로 변환 (줄바꿈 기준)
      const agendaArray = agenda
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      // 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 문제 방지)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const { error } = await supabase.from("club_personal_schedule").insert({
        title: title.trim(),
        date: dateString,
        started_at: startTimeFormatted,
        ended_at: endTimeFormatted,
        location: scheduleLocation.trim() || null,
        participation_enabled: participationEnabled,
        content: content.trim() || null,
        agenda: agendaArray.length > 0 ? agendaArray : null,
        club_user_id: clubUserId,
        club_personal_id: clubPersonalId,
        official: false,
      });

      if (error) {
        console.error("일정 저장 오류:", error);
        alert("일정 저장 중 오류가 발생했습니다.");
        return;
      }

      alert("일정이 등록되었습니다.");
      // 내 동아리 일정 페이지로 이동하고 해당 날짜 선택 상태로 표시
      navigate(`/myclub?tab=schedule&date=${dateString}`);
    } catch (error) {
      console.error("일정 저장 중 오류:", error);
      alert("일정 저장 중 오류가 발생했습니다.");
    }
  };

  // 달력 관련 함수
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

  const getKoreanMonthYear = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${month}월`;
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
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = dayNames[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  return (
    <div className="schedule-add-screen">
      {/* 헤더 */}
      <div className="schedule-add-header">
        <button
          className="schedule-add-back-btn"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          ✕
        </button>
        <h1 className="schedule-add-title">일정 추가</h1>
        <div className="schedule-add-header-spacer"></div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="schedule-add-content">
        {/* 섹션 A: 일정 제목 */}
        <div className="schedule-add-section">
          <label className="schedule-add-label">일정 제목</label>
          <input
            type="text"
            className="schedule-add-input"
            placeholder="일정 제목을 입력해주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 섹션 B: 날짜 선택 - 달력 UI */}
        <div className="schedule-add-section">
          <label className="schedule-add-label">날짜</label>
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
                      {dayData.isCurrentMonth ? dayData.date : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* 선택된 날짜 표시 */}
          {selectedDate && (
            <div className="schedule-add-date-display">
              {formatDate(selectedDate)}
            </div>
          )}
        </div>

        {/* 섹션 C: 시간 선택 */}
        <div className="schedule-add-section">
          <label className="schedule-add-label">시간</label>
          <div className="schedule-add-time-row">
            <div className="schedule-add-time-group">
              <label className="schedule-add-time-label">시작 시간</label>
              <input
                type="time"
                className="schedule-add-time-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <span className="schedule-add-time-separator">~</span>
            <div className="schedule-add-time-group">
              <label className="schedule-add-time-label">끝 시간</label>
              <input
                type="time"
                className="schedule-add-time-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 섹션 D: 장소 입력 */}
        <div className="schedule-add-section">
          <label className="schedule-add-label">장소</label>
          <input
            type="text"
            className="schedule-add-input"
            placeholder="장소를 입력해주세요."
            value={scheduleLocation}
            onChange={(e) => setScheduleLocation(e.target.value)}
          />
        </div>

        {/* 섹션 E: 참가 신청 활성화 토글 */}
        <div className="schedule-add-section">
          <label className="schedule-add-label">참가 신청</label>
          <div className="schedule-add-toggle-wrapper">
            <span className="schedule-add-toggle-label">참가 신청 활성화</span>
            <label className="schedule-add-toggle-switch">
              <input
                type="checkbox"
                checked={participationEnabled}
                onChange={(e) => setParticipationEnabled(e.target.checked)}
              />
              <span className="schedule-add-toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* 섹션 F: 상세 내용 입력 */}
        <div className="schedule-add-section">
          <label className="schedule-add-label">상세 내용</label>
          <textarea
            className="schedule-add-textarea"
            placeholder="상세 내용을 입력해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </div>

        {/* 섹션 G: 일정표 입력 */}
        <div className="schedule-add-section">
          <label className="schedule-add-label">일정표</label>
          <textarea
            className="schedule-add-textarea"
            placeholder="일정표를 입력해주세요. (줄바꿈으로 구분)"
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            rows={6}
          />
        </div>
      </div>

      {/* 하단 완료 버튼 */}
      <div className="schedule-add-footer">
        <button
          className={`schedule-add-submit-btn ${
            isSubmitEnabled ? "enabled" : "disabled"
          }`}
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
        >
          작성 완료
        </button>
      </div>
    </div>
  );
};

export default ScheduleAddScreen;
