import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./MyClubScreen.css";

// 이미지 상수들 (피그마에서 다운로드한 실제 아이콘들)
const imgTrailingIcon2 = "/search-icon.png"; // 검색 아이콘
const imgTrailingIcon1 = "/alarm-icon.png"; // 알림 아이콘
const imgIcon = "/home.png"; // 홈 아이콘
const imgIcon1 = "/community.png"; // 커뮤니티 아이콘
const imgIcon2 = "/myclub.png"; // 내 클럽 아이콘
const imgIcon3 = "/booking.png"; // 예약/구매 아이콘
const imgIcon4 = "/chat.png"; // 채팅 아이콘

const MyClubScreen: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<
    "posts" | "statistics" | "schedule" | "members" | "archive"
  >("posts");

  // 공지글만 보기 토글 상태
  const [showNoticeOnly, setShowNoticeOnly] = useState(false);

  // 멤버 검색 상태
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // 멤버 데이터
  const members = [
    {
      id: 1,
      name: "Karthi Rajasekar",
      email: "karthirajasekar23@gmail.com",
      role: "Owner",
      isOwner: true,
    },
    {
      id: 2,
      name: "Jane Cooper",
      email: "jane@gmail.com",
      role: "Edit",
      isOwner: false,
    },
    {
      id: 3,
      name: "Robert Fox",
      email: "robertfox@gmail.com",
      role: "Can View",
      isOwner: false,
    },
    {
      id: 4,
      name: "Darrell",
      email: "darrell@gmail.com",
      role: "Can View",
      isOwner: false,
    },
    {
      id: 5,
      name: "Calvin",
      email: "calvin@gmail.com",
      role: "Can View",
      isOwner: false,
    },
  ];

  // 검색 필터링된 멤버
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  // 달력 관련 상태
  const [currentDate, setCurrentDate] = useState(new Date(2024, 8, 7)); // 2024년 9월 7일
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
      }
    : null;

  const handleTabClick = (
    tab: "posts" | "statistics" | "schedule" | "members" | "archive"
  ) => {
    setActiveTab(tab);
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

  return (
    <div
      className="myclub-screen"
      data-name="내 동아리 화면"
      data-node-id="12:2999"
    >
      {/* Header Navigation Bar */}
      <div
        className="header-nav-bar"
        data-name="Header Navigation Bar With Title"
        data-node-id="12:3000"
      >
        {/* Navigation Bar */}
        <div
          className="nav-bar"
          data-name="Navigation Bar"
          data-node-id="12:3017"
        >
          <p className="nav-title" data-node-id="12:3019">
            HICC ▼
          </p>
          <div
            className="trailing-icons"
            data-name="Trailing Icon"
            data-node-id="12:3020"
          >
            <div
              className="trailing-icon"
              data-name="trailingIcon2?"
              data-node-id="12:3021"
            >
              <img
                alt="Trailing Icon 2"
                className="icon"
                src={imgTrailingIcon2}
              />
            </div>
            <div
              className="trailing-icon"
              data-name="trailingIcon1?"
              data-node-id="12:3034"
            >
              <img
                alt="Trailing Icon 1"
                className="icon"
                src={imgTrailingIcon1}
              />
            </div>
            <div
              className="profile-icon"
              data-name="profileIcon"
              data-node-id="9:641"
            >
              <img
                alt="Profile Icon"
                className="icon"
                src="/profile-icon.png"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inline Segment Tabs */}
      <div
        className="segment-tabs"
        data-name="Inline Segment Tabs Minimal with Icon"
        data-node-id="12:3315"
      >
        <div
          className="tabs-container"
          data-name="Tabs Minimal with Icon"
          data-node-id="12:3316"
        >
          <div className="tabs-wrapper">
            {/* Posts Tab */}
            <div
              className={`tab ${activeTab === "posts" ? "active" : ""}`}
              data-name="Tab"
              data-node-id="12:3345"
              onClick={() => handleTabClick("posts")}
            >
              <div
                className={`tab-underline ${
                  activeTab === "posts" ? "active" : ""
                }`}
                data-name="Underline"
                data-node-id="12:3347"
              >
                <p
                  className={`tab-text ${
                    activeTab === "posts" ? "active" : ""
                  }`}
                  data-node-id="12:3348"
                >
                  게시글
                </p>
              </div>
            </div>

            {/* Statistics Tab */}
            <div
              className={`tab ${activeTab === "statistics" ? "active" : ""}`}
              data-name="Tab"
              data-node-id="12:3328"
              onClick={() => handleTabClick("statistics")}
            >
              <div
                className={`tab-underline ${
                  activeTab === "statistics" ? "active" : ""
                }`}
                data-name="Underline"
                data-node-id="12:3330"
              >
                <p
                  className={`tab-text ${
                    activeTab === "statistics" ? "active" : ""
                  }`}
                  data-node-id="12:3331"
                >
                  통계
                </p>
              </div>
            </div>

            {/* Schedule Tab */}
            <div
              className={`tab ${activeTab === "schedule" ? "active" : ""}`}
              data-name="Tab"
              data-node-id="12:3332"
              onClick={() => handleTabClick("schedule")}
            >
              <div
                className={`tab-underline ${
                  activeTab === "schedule" ? "active" : ""
                }`}
                data-name="Underline"
                data-node-id="12:3333"
              >
                <p
                  className={`tab-text ${
                    activeTab === "schedule" ? "active" : ""
                  }`}
                  data-node-id="12:3334"
                >
                  일정
                </p>
              </div>
            </div>

            {/* Members Tab */}
            <div
              className={`tab ${activeTab === "members" ? "active" : ""}`}
              data-name="Tab"
              data-node-id="12:3335"
              onClick={() => handleTabClick("members")}
            >
              <div
                className={`tab-underline ${
                  activeTab === "members" ? "active" : ""
                }`}
                data-name="Underline"
                data-node-id="12:3336"
              >
                <p
                  className={`tab-text ${
                    activeTab === "members" ? "active" : ""
                  }`}
                  data-node-id="12:3337"
                >
                  멤버
                </p>
              </div>
            </div>

            {/* Archive Tab */}
            <div
              className={`tab ${activeTab === "archive" ? "active" : ""}`}
              data-name="Tab"
              data-node-id="12:3338"
              onClick={() => handleTabClick("archive")}
            >
              <div
                className={`tab-underline ${
                  activeTab === "archive" ? "active" : ""
                }`}
                data-name="Underline"
                data-node-id="12:3339"
              >
                <p
                  className={`tab-text ${
                    activeTab === "archive" ? "active" : ""
                  }`}
                  data-node-id="12:3340"
                >
                  자료실
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="main-content"
        data-name="Main Content"
        data-node-id="12:3039"
      >
        {activeTab === "posts" && (
          <div className="posts-content">
            {/* 공지글만 보기 토글 */}
            <div className="posts-filter-bar">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showNoticeOnly}
                  onChange={(e) => setShowNoticeOnly(e.target.checked)}
                />
                <span className="toggle-label">공지글만</span>
                <span className="toggle-slider"></span>
              </label>
            </div>
            {/* 게시글 리스트 */}
            <div className="posts-list">
              {/* 게시글 1 - 공지글 */}
              {(!showNoticeOnly || true) && (
                <div className="club-post-card">
                  <div className="post-header">
                    <div className="post-author-section">
                      <div className="post-author-avatar">
                        <img src="/profile-icon.png" alt="작성자 프로필" />
                      </div>
                      <div className="post-author-info">
                        <div className="author-name-row">
                          <span className="author-name">홍익대 HICC</span>
                          <span className="verified-badge">✓</span>
                        </div>
                        <span className="post-time">오늘 18:41</span>
                      </div>
                    </div>
                    <button className="post-more-btn">⋯</button>
                  </div>
                  <div className="post-title-section">
                    <div className="post-topic-icons">
                      <span className="topic-icon">📊</span>
                      <span className="topic-icon">💡</span>
                    </div>
                    <h3 className="post-title">
                      HICC 정기 세션 안내 및 참여 신청
                    </h3>
                    <div className="post-topic-icons-right">
                      <span className="topic-icon">📈</span>
                      <span className="topic-icon">💰</span>
                    </div>
                  </div>
                  <div className="post-engagement-section">
                    <button className="engagement-btn">👍 2,321</button>
                    <button className="engagement-btn">💬 5,321</button>
                    <button className="engagement-btn">🔗</button>
                    <span className="engagement-views">👁 5,321</span>
                  </div>
                </div>
              )}

              {/* 게시글 2 - 공지글 */}
              {(!showNoticeOnly || true) && (
                <div className="club-post-card">
                  <div className="post-header">
                    <div className="post-author-section">
                      <div className="post-author-avatar">
                        <img src="/profile-icon.png" alt="작성자 프로필" />
                      </div>
                      <div className="post-author-info">
                        <div className="author-name-row">
                          <span className="author-name">홍익대 HICC</span>
                          <span className="verified-badge">✓</span>
                        </div>
                        <span className="post-time">오늘 18:41</span>
                      </div>
                    </div>
                    <button className="post-more-btn">⋯</button>
                  </div>
                  <div className="post-title-section">
                    <h3 className="post-title">이번 달 회비 납부 관련 안내</h3>
                    <div className="post-topic-icons-right">
                      <span className="topic-icon">🏢</span>
                      <span className="topic-icon">📈</span>
                    </div>
                  </div>
                  <div className="post-engagement-section">
                    <button className="engagement-btn">👍 1,856</button>
                    <button className="engagement-btn">💬 342</button>
                    <button className="engagement-btn">🔗</button>
                    <span className="engagement-views">👁 2,156</span>
                  </div>
                </div>
              )}

              {/* 게시글 3 - 일반글 */}
              {(!showNoticeOnly || false) && (
                <div className="club-post-card">
                  <div className="post-header">
                    <div className="post-author-section">
                      <div className="post-author-avatar">
                        <img src="/profile-icon.png" alt="작성자 프로필" />
                      </div>
                      <div className="post-author-info">
                        <div className="author-name-row">
                          <span className="author-name">홍익대 HICC</span>
                          <span className="verified-badge">✓</span>
                          <span className="post-time">어제 15:30</span>
                        </div>
                      </div>
                    </div>
                    <button className="post-more-btn">⋯</button>
                  </div>
                  <div className="post-title-section">
                    <div className="post-topic-icons">
                      <span className="topic-icon">📋</span>
                    </div>
                    <h3 className="post-title">
                      프로젝트 팀 구성 및 역할 배정 투표
                    </h3>
                  </div>
                  <div className="post-engagement-section">
                    <button className="engagement-btn">👍 892</button>
                    <button className="engagement-btn">💬 156</button>
                    <button className="engagement-btn">🔗</button>
                    <span className="engagement-views">👁 1,234</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "statistics" && (
          <div className="statistics-content">
            <h2>통계</h2>
            <p>통계 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        )}
        {activeTab === "schedule" && (
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
                  <div className="schedule-event-card">
                    <h4 className="schedule-event-title">
                      {selectedEvent.title}
                    </h4>
                    <div className="schedule-event-info">
                      <span className="schedule-event-group">
                        {selectedEvent.group} · {selectedEvent.participants}명
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
                  <div className="schedule-event-card">
                    <p className="no-event-message">일정이 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === "members" && (
          <div className="members-content">
            {/* 멤버 헤더 */}
            <div className="members-header">
              <h2 className="members-title">멤버</h2>
              <button className="invite-btn">+ Invite</button>
            </div>

            {/* 검색 필드 */}
            <div className="members-search-container">
              <img src="/search-icon.png" alt="검색" className="search-icon" />
              <input
                type="text"
                className="members-search-input"
                placeholder="Search"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
              />
            </div>

            {/* 멤버 리스트 */}
            <div className="members-list">
              {filteredMembers.map((member) => (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <div className="member-avatar">
                      <img src="/profile-icon.png" alt={member.name} />
                    </div>
                    <div className="member-details">
                      <div className="member-name">{member.name}</div>
                      <div className="member-email">{member.email}</div>
                    </div>
                  </div>
                  <button
                    className={`member-role-btn ${
                      member.isOwner ? "owner-role" : ""
                    }`}
                  >
                    {member.role}
                    {!member.isOwner && (
                      <span className="dropdown-icon">▼</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "archive" && (
          <div className="archive-content">
            <h2>자료실</h2>
            <p>자료실 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div
        className="bottom-tab-bar"
        data-name="Bottom Tab Bar with Labels"
        data-node-id="12:3040"
      >
        <div className="tabs" data-name="tabs" data-node-id="12:3041">
          {/* Home Tab */}
          <Link
            to="/"
            className={`tab ${location.pathname === "/" ? "active" : ""}`}
            data-name="tab1"
            data-node-id="12:3042"
          >
            <div className="tab-icon" data-name="Icon" data-node-id="12:3043">
              <img alt="Home Icon" className="icon" src={imgIcon} />
            </div>
            <p
              className={`tab-label ${
                location.pathname === "/" ? "active" : ""
              }`}
              data-node-id="12:3052"
            >
              홈
            </p>
          </Link>

          {/* Community Tab */}
          <Link
            to="/community"
            className={`tab ${
              location.pathname === "/community" ? "active" : ""
            }`}
            data-name="tab2"
            data-node-id="12:3053"
          >
            <div className="tab-icon" data-name="Icon" data-node-id="12:3054">
              <img alt="Community Icon" className="icon" src={imgIcon1} />
            </div>
            <p
              className={`tab-label ${
                location.pathname === "/community" ? "active" : ""
              }`}
              data-node-id="12:3070"
            >
              커뮤니티
            </p>
          </Link>

          {/* My Club Tab */}
          <Link
            to="/myclub"
            className={`tab ${location.pathname === "/myclub" ? "active" : ""}`}
            data-name="tab3"
            data-node-id="12:3071"
          >
            <div className="tab-icon" data-name="Icon" data-node-id="12:3072">
              <img alt="My Club Icon" className="icon" src={imgIcon2} />
            </div>
            <p
              className={`tab-label ${
                location.pathname === "/myclub" ? "active" : ""
              }`}
              data-node-id="12:3080"
            >
              내 동아리
            </p>
          </Link>

          {/* Booking/Purchase Tab */}
          <div className="tab" data-name="tab4?" data-node-id="12:3081">
            <div className="tab-icon" data-name="Icon" data-node-id="12:3082">
              <img alt="Booking Icon" className="icon" src={imgIcon3} />
            </div>
            <p className="tab-label" data-node-id="12:3089">
              예약/구매
            </p>
          </div>

          {/* Chat Tab */}
          <div className="tab" data-name="tab5?" data-node-id="12:3090">
            <div className="tab-icon" data-name="Icon" data-node-id="12:3091">
              <img alt="Chat Icon" className="icon" src={imgIcon4} />
            </div>
            <p className="tab-label" data-node-id="12:3096">
              채팅
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyClubScreen;
