import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./MyClubScreen.css";

// 이미지 상수들 (피그마에서 다운로드한 실제 아이콘들)
const imgTrailingIcon2 = "/search-icon.png"; // 검색 아이콘
const imgTrailingIcon1 = "/alarm-icon.png"; // 알림 아이콘
const imgIcon = "/home.png"; // 홈 아이콘
const imgIcon1 = "/community.png"; // 커뮤니티 아이콘
const imgIcon2 = "/myclub.png"; // 내 클럽 아이콘
const imgIcon3 = "/booking.png"; // 예약/구매 아이콘
const imgIcon4 = "/chat.png"; // 채팅 아이콘

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
  avatar: string;
  role: string;
  club_user_id?: number;
  club_personal_id?: number;
}

const MyClubScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "posts" | "payout" | "schedule" | "archive"
  >("posts");

  // 사용자 정보 상태
  const [userData, setUserData] = useState<UserData | null>(null);

  // 동아리 선택 모달 상태
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showClubModal, setShowClubModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 사이드 네비게이션 모달 상태
  const [showSideNav, setShowSideNav] = useState(false);
  const [profileInfo, setProfileInfo] = useState<{
    nickname: string;
    role: string;
    profileImage: string;
  } | null>(null);

  const canAccessSideNav =
    userData?.type === "club" ||
    selectedClub?.role === "회장" ||
    selectedClub?.role === "스태프";

  // 가입된 동아리 목록
  const [clubs, setClubs] = useState<Club[]>([]);

  // 정산 데이터 상태
  interface PayoutItem {
    id: number;
    title: string;
    totalMembers: number;
    requestDate: string;
    userStatus: "pending" | "paid" | "unpaid";
    userAmount?: number;
  }

  const [payouts, setPayouts] = useState<PayoutItem[]>([]);

  // 정산 데이터 로드 함수
  const loadPayouts = React.useCallback(async () => {
    if (
      !selectedClub ||
      !selectedClub.club_user_id ||
      !selectedClub.club_personal_id
    ) {
      setPayouts([]);
      return;
    }

    try {
      // 1. payout_participant에서 현재 사용자의 club_personal_id로 필터링하여 payout_id 목록 가져오기
      const { data: participants, error: participantError } = await supabase
        .from("payout_participant")
        .select(
          `
          payout_id,
          payout_amount,
          status,
          club_personal_payout:payout_id (
            id,
            title,
            content,
            applied_date,
            created_at,
            club_user_id
          )
        `
        )
        .eq("club_personal_id", selectedClub.club_personal_id);

      if (participantError) {
        throw participantError;
      }

      if (!participants || participants.length === 0) {
        setPayouts([]);
        return;
      }

      // 2. payout_id 목록 추출
      const payoutIds = participants.map((p: any) => p.payout_id);

      // 3. club_personal_payout에서 해당 정산들의 전체 정보 가져오기 (전체 참가자 포함)
      const { data: payoutsData, error: payoutsError } = await supabase
        .from("club_personal_payout")
        .select(
          `
          id,
          title,
          content,
          applied_date,
          created_at,
          club_user_id,
          payout_participant (
            id,
            payout_amount,
            club_personal_id,
            status
          )
        `
        )
        .in("id", payoutIds)
        .eq("club_user_id", selectedClub.club_user_id)
        .order("applied_date", { ascending: false });

      if (payoutsError) {
        throw payoutsError;
      }

      // 4. 데이터 매핑
      const mapped: PayoutItem[] = (payoutsData || []).map((payout: any) => {
        const requestDate =
          payout.applied_date ||
          payout.created_at ||
          new Date().toISOString().split("T")[0];
        const participants = payout.payout_participant || [];
        const totalMembers = participants.length;
        const currentMemberId = selectedClub.club_personal_id;
        const currentParticipant = participants.find(
          (participant: any) =>
            String(participant.club_personal_id) ===
            String(currentMemberId || "")
        );
        const status = currentParticipant?.status || "pending";

        return {
          id: payout.id,
          title: payout.title,
          totalMembers,
          requestDate,
          userStatus:
            status === "paid"
              ? "paid"
              : status === "unpaid"
              ? "unpaid"
              : "pending",
          userAmount: currentParticipant?.payout_amount,
        };
      });

      // 동일한 payout이 중복으로 들어오는 경우(이전 데이터 등) 대비
      const uniqueMap = new Map<number, PayoutItem>();
      mapped.forEach((item) => {
        uniqueMap.set(item.id, item);
      });

      setPayouts(Array.from(uniqueMap.values()));
    } catch (error) {
      console.error("정산 데이터 로드 중 오류:", error);
      setPayouts([]);
    }
  }, [selectedClub]);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserData = () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
      } else {
        // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
        navigate("/login");
      }
    };

    loadUserData();
  }, [navigate]);

  const loadClubs = React.useCallback(async () => {
    if (!userData) return;

    try {
      if (userData.type === "personal") {
        // 개인 계정: 승인된 동아리 목록 로드
        const { data: clubPersonals, error } = await supabase
          .from("club_personal")
          .select(
            `
            id,
            role,
            approved,
            club_user:club_user_id (
              id,
              club_name
            )
          `
          )
          .eq("personal_user_id", userData.id)
          .eq("approved", true);

        if (error) {
          console.error("동아리 목록 로드 오류:", error);
        } else if (clubPersonals) {
          const clubsList: Club[] = clubPersonals.map((cp: any) => ({
            id: cp.club_user?.id || 0,
            name: cp.club_user?.club_name || "",
            avatar: "/profile-icon.png", // 기본 아바타
            role: cp.role || "동아리원",
            club_user_id: cp.club_user?.id,
            club_personal_id: cp.id,
          }));

          setClubs(clubsList);

          // 첫 번째 동아리를 기본 선택
          if (clubsList.length > 0 && !selectedClub) {
            const firstClub = clubsList[0];
            setSelectedClub(firstClub);
            sessionStorage.setItem("selectedClub", JSON.stringify(firstClub));
          }
        }
      } else if (userData.type === "club") {
        // 클럽 계정: 본인 동아리만 표시
        const { data: clubUser, error } = await supabase
          .from("club_user")
          .select("id, club_name")
          .eq("id", userData.id)
          .single();

        if (error) {
          console.error("동아리 정보 로드 오류:", error);
        } else if (clubUser) {
          const club: Club = {
            id: clubUser.id,
            name: clubUser.club_name,
            avatar: "/profile-icon.png",
            role: "관리자",
            club_user_id: clubUser.id,
          };

          setClubs([club]);
          setSelectedClub(club);
          sessionStorage.setItem("selectedClub", JSON.stringify(club));
        }
      }
    } catch (error) {
      console.error("동아리 목록 로드 중 오류:", error);
    }
  }, [userData, selectedClub]);

  // 동아리 목록 로드
  useEffect(() => {
    if (userData) {
      loadClubs();
    }
  }, [userData, loadClubs]);

  // URL 파라미터에서 탭과 날짜 읽기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    const dateParam = params.get("date");

    // 탭 파라미터가 있으면 해당 탭으로 설정
    if (
      tabParam &&
      ["posts", "payout", "schedule", "archive"].includes(tabParam)
    ) {
      setActiveTab(tabParam as "posts" | "payout" | "schedule" | "archive");
    }

    // 날짜 파라미터가 있으면 해당 날짜 선택
    if (dateParam && tabParam === "schedule") {
      try {
        // YYYY-MM-DD 형식의 날짜 파싱
        const [year, month, day] = dateParam.split("-").map(Number);
        const parsedDate = new Date(year, month - 1, day);
        setSelectedDate(parsedDate);
        // 해당 날짜가 포함된 월로 달력 이동
        setCurrentDate(new Date(year, month - 1, 1));
      } catch (error) {
        console.error("날짜 파라미터 파싱 오류:", error);
      }
    }
  }, [location.search]);

  // 날짜 포맷팅 헬퍼 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 0 ? "방금 전" : `${minutes}분 전`;
      }
      return `오늘 ${date.getHours()}:${String(date.getMinutes()).padStart(
        2,
        "0"
      )}`;
    } else if (days === 1) {
      return `어제 ${date.getHours()}:${String(date.getMinutes()).padStart(
        2,
        "0"
      )}`;
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
  };

  const loadPosts = React.useCallback(async () => {
    if (!selectedClub?.club_user_id || !userData) return;

    try {
      // club_personal을 통해 club_user_id로 필터링한 후 게시글 로드
      const { data: clubPersonals, error: cpError } = await supabase
        .from("club_personal")
        .select("id")
        .eq("club_user_id", selectedClub.club_user_id)
        .eq("approved", true);

      if (cpError) {
        console.error("club_personal 조회 오류:", cpError);
        return;
      }

      if (!clubPersonals || clubPersonals.length === 0) {
        setPosts([]);
        return;
      }

      const clubPersonalIds = clubPersonals.map((cp) => cp.id);

      const { data: articles, error } = await supabase
        .from("club_personal_article")
        .select(
          `
          id,
          title,
          content,
          notification,
          written_date,
          created_at,
          club_personal:club_personal_id (
            id,
            role,
            personal_user:personal_user_id (
              id,
              personal_name,
              profile_image_url
            )
          ),
          club_personal_article_category:club_personal_article_category (
            name
          )
        `
        )
        .in("club_personal_id", clubPersonalIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("게시글 로드 오류:", error);
        setPosts([]);
      } else if (articles) {
        // 게시글 데이터 변환 및 좋아요/댓글 수 로드
        const transformedPosts = await Promise.all(
          articles.map(async (article: any) => {
            // 좋아요 수 로드
            const { count: likeCount } = await supabase
              .from("club_personal_like")
              .select("*", { count: "exact", head: true })
              .eq("club_personal_article_id", article.id);

            // 댓글 수 로드
            const { count: commentCount } = await supabase
              .from("club_personal_comment")
              .select("*", { count: "exact", head: true })
              .eq("club_personal_article_id", article.id);

            const authorName =
              article.club_personal?.personal_user?.personal_name ||
              selectedClub?.name ||
              "작성자";
            const authorAvatar =
              article.club_personal?.personal_user?.profile_image_url ||
              "/profile-icon.png";

            // 작성자 확인 (현재 사용자가 작성자인지)
            const isAuthor =
              userData.type === "personal" &&
              article.club_personal?.personal_user?.id === userData.id;

            // 카테고리 추출 (club_personal_article_category에서)
            const articleCategories =
              article.club_personal_article_category || [];
            const categoryNames = Array.isArray(articleCategories)
              ? articleCategories.map((cat: any) => cat.name).filter(Boolean)
              : [];
            // 첫 번째 카테고리를 기본으로 사용 (하위 호환성)
            const primaryCategory = categoryNames[0] || "";

            return {
              id: article.id,
              author: authorName,
              authorAvatar: authorAvatar,
              createdAt: formatDate(article.created_at || article.written_date),
              title: article.title || "",
              content: article.content || "",
              isNotice: Boolean(article.notification),
              category: primaryCategory, // 첫 번째 카테고리
              categories: categoryNames, // 모든 카테고리 배열
              likes: likeCount || 0,
              comments: commentCount || 0,
              views: 0, // TODO: 조회수는 별도 필드 필요
              isAuthor: isAuthor,
              isAdmin: userData.type === "club" || false,
            };
          })
        );

        // 모든 게시글의 카테고리를 수집하여 고유한 카테고리 목록 생성
        const allCategories = new Set<string>();
        transformedPosts.forEach((post) => {
          if (post.categories && post.categories.length > 0) {
            post.categories.forEach((cat: string) => allCategories.add(cat));
          } else if (post.category) {
            allCategories.add(post.category);
          }
        });
        setCategories(Array.from(allCategories).sort());

        setPosts(transformedPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("게시글 로드 중 오류:", error);
      setPosts([]);
    }
  }, [selectedClub, userData]);

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

  // 선택된 동아리 변경 시 데이터 로드
  useEffect(() => {
    if (!selectedClub || !selectedClub.club_user_id) return;

    const loadData = async () => {
      try {
        if (activeTab === "posts") {
          // 게시글 로드
          await loadPosts();
        } else if (activeTab === "schedule") {
          // 일정 로드
          await loadSchedules();
        } else if (activeTab === "payout") {
          // 정산 로드
          await loadPayouts();
        }
      } catch (error) {
        console.error("데이터 로드 오류:", error);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClub?.club_user_id, activeTab]);

  // 프로필 정보 로드 (동아리 내부용)
  useEffect(() => {
    const loadProfileInfo = async () => {
      if (!userData) return;

      // personal 타입일 때는 club_personal_id가 필요
      if (userData.type === "personal" && !selectedClub?.club_personal_id)
        return;

      try {
        if (userData.type === "personal" && selectedClub?.club_personal_id) {
          const { data: clubPersonal, error } = await supabase
            .from("club_personal")
            .select(
              `
              role,
              personal_user:personal_user_id (
                id,
                personal_name,
                profile_image_url
              )
            `
            )
            .eq("id", selectedClub.club_personal_id)
            .single();

          if (error) {
            console.error("프로필 정보 로드 오류:", error);
            return;
          }

          if (clubPersonal) {
            const personalUser = Array.isArray(clubPersonal.personal_user)
              ? clubPersonal.personal_user[0]
              : clubPersonal.personal_user;
            setProfileInfo({
              nickname: personalUser?.personal_name || userData.name,
              role: clubPersonal.role || "동아리원",
              profileImage:
                personalUser?.profile_image_url || "/profile-icon.png",
            });
          }
        } else if (userData.type === "club") {
          // club_user 테이블에서 동아리 정보 가져오기
          const { data: clubUserData, error: clubUserError } = await supabase
            .from("club_user")
            .select("club_name, profile_image_url")
            .eq("id", userData.id)
            .single();

          if (clubUserError) {
            console.error("동아리 정보 로드 오류:", clubUserError);
            setProfileInfo({
              nickname: selectedClub?.name || userData.name,
              role: "동아리 계정",
              profileImage: "/profile-icon.png",
            });
          } else {
            setProfileInfo({
              nickname:
                clubUserData?.club_name || selectedClub?.name || userData.name,
              role: "동아리 계정",
              profileImage:
                clubUserData?.profile_image_url || "/profile-icon.png",
            });
          }
        }
      } catch (error) {
        console.error("프로필 정보 로드 중 오류:", error);
      }
    };

    loadProfileInfo();
  }, [userData, selectedClub]);

  const handleClubSelect = (club: Club) => {
    if (!isDragging) {
      setSelectedClub(club);
      // sessionStorage에 저장하여 다른 페이지에서 사용할 수 있도록 함
      sessionStorage.setItem("selectedClub", JSON.stringify(club));
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
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null);
  const [posts, setPosts] = useState<any[]>([]);

  const [categories, setCategories] = useState<string[]>([]);
  const sortOptions = ["최신순", "인기순"];

  // 게시글 필터링 및 정렬
  const filteredAndSortedPosts = posts
    .filter((post) => {
      // 공지글 필터
      if (showNoticeOnly && !post.isNotice) return false;
      // 카테고리 필터 (categories 배열에 선택된 카테고리가 포함되어 있는지 확인)
      if (selectedCategory) {
        const hasCategory =
          (post.categories && post.categories.includes(selectedCategory)) ||
          post.category === selectedCategory;
        if (!hasCategory) return false;
      }
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

  // 달력 관련 상태
  const [currentDate, setCurrentDate] = useState(() => {
    // 초기값을 현재 날짜로 설정
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);

  // 공지 상세 및 참석/불참 모달 상태
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [attendanceChoice, setAttendanceChoice] = useState<
    "attend" | "absent" | null
  >(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [isRemittanceChecking, setIsRemittanceChecking] = useState(false);

  // 댓글 상태
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  // 일정 데이터
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);

  // 일정 댓글 로드 함수
  const loadScheduleComments = React.useCallback(async (scheduleId: number) => {
    if (!scheduleId) return;

    try {
      const { data: scheduleComments, error } = await supabase
        .from("schedule_comment")
        .select(
          `
          id,
          content,
          commented_date,
          club_personal:club_personal_id (
            personal_user:personal_user_id (
              id,
              personal_name,
              profile_image_url
            ),
            club_user:club_user_id (
              id,
              club_name
            )
          )
        `
        )
        .eq("schedule_id", scheduleId)
        .order("commented_date", { ascending: false });

      if (error) {
        console.error("댓글 로드 오류:", error);
        setComments([]);
        return;
      }

      if (scheduleComments) {
        const formattedComments = scheduleComments.map((comment: any) => {
          const clubPersonal = comment.club_personal;
          const personalUser = clubPersonal?.personal_user;
          const clubUser = clubPersonal?.club_user;

          // 개인 유저가 있으면 개인 유저 정보 사용, 없으면 클럽 유저 정보 사용
          const authorName =
            personalUser?.personal_name || clubUser?.club_name || "익명";
          const authorAvatar =
            personalUser?.profile_image_url || "/profile-icon.png";

          return {
            id: comment.id,
            author: authorName,
            authorAvatar: authorAvatar,
            content: comment.content,
            createdAt: comment.commented_date
              ? new Date(comment.commented_date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "",
          };
        });
        setComments(formattedComments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("댓글 로드 중 오류:", err);
      setComments([]);
    }
  }, []);

  // 일정 댓글 추가 함수
  const handleAddComment = async () => {
    // club_user 계정은 댓글 작성 불가
    if (userData?.type === "club") {
      return;
    }

    if (!newComment.trim() || !selectedEvent?.id) {
      return;
    }

    // club_personal_id 찾기
    let clubPersonalId: number | null = null;

    if (selectedClub?.club_personal_id) {
      // 개인 계정 사용자: 이미 club_personal_id가 있음
      clubPersonalId = selectedClub.club_personal_id;
    } else if (
      (userData?.type as string) === "club" &&
      selectedClub?.club_user_id
    ) {
      // 클럽 계정 사용자: 해당 클럽의 club_personal 레코드 찾기
      // club_user 계정이 자신의 클럽 일정에 댓글을 작성하는 경우,
      // 해당 클럽의 첫 번째 club_personal 레코드를 사용

      const { data: clubPersonalList, error: clubPersonalError } =
        await supabase
          .from("club_personal")
          .select("id")
          .eq("club_user_id", selectedClub.club_user_id)
          .eq("approved", true)
          .limit(1);

      if (clubPersonalError) {
        console.error("club_personal 조회 오류:", clubPersonalError);
        alert(
          "댓글을 작성할 수 없습니다. 동아리 정보를 불러오는 중 오류가 발생했습니다."
        );
        return;
      }

      if (clubPersonalList && clubPersonalList.length > 0) {
        // 해당 클럽의 첫 번째 club_personal 레코드 사용
        clubPersonalId = clubPersonalList[0].id;
      } else {
        // club_personal 레코드가 없는 경우 (클럽에 가입한 개인 사용자가 없는 경우)
        console.error("club_personal 레코드를 찾을 수 없습니다.", {
          club_user_id: selectedClub.club_user_id,
        });
        alert("댓글을 작성하려면 동아리에 가입한 회원이 있어야 합니다.");
        return;
      }
    }

    if (!clubPersonalId) {
      console.error("club_personal_id를 찾을 수 없습니다.", {
        selectedClub,
        userData,
        selectedEvent,
      });
      alert("댓글을 작성할 수 없습니다. 동아리 가입 정보를 확인해주세요.");
      return;
    }

    try {
      const { error } = await supabase.from("schedule_comment").insert({
        schedule_id: selectedEvent.id,
        club_personal_id: clubPersonalId,
        content: newComment.trim(),
        commented_date: new Date().toISOString().split("T")[0],
      });

      if (error) {
        console.error("댓글 등록 오류:", error);
        console.error("에러 상세:", JSON.stringify(error, null, 2));
        alert(`댓글 등록에 실패했습니다: ${error.message}`);
        return;
      }

      // 댓글 목록 새로고침
      await loadScheduleComments(selectedEvent.id);
      setNewComment("");
    } catch (err: any) {
      console.error("댓글 등록 중 오류:", err);
      alert(`댓글 등록 중 오류가 발생했습니다: ${err.message || err}`);
    }
  };

  // selectedEvent가 변경될 때 댓글 로드
  useEffect(() => {
    if (selectedEvent?.id) {
      loadScheduleComments(selectedEvent.id);
    } else {
      setComments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent?.id]);

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

  const handleTabClick = (tab: "posts" | "payout" | "schedule" | "archive") => {
    setActiveTab(tab);
    // 일정 탭이 아닌 다른 탭으로 이동할 때 일정 관련 상태 초기화
    if (tab !== "schedule") {
      setSelectedDate(null);
      setShowEventDetail(false);
    }
    // 일정 탭으로 돌아올 때 상태 초기화 및 현재 날짜로 설정
    if (tab === "schedule") {
      setSelectedDate(null);
      setShowEventDetail(false);
      // 현재 날짜로 달력 설정
      const today = new Date();
      setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
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

  const handleDateClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);
    setSelectedEvent(null); // 상세 보기 초기화

    // 해당 날짜의 모든 일정 찾기
    const eventsOnDate = schedules.filter((schedule) => {
      if (!schedule.date) return false;
      // 날짜 문자열을 YYYY-MM-DD 형식으로 파싱하여 시간대 문제 방지
      const dateStr = schedule.date;
      const [year, month, day] = dateStr.split("-").map(Number);
      const scheduleDate = new Date(year, month - 1, day);
      return (
        scheduleDate.getFullYear() === clickedDate.getFullYear() &&
        scheduleDate.getMonth() === clickedDate.getMonth() &&
        scheduleDate.getDate() === clickedDate.getDate()
      );
    });

    if (eventsOnDate.length > 0) {
      // 모든 일정의 참가자 정보 로드
      const loadAllParticipants = async () => {
        const eventsWithParticipants = await Promise.all(
          eventsOnDate.map(async (eventOnDate) => {
            const { data: participants, count } = await supabase
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
              `,
                { count: "exact" }
              )
              .eq("schedule_id", eventOnDate.id);

            const participantAvatars = (participants || [])
              .map(
                (p: any) => p.club_personal?.personal_user?.profile_image_url
              )
              .filter((url: string) => url) // null/undefined 제거
              .slice(0, 4); // 최대 4개만 표시

            // agenda 필드 처리 (배열 또는 null일 수 있음)
            const agendaList = Array.isArray(eventOnDate.agenda)
              ? eventOnDate.agenda
              : eventOnDate.agenda
              ? [eventOnDate.agenda]
              : [];

            // 현재 사용자의 참가 여부 확인
            let isCurrentUserParticipant = false;
            let currentUserClubPersonalId: number | null = null;

            if (
              userData?.type === "personal" &&
              selectedClub?.club_personal_id
            ) {
              currentUserClubPersonalId = selectedClub.club_personal_id;
              isCurrentUserParticipant = (participants || []).some(
                (p: any) => p.club_personal_id === currentUserClubPersonalId
              );
            }

            return {
              id: eventOnDate.id,
              title: eventOnDate.title || "",
              group: selectedClub?.name || "",
              participants: count || 0,
              participantAvatars: participantAvatars,
              date: clickedDate,
              time:
                eventOnDate.started_at && eventOnDate.ended_at
                  ? `${formatTime(eventOnDate.started_at)} ~ ${formatTime(
                      eventOnDate.ended_at
                    )}`
                  : "시간 미정",
              location: eventOnDate.location || "",
              description: eventOnDate.content || "",
              agenda: agendaList,
              isParticipant: isCurrentUserParticipant,
              clubPersonalId: currentUserClubPersonalId,
              // participation_enabled 필드 확인 (ScheduleAddScreen에서 사용하는 필드명)
              participationEnabled:
                eventOnDate.participation_enabled !== undefined
                  ? eventOnDate.participation_enabled
                  : false, // 기본값은 false (참가 신청 비활성화)
            };
          })
        );

        setSelectedEvents(eventsWithParticipants);
        // 첫 번째 일정을 기본 선택
        if (eventsWithParticipants.length > 0) {
          setSelectedEvent(eventsWithParticipants[0]);
        }
      };

      loadAllParticipants();
    } else {
      setSelectedEvents([]);
      setSelectedEvent(null);
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

  // 시간 포맷팅 헬퍼 함수
  const formatTime = React.useCallback((timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "오후" : "오전";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${period} ${displayHour}:${minutes}`;
  }, []);

  // 가입된 동아리가 없는 경우 (개인 계정만)
  if (userData?.type !== "club" && clubs.length === 0) {
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
            <button
              className="back-btn"
              onClick={() => navigate(-1)}
              style={{
                background: "none",
                border: "none",
                padding: "0",
                margin: "0",
                cursor: "pointer",
                fontSize: "clamp(16px, 4vw, 18px)",
                color: "#28201b",
                fontFamily: '"Inter", "Noto Sans KR", sans-serif',
              }}
            >
              ← 뒤로가기
            </button>
          </div>
        </div>

        {/* Main Content - No Clubs Message */}
        <div className="main-content">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "calc(100vh - 200px)",
              padding: "clamp(40px, 10vw, 60px)",
              gap: "clamp(24px, 6vw, 32px)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "clamp(8px, 2vw, 12px)",
              }}
            >
              <p
                style={{
                  fontFamily: '"Inter", "Noto Sans KR", sans-serif',
                  fontSize: "clamp(16px, 4vw, 18px)",
                  color: "#28201b",
                  textAlign: "center",
                  margin: "0",
                }}
              >
                가입된 동아리가 없어요..
              </p>
              <p
                style={{
                  fontFamily: '"Inter", "Noto Sans KR", sans-serif',
                  fontSize: "clamp(16px, 4vw, 18px)",
                  color: "#28201b",
                  textAlign: "center",
                  margin: "0",
                }}
              >
                가입할 동아리를 찾아봐요!
              </p>
            </div>
            <button
              onClick={() => navigate("/community")}
              style={{
                padding: "clamp(12px, 3vw, 14px) clamp(24px, 6vw, 32px)",
                background: "#c34e00",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontFamily: '"Inter", "Noto Sans KR", sans-serif',
                fontSize: "clamp(14px, 3.5vw, 16px)",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#a03e00";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#c34e00";
              }}
            >
              동아리 탐색
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {userData?.type !== "club" && (
            <p
              className="nav-title"
              data-node-id="12:3019"
              onClick={() => setShowClubModal(true)}
              style={{ cursor: "pointer" }}
            >
              {selectedClub?.name || "동아리 선택"} ▼
            </p>
          )}
          {userData?.type === "club" && (
            <p className="nav-title" data-node-id="12:3019">
              {selectedClub?.name || "내 동아리"}
            </p>
          )}
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
            {canAccessSideNav ? (
              <div
                className="profile-icon"
                data-name="profileIcon"
                data-node-id="9:641"
                onClick={() => setShowSideNav(true)}
                style={{ cursor: "pointer" }}
              >
                <img
                  alt="Menu Icon"
                  className="icon"
                  src="/hamburger-menu.png"
                />
              </div>
            ) : (
              <div
                className="profile-icon"
                data-name="profileIcon"
                data-node-id="9:641"
                onClick={() => navigate("/myclub/profile/edit")}
                style={{ cursor: "pointer" }}
              >
                <img
                  alt="Profile Icon"
                  className="icon"
                  src="/profile-icon.png"
                />
              </div>
            )}
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

            {/* Payout Tab */}
            <div
              className={`tab ${activeTab === "payout" ? "active" : ""}`}
              data-name="Tab"
              data-node-id="12:3328"
              onClick={() => handleTabClick("payout")}
            >
              <div
                className={`tab-underline ${
                  activeTab === "payout" ? "active" : ""
                }`}
                data-name="Underline"
                data-node-id="12:3330"
              >
                <p
                  className={`tab-text ${
                    activeTab === "payout" ? "active" : ""
                  }`}
                  data-node-id="12:3331"
                >
                  정산
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
                    // 더보기 메뉴나 버튼 클릭 시에는 페이지 이동하지 않음
                    if (
                      target.closest(".post-more-btn") ||
                      target.closest(".more-menu") ||
                      target.closest(".post-more-wrapper")
                    ) {
                      return;
                    }
                    navigate(`/myclub/post/${post.id}`);
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
        {activeTab === "payout" && (
          <div className="payout-content">
            {payouts.length === 0 ? (
              <div className="payout-empty-state">
                <p className="payout-description">요청된 정산이 없습니다.</p>
              </div>
            ) : (
              <div className="payout-list-container">
                {Object.entries(
                  payouts.reduce((acc, payout) => {
                    const date = new Date(payout.requestDate);
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    const key = `${year}-${month}`;
                    if (!acc[key]) {
                      acc[key] = [];
                    }
                    acc[key].push(payout);
                    return acc;
                  }, {} as Record<string, PayoutItem[]>)
                )
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([key, items]) => {
                    const [year, month] = key.split("-").map(Number);
                    return (
                      <div key={key} className="payout-month-section">
                        {/* 섹션 A: 연, 월 표시 */}
                        <h2 className="payout-month-title">
                          {year}년 {month}월
                        </h2>
                        {/* 섹션 B: 정산 리스트 */}
                        <div className="payout-items-list">
                          {items
                            .sort(
                              (a, b) =>
                                new Date(b.requestDate).getTime() -
                                new Date(a.requestDate).getTime()
                            )
                            .map((payout) => (
                              <div
                                key={payout.id}
                                className="payout-item-card"
                                onClick={() =>
                                  navigate(`/myclub/payout/${payout.id}`)
                                }
                              >
                                {/* 섹션 B-A: 총 인원 */}
                                <div className="payout-item-members">
                                  총 {payout.totalMembers}명
                                </div>
                                {/* 섹션 B-B: 정산 이름 */}
                                <div className="payout-item-title">
                                  {payout.title}
                                </div>
                                {/* 섹션 B-C: 정산 요청 날짜, 섹션 B-D: 자신의 정산 현황 (같은 줄) */}
                                <div className="payout-item-footer">
                                  <span className="payout-item-date">
                                    {new Date(
                                      payout.requestDate
                                    ).toLocaleDateString("ko-KR", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                  <span
                                    className={`payout-item-status ${
                                      payout.userStatus === "paid"
                                        ? "status-paid"
                                        : payout.userStatus === "pending"
                                        ? "status-pending"
                                        : "status-unpaid"
                                    }`}
                                  >
                                    {payout.userStatus === "paid"
                                      ? "완료"
                                      : payout.userStatus === "pending"
                                      ? "대기"
                                      : "미납"}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
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
                <div className="schedule-content-wrapper">
                  {selectedEvents.length > 0 &&
                  hasEvent(
                    selectedDate.getDate(),
                    selectedDate.getMonth() === currentDate.getMonth() &&
                      selectedDate.getFullYear() === currentDate.getFullYear()
                  ) ? (
                    <>
                      {!showEventDetail ? (
                        <div className="schedule-events-list">
                          {selectedEvents.map((event, index) => (
                            <div
                              key={event.id || index}
                              className="schedule-event-card"
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowEventDetail(true);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <h4 className="schedule-event-title">
                                {event.title}
                              </h4>
                              <div className="schedule-event-info">
                                <span className="schedule-event-group">
                                  {event.group} · {event.participants}명
                                </span>
                                {event.participants > 0 &&
                                  event.participantAvatars &&
                                  event.participantAvatars.length > 0 && (
                                    <div className="schedule-event-participants">
                                      {event.participantAvatars.map(
                                        (avatar: string, idx: number) => (
                                          <div
                                            key={idx}
                                            className="participant-avatar"
                                          >
                                            <img
                                              src={
                                                avatar || "/profile-icon.png"
                                              }
                                              alt="참가자"
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                              <div className="schedule-event-time">
                                • {event.date.getFullYear()}년{" "}
                                {event.date.getMonth() + 1}월{" "}
                                {event.date.getDate()}일 {event.time}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        selectedEvent && (
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
                                    {selectedEvent.agenda &&
                                    selectedEvent.agenda.length > 0 ? (
                                      selectedEvent.agenda.map(
                                        (item: string, index: number) => (
                                          <li key={index}>{item}</li>
                                        )
                                      )
                                    ) : (
                                      <li>일정표 정보가 없습니다.</li>
                                    )}
                                  </ul>
                                </div>

                                {/* 참석/불참 버튼 - 참가 신청 활성화된 일정만 표시 */}
                                {selectedEvent &&
                                  selectedEvent.participationEnabled === true &&
                                  userData?.type === "personal" &&
                                  selectedClub?.club_personal_id && (
                                    <div className="event-attendance-section">
                                      <h5 className="event-detail-section-title">
                                        참석 여부
                                      </h5>
                                      <div className="event-attendance-buttons">
                                        <button
                                          className={`event-attendance-btn attend ${
                                            selectedEvent.isParticipant
                                              ? "selected"
                                              : ""
                                          }`}
                                          onClick={async () => {
                                            if (
                                              !selectedEvent.clubPersonalId ||
                                              !selectedEvent.id
                                            )
                                              return;

                                            try {
                                              // 이미 참가자인 경우 무시
                                              if (selectedEvent.isParticipant) {
                                                return;
                                              }

                                              // schedule_participant에 추가
                                              const { error } = await supabase
                                                .from("schedule_participant")
                                                .insert({
                                                  schedule_id: selectedEvent.id,
                                                  club_personal_id:
                                                    selectedEvent.clubPersonalId,
                                                });

                                              if (error) {
                                                console.error(
                                                  "참석 등록 오류:",
                                                  error
                                                );
                                                alert(
                                                  "참석 등록 중 오류가 발생했습니다."
                                                );
                                                return;
                                              }

                                              // 참가자 수 업데이트
                                              const updatedEvent = {
                                                ...selectedEvent,
                                                isParticipant: true,
                                                participants:
                                                  selectedEvent.participants +
                                                  1,
                                              };
                                              setSelectedEvent(updatedEvent);

                                              // selectedEvents도 업데이트
                                              setSelectedEvents(
                                                selectedEvents.map((e) =>
                                                  e.id === selectedEvent.id
                                                    ? updatedEvent
                                                    : e
                                                )
                                              );

                                              // 일정 목록 새로고침
                                              if (selectedDate) {
                                                handleDateClick(
                                                  selectedDate.getDate(),
                                                  selectedDate.getMonth() ===
                                                    currentDate.getMonth() &&
                                                    selectedDate.getFullYear() ===
                                                      currentDate.getFullYear()
                                                );
                                              }
                                            } catch (error) {
                                              console.error(
                                                "참석 등록 중 오류:",
                                                error
                                              );
                                              alert(
                                                "참석 등록 중 오류가 발생했습니다."
                                              );
                                            }
                                          }}
                                        >
                                          참석
                                        </button>
                                        <button
                                          className={`event-attendance-btn absent ${
                                            !selectedEvent.isParticipant
                                              ? "selected"
                                              : ""
                                          }`}
                                          onClick={async () => {
                                            if (
                                              !selectedEvent.clubPersonalId ||
                                              !selectedEvent.id
                                            )
                                              return;

                                            try {
                                              // 참가자가 아닌 경우 무시
                                              if (
                                                !selectedEvent.isParticipant
                                              ) {
                                                return;
                                              }

                                              // schedule_participant에서 삭제
                                              const { error } = await supabase
                                                .from("schedule_participant")
                                                .delete()
                                                .eq(
                                                  "schedule_id",
                                                  selectedEvent.id
                                                )
                                                .eq(
                                                  "club_personal_id",
                                                  selectedEvent.clubPersonalId
                                                );

                                              if (error) {
                                                console.error(
                                                  "불참 등록 오류:",
                                                  error
                                                );
                                                alert(
                                                  "불참 등록 중 오류가 발생했습니다."
                                                );
                                                return;
                                              }

                                              // 참가자 수 업데이트
                                              const updatedEvent = {
                                                ...selectedEvent,
                                                isParticipant: false,
                                                participants: Math.max(
                                                  0,
                                                  selectedEvent.participants - 1
                                                ),
                                              };
                                              setSelectedEvent(updatedEvent);

                                              // selectedEvents도 업데이트
                                              setSelectedEvents(
                                                selectedEvents.map((e) =>
                                                  e.id === selectedEvent.id
                                                    ? updatedEvent
                                                    : e
                                                )
                                              );

                                              // 일정 목록 새로고침
                                              if (selectedDate) {
                                                handleDateClick(
                                                  selectedDate.getDate(),
                                                  selectedDate.getMonth() ===
                                                    currentDate.getMonth() &&
                                                    selectedDate.getFullYear() ===
                                                      currentDate.getFullYear()
                                                );
                                              }
                                            } catch (error) {
                                              console.error(
                                                "불참 등록 중 오류:",
                                                error
                                              );
                                              alert(
                                                "불참 등록 중 오류가 발생했습니다."
                                              );
                                            }
                                          }}
                                        >
                                          불참
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                {/* 댓글 섹션 */}
                                <div className="event-comments-section">
                                  <h5 className="event-detail-section-title">
                                    댓글 ({comments.length})
                                  </h5>

                                  {/* 댓글 입력 - club_user 계정은 숨김 */}
                                  {userData?.type !== "club" && (
                                    <div className="comment-input-container">
                                      <div className="comment-input-avatar">
                                        <img
                                          src="/profile-icon.png"
                                          alt="프로필"
                                        />
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
                                  )}

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
                        )
                      )}
                    </>
                  ) : (
                    <div className="schedule-event-card no-event-card">
                      <p className="no-event-message">일정이 없습니다.</p>
                    </div>
                  )}
                  {/* 일정 추가 버튼 - 회장, 스태프만 표시 (club_user 계정 제외) */}
                  {userData?.type === "personal" &&
                    selectedClub?.role &&
                    (selectedClub.role === "회장" ||
                      selectedClub.role === "스태프") && (
                      <button
                        className="schedule-add-btn"
                        onClick={() => {
                          // 선택된 날짜가 있으면 URL 파라미터로 전달 (시간대 문제 방지)
                          let dateParam = "";
                          if (selectedDate) {
                            const year = selectedDate.getFullYear();
                            const month = String(
                              selectedDate.getMonth() + 1
                            ).padStart(2, "0");
                            const day = String(selectedDate.getDate()).padStart(
                              2,
                              "0"
                            );
                            dateParam = `?date=${year}-${month}-${day}`;
                          }
                          navigate(`/myclub/schedule/add${dateParam}`);
                        }}
                        aria-label="일정 추가"
                      >
                        <span className="schedule-add-icon">+</span>
                        <span className="schedule-add-text">일정 추가</span>
                      </button>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "archive" && (
          <div className="archive-content">
            <h2>자료실</h2>
            <p>자료실 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        )}
      </div>

      {/* 글 작성 플로팅 버튼 - club_user 계정은 숨김 */}
      {activeTab === "posts" && userData?.type !== "club" && (
        <button
          className="floating-write-btn"
          onClick={() => navigate("/myclub/post/write")}
          aria-label="글 작성"
        >
          <span className="floating-write-icon">+</span>
        </button>
      )}

      {/* 정산 등록 플로팅 버튼 - 회장/스태프만 노출 */}
      {activeTab === "payout" &&
        selectedClub?.role &&
        (selectedClub.role === "회장" || selectedClub.role === "스태프") && (
          <button
            className="floating-write-btn"
            onClick={() => navigate("/myclub/payout/register")}
            aria-label="정산 등록"
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
              {clubs.length === 0 ? (
                <div className="no-clubs-message">
                  가입된 동아리가 없습니다.
                </div>
              ) : (
                clubs.map((club, index) => (
                  <div
                    key={club.id}
                    data-index={index}
                    className={`club-modal-item ${
                      draggedIndex === index ? "dragging" : ""
                    } ${dragOverIndex === index ? "drag-over" : ""}`}
                    draggable={userData?.type !== "club"}
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
                        userData?.type === "club"
                          ? "default"
                          : isDragging && draggedIndex === index
                          ? "grabbing"
                          : "grab",
                    }}
                  >
                    <div className="club-modal-avatar">
                      <img
                        src={club.avatar}
                        alt={club.name}
                        draggable={false}
                      />
                    </div>
                    <div className="club-modal-name">{club.name}</div>
                    <div className="club-modal-role">{club.role}</div>
                  </div>
                ))
              )}
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
              <h4 className="post-detail-title">공지 상세</h4>
              <div className="post-detail-meta">
                <div className="post-detail-author">홍익대 HICC ✓</div>
                <div className="post-detail-time">오늘 18:41</div>
              </div>
              <div className="post-detail-body">내용이 없습니다.</div>

              {false ? (
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

                {/* 댓글 입력 - club_user 계정은 숨김 */}
                {userData?.type !== "club" && (
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
                )}

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

      {/* 사이드 네비게이션 모달 */}
      {showSideNav && (
        <>
          {/* 오버레이 */}
          <div
            className="side-nav-overlay"
            onClick={() => setShowSideNav(false)}
          ></div>
          {/* 사이드 네비게이션 패널 */}
          <div className="side-nav-panel">
            {/* 닫기 버튼 */}
            <button
              className="side-nav-close-btn"
              onClick={() => setShowSideNav(false)}
              aria-label="닫기"
            >
              ✕
            </button>

            {/* 섹션 A: 프로필 정보 */}
            <div className="side-nav-profile-section">
              <div
                className="side-nav-profile-info"
                onClick={() => {
                  setShowSideNav(false);
                  // club_user 타입이면 ClubDetailScreen으로 이동
                  if (userData?.type === "club") {
                    navigate(`/community/club/${userData.id}`);
                  } else {
                    navigate("/myclub/profile/edit");
                  }
                }}
              >
                <img
                  src={profileInfo?.profileImage || "/profile-icon.png"}
                  alt="프로필"
                  className="side-nav-profile-image"
                />
                <div className="side-nav-profile-text">
                  <div className="side-nav-profile-name">
                    {profileInfo?.nickname || "사용자"}
                  </div>
                  <div className="side-nav-profile-role">
                    {profileInfo?.role || "동아리원"}
                  </div>
                </div>
                <span className="side-nav-arrow">›</span>
              </div>
            </div>

            {/* 섹션 B: 동아리 페이지 관리 */}
            <div className="side-nav-section">
              <button
                className="side-nav-page-manage-btn"
                onClick={() => {
                  setShowSideNav(false);
                  navigate("/myclub/page/edit");
                }}
              >
                동아리 설정
              </button>
            </div>

            {/* 섹션 C: 관리 기능 리스트 */}
            <div className="side-nav-section">
              <div className="side-nav-menu-list">
                <button
                  className="side-nav-menu-item"
                  onClick={() => {
                    setShowSideNav(false);
                    navigate("/myclub/manage/members");
                  }}
                >
                  멤버 관리
                </button>
                <button
                  className="side-nav-menu-item"
                  onClick={() => {
                    setShowSideNav(false);
                    navigate("/myclub/manage/account");
                  }}
                >
                  통장 등록
                </button>
                <button
                  className="side-nav-menu-item"
                  onClick={() => {
                    setShowSideNav(false);
                    navigate("/myclub/manage/payout");
                  }}
                >
                  정산 관리
                </button>
                <button
                  className="side-nav-menu-item"
                  onClick={() => {
                    setShowSideNav(false);
                    navigate("/myclub/manage/accounting");
                  }}
                >
                  회계 내역
                </button>
                <button
                  className="side-nav-menu-item"
                  onClick={() => {
                    setShowSideNav(false);
                    navigate("/myclub/manage/events");
                  }}
                >
                  행사 관리
                </button>
                <button
                  className="side-nav-menu-item"
                  onClick={() => {
                    setShowSideNav(false);
                    navigate("/myclub/manage/archive");
                  }}
                >
                  임원진 자료
                </button>

                <button
                  className="side-nav-menu-item"
                  onClick={() => {
                    setShowSideNav(false);
                    navigate("/myclub/manage/approvals");
                  }}
                >
                  신청폼 관리
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyClubScreen;
