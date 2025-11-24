import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import BottomTabBar from "./BottomTabBar";
import "./PayoutScreens.css";

const STORAGE_KEY = "payoutSelectedMembers";

interface UserData {
  type: "personal" | "club" | "group" | "admin";
  id: number;
  username: string;
  name: string;
  email: string;
}

interface Club {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
}

interface Member {
  id: string;
  name: string;
  role: string;
}

const PayoutMemberSearchScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"members" | "events">("members");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  // userData는 나중에 사용할 수 있으므로 유지
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // 사용자 정보 및 동아리 정보 로드
  useEffect(() => {
    const loadUserData = () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
      }
    };

    const loadSelectedClub = () => {
      const storedClub = sessionStorage.getItem("selectedClub");
      if (storedClub) {
        try {
          const club = JSON.parse(storedClub);
          setSelectedClub(club);
        } catch (error) {
          console.error("동아리 정보 파싱 오류:", error);
        }
      }
    };

    loadUserData();
    loadSelectedClub();
  }, []);

  // 선택된 멤버 로드
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: Member[] = JSON.parse(stored);
        setSelectedIds(parsed.map((member) => member.id));
      } catch (error) {
        console.error("선택된 멤버 파싱 오류:", error);
      }
    }
  }, []);

  // 일정 데이터 로드
  const loadSchedules = React.useCallback(async () => {
    if (!selectedClub?.club_user_id) return;

    try {
      const { data: schedules, error } = await supabase
        .from("club_personal_schedule")
        .select("*")
        .eq("club_user_id", selectedClub.club_user_id)
        .order("date", { ascending: true });

      if (error) {
        console.error("일정 로드 오류:", error);
        setSchedules([]);
      } else {
        setSchedules(schedules || []);
      }
    } catch (error) {
      console.error("일정 로드 중 오류:", error);
      setSchedules([]);
    }
  }, [selectedClub?.club_user_id]);

  // 멤버 데이터 로드
  const loadMembers = React.useCallback(async () => {
    if (!selectedClub?.club_user_id) return;

    try {
      const { data: membersData, error } = await supabase
        .from("club_personal")
        .select(
          `
          id,
          role,
          personal_user:personal_user_id (
            id,
            personal_name
          )
        `
        )
        .eq("club_user_id", selectedClub.club_user_id)
        .eq("approved", true);

      if (error) {
        console.error("멤버 로드 오류:", error);
        setMembers([]);
      } else {
        const transformedMembers: Member[] = (membersData || []).map(
          (member: any) => {
            const personalUser = Array.isArray(member.personal_user)
              ? member.personal_user[0]
              : member.personal_user;
            return {
              id: String(personalUser?.id || member.id),
              name: personalUser?.personal_name || "이름 없음",
              role: member.role || "동아리원",
            };
          }
        );
        setMembers(transformedMembers);
      }
    } catch (error) {
      console.error("멤버 로드 중 오류:", error);
      setMembers([]);
    }
  }, [selectedClub?.club_user_id]);

  useEffect(() => {
    if (selectedClub?.club_user_id) {
      loadSchedules();
      loadMembers();
    }
  }, [selectedClub?.club_user_id, loadSchedules, loadMembers]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) =>
      member.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [members, searchText]);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((memberId) => memberId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === members.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(members.map((member) => member.id));
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: prevMonthDays - i, isCurrentMonth: false });
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

  // 일정이 있는 날짜들 계산
  const eventsDates = React.useMemo(() => {
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

  const hasEvent = React.useCallback(
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

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);

    // 해당 날짜의 일정 찾기
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

    if (eventsOnDate.length > 0) {
      // 첫 번째 일정 선택
      setSelectedEventId(eventsOnDate[0].id);
    } else {
      setSelectedEventId(null);
    }
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

  const handleMemberComplete = () => {
    const selectedMembers = members
      .filter((member) => selectedIds.includes(member.id))
      .map((member) => ({ ...member, amount: 0 }));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedMembers));
    navigate(-1);
  };

  const handleEventComplete = async () => {
    if (!selectedEventId) {
      alert("행사를 선택해 주세요.");
      return;
    }

    try {
      // 선택된 일정의 참가자 정보 가져오기
      const { data: participants, error } = await supabase
        .from("schedule_participant")
        .select(
          `
          *,
          club_personal:club_personal_id (
            personal_user:personal_user_id (
              id,
              personal_name
            )
          )
        `
        )
        .eq("schedule_id", selectedEventId);

      if (error) {
        console.error("참가자 정보 로드 오류:", error);
        alert("참가자 정보를 불러오는 중 오류가 발생했습니다.");
        return;
      }

      // 참가자 정보를 멤버 형식으로 변환
      const eventMembers = (participants || []).map((participant: any) => {
        const clubPersonal = Array.isArray(participant.club_personal)
          ? participant.club_personal[0]
          : participant.club_personal;
        const personalUser = Array.isArray(clubPersonal?.personal_user)
          ? clubPersonal.personal_user[0]
          : clubPersonal?.personal_user;

        return {
          id: String(personalUser?.id || participant.club_personal_id),
          name: personalUser?.personal_name || "이름 없음",
          role: clubPersonal?.role || "동아리원",
          amount: 0,
        };
      });

      if (eventMembers.length === 0) {
        alert("선택한 행사에 참가자가 없습니다.");
        return;
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(eventMembers));
      navigate(-1);
    } catch (error) {
      console.error("행사 참가자 로드 중 오류:", error);
      alert("행사 참가자 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="payout-screen" data-name="정산 멤버 검색">
      <div className="payout-inner">
        <header className="payout-header-block">
          <button className="payout-back-btn" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
        </header>

        <h1 className="payout-title">정산 멤버 검색</h1>

        <div className="member-search-tabs">
          <button
            className={`member-search-tab ${
              activeTab === "members" ? "active" : ""
            }`}
            onClick={() => setActiveTab("members")}
          >
            멤버 검색
          </button>
          <button
            className={`member-search-tab ${
              activeTab === "events" ? "active" : ""
            }`}
            onClick={() => setActiveTab("events")}
          >
            행사 검색
          </button>
        </div>

        {activeTab === "members" ? (
          <>
            <div className="member-select-all">
              <div>
                <strong>전체 선택</strong>
                <p className="member-select-all-description">
                  현재 동아리의 모든 멤버를 선택합니다.
                </p>
              </div>
              <button type="button" onClick={handleSelectAll}>
                {selectedIds.length === members.length
                  ? "선택 해제"
                  : "전체 선택"}
              </button>
            </div>

            <div className="search-input-wrapper">
              <span>🔍</span>
              <input
                type="text"
                placeholder="멤버 이름 검색"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            <div className="member-search-list">
              {filteredMembers.map((member) => (
                <div key={member.id} className="member-search-item">
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                  </div>
                  <div className="member-search-actions">
                    <button
                      type="button"
                      className="member-search-select-btn"
                      onClick={() => toggleMember(member.id)}
                    >
                      {selectedIds.includes(member.id) ? "해제" : "선택"}
                    </button>
                    {selectedIds.includes(member.id) && (
                      <span className="member-check">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="member-search-footer">
              <button type="button" onClick={handleMemberComplete}>
                선택 완료
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="calendar-container">
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
              <div className="calendar-weekdays">
                {["일", "월", "화", "수", "목", "금", "토"].map(
                  (label, index) => (
                    <div key={index} className="calendar-weekday">
                      {label}
                    </div>
                  )
                )}
              </div>
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
                        handleDayClick(dayData.date, dayData.isCurrentMonth)
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

            <div className="member-search-footer">
              <button type="button" onClick={handleEventComplete}>
                선택 완료
              </button>
            </div>
          </>
        )}
      </div>
      <BottomTabBar />
    </div>
  );
};

export default PayoutMemberSearchScreen;
