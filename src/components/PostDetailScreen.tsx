import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./PostDetailScreen.css";

// 게시글 인터페이스
interface Post {
  id: number;
  clubId: number;
  clubName: string;
  clubLogo: string;
  title: string;
  content: string;
  fullContent: string;
  createdAt: string;
  views: number;
  likes: number;
  attachedPayoutId?: number;
}

interface UserData {
  id: number;
  type: "personal" | "club" | "group" | "admin";
}

type PayoutStatus = "pending" | "paid" | "unpaid";

interface AttachedPayoutSummary {
  id: number;
  title: string;
  appliedDate: string;
  totalMembers: number;
  isUserParticipant: boolean;
  userStatus: PayoutStatus | null;
}

// 샘플 게시글 상세 데이터
const samplePostDetails: { [key: number]: Post } = {
  1: {
    id: 1,
    clubId: 1,
    clubName: "HICC",
    clubLogo: "/profile-icon.png",
    title: "2024년 신입 부원 모집합니다!",
    content:
      "HICC에서 함께 성장할 신입 부원을 모집합니다. 웹 개발과 알고리즘에 관심이 있는 분들을 환영합니다.",
    fullContent: `안녕하세요, HICC입니다!

2024년 신입 부원을 모집합니다. HICC는 홍익대학교 컴퓨터공학 동아리로, 웹 개발, 알고리즘, 프로젝트 등 다양한 활동을 진행하고 있습니다.

📌 모집 분야
- 프론트엔드 개발
- 백엔드 개발
- 알고리즘 스터디
- 프로젝트 참여

📅 모집 일정
- 지원 기간: 2024년 1월 15일 ~ 1월 30일
- 면접 일정: 2024년 2월 초 (개별 안내)

💡 지원 방법
- 이메일: hicc@hongik.ac.kr
- 인스타그램 DM: @hicc_official

많은 지원 부탁드립니다!`,
    createdAt: "2024-01-15",
    views: 245,
    likes: 32,
  },
  2: {
    id: 2,
    clubId: 2,
    clubName: "브레인스워즈",
    clubLogo: "/profile-icon.png",
    title: "토론 대회 개최 안내",
    content: "이번 주말에 토론 대회를 개최합니다. 많은 관심 부탁드립니다.",
    fullContent: `안녕하세요, 브레인스워즈입니다!

이번 주말 토론 대회를 개최합니다.

📅 일정
- 날짜: 2024년 1월 20일 (토요일)
- 시간: 오후 2시 ~ 6시
- 장소: 경영대학 강의실 101호

📌 주제
- 경제 발전과 환경 보호의 균형
- 인공지능의 사회적 영향

🎯 참가 방법
- 사전 신청 필수
- 신청 기한: 1월 18일까지

많은 관심과 참여 부탁드립니다!`,
    createdAt: "2024-01-14",
    views: 189,
    likes: 28,
  },
  3: {
    id: 3,
    clubId: 3,
    clubName: "VOERA",
    clubLogo: "/profile-icon.png",
    title: "공연 연습 일정 공지",
    content:
      "다음 주 공연을 위한 연습 일정을 공지드립니다. 모든 부원분들의 참석 부탁드립니다.",
    fullContent: `안녕하세요, VOERA입니다!

다음 주 공연을 위한 연습 일정을 공지드립니다.

📅 연습 일정
- 월요일: 오후 7시 ~ 9시
- 수요일: 오후 7시 ~ 9시
- 금요일: 오후 7시 ~ 9시
- 토요일: 오전 10시 ~ 오후 2시

📍 장소
- 음악동 연습실

🎵 연습 곡
- 신청곡 리스트는 카카오톡 단체방에 공지

모든 부원분들의 참석 부탁드립니다!`,
    createdAt: "2024-01-13",
    views: 156,
    likes: 19,
  },
  4: {
    id: 4,
    clubId: 1,
    clubName: "HICC",
    clubLogo: "/profile-icon.png",
    title: "프로젝트 발표회 안내",
    content: "이번 학기 프로젝트 발표회를 개최합니다. 많은 관심 부탁드립니다.",
    fullContent: `안녕하세요, HICC입니다!

이번 학기 프로젝트 발표회를 개최합니다.

📅 일정
- 날짜: 2024년 1월 25일 (목요일)
- 시간: 오후 2시 ~ 5시
- 장소: 컴퓨터공학과 강의실

🎯 발표 팀
- 팀 1: 웹 애플리케이션 개발
- 팀 2: 모바일 앱 개발
- 팀 3: AI 프로젝트

많은 관심 부탁드립니다!`,
    createdAt: "2024-01-12",
    views: 312,
    likes: 45,
  },
  5: {
    id: 5,
    clubId: 2,
    clubName: "브레인스워즈",
    clubLogo: "/profile-icon.png",
    title: "학술 세미나 개최",
    content:
      "이번 주 금요일에 학술 세미나를 개최합니다. 주제는 '현대 경제학'입니다.",
    fullContent: `안녕하세요, 브레인스워즈입니다!

이번 주 금요일에 학술 세미나를 개최합니다.

📅 일정
- 날짜: 2024년 1월 19일 (금요일)
- 시간: 오후 4시 ~ 6시
- 장소: 경영대학 세미나실

📚 주제
- 현대 경제학의 주요 이론
- 경제 정책의 실제 사례

🎓 강사
- 홍익대학교 경제학과 교수

많은 관심 부탁드립니다!`,
    createdAt: "2024-01-11",
    views: 201,
    likes: 33,
  },
  6: {
    id: 6,
    clubId: 3,
    clubName: "VOERA",
    clubLogo: "/profile-icon.png",
    title: "봄 콘서트 티켓 예매 안내",
    content: "봄 콘서트 티켓 예매가 시작되었습니다. 많은 관심 부탁드립니다!",
    fullContent: `안녕하세요, VOERA입니다!

봄 콘서트 티켓 예매가 시작되었습니다.

🎵 콘서트 정보
- 날짜: 2024년 3월 15일 (금요일)
- 시간: 오후 7시
- 장소: 홍익대학교 대강당

💰 티켓 가격
- 학생: 5,000원
- 일반: 10,000원

📅 예매 일정
- 1차 예매: 1월 20일 ~ 1월 27일
- 2차 예매: 2월 1일 ~ 2월 10일

많은 관심과 참여 부탁드립니다!`,
    createdAt: "2024-01-10",
    views: 278,
    likes: 52,
  },
};

