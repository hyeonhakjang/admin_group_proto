import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./PostWriteScreen.css";

interface StoredClub {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
  role?: string;
}

interface Schedule {
  id: number;
  title: string;
  date: string;
  started_at?: string;
  ended_at?: string;
  location?: string;
  content?: string;
  agenda?: string[];
}

const ScheduleSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Schedule[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);

  useEffect(() => {
    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, []);

  useEffect(() => {
    if (!selectedClub?.club_user_id) return;

    const loadSchedules = async () => {
      try {
        const { data, error } = await supabase
          .from("club_personal_schedule")
          .select("*")
          .eq("club_user_id", selectedClub.club_user_id)
          .order("date", { ascending: true });

        if (error) {
          console.error("일정 로드 오류:", error);
          return;
        }

        if (data) {
          setSchedules(data as Schedule[]);
        }
      } catch (error) {
        console.error("일정 로드 중 오류:", error);
      }
    };

    loadSchedules();
  }, [selectedClub]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: number; isCurrentMonth: boolean }> = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: i, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, isCurrentMonth: true });
    }
    const totalCells = 35;
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

  const eventsDates = useMemo(() => {
    return schedules
      .map((schedule) => {
        if (schedule.date) {
          const date = new Date(schedule.date);
          return date;
        }
        return null;
      })
      .filter((date): date is Date => date !== null);
  }, [schedules]);

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

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "오후" : "오전";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${period} ${displayHour}:${minutes}`;
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);
    setSelectedEventId(null);
    setShowEventDetail(false);

    const eventsOnDate = schedules.filter((schedule) => {
      if (!schedule.date) return false;
      const dateStr = schedule.date;
      const [year, month, dayNum] = dateStr.split("-").map(Number);
      const scheduleDate = new Date(year, month - 1, dayNum);
      return (
        scheduleDate.getFullYear() === clickedDate.getFullYear() &&
        scheduleDate.getMonth() === clickedDate.getMonth() &&
        scheduleDate.getDate() === clickedDate.getDate()
      );
    });

    setSelectedEvents(eventsOnDate);
    if (eventsOnDate.length > 0) {
      setSelectedEventId(eventsOnDate[0].id);
      setShowEventDetail(true);
    }
  };

  const handleEventClick = (eventId: number) => {
    setSelectedEventId(eventId);
    setShowEventDetail(true);
  };

  const handleSelectEvent = () => {
    if (!selectedEventId) {
      alert("행사를 선택해 주세요.");
      return;
    }

    const selectedEvent = schedules.find((s) => s.id === selectedEventId);
    if (!selectedEvent) {
      alert("선택한 행사를 찾을 수 없습니다.");
      return;
    }

    sessionStorage.setItem(
      "selectedArticleSchedule",
      JSON.stringify({
        id: selectedEvent.id,
        title: selectedEvent.title,
        date: selectedEvent.date,
      })
    );

    // 저장된 폼 데이터 복원
    const storedData = sessionStorage.getItem("articleWriteData");
    if (storedData) {
      const data = JSON.parse(storedData);
      sessionStorage.setItem("articleWriteData", JSON.stringify(data));
    }

    navigate(-1);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null);
    setSelectedEvents([]);
    setSelectedEventId(null);
    setShowEventDetail(false);
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null);
    setSelectedEvents([]);
    setSelectedEventId(null);
    setShowEventDetail(false);
  };

  const selectedEvent = selectedEvents.find((e) => e.id === selectedEventId);
  const agendaList = selectedEvent?.agenda
    ? Array.isArray(selectedEvent.agenda)
      ? selectedEvent.agenda
      : [selectedEvent.agenda]
    : [];

  return (
    <div className="post-write-screen">
      <div className="post-write-inner">
        <header className="post-write-header">
          <button
            className="post-write-back-btn"
            onClick={() => navigate(-1)}
          >
            ← 뒤로가기
          </button>
        </header>

        <h1 className="post-write-select-title">행사 선택</h1>

        {/* 달력 */}
        <div className="post-write-calendar-container">
          <div className="post-write-calendar-header">
            <button
              className="post-write-calendar-nav-btn"
              onClick={goToPreviousMonth}
            >
              ←
            </button>
            <h2 className="post-write-calendar-month">
              {getKoreanMonthYear(currentDate)}
            </h2>
            <button
              className="post-write-calendar-nav-btn"
              onClick={goToNextMonth}
            >
              →
            </button>
          </div>

          <div className="post-write-calendar-weekdays">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div key={day} className="post-write-calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="post-write-calendar-grid">
            {getDaysInMonth(currentDate).map((day, index) => (
              <div
                key={index}
                className={`post-write-calendar-day ${
                  isSelected(day.date, day.isCurrentMonth) ? "selected" : ""
                } ${!day.isCurrentMonth ? "other-month" : ""}`}
                onClick={() => handleDayClick(day.date, day.isCurrentMonth)}
              >
                <span className="post-write-calendar-day-number">
                  {day.isCurrentMonth ? day.date : ""}
                </span>
                {hasEvent(day.date, day.isCurrentMonth) && (
                  <span className="post-write-calendar-event-dot"></span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 선택된 날짜의 행사 목록 */}
        {selectedEvents.length > 0 && (
          <div className="post-write-events-list">
            {selectedEvents.map((event) => (
              <div
                key={event.id}
                className={`post-write-event-card ${
                  selectedEventId === event.id ? "selected" : ""
                }`}
                onClick={() => handleEventClick(event.id)}
              >
                <div className="post-write-event-title">{event.title}</div>
                <div className="post-write-event-date">{event.date}</div>
              </div>
            ))}
          </div>
        )}

        {/* 선택된 행사 상세 정보 */}
        {selectedEvent && showEventDetail && (
          <div className="post-write-event-detail-card">
            <div className="post-write-event-detail-title">
              {selectedEvent.title}
            </div>
            <div className="post-write-event-detail-info">
              <div className="post-write-event-detail-date">
                {selectedEvent.date}
              </div>
              {selectedEvent.started_at && selectedEvent.ended_at && (
                <div className="post-write-event-detail-time">
                  {formatTime(selectedEvent.started_at)} ~{" "}
                  {formatTime(selectedEvent.ended_at)}
                </div>
              )}
              {selectedEvent.location && (
                <div className="post-write-event-detail-location">
                  {selectedEvent.location}
                </div>
              )}
            </div>
            {selectedEvent.content && (
              <div className="post-write-event-detail-content">
                {selectedEvent.content}
              </div>
            )}
            {agendaList.length > 0 && (
              <div className="post-write-event-detail-agenda">
                <strong>안건:</strong>
                <ul>
                  {agendaList.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 선택 완료 버튼 */}
        {selectedEventId && (
          <button
            className="post-write-select-complete-btn"
            onClick={handleSelectEvent}
          >
            선택 완료
          </button>
        )}
      </div>
    </div>
  );
};

export default ScheduleSelectScreen;

