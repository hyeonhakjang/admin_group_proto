import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import { supabase } from "../lib/supabase";
import "./ClubPostDetailScreen.css";

interface UserData {
  type: "personal" | "club" | "group" | "admin";
  id: number;
  username: string;
  name: string;
  email: string;
}

interface Post {
  id: number;
  author: string;
  authorAvatar: string;
  createdAt: string;
  title: string;
  content: string;
  isNotice: boolean;
  category: string;
  categories: string[];
  likes: number;
  comments: number;
  isAuthor: boolean;
  isAdmin: boolean;
}

interface AttachedSchedule {
  id: number;
  title: string;
  date: string;
  startedAt?: string | null;
  endedAt?: string | null;
  location?: string | null;
  description?: string | null;
  agenda?: string[] | null;
  participationEnabled?: boolean;
  participantsCount: number;
  participantAvatars: string[];
  isParticipant: boolean;
}

interface Comment {
  id: number;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  isAnonymous: boolean;
  likes: number;
  isLiked: boolean;
}

const ClubPostDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const postId = id ? parseInt(id, 10) : 0;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [attachedSchedule, setAttachedSchedule] =
    useState<AttachedSchedule | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isScrapped, setIsScrapped] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }

    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, [navigate]);

  useEffect(() => {
    if (!postId || !selectedClub?.club_user_id || !userData) return;

    const loadPost = async () => {
      try {
        setLoading(true);

        // 게시글 로드
        const { data: article, error: articleError } = await supabase
          .from("club_personal_article")
          .select(
            `
            id,
            title,
            content,
            written_date,
            created_at,
            notification,
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
            ),
            club_personal_article_schedule:club_personal_article_schedule (
              club_personal_schedule:club_personal_schedule_id (
                id,
                title,
                content,
                date,
                started_at,
                ended_at,
                location,
                agenda,
                participation_enabled
              )
            )
          `
          )
          .eq("id", postId)
          .single();

        if (articleError) {
          console.error("게시글 로드 오류:", articleError);
          alert("게시글을 불러오는 중 오류가 발생했습니다.");
          navigate("/myclub");
          return;
        }

        if (!article) {
          alert("게시글을 찾을 수 없습니다.");
          navigate("/myclub");
          return;
        }

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

        // 현재 사용자의 좋아요 여부 확인
        let currentUserLiked = false;
        if (userData.type === "personal" && selectedClub?.club_personal_id) {
          const { data: likeData } = await supabase
            .from("club_personal_like")
            .select("id")
            .eq("club_personal_article_id", article.id)
            .eq("club_personal_id", selectedClub.club_personal_id)
            .single();
          currentUserLiked = !!likeData;
        }

        // club_personal이 배열일 수 있으므로 처리
        const clubPersonal = Array.isArray(article.club_personal)
          ? article.club_personal[0]
          : article.club_personal;
        const personalUser = Array.isArray(clubPersonal?.personal_user)
          ? clubPersonal.personal_user[0]
          : clubPersonal?.personal_user;

        const authorName =
          personalUser?.personal_name || selectedClub?.name || "작성자";
        const authorAvatar =
          personalUser?.profile_image_url || "/profile-icon.png";

        const isAuthor =
          userData.type === "personal" && personalUser?.id === userData.id;

        const articleCategories = article.club_personal_article_category || [];
        const categoryNames = Array.isArray(articleCategories)
          ? articleCategories.map((cat: any) => cat.name).filter(Boolean)
          : [];
        const primaryCategory = categoryNames[0] || "";

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
            return `오늘 ${date.getHours()}:${String(
              date.getMinutes()
            ).padStart(2, "0")}`;
          } else if (days === 1) {
            return `어제 ${date.getHours()}:${String(
              date.getMinutes()
            ).padStart(2, "0")}`;
          } else if (days < 7) {
            return `${days}일 전`;
          } else {
            return `${date.getMonth() + 1}월 ${date.getDate()}일`;
          }
        };

        setPost({
          id: article.id,
          author: authorName,
          authorAvatar: authorAvatar,
          createdAt: formatDate(article.created_at || article.written_date),
          title: article.title || "",
          content: article.content || "",
          isNotice: article.notification || false,
          category: primaryCategory,
          categories: categoryNames,
          likes: likeCount || 0,
          comments: commentCount || 0,
          isAuthor: isAuthor,
          isAdmin: userData.type === "club" || false,
        });

        // 첨부 일정 정보
        const articleScheduleRelation =
          article.club_personal_article_schedule as
            | any[]
            | Record<string, any>
            | null;
        let scheduleDataRaw: any = null;

        if (Array.isArray(articleScheduleRelation)) {
          scheduleDataRaw =
            articleScheduleRelation[0]?.club_personal_schedule || null;
        } else if (articleScheduleRelation) {
          scheduleDataRaw = articleScheduleRelation.club_personal_schedule;
        }

        const normalizedSchedule = Array.isArray(scheduleDataRaw)
          ? scheduleDataRaw[0]
          : scheduleDataRaw;

        if (normalizedSchedule) {
          let participantsCount = 0;
          let participantAvatars: string[] = [];
          let scheduleIsParticipant = false;

          try {
            const {
              data: scheduleParticipants,
              error: scheduleParticipantError,
            } = await supabase
              .from("schedule_participant")
              .select(
                `
                  id,
                  club_personal_id,
                  club_personal:club_personal_id (
                    personal_user:personal_user_id (
                      profile_image_url
                    )
                  )
                `
              )
              .eq("schedule_id", normalizedSchedule.id);

            if (scheduleParticipantError) {
              console.error(
                "첨부 일정 참가자 로드 오류:",
                scheduleParticipantError
              );
            } else if (scheduleParticipants) {
              participantsCount = scheduleParticipants.length;
              participantAvatars = scheduleParticipants
                .map((participant: any) => {
                  const clubPersonal = Array.isArray(participant.club_personal)
                    ? participant.club_personal[0]
                    : participant.club_personal;
                  const personalUser = Array.isArray(
                    clubPersonal?.personal_user
                  )
                    ? clubPersonal.personal_user[0]
                    : clubPersonal?.personal_user;
                  return personalUser?.profile_image_url || "/profile-icon.png";
                })
                .slice(0, 5);

              scheduleIsParticipant = scheduleParticipants.some(
                (participant: any) =>
                  String(participant.club_personal_id) ===
                  String(selectedClub?.club_personal_id || "")
              );
            }
          } catch (participantError) {
            console.error(
              "첨부 일정 참가자 정보를 불러오는 중 오류:",
              participantError
            );
          }

          setAttachedSchedule({
            id: normalizedSchedule.id,
            title: normalizedSchedule.title || "첨부된 일정",
            date: normalizedSchedule.date,
            startedAt: normalizedSchedule.started_at,
            endedAt: normalizedSchedule.ended_at,
            location: normalizedSchedule.location,
            description: normalizedSchedule.content,
            agenda: normalizedSchedule.agenda || [],
            participationEnabled: normalizedSchedule.participation_enabled,
            participantsCount,
            participantAvatars,
            isParticipant: scheduleIsParticipant,
          });
        } else {
          setAttachedSchedule(null);
        }

        setIsLiked(currentUserLiked);
        setLikeCount(likeCount || 0);

        // 댓글 로드
        await loadComments(article.id);
      } catch (error) {
        console.error("게시글 로드 중 오류:", error);
        alert("게시글을 불러오는 중 오류가 발생했습니다.");
        navigate("/myclub");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, selectedClub, userData, navigate]);

  const loadComments = async (articleId: number) => {
    try {
      const { data: commentsData, error } = await supabase
        .from("club_personal_comment")
        .select(
          `
          id,
          content,
          commented_date,
          created_at,
          anonymous,
          club_personal:club_personal_id (
            personal_user:personal_user_id (
              id,
              personal_name,
              profile_image_url
            )
          )
        `
        )
        .eq("club_personal_article_id", articleId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("댓글 로드 오류:", error);
        return;
      }

      if (commentsData) {
        const formattedComments: Comment[] = commentsData.map(
          (comment: any) => {
            // club_personal이 배열일 수 있으므로 처리
            const clubPersonal = Array.isArray(comment.club_personal)
              ? comment.club_personal[0]
              : comment.club_personal;
            const personalUser = Array.isArray(clubPersonal?.personal_user)
              ? clubPersonal.personal_user[0]
              : clubPersonal?.personal_user;

            const authorName = comment.anonymous
              ? "익명"
              : personalUser?.personal_name || "작성자";
            const authorAvatar = comment.anonymous
              ? "/profile-icon.png"
              : personalUser?.profile_image_url || "/profile-icon.png";

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
                return `오늘 ${date.getHours()}:${String(
                  date.getMinutes()
                ).padStart(2, "0")}`;
              } else if (days === 1) {
                return `어제 ${date.getHours()}:${String(
                  date.getMinutes()
                ).padStart(2, "0")}`;
              } else if (days < 7) {
                return `${days}일 전`;
              } else {
                return `${date.getMonth() + 1}월 ${date.getDate()}일`;
              }
            };

            return {
              id: comment.id,
              author: authorName,
              authorAvatar: authorAvatar,
              content: comment.content,
              createdAt: formatDate(
                comment.created_at || comment.commented_date
              ),
              isAnonymous: comment.anonymous || false,
              likes: 0, // 댓글 좋아요는 추후 구현
              isLiked: false,
            };
          }
        );

        setComments(formattedComments);
      }
    } catch (error) {
      console.error("댓글 로드 중 오류:", error);
    }
  };

  const handleLike = async () => {
    if (
      !post ||
      !selectedClub?.club_personal_id ||
      userData?.type !== "personal"
    ) {
      return;
    }

    try {
      if (isLiked) {
        // 좋아요 취소
        const { error } = await supabase
          .from("club_personal_like")
          .delete()
          .eq("club_personal_article_id", post.id)
          .eq("club_personal_id", selectedClub.club_personal_id);

        if (error) throw error;
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        // 좋아요 추가
        const { error } = await supabase.from("club_personal_like").insert({
          club_personal_article_id: post.id,
          club_personal_id: selectedClub.club_personal_id,
          liked_date: new Date().toISOString().split("T")[0],
        });

        if (error) throw error;
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("좋아요 처리 오류:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const handleScrap = () => {
    setIsScrapped(!isScrapped);
    // 스크랩 기능은 추후 구현
  };

  const handleCommentLike = (commentId: number) => {
    // 댓글 좋아요는 추후 구현
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post || !selectedClub?.club_personal_id) {
      return;
    }

    if (userData?.type === "club") {
      alert("동아리 계정은 댓글을 작성할 수 없습니다.");
      return;
    }

    try {
      const { error } = await supabase.from("club_personal_comment").insert({
        club_personal_article_id: post.id,
        club_personal_id: selectedClub.club_personal_id,
        content: newComment.trim(),
        commented_date: new Date().toISOString().split("T")[0],
        anonymous: isAnonymous,
      });

      if (error) throw error;

      // 댓글 목록 새로고침
      await loadComments(post.id);
      setNewComment("");
      setIsAnonymous(false);
      setReplyingTo(null);
      setShowCommentModal(false);
    } catch (error) {
      console.error("댓글 등록 오류:", error);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  const handleCommentAreaClick = () => {
    setReplyingTo(null);
    setShowCommentModal(true);
  };

  const handleReplyClick = (commentId: number) => {
    setReplyingTo(commentId);
    setShowCommentModal(true);
  };

  const handleAttendAttachedSchedule = async () => {
    if (
      !attachedSchedule ||
      !selectedClub?.club_personal_id ||
      attachedSchedule.isParticipant
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("schedule_participant").insert({
        schedule_id: attachedSchedule.id,
        club_personal_id: selectedClub.club_personal_id,
      });

      if (error) {
        throw error;
      }

      setAttachedSchedule((prev) =>
        prev
          ? {
              ...prev,
              isParticipant: true,
              participantsCount: prev.participantsCount + 1,
            }
          : prev
      );
    } catch (error) {
      console.error("첨부 일정 참석 처리 오류:", error);
      alert("참석 처리 중 오류가 발생했습니다.");
    }
  };

  const handleAbsentAttachedSchedule = async () => {
    if (
      !attachedSchedule ||
      !selectedClub?.club_personal_id ||
      !attachedSchedule.isParticipant
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("schedule_participant")
        .delete()
        .eq("schedule_id", attachedSchedule.id)
        .eq("club_personal_id", selectedClub.club_personal_id);

      if (error) {
        throw error;
      }

      setAttachedSchedule((prev) =>
        prev
          ? {
              ...prev,
              isParticipant: false,
              participantsCount: Math.max(prev.participantsCount - 1, 0),
            }
          : prev
      );
    } catch (error) {
      console.error("첨부 일정 불참 처리 오류:", error);
      alert("불참 처리 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="club-post-detail-screen">
        <div className="club-post-detail-header-back">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
        </div>
        <div className="club-post-detail-loading">로딩 중...</div>
        <BottomTabBar />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="club-post-detail-screen">
        <div className="club-post-detail-header-back">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
        </div>
        <div className="club-post-detail-not-found">
          <p>게시글을 찾을 수 없습니다.</p>
          <button onClick={() => navigate("/myclub")}>목록으로</button>
        </div>
        <BottomTabBar />
      </div>
    );
  }

  const formatScheduleDate = (dateString: string) => {
    if (!dateString) return "";
    const [yearStr, monthStr, dayStr] = dateString.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const dateObj = new Date(year, month - 1, day);
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[dateObj.getDay()] || "";
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  const formatScheduleTimeRange = (
    start?: string | null,
    end?: string | null
  ) => {
    if (start && end) {
      return `${start} ~ ${end}`;
    }
    if (start) return start;
    if (end) return end;
    return "시간 정보 없음";
  };

  return (
    <div className="club-post-detail-screen">
      {/* 헤더: 뒤로가기 버튼 */}
      <div className="club-post-detail-header-back">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      <div className="club-post-detail-content">
        {/* 프로필 사진, 이름, 날짜 */}
        <div className="club-post-detail-header">
          <div className="club-post-detail-club-info">
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="club-post-detail-club-logo"
            />
            <div className="club-post-detail-club-text">
              <span className="club-post-detail-club-name">{post.author}</span>
              <span className="club-post-detail-date">{post.createdAt}</span>
            </div>
          </div>
        </div>

        {/* 제목 */}
        <h1 className="club-post-detail-title">{post.title}</h1>

        {/* 내용 */}
        <div className="club-post-detail-body">
          <pre className="club-post-detail-content-text">{post.content}</pre>
        </div>

        {/* 첨부 일정 */}
        {attachedSchedule && (
          <div className="post-attached-schedule-card">
            <div className="post-attached-schedule-label">첨부된 일정</div>
            <h3 className="post-attached-schedule-title">
              {attachedSchedule.title}
            </h3>
            <div className="post-attached-schedule-row">
              <span className="post-attached-schedule-row-label">일시</span>
              <strong className="post-attached-schedule-row-value">
                {formatScheduleDate(attachedSchedule.date)}{" "}
                {formatScheduleTimeRange(
                  attachedSchedule.startedAt,
                  attachedSchedule.endedAt
                )}
              </strong>
            </div>
            {attachedSchedule.location && (
              <div className="post-attached-schedule-row">
                <span className="post-attached-schedule-row-label">장소</span>
                <span className="post-attached-schedule-row-value">
                  {attachedSchedule.location}
                </span>
              </div>
            )}
            <div className="post-attached-schedule-participants">
              <div>
                <span className="post-attached-schedule-row-label">참가자</span>
                <strong className="post-attached-schedule-row-value">
                  {attachedSchedule.participantsCount}명
                </strong>
              </div>
              <div className="post-attached-schedule-avatar-group">
                {attachedSchedule.participantAvatars.map(
                  (avatar: string, index: number) => (
                    <div
                      key={`${avatar}-${index}`}
                      className="post-attached-schedule-avatar"
                    >
                      <img src={avatar} alt="참가자" />
                    </div>
                  )
                )}
              </div>
            </div>
            {attachedSchedule.description && (
              <div className="post-attached-schedule-description">
                {attachedSchedule.description}
              </div>
            )}
            {attachedSchedule.agenda &&
              Array.isArray(attachedSchedule.agenda) &&
              attachedSchedule.agenda.length > 0 && (
                <div className="post-attached-schedule-agenda">
                  <h4>일정표</h4>
                  <ul>
                    {attachedSchedule.agenda.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

            {attachedSchedule.participationEnabled &&
              userData?.type === "personal" &&
              selectedClub?.club_personal_id && (
                <div className="post-attached-schedule-attendance">
                  <h4>참석 여부</h4>
                  <div className="event-attendance-buttons">
                    <button
                      className={`event-attendance-btn attend ${
                        attachedSchedule.isParticipant ? "selected" : ""
                      }`}
                      onClick={handleAttendAttachedSchedule}
                    >
                      참석
                    </button>
                    <button
                      className={`event-attendance-btn absent ${
                        !attachedSchedule.isParticipant ? "selected" : ""
                      }`}
                      onClick={handleAbsentAttachedSchedule}
                    >
                      불참
                    </button>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* 좋아요, 스크랩 버튼 */}
        <div className="club-post-detail-actions">
          <button
            className={`club-post-detail-action-btn like-btn ${
              isLiked ? "active" : ""
            }`}
            onClick={handleLike}
            disabled={userData?.type !== "personal"}
          >
            좋아요 {likeCount}
          </button>
          <button
            className={`club-post-detail-action-btn scrap-btn ${
              isScrapped ? "active" : ""
            }`}
            onClick={handleScrap}
          >
            {isScrapped ? "스크랩됨" : "스크랩"}
          </button>
        </div>

        {/* 댓글 섹션 */}
        <div className="club-post-detail-comments">
          <h2 className="club-post-detail-comments-title">
            댓글 {comments.length}
          </h2>

          {/* 댓글 목록 */}
          <div className="club-post-detail-comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="club-post-detail-comment-item">
                <div className="club-post-detail-comment-header">
                  <div className="club-post-detail-comment-author-info">
                    <img
                      src={comment.authorAvatar || "/profile-icon.png"}
                      alt={comment.author}
                      className="club-post-detail-comment-author-avatar"
                    />
                    <span className="club-post-detail-comment-author">
                      {comment.author}
                    </span>
                  </div>
                  <div className="club-post-detail-comment-actions">
                    <button
                      className={`club-post-detail-comment-like-btn ${
                        comment.isLiked ? "active" : ""
                      }`}
                      onClick={() => handleCommentLike(comment.id)}
                    >
                      좋아요 {comment.likes}
                    </button>
                    <button
                      className="club-post-detail-comment-reply-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplyClick(comment.id);
                      }}
                    >
                      답글
                    </button>
                  </div>
                </div>
                <div className="club-post-detail-comment-body">
                  <p className="club-post-detail-comment-content">
                    {comment.content}
                  </p>
                  <span className="club-post-detail-comment-date">
                    {comment.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 댓글 작성 영역 */}
          {userData?.type !== "club" && (
            <div className="club-post-detail-comment-write-area">
              <label className="club-post-detail-anonymous-checkbox">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span>익명</span>
              </label>
              <div
                className="club-post-detail-comment-input-area"
                onClick={handleCommentAreaClick}
              >
                <span className="club-post-detail-comment-input-placeholder">
                  댓글을 입력하세요...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 댓글 작성 모달 */}
        {showCommentModal && (
          <div
            className="club-post-detail-comment-modal-overlay"
            onClick={() => {
              setShowCommentModal(false);
              setReplyingTo(null);
            }}
          >
            <div
              className="club-post-detail-comment-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="club-post-detail-comment-modal-header">
                <h3>{replyingTo ? "답글 작성" : "댓글 작성"}</h3>
                <button
                  className="club-post-detail-comment-modal-close"
                  onClick={() => {
                    setShowCommentModal(false);
                    setReplyingTo(null);
                  }}
                >
                  ×
                </button>
              </div>
              <form
                className="club-post-detail-comment-modal-form"
                onSubmit={handleCommentSubmit}
              >
                {replyingTo && (
                  <div className="club-post-detail-comment-modal-reply-info">
                    <span>
                      {comments.find((c) => c.id === replyingTo)?.author ||
                        "사용자"}
                      님에게 답글
                    </span>
                  </div>
                )}
                <div className="club-post-detail-comment-modal-checkbox">
                  <label className="club-post-detail-anonymous-checkbox">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <span>익명</span>
                  </label>
                </div>
                <textarea
                  className="club-post-detail-comment-modal-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    replyingTo ? "답글을 입력하세요..." : "댓글을 입력하세요..."
                  }
                  rows={5}
                  autoFocus
                />
                <div className="club-post-detail-comment-modal-actions">
                  <button
                    type="button"
                    className="club-post-detail-comment-modal-cancel"
                    onClick={() => {
                      setShowCommentModal(false);
                      setNewComment("");
                      setIsAnonymous(false);
                      setReplyingTo(null);
                    }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="club-post-detail-comment-modal-submit"
                    disabled={!newComment.trim()}
                  >
                    등록
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
};

export default ClubPostDetailScreen;