// 댓글 인터페이스
interface Comment {
  id: number;
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isAnonymous: boolean;
  likes: number;
  isLiked: boolean;
}

const PostDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const postId = id ? parseInt(id, 10) : 0;
  const [post, setPost] = useState<Post | null>(
    samplePostDetails[postId] || null
  );
  const [userData, setUserData] = useState<UserData | null>(null);
  const [attachedPayoutSummary, setAttachedPayoutSummary] =
    useState<AttachedPayoutSummary | null>(null);
  const [payoutAccessMessage, setPayoutAccessMessage] = useState<string | null>(
    null
  );
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isCheckingPayout, setIsCheckingPayout] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isScrapped, setIsScrapped] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "익명",
      authorAvatar: "/profile-icon.png",
      content: "좋은 정보 감사합니다!",
      createdAt: "2024-01-15",
      isAnonymous: true,
      likes: 5,
      isLiked: false,
    },
    {
      id: 2,
      author: "홍익대생",
      authorAvatar: "/profile-icon.png",
      content: "참여하고 싶어요!",
      createdAt: "2024-01-15",
      isAnonymous: false,
      likes: 3,
      isLiked: false,
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) return;
    try {
      setUserData(JSON.parse(storedUser));
    } catch (error) {
      console.error("사용자 정보 파싱 오류:", error);
    }
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) {
        setIsLoadingPost(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("club_personal_article")
          .select(
            `
            id,
            title,
            content,
            written_date,
            created_at,
            club_personal:club_personal_id (
              club_user:club_user_id (
                id,
                club_name,
                profile_image_url
              )
            ),
            club_personal_article_payout (
              club_personal_payout_id
            )
          `
          )
          .eq("id", Number(id))
          .single();

        if (error || !data) {
          if (samplePostDetails[postId]) {
            setPost(samplePostDetails[postId]);
            setLikeCount(samplePostDetails[postId].likes);
          } else {
            setPost(null);
          }
          setAttachedPayoutSummary(null);
          setPayoutAccessMessage(null);
          return;
        }

        const likeCountValue = 0;

        const clubPersonalData = Array.isArray(data.club_personal)
          ? data.club_personal[0]
          : data.club_personal;
        const clubUserData = Array.isArray(clubPersonalData?.club_user)
          ? clubPersonalData?.club_user[0]
          : clubPersonalData?.club_user;

        const attachedPayoutId =
          data.club_personal_article_payout?.[0]?.club_personal_payout_id ||
          undefined;

        const articlePost: Post = {
          id: data.id,
          clubId: clubUserData?.id || 0,
          clubName: clubUserData?.club_name || "알 수 없음",
          clubLogo: clubUserData?.profile_image_url || "/profile-icon.png",
          title: data.title || "",
          content: data.content || "",
          fullContent: data.content || "",
          createdAt: data.written_date || data.created_at || "",
          views: 0,
          likes: likeCountValue || 0,
          attachedPayoutId,
        };

        setPost(articlePost);
        setLikeCount(likeCountValue || 0);
      } catch (error) {
        console.error("게시글 로드 오류:", error);
        if (!samplePostDetails[postId]) {
          setPost(null);
        }
      } finally {
        setIsLoadingPost(false);
      }
    };

    loadPost();
  }, [id, postId]);

  useEffect(() => {
    const loadPayoutSummary = async () => {
      if (!post?.attachedPayoutId) {
        setAttachedPayoutSummary(null);
        setPayoutAccessMessage(null);
        return;
      }

      setIsCheckingPayout(true);
      try {
        const { data, error } = await supabase
          .from("club_personal_payout")
          .select(
            `
            id,
            title,
            applied_date,
            club_user_id,
            payout_participant (
              club_personal_id,
              status
            )
          `
          )
          .eq("id", post.attachedPayoutId)
          .single();

        if (error || !data) {
          throw error || new Error("정산 정보를 찾을 수 없습니다.");
        }

        let userClubPersonalId: number | null = null;

        if (userData?.type === "personal") {
          const { data: clubPersonalData, error: clubPersonalError } =
            await supabase
              .from("club_personal")
              .select("id")
              .eq("personal_user_id", userData.id)
              .eq("club_user_id", data.club_user_id)
              .eq("approved", true)
              .limit(1);

          if (clubPersonalError) {
            console.error("멤버십 조회 오류:", clubPersonalError);
          }

          if (clubPersonalData && clubPersonalData.length > 0) {
            userClubPersonalId = clubPersonalData[0].id;
          }
        }

        const participants = data.payout_participant || [];
        const currentParticipant =
          userClubPersonalId !== null
            ? participants.find(
                (participant: any) =>
                  Number(participant.club_personal_id) ===
                  Number(userClubPersonalId)
              )
            : null;
        const isParticipant = Boolean(currentParticipant);
        const userStatus = currentParticipant?.status || null;

        setAttachedPayoutSummary({
          id: data.id,
          title: data.title,
          appliedDate: data.applied_date,
          totalMembers: participants.length,
          isUserParticipant: isParticipant,
          userStatus: isParticipant
            ? ((userStatus as PayoutStatus) || "pending")
            : null,
        });
        setPayoutAccessMessage(isParticipant ? null : "정산 대상이 아닙니다.");
      } catch (error) {
        console.error("정산 첨부 로드 오류:", error);
        setAttachedPayoutSummary(null);
        setPayoutAccessMessage(null);
      } finally {
        setIsCheckingPayout(false);
      }
    };

    loadPayoutSummary();
  }, [post?.attachedPayoutId, userData]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleScrap = () => {
    setIsScrapped(!isScrapped);
  };

  const formatPayoutDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  const getPayoutStatusLabel = (summary: AttachedPayoutSummary) => {
    if (!summary.isUserParticipant) {
      return "정산 대상 아님";
    }
    switch (summary.userStatus) {
      case "paid":
        return "완료";
      case "unpaid":
        return "미납";
      case "pending":
      default:
        return "대기";
    }
  };

  const getPayoutStatusClass = (summary: AttachedPayoutSummary) => {
    if (!summary.isUserParticipant) {
      return "status-disabled";
    }
    switch (summary.userStatus) {
      case "paid":
        return "status-paid";
      case "unpaid":
        return "status-unpaid";
      case "pending":
      default:
        return "status-pending";
    }
  };

  const handlePayoutCardClick = () => {
    if (!attachedPayoutSummary) return;
    if (!attachedPayoutSummary.isUserParticipant) {
      setPayoutAccessMessage("정산 대상이 아닙니다.");
      return;
    }
    navigate(`/myclub/payout/${attachedPayoutSummary.id}`);
  };

  const handleCommentLike = (commentId: number) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        return comment;
      })
    );
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const commentContent = replyingTo
        ? `@${
            comments.find((c) => c.id === replyingTo)?.author || "사용자"
          } ${newComment}`
        : newComment;

      const comment: Comment = {
        id: comments.length + 1,
        author: isAnonymous ? "익명" : "사용자",
        authorAvatar: "/profile-icon.png",
        content: commentContent,
        createdAt: new Date().toISOString().split("T")[0],
        isAnonymous,
        likes: 0,
        isLiked: false,
      };
      setComments([...comments, comment]);
      setNewComment("");
      setIsAnonymous(false);
      setReplyingTo(null);
      setShowCommentModal(false);
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

  if (!post && isLoadingPost) {
    return (
      <div className="post-detail-screen" data-name="게시글 상세 화면">
        <div className="post-detail-header-back">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
        </div>
        <div className="post-loading">게시글을 불러오는 중입니다...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-screen" data-name="게시글 상세 화면">
        <div className="post-detail-header-back">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
        </div>
        <div className="post-not-found">
          <p>게시글을 찾을 수 없습니다.</p>
          <button onClick={() => navigate("/community")}>목록으로</button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-screen" data-name="게시글 상세 화면">
      {/* 헤더: 뒤로가기 버튼 */}
      <div className="post-detail-header-back">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      <div className="post-detail-content">
        {/* 게시글 헤더 (동아리 로고 + 이름) */}
        <div className="post-detail-header">
          <div
            className="post-detail-club-info"
            onClick={() => navigate(`/community/club/${post.clubId}`)}
            style={{ cursor: "pointer" }}
          >
            <img
              src={post.clubLogo}
              alt={post.clubName}
              className="post-detail-club-logo"
            />
            <div className="post-detail-club-text">
              <span className="post-detail-club-name">{post.clubName}</span>
              <span className="post-detail-date">{post.createdAt}</span>
            </div>
          </div>
        </div>

        {/* 게시글 제목 */}
        <h1 className="post-detail-title">{post.title}</h1>

        {/* 게시글 내용 */}
        <div className="post-detail-body">
          <pre className="post-detail-content-text">{post.fullContent}</pre>
        </div>

        {isCheckingPayout && !attachedPayoutSummary && (
          <div className="post-payout-card-loading">
            정산 정보를 확인하는 중입니다...
          </div>
        )}

        {attachedPayoutSummary && (
          <div className="post-payout-card-wrapper">
            <div
              className={`payout-item-card ${
                attachedPayoutSummary.isUserParticipant ? "" : "disabled"
              }`}
              onClick={handlePayoutCardClick}
            >
              <div className="payout-item-members">
                총 {attachedPayoutSummary.totalMembers}명
              </div>
              <div className="payout-item-title">
                {attachedPayoutSummary.title}
              </div>
              <div className="payout-item-footer">
                <span className="payout-item-date">
                  {formatPayoutDate(attachedPayoutSummary.appliedDate)}
                </span>
                <span
                  className={`payout-item-status ${getPayoutStatusClass(
                    attachedPayoutSummary
                  )}`}
                >
                  {getPayoutStatusLabel(attachedPayoutSummary)}
                </span>
              </div>
            </div>
          </div>
        )}

        {payoutAccessMessage && (
          <p className="post-payout-card-message">{payoutAccessMessage}</p>
        )}

        {/* 게시글 액션 버튼 (좋아요, 스크랩) */}
        <div className="post-detail-actions">
          <button
            className={`post-detail-action-btn like-btn ${
              isLiked ? "active" : ""
            }`}
            onClick={handleLike}
          >
            좋아요 {likeCount}
          </button>
          <button
            className={`post-detail-action-btn scrap-btn ${
              isScrapped ? "active" : ""
            }`}
            onClick={handleScrap}
          >
            {isScrapped ? "스크랩됨" : "스크랩"}
          </button>
        </div>

        {/* 댓글 섹션 */}
        <div className="post-detail-comments">
          <h2 className="comments-title">댓글 {comments.length}</h2>

          {/* 댓글 목록 */}
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
                    <span className="comment-author">{comment.author}</span>
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
                    <button
                      className="comment-reply-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplyClick(comment.id);
                      }}
                    >
                      답글
                    </button>
                  </div>
                </div>
                <div className="comment-body">
                  <p className="comment-content">{comment.content}</p>
                  <span className="comment-date">{comment.createdAt}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 댓글 작성 영역 */}
          <div className="comment-write-area">
            <label className="anonymous-checkbox">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span>익명</span>
            </label>
            <div
              className="comment-input-area"
              onClick={handleCommentAreaClick}
            >
              <span className="comment-input-placeholder">
                댓글을 입력하세요...
              </span>
            </div>
          </div>
        </div>

        {/* 댓글 작성 모달 */}
        {showCommentModal && (
          <div
            className="comment-modal-overlay"
            onClick={() => {
              setShowCommentModal(false);
              setReplyingTo(null);
            }}
          >
            <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
              <div className="comment-modal-header">
                <h3>{replyingTo ? "답글 작성" : "댓글 작성"}</h3>
                <button
                  className="comment-modal-close"
                  onClick={() => {
                    setShowCommentModal(false);
                    setReplyingTo(null);
                  }}
                >
                  ×
                </button>
              </div>
              <form
                className="comment-modal-form"
                onSubmit={handleCommentSubmit}
              >
                {replyingTo && (
                  <div className="comment-modal-reply-info">
                    <span>
                      {comments.find((c) => c.id === replyingTo)?.author ||
                        "사용자"}
                      님에게 답글
                    </span>
                  </div>
                )}
                <div className="comment-modal-checkbox">
                  <label className="anonymous-checkbox">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <span>익명</span>
                  </label>
                </div>
                <textarea
                  className="comment-modal-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    replyingTo ? "답글을 입력하세요..." : "댓글을 입력하세요..."
                  }
                  rows={5}
                  autoFocus
                />
                <div className="comment-modal-actions">
                  <button
                    type="button"
                    className="comment-modal-cancel"
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
                    className="comment-modal-submit"
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

    </div>
  );
};

export default PostDetailScreen;
