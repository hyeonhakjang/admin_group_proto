import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "posts" | "statistics" | "schedule" | "members" | "archive"
  >("posts");

  // 동아리 선택 모달 상태
  const [selectedClub, setSelectedClub] = useState("HICC");
  const [showClubModal, setShowClubModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 가입된 동아리 목록 (샘플 데이터)
  const [clubs, setClubs] = useState([
    {
      id: 1,
      name: "HICC",
      avatar: "/club1-image.png",
      role: "회장",
    },
    {
      id: 2,
      name: "브레인스워즈",
      avatar: "/club2-image.png",
      role: "동아리원",
    },
    {
      id: 3,
      name: "VOERA",
      avatar: "/club3-image.png",
      role: "부회장",
    },
  ]);

  const handleClubSelect = (club: (typeof clubs)[0]) => {
    if (!isDragging) {
      setSelectedClub(club.name);
      setShowClubModal(false);
    }
  };

  // 드래그 드롭 재정렬 함수
  const reorderClubs = (startIndex: number, endIndex: number) => {
    if (startIndex === endIndex) return;
    const newClubs = [...clubs];
    const [removed] = newClubs.splice(startIndex, 1);
    newClubs.splice(endIndex, 0, removed);
    setClubs(newClubs);
  };

  // HTML5 Drag API 핸들러 (데스크톱)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceIndex = draggedIndex;
    if (sourceIndex !== null && sourceIndex !== dropIndex) {
      const newClubs = Array.from(clubs);
      const [removed] = newClubs.splice(sourceIndex, 1);
      newClubs.splice(dropIndex, 0, removed);
      setClubs(newClubs);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    setDraggedIndex(index);
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null || touchStartY === null) return;
    e.preventDefault();
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;

    // 현재 터치 위치에 있는 항목 찾기
    const elements = document.elementsFromPoint(
      e.touches[0].clientX,
      e.touches[0].clientY
    );
    const targetItem = elements.find((el) =>
      el.classList.contains("club-modal-item")
    );

    if (targetItem) {
      const targetIndex = parseInt(
        targetItem.getAttribute("data-index") || "-1"
      );
      if (
        targetIndex >= 0 &&
        targetIndex !== draggedIndex &&
        Math.abs(deltaY) > 20
      ) {
        reorderClubs(draggedIndex, targetIndex);
        setDraggedIndex(targetIndex);
        setTouchStartY(currentY);
      }
    }
  };

  const handleTouchEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTouchStartY(null);
    setIsDragging(false);
  };

  // 공지글만 보기 토글 상태
  const [showNoticeOnly, setShowNoticeOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState("최신순");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null);
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "홍익대 HICC",
      authorAvatar: "/profile-icon.png",
      createdAt: "오늘 18:41",
      title: "9월 7일 정기 세션 안내 및 참여 신청",
      content:
        "이번 정기 세션에서는 웹 개발 기초와 React 프레임워크에 대해 다룹니다.",
      isNotice: true,
      category: "모집",
      likes: 2321,
      comments: 5321,
      views: 5321,
      isAuthor: false,
      isAdmin: false,
    },
    {
      id: 2,
      author: "홍익대 HICC",
      authorAvatar: "/profile-icon.png",
      createdAt: "오늘 18:41",
      title: "이번 달 회비 납부 관련 안내",
      content:
        "이번 달 회비 납부 안내입니다. 아래 결제 수단으로 송금하신 후, 하단의 송금 완료 버튼을 눌러 확인 요청을 진행해주세요.",
      isNotice: true,
      category: "홍보",
      likes: 1856,
      comments: 342,
      views: 2156,
      isAuthor: false,
      isAdmin: false,
    },
    {
      id: 3,
      author: "홍익대 HICC",
      authorAvatar: "/profile-icon.png",
      createdAt: "어제 15:30",
      title: "프로젝트 팀 구성 및 역할 배정 투표",
      content: "프로젝트 팀 구성 및 역할 배정에 대한 투표를 진행합니다.",
      isNotice: false,
      category: "잡담",
      likes: 892,
      comments: 156,
      views: 1234,
      isAuthor: true,
      isAdmin: false,
    },
  ]);

  const categories = ["잡담", "모집", "홍보"];
  const sortOptions = ["최신순", "인기순"];

  // 게시글 필터링 및 정렬
  const filteredAndSortedPosts = posts
    .filter((post) => {
      // 공지글 필터
      if (showNoticeOnly && !post.isNotice) return false;
      // 카테고리 필터
      if (selectedCategory && post.category !== selectedCategory) return false;
      return true;
    })
    .sort((a, b) => {
      if (selectedSort === "최신순") {
        // 날짜 기준 정렬 (간단한 예시)
        return b.id - a.id;
      } else if (selectedSort === "인기순") {
        return b.likes + b.comments - (a.likes + a.comments);
      }
      return 0;
    });

  // 더보기 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // 더보기 버튼이나 메뉴 내부가 아닌 경우에만 닫기
      if (!target.closest(".post-more-btn") && !target.closest(".more-menu")) {
        setShowMoreMenu(null);
      }
    };

    if (showMoreMenu !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMoreMenu]);

  // 무한 스크롤 (페이지 전체 스크롤)
  useEffect(() => {
    const handleScroll = () => {
      // 현재 스크롤 위치
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      // 문서 전체 높이
      const scrollHeight = document.documentElement.scrollHeight;
      // 화면 높이
      const clientHeight = document.documentElement.clientHeight;

      // 스크롤이 맨 아래에서 200px 이내일 때
      if (scrollHeight - scrollTop - clientHeight < 200) {
        // 더 많은 게시글 로드 (현재는 샘플 데이터만 있으므로 실제로는 API 호출)
        // 예: loadMorePosts();
        // console.log("더 많은 게시글 로드 필요");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [filteredAndSortedPosts]);

  // 멤버 검색 상태
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // 멤버 데이터
  const members = [
    {
      id: 1,
      name: "Karthi Rajasekar",
      email: "karthirajasekar23@gmail.com",
      role: "회장",
      isOwner: true,
    },
    {
      id: 2,
      name: "Jane Cooper",
      email: "jane@gmail.com",
      role: "부회장",
      isOwner: false,
    },
    {
      id: 3,
      name: "Robert Fox",
      email: "robertfox@gmail.com",
      role: "임원",
      isOwner: false,
    },
    {
      id: 4,
      name: "Darrell",
      email: "darrell@gmail.com",
      role: "동아리원",
      isOwner: false,
    },
    {
      id: 5,
      name: "Calvin",
      email: "calvin@gmail.com",
      role: "동아리원",
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
  const [showEventDetail, setShowEventDetail] = useState(false);

  // 공지 상세 및 참석/불참 모달 상태
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<
    "session" | "dues" | "general"
  >("session");
  const [attendanceChoice, setAttendanceChoice] = useState<
    "attend" | "absent" | null
  >(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [isRemittanceChecking, setIsRemittanceChecking] = useState(false);

  // 댓글 상태
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "김홍익",
      authorAvatar: "/profile-icon.png",
      content: "참여하겠습니다!",
      createdAt: "오늘 18:30",
      likes: 3,
      isLiked: false,
    },
    {
      id: 2,
      author: "이동아리",
      authorAvatar: "/profile-icon.png",
      content: "노트북 필수인가요?",
      createdAt: "오늘 18:25",
      likes: 1,
      isLiked: false,
    },
  ]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: "홍익대 HICC",
        authorAvatar: "/profile-icon.png",
        content: newComment,
        createdAt: "방금 전",
        likes: 0,
        isLiked: false,
      };
      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  const handleCommentLike = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
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

  const handleTabClick = (
    tab: "posts" | "statistics" | "schedule" | "members" | "archive"
  ) => {
    setActiveTab(tab);
    // 일정 탭이 아닌 다른 탭으로 이동할 때 일정 관련 상태 초기화
    if (tab !== "schedule") {
      setSelectedDate(null);
      setShowEventDetail(false);
    }
    // 일정 탭으로 돌아올 때도 상태 초기화
    if (tab === "schedule") {
      setSelectedDate(null);
      setShowEventDetail(false);
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
          <p
            className="nav-title"
            data-node-id="12:3019"
            onClick={() => setShowClubModal(true)}
            style={{ cursor: "pointer" }}
          >
            {selectedClub} ▼
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
            {/* 섹션 A: 공지글만 보기 토글 */}
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

            {/* 섹션 B, C: 카테고리 및 정렬 필터 */}
            <div className="posts-filter-row">
              {/* 섹션 B: 카테고리 필터 */}
              <div className="filter-wrapper">
                <button
                  className="filter-btn"
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowSortDropdown(false);
                  }}
                >
                  {selectedCategory || "카테고리"} ▼
                </button>
                {showCategoryDropdown && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        setSelectedCategory(null);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      전체
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="dropdown-item"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 섹션 C: 정렬 필터 */}
              <div className="filter-wrapper">
                <button
                  className="filter-btn"
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowCategoryDropdown(false);
                  }}
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

            {/* 섹션 D: 게시글 리스트 */}
            <div className="posts-list">
              {filteredAndSortedPosts.map((post) => (
                <div
                  key={post.id}
                  className="club-post-card"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    // 더보기 메뉴나 버튼 클릭 시에는 모달 열지 않음
                    if (
                      target.closest(".post-more-btn") ||
                      target.closest(".more-menu") ||
                      target.closest(".post-more-wrapper")
                    ) {
                      return;
                    }
                    setSelectedPost(post);
                    setShowPostModal(true);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {/* 섹션 D-A: 프로필 이미지, 이름, 작성 날짜 */}
                  <div className="post-header">
                    <div
                      className="post-author-section"
                      onClick={(e) => {
                        e.stopPropagation();
                        // 개인 프로필 페이지로 이동 (현재는 주석 처리)
                        // navigate(`/profile/${post.author}`);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="post-author-avatar">
                        <img src={post.authorAvatar} alt="작성자 프로필" />
                      </div>
                      <div className="post-author-info">
                        <div className="author-name-row">
                          <span className="author-name">{post.author}</span>
                          <span className="verified-badge">✓</span>
                        </div>
                        <span className="post-time">{post.createdAt}</span>
                      </div>
                    </div>
                    {/* 섹션 D-B: 더보기 메뉴 */}
                    <div className="post-more-wrapper">
                      <button
                        className="post-more-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMoreMenu(
                            showMoreMenu === post.id ? null : post.id
                          );
                        }}
                      >
                        ⋯
                      </button>
                      {showMoreMenu === post.id && (
                        <div className="more-menu">
                          {post.isAuthor && (
                            <button
                              className="more-menu-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                // 글 수정 기능
                                setShowMoreMenu(null);
                              }}
                            >
                              글 수정
                            </button>
                          )}
                          {(post.isAuthor || post.isAdmin) && (
                            <button
                              className="more-menu-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                // 글 삭제 기능
                                setPosts(posts.filter((p) => p.id !== post.id));
                                setShowMoreMenu(null);
                              }}
                            >
                              글 삭제
                            </button>
                          )}
                          <button
                            className="more-menu-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              // 신고 기능
                              setShowMoreMenu(null);
                            }}
                          >
                            신고
                          </button>
                          <button
                            className="more-menu-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              // 공유 기능
                              setShowMoreMenu(null);
                            }}
                          >
                            공유
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 섹션 D-C: 글 제목 영역 */}
                  <div className="post-title-section">
                    <h3 className="post-title">{post.title}</h3>
                  </div>
                  {/* 섹션 D-D, D-E: 좋아요/댓글 수와 카테고리 */}
                  <div className="post-footer-section">
                    <div className="post-engagement-counts">
                      <span className="engagement-count">
                        👍 {post.likes.toLocaleString()}
                      </span>
                      <span className="engagement-count">
                        💬 {post.comments.toLocaleString()}
                      </span>
                    </div>
                    <span className="post-category">{post.category}</span>
                  </div>
                </div>
              ))}
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
                  <>
                    {!showEventDetail ? (
                      <div
                        className="schedule-event-card"
                        onClick={() => setShowEventDetail(true)}
                        style={{ cursor: "pointer" }}
                      >
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
                                    <div className="comment-header">
                                      <div className="comment-author-info">
                                        <img
                                          src={
                                            comment.authorAvatar ||
                                            "/profile-icon.png"
                                          }
                                          alt={comment.author}
                                          className="comment-author-avatar"
                                        />
                                        <span className="comment-author">
                                          {comment.author}
                                        </span>
                                      </div>
                                      <div className="comment-actions">
                                        <button
                                          className={`comment-like-btn ${
                                            comment.isLiked ? "active" : ""
                                          }`}
                                          onClick={() =>
                                            handleCommentLike(comment.id)
                                          }
                                        >
                                          좋아요 {comment.likes}
                                        </button>
                                        <button className="comment-reply-btn">
                                          답글
                                        </button>
                                      </div>
                                    </div>
                                    <div className="comment-body">
                                      <p className="comment-content">
                                        {comment.content}
                                      </p>
                                      <span className="comment-date">
                                        {comment.createdAt}
                                      </span>
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

      {/* 게시글 상세 모달 */}
      {showPostModal && selectedPost && (
        <>
          <div
            className="post-modal-overlay"
            onClick={() => {
              setShowPostModal(false);
              setSelectedPost(null);
            }}
          ></div>
          <div className="post-modal">
            <div className="post-modal-header">
              <h3 className="post-modal-title">{selectedPost.title}</h3>
              <button
                className="post-modal-close"
                onClick={() => {
                  setShowPostModal(false);
                  setSelectedPost(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="post-modal-body">
              <div className="post-modal-author">
                <img
                  src={selectedPost.authorAvatar}
                  alt={selectedPost.author}
                  className="post-modal-author-avatar"
                />
                <span className="post-modal-author-name">
                  {selectedPost.author}
                </span>
                <span className="post-modal-date">
                  {selectedPost.createdAt}
                </span>
              </div>
              <div className="post-modal-content">{selectedPost.content}</div>
            </div>
          </div>
        </>
      )}

      {/* 글 작성 플로팅 버튼 */}
      {activeTab === "posts" && (
        <button
          className="floating-write-btn"
          onClick={() => navigate("/myclub/post/write")}
          aria-label="글 작성"
        >
          <span className="floating-write-icon">+</span>
        </button>
      )}

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
          <Link
            to="/booking"
            className={`tab ${
              location.pathname === "/booking" ? "active" : ""
            }`}
            data-name="tab4?"
            data-node-id="12:3081"
          >
            <div className="tab-icon" data-name="Icon" data-node-id="12:3082">
              <img
                alt="Booking Icon"
                className={`icon ${
                  location.pathname === "/booking" ? "active" : ""
                }`}
                src={imgIcon3}
              />
            </div>
            <p
              className={`tab-label ${
                location.pathname === "/booking" ? "active" : ""
              }`}
              data-node-id="12:3089"
            >
              예약/구매
            </p>
          </Link>

          {/* Chat Tab */}
          <Link
            to="/chat"
            className={`tab ${location.pathname === "/chat" ? "active" : ""}`}
            data-name="tab5?"
            data-node-id="12:3090"
          >
            <div className="tab-icon" data-name="Icon" data-node-id="12:3091">
              <img
                alt="Chat Icon"
                className={`icon ${
                  location.pathname === "/chat" ? "active" : ""
                }`}
                src={imgIcon4}
              />
            </div>
            <p
              className={`tab-label ${
                location.pathname === "/chat" ? "active" : ""
              }`}
              data-node-id="12:3096"
            >
              채팅
            </p>
          </Link>
        </div>
      </div>

      {/* 동아리 선택 모달 */}
      {showClubModal && (
        <>
          <div
            className="club-modal-overlay"
            onClick={() => setShowClubModal(false)}
          ></div>
          <div className="club-modal">
            <div className="club-modal-header">
              <h2 className="club-modal-title">동아리 선택</h2>
              <button
                className="club-modal-close"
                onClick={() => setShowClubModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="club-list">
              {clubs.map((club, index) => (
                <div
                  key={club.id}
                  data-index={index}
                  className={`club-modal-item ${
                    draggedIndex === index ? "dragging" : ""
                  } ${dragOverIndex === index ? "drag-over" : ""}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    if (draggedIndex !== null && draggedIndex !== index) {
                      setDragOverIndex(index);
                    }
                  }}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(index, e)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => {
                    if (!isDragging) {
                      handleClubSelect(club);
                    }
                  }}
                  style={{
                    cursor:
                      isDragging && draggedIndex === index
                        ? "grabbing"
                        : "grab",
                  }}
                >
                  <div className="club-modal-avatar">
                    <img src={club.avatar} alt={club.name} draggable={false} />
                  </div>
                  <div className="club-modal-name">{club.name}</div>
                  <div className="club-modal-role">{club.role}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 공지 상세 바텀시트 + 참석/불참 선택 */}
      {showPostDetail && (
        <>
          <div
            className="event-detail-overlay"
            onClick={() => setShowPostDetail(false)}
          ></div>
          <div className="post-detail-card">
            <div className="post-detail-inner">
              <button
                className="event-back-btn"
                onClick={() => setShowPostDetail(false)}
              >
                ← 뒤로가기
              </button>
              <h4 className="post-detail-title">
                {selectedPostType === "dues"
                  ? "이번 달 회비 납부 관련 안내"
                  : selectedPostType === "session"
                  ? "9월 7일 정기 세션 안내 및 참여 신청"
                  : "공지 상세"}
              </h4>
              <div className="post-detail-meta">
                <div className="post-detail-author">홍익대 HICC ✓</div>
                <div className="post-detail-time">오늘 18:41</div>
              </div>
              <div className="post-detail-body">
                {selectedPostType === "dues" ? (
                  <>
                    이번 달 회비 납부 안내입니다. 아래 결제 수단으로 송금하신
                    후, 하단의 송금 완료 버튼을 눌러 확인 요청을 진행해주세요.
                    납부 기한을 꼭 지켜주세요.
                  </>
                ) : (
                  <>
                    이번 정기 세션에서는 웹 개발 기초와 React 프레임워크에 대해
                    다룹니다. 초보자도 참여 가능하며, 실습 시간도 포함되어
                    있습니다. 노트북 지참 바랍니다.
                  </>
                )}
              </div>

              {selectedPostType === "dues" ? (
                <div className="dues-section">
                  <div className="dues-title">송금 방법 선택</div>
                  <div className="dues-methods">
                    <button className="dues-method-btn kakao">
                      카카오페이로 송금
                    </button>
                    <button className="dues-method-btn toss">
                      TOSS로 송금
                    </button>
                  </div>
                  <div className="dues-actions">
                    <button
                      className="remit-done-btn"
                      onClick={() => setIsRemittanceChecking(true)}
                    >
                      송금 완료
                    </button>
                    {isRemittanceChecking && (
                      <span className="remit-status">확인중</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="attendance-section">
                  <div className="attendance-title">참석 여부 선택</div>
                  <div className="attendance-options">
                    <button
                      className={`attendance-btn ${
                        attendanceChoice === "attend" ? "selected" : ""
                      }`}
                      onClick={() => {
                        setAttendanceChoice("attend");
                        setShowAttendanceModal(true);
                      }}
                    >
                      참석
                    </button>
                    <button
                      className={`attendance-btn ${
                        attendanceChoice === "absent" ? "selected" : ""
                      }`}
                      onClick={() => {
                        setAttendanceChoice("absent");
                        setShowAttendanceModal(true);
                      }}
                    >
                      불참
                    </button>
                  </div>
                </div>
              )}

              {/* 댓글 섹션 (공지 상세) */}
              <div className="event-comments-section">
                <h5 className="event-detail-section-title">
                  댓글 ({comments.length})
                </h5>

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
                      onChange={(e) => setNewComment(e.target.value)}
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

                <div className="comments-list">
                  {comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <div className="comment-author-info">
                          <img
                            src={comment.authorAvatar || "/profile-icon.png"}
                            alt={comment.author}
                            className="comment-author-avatar"
                          />
                          <span className="comment-author">
                            {comment.author}
                          </span>
                        </div>
                        <div className="comment-actions">
                          <button
                            className={`comment-like-btn ${
                              comment.isLiked ? "active" : ""
                            }`}
                            onClick={() => handleCommentLike(comment.id)}
                          >
                            좋아요 {comment.likes}
                          </button>
                          <button className="comment-reply-btn">답글</button>
                        </div>
                      </div>
                      <div className="comment-body">
                        <p className="comment-content">{comment.content}</p>
                        <span className="comment-date">
                          {comment.createdAt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 등록 확인 모달 */}
          {showAttendanceModal && (
            <>
              <div
                className="club-modal-overlay"
                onClick={() => setShowAttendanceModal(false)}
              ></div>
              <div className="attendance-modal">
                <div className="attendance-modal-header">
                  <h2 className="attendance-modal-title">참석 여부 등록</h2>
                  <button
                    className="club-modal-close"
                    onClick={() => setShowAttendanceModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="attendance-modal-body">
                  {attendanceChoice === "attend" ? "참석" : "불참"}으로
                  등록할까요?
                </div>
                <div className="attendance-modal-actions">
                  <button
                    className="attendance-cancel-btn"
                    onClick={() => setShowAttendanceModal(false)}
                  >
                    취소
                  </button>
                  <button
                    className="attendance-confirm-btn"
                    onClick={() => {
                      setShowAttendanceModal(false);
                      setShowPostDetail(false);
                    }}
                  >
                    확인
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MyClubScreen;
