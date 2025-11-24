import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import "./PayoutScreens.css";

const STORAGE_KEY = "payoutSelectedMembers";

interface Member {
  id: string;
  name: string;
  role: string;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  participants: Member[];
}

const mockMembers: Member[] = [
  { id: "m1", name: "이동아리", role: "리더" },
  { id: "m2", name: "김홍익", role: "총무" },
  { id: "m3", name: "박동아리", role: "멤버" },
  { id: "m4", name: "최활동", role: "멤버" },
  { id: "m5", name: "정기획", role: "기획" },
];

const mockEvents: EventItem[] = [
  {
    id: "e1",
    title: "11월 정기 모임",
    date: "2025-11-10",
    participants: mockMembers.slice(0, 3),
  },
  {
    id: "e2",
    title: "해커톤 준비",
    date: "2025-11-14",
    participants: mockMembers.slice(2, 5),
  },
];

const PayoutMemberSearchScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"members" | "events">("members");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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

  const filteredMembers = useMemo(() => {
    return mockMembers.filter((member) =>
      member.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((memberId) => memberId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === mockMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mockMembers.map((member) => member.id));
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

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const formatted = clickedDate.toISOString().split("T")[0];
    const event = mockEvents.find((item) => item.date === formatted);
    setSelectedEventId(event ? event.id : null);
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
    const selectedMembers = mockMembers
      .filter((member) => selectedIds.includes(member.id))
      .map((member) => ({ ...member, amount: 0 }));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedMembers));
    navigate(-1);
  };

  const handleEventComplete = () => {
    if (!selectedEventId) {
      alert("행사를 선택해 주세요.");
      return;
    }
    const event = mockEvents.find((item) => item.id === selectedEventId);
    if (!event) return;
    const eventMembers = event.participants.map((member) => ({
      ...member,
      amount: 0,
    }));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(eventMembers));
    navigate(-1);
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
                {selectedIds.length === mockMembers.length
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
            <div className="payout-calendar">
              <div className="calendar-header">
                <button
                  className="calendar-nav-btn"
                  onClick={goToPreviousMonth}
                  aria-label="이전 달"
                >
                  &lt;
                </button>
                <h2 className="calendar-month-year">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
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
                {["일", "월", "화", "수", "목", "금", "토"].map((label) => (
                  <div key={label} className="calendar-weekday">
                    {label}
                  </div>
                ))}
              </div>
              <div className="payout-calendar-grid">
                {getDaysInMonth(currentDate).map((day, index) => {
                  const isSelected =
                    day.isCurrentMonth &&
                    mockEvents.some((event) => {
                      const eventDate = new Date(event.date);
                      return (
                        eventDate.getFullYear() === currentDate.getFullYear() &&
                        eventDate.getMonth() === currentDate.getMonth() &&
                        eventDate.getDate() === day.date &&
                        event.id === selectedEventId
                      );
                    });
                  return (
                    <div
                      key={index}
                      className={`payout-calendar-day ${
                        day.isCurrentMonth ? "" : "other-month"
                      } ${isSelected ? "selected" : ""}`}
                      onClick={() =>
                        handleDayClick(day.date, day.isCurrentMonth)
                      }
                    >
                      {day.date}
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
