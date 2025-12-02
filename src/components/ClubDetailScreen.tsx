import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const categoryOptions = [
  "학술",
  "공연",
  "체육",
  "종교",
  "봉사",
  "문화",
  "기타",
];

const ClubDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinSuccess, setShowJoinSuccess] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState("");
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const [showJoinSettingsModal, setShowJoinSettingsModal] = useState(false);
  const [isUpdatingRecruiting, setIsUpdatingRecruiting] = useState(false);
  const [applicationForms, setApplicationForms] = useState<any[]>([]);
  const [selectedApplicationFormId, setSelectedApplicationFormId] = useState<
    number | null
  >(null);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [isUpdatingApplicationForm, setIsUpdatingApplicationForm] =
    useState(false);
  const [activeApplicationForm, setActiveApplicationForm] = useState<{
    id: number;
    title: string;
    google_form_url: string;
  } | null>(null);

  // 달력 관련 상태 (MyClubScreen에서 재사용)
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // 오늘 날짜의 월 첫날
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);

  // 일정 데이터 상태
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [scheduleParticipants, setScheduleParticipants] = useState<any[]>([]);

  // 일정이 있는 날짜들 (DB에서 로드된 데이터 기반)
  const eventsDates = useMemo(() => {
    return schedules.map((schedule) => {
      const dateStr = schedule.date;
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    });
  }, [schedules]);

  // 선택된 날짜의 모든 일정 정보 (DB에서 로드된 데이터 기반)
  const [eventParticipantsMap, setEventParticipantsMap] = useState<
    Record<number, number>
  >({});

  const selectedEvents = useMemo(() => {
    if (!selectedDate || selectedSchedules.length === 0) return [];

    const formatTime = (timeStr: string) => {
      if (!timeStr) return "";
      const [hours, minutes] = timeStr.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "오후" : "오전";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${period} ${displayHour}:${minutes}`;
    };

    return selectedSchedules.map((schedule) => {
      const startTime = formatTime(schedule.started_at || "");
      const endTime = formatTime(schedule.ended_at || "");
      const timeRange = startTime && endTime ? `${startTime} ~ ${endTime}` : "";

      return {
        id: schedule.id,
        title: schedule.title || "일정",
        group: club?.name || "동아리",
        participants: eventParticipantsMap[schedule.id] || 0,
        date: selectedDate,
        time: timeRange,
        location: schedule.location || "",
        description: schedule.content || "",
        agenda: Array.isArray(schedule.agenda)
          ? schedule.agenda
          : schedule.agenda
          ? [schedule.agenda]
          : [],
        participantAvatars: [],
      };
    });
  }, [selectedDate, selectedSchedules, club, eventParticipantsMap]);

  // 선택된 날짜의 모든 일정의 참가자 수 로드
  useEffect(() => {
    const loadAllEventParticipants = async () => {
      if (selectedSchedules.length === 0) {
        setEventParticipantsMap({});
        return;
      }

      const participantsMap: Record<number, number> = {};
      for (const schedule of selectedSchedules) {
        try {
          const { count, error } = await supabase
            .from("schedule_participant")
            .select("*", { count: "exact", head: true })
            .eq("schedule_id", schedule.id);

          if (!error && count !== null) {
            participantsMap[schedule.id] = count;
          } else {
            participantsMap[schedule.id] = 0;
          }
        } catch (error) {
          console.error(`일정 ${schedule.id}의 참가자 수 로드 오류:`, error);
          participantsMap[schedule.id] = 0;
        }
      }
      setEventParticipantsMap(participantsMap);
    };

    loadAllEventParticipants();
  }, [selectedSchedules]);

  // 선택된 일정의 상세 정보 (상세 보기용)
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
      location: selectedSchedule.location || "",
      description: selectedSchedule.content || "",
      agenda: Array.isArray(selectedSchedule.agenda)
        ? selectedSchedule.agenda
        : selectedSchedule.agenda
        ? [selectedSchedule.agenda]
        : [],
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
    setShowEventDetail(false);
    setSelectedSchedule(null);

    // 해당 날짜의 모든 일정 찾기
    const dateStr = `${clickedDate.getFullYear()}-${String(
      clickedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(clickedDate.getDate()).padStart(2, "0")}`;
    const schedulesOnDate = schedules.filter((s) => s.date === dateStr);
    setSelectedSchedules(schedulesOnDate);
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

  // 활성 신청폼 정보 로드
  const loadActiveApplicationForm = useCallback(async () => {
    if (!club?.id) {
      setActiveApplicationForm(null);
      return;
    }

    try {
      const { data: clubUser, error } = await supabase
        .from("club_user")
        .select("active_application_form_id")
        .eq("id", club.id)
        .single();

      if (error || !clubUser?.active_application_form_id) {
        setActiveApplicationForm(null);
        return;
      }

      const { data: formData, error: formError } = await supabase
        .from("application_form")
        .select("id, title, google_form_url")
        .eq("id", clubUser.active_application_form_id)
        .single();

      if (formError || !formData) {
        setActiveApplicationForm(null);
        return;
      }

      setActiveApplicationForm({
        id: formData.id,
        title: formData.title,
        google_form_url: formData.google_form_url,
      });
    } catch (error) {
      console.error("활성 신청폼 로드 오류:", error);
      setActiveApplicationForm(null);
    }
  }, [club?.id]);

  // 동아리 데이터 로드 시 활성 신청폼도 로드
  useEffect(() => {
    if (club?.id) {
      loadActiveApplicationForm();
    }
  }, [club?.id, loadActiveApplicationForm]);

  // 가입 신청 처리 함수
  const handleJoinRequest = async () => {
    if (!userData || userData.type !== "personal" || !club) {
      return;
    }

    // 이미 가입 신청한 경우 확인
    try {
      const { data: existingMembership } = await supabase
        .from("club_personal")
        .select("id")
        .eq("personal_user_id", userData.id)
        .eq("club_user_id", club.id)
        .single();

      if (existingMembership) {
        alert("이미 가입 신청하셨습니다.");
        return;
      }
    } catch (error) {
      // 기존 멤버십이 없는 경우 계속 진행
    }

    // 활성 신청폼이 있으면 구글폼으로 이동
    if (activeApplicationForm?.google_form_url) {
      const googleFormUrl = activeApplicationForm.google_form_url;
      
      // 구글폼으로 이동 (현재 창에서)
      window.location.href = googleFormUrl;
      
      // 참고: 구글폼 제출 후 리다이렉트 URL을 설정하려면
      // 구글폼 설정에서 "제출 후 리다이렉트" 옵션을 활성화하고
      // 리다이렉트 URL을 다음으로 설정해야 합니다:
      // /community/club/{club.id}/join-success?club_id={club.id}
    } else {
      // 활성 신청폼이 없으면 기존 방식대로 처리
      try {
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

        setShowJoinSuccess(true);
      } catch (error) {
        console.error("가입 신청 처리 중 오류:", error);
        alert("가입 신청 중 오류가 발생했습니다.");
      }
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

      // 피드 개수 계산 (club_feed 테이블에서)
      const { count: feedCount } = await supabase
        .from("club_feed")
        .select("*", { count: "exact", head: true })
        .eq("club_user_id", clubId);

      // 피드 데이터 로드
      const { data: feedData } = await supabase
        .from("club_feed")
        .select("id, image_url, caption")
        .eq("club_user_id", clubId)
        .order("created_at", { ascending: false })
        .limit(9); // 최근 9개만 미리보기용으로 로드

      const feedItems = (feedData || []).map((item) => ({
        id: item.id,
        image: item.image_url,
        caption: item.caption || "",
      }));

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
        feed: feedItems,
        postCount: feedCount || 0, // 피드 개수
      };

      setClub(clubData);
    } catch (error) {
      console.error("동아리 데이터 로드 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const canEditCategory =
    userData?.type === "club" && club && userData.id === club.id;
  const canManageFeed = canEditCategory;
  const isOwnClub = canEditCategory;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategorySelect = async (newCategory: string) => {
    if (!club || !canEditCategory || isUpdatingCategory) return;

    try {
      setIsUpdatingCategory(true);
      const { error } = await supabase
        .from("club_user")
        .update({ category: newCategory })
        .eq("id", club.id);

      if (error) {
        throw error;
      }

      setClub((prevClub) =>
        prevClub ? { ...prevClub, category: newCategory } : prevClub
      );
      setShowCategoryModal(false);
    } catch (error) {
      console.error("카테고리 업데이트 오류:", error);
      alert("카테고리 변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const handleAddFeedClick = () => {
    if (!club || !canManageFeed) return;
    navigate(`/community/club/${club.id}/feed/new`);
  };

  const handleJoinSettingsClick = () => {
    if (!club || !isOwnClub) return;
    setShowJoinSettingsModal(true);
  };

  // 모집중 상태 토글
  const handleToggleRecruiting = async () => {
    if (!club || !isOwnClub || isUpdatingRecruiting) return;

    setIsUpdatingRecruiting(true);
    try {
      const newRecruitingStatus = !club.isRecruiting;
      const { error } = await supabase
        .from("club_user")
        .update({ recruiting: newRecruitingStatus })
        .eq("id", club.id);

      if (error) {
        throw error;
      }

      // 로컬 상태 업데이트
      setClub((prev) => {
        if (!prev) return null;
        return { ...prev, isRecruiting: newRecruitingStatus };
      });
    } catch (error) {
      console.error("모집중 상태 업데이트 오류:", error);
      alert("모집중 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdatingRecruiting(false);
    }
  };

  // 신청폼 목록 로드
  const loadApplicationForms = useCallback(async () => {
    if (!club?.id) {
      setApplicationForms([]);
      return;
    }

    try {
      setIsLoadingForms(true);
      const { data, error } = await supabase
        .from("application_form")
        .select("id, title, created_at, google_form_url, form_type")
        .eq("club_user_id", club.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("신청폼 목록 로드 오류:", error);
        setApplicationForms([]);
        return;
      }

      setApplicationForms(data || []);
    } catch (error) {
      console.error("신청폼 목록 로드 중 오류:", error);
      setApplicationForms([]);
    } finally {
      setIsLoadingForms(false);
    }
  }, [club?.id]);

  // 활성 신청폼 ID 로드
  const loadActiveApplicationFormId = useCallback(async () => {
    if (!club?.id) return;

    try {
      const { data, error } = await supabase
        .from("club_user")
        .select("active_application_form_id")
        .eq("id", club.id)
        .single();

      if (error) {
        console.error("활성 신청폼 ID 로드 오류:", error);
        return;
      }

      setSelectedApplicationFormId(data?.active_application_form_id || null);
    } catch (error) {
      console.error("활성 신청폼 ID 로드 중 오류:", error);
    }
  }, [club?.id]);

  // 모달이 열릴 때 신청폼 목록 로드
  useEffect(() => {
    if (showJoinSettingsModal) {
      loadApplicationForms();
      loadActiveApplicationFormId();
    }
  }, [
    showJoinSettingsModal,
    loadApplicationForms,
    loadActiveApplicationFormId,
  ]);

  // 신청폼 선택 및 등록
  const handleSelectApplicationForm = async () => {
    if (!club || selectedApplicationFormId === null) {
      alert("신청폼을 선택해주세요.");
      return;
    }

    setIsUpdatingApplicationForm(true);
    try {
      const { error } = await supabase
        .from("club_user")
        .update({ active_application_form_id: selectedApplicationFormId })
        .eq("id", club.id);

      if (error) {
        throw error;
      }

      const selectedForm = applicationForms.find(
        (form) => form.id === selectedApplicationFormId
      );
      alert(
        `"${
          selectedForm?.title || "신청폼"
        }"이(가) 활성 신청폼으로 등록되었습니다.`
      );
      setShowJoinSettingsModal(false);
    } catch (error: any) {
      console.error("신청폼 등록 오류:", error);
      const errorMessage =
        error.message || error.details || "알 수 없는 오류가 발생했습니다.";
      alert(`신청폼 등록 중 오류가 발생했습니다.\n\n${errorMessage}`);
    } finally {
      setIsUpdatingApplicationForm(false);
    }
  };

  const handleLogoClick = () => {
    if (!isOwnClub || isUploadingLogo) return;
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!club || !isOwnClub) return;
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `club-${club.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("club-profile-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError || !uploadData) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("club-profile-images").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("club_user")
        .update({ profile_image_url: publicUrl })
        .eq("id", club.id);

      if (updateError) {
        throw updateError;
      }

      setClub((prev) =>
        prev
          ? {
              ...prev,
              logo: publicUrl,
            }
          : prev
      );
    } catch (error) {
      console.error("프로필 이미지 업로드 오류:", error);
      alert("프로필 이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDescriptionClick = () => {
    if (!isOwnClub || !club) return;
    setDescriptionInput(club.description || "");
    setShowDescriptionModal(true);
  };

  const handleDescriptionSave = async () => {
    if (!club || !isOwnClub) return;

    try {
      setIsUpdatingDescription(true);
      const trimmed = descriptionInput.trim();
      const { error } = await supabase
        .from("club_user")
        .update({ club_explanation: trimmed })
        .eq("id", club.id);

      if (error) {
        throw error;
      }

      setClub((prev) =>
        prev
          ? {
              ...prev,
              description: trimmed,
            }
          : prev
      );
      setShowDescriptionModal(false);
    } catch (error) {
      console.error("동아리 설명 업데이트 오류:", error);
      alert("동아리 설명 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsUpdatingDescription(false);
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
        <h1 className="club-header-title">동아리 상세</h1>
      </div>

      {/* Main Content */}
      <div className="club-detail-content">
        {/* 인스타그램 스타일 프로필 섹션 */}
        <div className="club-profile-section">
          {/* Section B & C: 로고와 통계 */}
          <div className="club-logo-stats-wrapper">
            {/* Section B: 동아리 로고 */}
            <div className="club-logo-section">
              {/* Section A: 동아리 이름과 카테고리 (로고 위) */}
              <div className="club-name-section">
                <h1 className="club-name">{club.name}</h1>
                <span
                  className={`club-category ${
                    canEditCategory ? "editable" : ""
                  }`}
                  onClick={() => canEditCategory && setShowCategoryModal(true)}
                  role={canEditCategory ? "button" : undefined}
                  tabIndex={canEditCategory ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (
                      canEditCategory &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      setShowCategoryModal(true);
                    }
                  }}
                >
                  {club.category || "카테고리 미지정"}
                </span>
              </div>
              <div
                className={`club-logo ${isOwnClub ? "editable" : ""}`}
                onClick={handleLogoClick}
                role={isOwnClub ? "button" : undefined}
                tabIndex={isOwnClub ? 0 : undefined}
                onKeyDown={(e) => {
                  if (!isOwnClub) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLogoClick();
                  }
                }}
              >
                {isUploadingLogo ? (
                  <span className="club-logo-uploading">업로드 중...</span>
                ) : (
                  <img src={club.logo} alt={club.name} />
                )}
              </div>
              {isOwnClub && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleLogoChange}
                />
              )}
            </div>

            {/* Section C: 통계 (피드, 멤버, 활동점수) */}
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
        </div>

        {/* Section D: 소개글 */}
        <div
          className={`club-description-section ${isOwnClub ? "editable" : ""}`}
          onClick={handleDescriptionClick}
          role={isOwnClub ? "button" : undefined}
          tabIndex={isOwnClub ? 0 : undefined}
          onKeyDown={(e) => {
            if (!isOwnClub) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleDescriptionClick();
            }
          }}
        >
          <p className="club-description">
            {club.description || "동아리 설명이 없습니다."}
          </p>
          {isOwnClub && (
            <span className="club-description-edit-hint">
              설명을 수정하려면 클릭하세요
            </span>
          )}
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
          {isOwnClub ? (
            <button className="join-btn" onClick={handleJoinSettingsClick}>
              가입 설정
            </button>
          ) : (
            <button
              className="join-btn"
              onClick={handleJoinRequest}
              disabled={!club.isRecruiting || userData?.type !== "personal"}
            >
              가입 신청
            </button>
          )}
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
                              onClick={async () => {
                                const schedule = selectedSchedules.find(
                                  (s) => s.id === event.id
                                );
                                if (schedule) {
                                  setSelectedSchedule(schedule);
                                  await loadScheduleParticipants(schedule.id);
                                  setShowEventDetail(true);
                                }
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
                              </div>
                              <div className="schedule-event-time">
                                • {event.date.getFullYear()}년{" "}
                                {event.date.getMonth() + 1}월{" "}
                                {event.date.getDate()}일 {event.time}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : selectedEvent ? (
                        <>
                          <div
                            className="event-detail-overlay"
                            onClick={() => setShowEventDetail(false)}
                          ></div>
                          <div className="schedule-event-detail-card">
                            <div className="schedule-event-detail-card-inner">
                              <div className="event-detail-header">
                                <button
                                  className="event-back-btn"
                                  onClick={() => setShowEventDetail(false)}
                                >
                                  ← 뒤로가기
                                </button>
                                <h4 className="event-detail-title">
                                  {selectedEvent.title}
                                </h4>
                              </div>
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
                                      {selectedEvent.agenda.map(
                                        (item: string, idx: number) => (
                                          <li key={idx}>{item}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          </div>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <div className="schedule-event-card no-event-card">
                      <p className="no-event-message">일정이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section H: 활동 피드 */}
        <div className="club-feed-section">
          <h2 className="section-title">동아리 활동 피드</h2>
          {club.feed.length > 0 ? (
            <div className="feed-grid">
              {canManageFeed && (
                <button
                  type="button"
                  className="feed-add-card"
                  onClick={handleAddFeedClick}
                >
                  <span className="feed-add-plus">+</span>
                  <span className="feed-add-label">새 피드</span>
                </button>
              )}
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
              {canManageFeed && (
                <button
                  type="button"
                  className="feed-add-btn"
                  onClick={handleAddFeedClick}
                >
                  + 피드 등록하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 카테고리 선택 모달 */}
      {showCategoryModal && (
        <>
          <div
            className="category-modal-overlay"
            onClick={() => !isUpdatingCategory && setShowCategoryModal(false)}
          ></div>
          <div className="category-modal">
            <div className="category-modal-header">
              <h2 className="category-modal-title">카테고리 선택</h2>
              <button
                className="category-modal-close"
                onClick={() =>
                  !isUpdatingCategory && setShowCategoryModal(false)
                }
                disabled={isUpdatingCategory}
              >
                ✕
              </button>
            </div>
            <div className="category-list">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  className={`category-item ${
                    category === club.category ? "active" : ""
                  }`}
                  onClick={() => handleCategorySelect(category)}
                  disabled={isUpdatingCategory}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 가입 설정 모달 */}
      {showJoinSettingsModal && (
        <>
          <div
            className="join-settings-modal-overlay"
            onClick={() => setShowJoinSettingsModal(false)}
          ></div>
          <div className="join-settings-modal">
            <div className="join-settings-modal-header">
              <h2 className="join-settings-modal-title">가입 설정</h2>
              <button
                className="join-settings-modal-close"
                onClick={() => setShowJoinSettingsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="join-settings-modal-content">
              {/* 모집중 상태 토글 */}
              <div className="join-settings-section">
                <div className="join-settings-section-header">
                  <h3 className="join-settings-section-title">모집 상태</h3>
                  <label className="join-settings-toggle">
                    <input
                      type="checkbox"
                      checked={club?.isRecruiting || false}
                      onChange={handleToggleRecruiting}
                      disabled={isUpdatingRecruiting}
                    />
                    <span className="join-settings-toggle-slider"></span>
                  </label>
                </div>
                <p className="join-settings-section-description">
                  {club?.isRecruiting
                    ? "현재 모집 중입니다"
                    : "현재 모집 중이 아닙니다"}
                </p>
              </div>

              {/* 신청폼 등록 */}
              <div className="join-settings-section">
                <h3 className="join-settings-section-title">신청폼 등록</h3>
                {isLoadingForms ? (
                  <div className="join-settings-form-loading">
                    신청폼 목록을 불러오는 중...
                  </div>
                ) : applicationForms.length === 0 ? (
                  <div className="join-settings-form-empty">
                    <p>등록된 신청폼이 없습니다.</p>
                    <button
                      className="join-settings-form-link-btn"
                      onClick={() => {
                        setShowJoinSettingsModal(false);
                        navigate("/myclub/manage/approvals");
                      }}
                    >
                      신청폼 만들기
                    </button>
                  </div>
                ) : (
                  <div className="join-settings-form-list">
                    {applicationForms.map((form) => (
                      <label
                        key={form.id}
                        className={`join-settings-form-item ${
                          selectedApplicationFormId === form.id
                            ? "selected"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="applicationForm"
                          value={form.id}
                          checked={selectedApplicationFormId === form.id}
                          onChange={(e) =>
                            setSelectedApplicationFormId(
                              parseInt(e.target.value)
                            )
                          }
                          disabled={isUpdatingApplicationForm}
                        />
                        <div className="join-settings-form-item-content">
                          <div className="join-settings-form-item-icon">📄</div>
                          <div className="join-settings-form-item-text">
                            <h4>{form.title}</h4>
                            <span>
                              {form.created_at
                                ? new Date(form.created_at).toLocaleDateString(
                                    "ko-KR",
                                    {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                    }
                                  )
                                : ""}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                    <button
                      className="join-settings-form-submit"
                      onClick={handleSelectApplicationForm}
                      disabled={
                        isUpdatingApplicationForm ||
                        selectedApplicationFormId === null
                      }
                    >
                      {isUpdatingApplicationForm ? "등록 중..." : "신청폼 등록"}
                    </button>
                    <button
                      className="join-settings-form-link-btn"
                      onClick={() => {
                        setShowJoinSettingsModal(false);
                        navigate("/myclub/manage/approvals");
                      }}
                    >
                      + 신청폼 만들기
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 동아리 설명 모달 */}
      {showDescriptionModal && (
        <>
          <div
            className="description-modal-overlay"
            onClick={() =>
              !isUpdatingDescription && setShowDescriptionModal(false)
            }
          ></div>
          <div className="description-modal">
            <div className="description-modal-header">
              <h2 className="description-modal-title">동아리 설명 수정</h2>
              <button
                className="description-modal-close"
                onClick={() =>
                  !isUpdatingDescription && setShowDescriptionModal(false)
                }
                disabled={isUpdatingDescription}
              >
                ✕
              </button>
            </div>
            <textarea
              className="description-modal-textarea"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              maxLength={1000}
              placeholder="동아리 설명을 입력하세요"
            ></textarea>
            <div className="description-modal-actions">
              <button
                className="description-modal-cancel"
                onClick={() => setShowDescriptionModal(false)}
                disabled={isUpdatingDescription}
              >
                취소
              </button>
              <button
                className="description-modal-save"
                onClick={handleDescriptionSave}
                disabled={isUpdatingDescription}
              >
                {isUpdatingDescription ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </>
      )}

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
    </div>
  );
};

export default ClubDetailScreen;
