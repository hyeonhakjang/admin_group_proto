import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ClubProfileEditScreen.css";

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

interface Post {
  id: number;
  title: string;
  content: string;
  written_date: string;
  created_at: string;
}

interface Comment {
  id: number;
  content: string;
  commented_date: string;
  created_at: string;
  article?: Post;
}

interface LikedPost {
  id: number;
  title: string;
  content: string;
  written_date: string;
  created_at: string;
}

type TabType = "posts" | "comments" | "commented-posts" | "liked-posts";

const ClubProfileEditScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("posts");

  // 프로필 정보
  const [clubNickname, setClubNickname] = useState<string>("");
  const [personalName, setPersonalName] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("/profile-icon.png");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editingNickname, setEditingNickname] = useState<string>("");
  const [personalUserId, setPersonalUserId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 데이터 리스트
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentedPosts, setCommentedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

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

  // 프로필 정보 로드
  useEffect(() => {
    const loadProfileInfo = async () => {
      if (!userData || !selectedClub?.club_personal_id) return;

      try {
        const { data: clubPersonal, error } = await supabase
          .from("club_personal")
          .select(
            `
            nickname,
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

          setClubNickname(
            clubPersonal.nickname || personalUser?.personal_name || ""
          );
          setPersonalName(personalUser?.personal_name || "");
          setProfileImage(
            personalUser?.profile_image_url || "/profile-icon.png"
          );
          setPersonalUserId(personalUser?.id || null);
        }
      } catch (error) {
        console.error("프로필 정보 로드 중 오류:", error);
      }
    };

    loadProfileInfo();
  }, [userData, selectedClub]);

  // 작성 글 로드
  const loadPosts = async () => {
    if (!selectedClub?.club_personal_id) return;

    try {
      setLoading(true);
      const { data: articles, error } = await supabase
        .from("club_personal_article")
        .select("id, title, content, written_date, created_at")
        .eq("club_personal_id", selectedClub.club_personal_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("작성 글 로드 오류:", error);
        return;
      }

      setPosts(articles || []);
    } catch (error) {
      console.error("작성 글 로드 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 작성 댓글 로드
  const loadComments = async () => {
    if (!selectedClub?.club_personal_id) return;

    try {
      setLoading(true);
      const { data: commentsData, error } = await supabase
        .from("club_personal_comment")
        .select("id, content, commented_date, created_at")
        .eq("club_personal_id", selectedClub.club_personal_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("작성 댓글 로드 오류:", error);
        return;
      }

      setComments(commentsData || []);
    } catch (error) {
      console.error("작성 댓글 로드 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 댓글단 글 로드
  const loadCommentedPosts = async () => {
    if (!selectedClub?.club_personal_id) return;

    try {
      setLoading(true);
      // 1. 사용자가 작성한 댓글들의 article_id 가져오기
      const { data: commentsData, error: commentsError } = await supabase
        .from("club_personal_comment")
        .select("club_personal_article_id")
        .eq("club_personal_id", selectedClub.club_personal_id);

      if (commentsError) {
        console.error("댓글 로드 오류:", commentsError);
        return;
      }

      if (!commentsData || commentsData.length === 0) {
        setCommentedPosts([]);
        return;
      }

      // 2. 중복 제거된 article_id 목록
      const articleIds = Array.from(
        new Set(
          commentsData
            .map((c: any) => c.club_personal_article_id)
            .filter((id: any) => id !== null)
        )
      );

      if (articleIds.length === 0) {
        setCommentedPosts([]);
        return;
      }

      // 3. 해당 article들 가져오기
      const { data: articles, error: articlesError } = await supabase
        .from("club_personal_article")
        .select("id, title, content, written_date, created_at")
        .in("id", articleIds)
        .order("created_at", { ascending: false });

      if (articlesError) {
        console.error("댓글단 글 로드 오류:", articlesError);
        return;
      }

      setCommentedPosts(articles || []);
    } catch (error) {
      console.error("댓글단 글 로드 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 좋아요한 글 로드
  const loadLikedPosts = async () => {
    if (!selectedClub?.club_personal_id) return;

    try {
      setLoading(true);
      // 1. 사용자가 좋아요한 article_id 가져오기
      const { data: likesData, error: likesError } = await supabase
        .from("club_personal_like")
        .select("club_personal_article_id")
        .eq("club_personal_id", selectedClub.club_personal_id);

      if (likesError) {
        console.error("좋아요 로드 오류:", likesError);
        return;
      }

      if (!likesData || likesData.length === 0) {
        setLikedPosts([]);
        return;
      }

      // 2. 중복 제거된 article_id 목록
      const articleIds = Array.from(
        new Set(
          likesData
            .map((l: any) => l.club_personal_article_id)
            .filter((id: any) => id !== null)
        )
      );

      if (articleIds.length === 0) {
        setLikedPosts([]);
        return;
      }

      // 3. 해당 article들 가져오기
      const { data: articles, error: articlesError } = await supabase
        .from("club_personal_article")
        .select("id, title, content, written_date, created_at")
        .in("id", articleIds)
        .order("created_at", { ascending: false });

      if (articlesError) {
        console.error("좋아요한 글 로드 오류:", articlesError);
        return;
      }

      setLikedPosts(articles || []);
    } catch (error) {
      console.error("좋아요한 글 로드 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (!selectedClub?.club_personal_id) return;

    switch (activeTab) {
      case "posts":
        loadPosts();
        break;
      case "comments":
        loadComments();
        break;
      case "commented-posts":
        loadCommentedPosts();
        break;
      case "liked-posts":
        loadLikedPosts();
        break;
    }
  }, [activeTab, selectedClub?.club_personal_id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const handlePostClick = (postId: number) => {
    navigate(`/myclub/post/${postId}`);
  };

  // 프로필 이미지 클릭 핸들러
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 프로필 이미지 변경
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !personalUserId) return;

    // 이미지 미리보기
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Supabase Storage에 업로드하고 URL을 personal_user 테이블에 저장
    // 현재는 미리보기만 구현
    try {
      setSaving(true);
      // 파일을 Base64로 변환하여 임시로 저장하거나
      // Supabase Storage에 업로드하는 로직을 여기에 추가
      // const fileExt = file.name.split('.').pop();
      // const fileName = `${personalUserId}-${Date.now()}.${fileExt}`;
      // const { data, error } = await supabase.storage
      //   .from('profile-images')
      //   .upload(fileName, file);
      // if (error) throw error;
      // const { data: { publicUrl } } = supabase.storage
      //   .from('profile-images')
      //   .getPublicUrl(fileName);
      // await supabase
      //   .from('personal_user')
      //   .update({ profile_image_url: publicUrl })
      //   .eq('id', personalUserId);
      alert("프로필 이미지 업로드 기능은 준비 중입니다.");
    } catch (error) {
      console.error("프로필 이미지 업로드 오류:", error);
      alert("프로필 이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 닉네임 편집 시작
  const handleNicknameClick = () => {
    setIsEditingNickname(true);
    setEditingNickname(clubNickname);
  };

  // 닉네임 저장
  const handleNicknameSave = async () => {
    if (!selectedClub?.club_personal_id || !editingNickname.trim()) {
      setIsEditingNickname(false);
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from("club_personal")
        .update({ nickname: editingNickname.trim() })
        .eq("id", selectedClub.club_personal_id);

      if (error) {
        throw error;
      }

      setClubNickname(editingNickname.trim());
      setIsEditingNickname(false);
    } catch (error) {
      console.error("닉네임 업데이트 오류:", error);
      alert("닉네임 업데이트 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 닉네임 편집 취소
  const handleNicknameCancel = () => {
    setIsEditingNickname(false);
    setEditingNickname(clubNickname);
  };

  // 동아리 탈퇴 확인
  const handleLeaveClubClick = () => {
    setShowLeaveConfirm(true);
  };

  // 동아리 탈퇴 취소
  const handleLeaveCancel = () => {
    setShowLeaveConfirm(false);
  };

  // 동아리 탈퇴 신청 실행
  const handleLeaveClub = async () => {
    if (!selectedClub?.club_personal_id) {
      alert("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      setLeaving(true);
      // club_personal 테이블에 탈퇴 신청 상태 업데이트
      const { error } = await supabase
        .from("club_personal")
        .update({ leave_requested: true })
        .eq("id", selectedClub.club_personal_id);

      if (error) {
        throw error;
      }

      alert("탈퇴 신청이 완료되었습니다. 관리자 승인 후 탈퇴가 처리됩니다.");
      // 페이지 새로고침 또는 상태 업데이트
      navigate(-1);
    } catch (error) {
      console.error("동아리 탈퇴 신청 오류:", error);
      alert("동아리 탈퇴 신청 중 오류가 발생했습니다.");
    } finally {
      setLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  return (
    <div className="club-profile-edit-screen">
      {/* 헤더: 뒤로가기 버튼 */}
      <div className="club-profile-edit-header-back">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      {/* 프로필 섹션 */}
      <div className="club-profile-edit-profile-section">
        {/* 섹션 A: 프로필 이미지 */}
        <div
          className="club-profile-edit-image-wrapper"
          onClick={handleImageClick}
          style={{ cursor: "pointer" }}
        >
          <img
            src={profileImage}
            alt="프로필"
            className="club-profile-edit-image"
          />
          <div className="club-profile-edit-image-overlay">
            <span className="club-profile-edit-image-edit-icon">✏️</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>

        {/* 섹션 B, C: 닉네임 정보 */}
        <div className="club-profile-edit-info">
          {/* 섹션 B: 동아리 닉네임 */}
          {isEditingNickname ? (
            <div className="club-profile-edit-nickname-edit">
              <input
                type="text"
                value={editingNickname}
                onChange={(e) => setEditingNickname(e.target.value)}
                className="club-profile-edit-nickname-input"
                autoFocus
                onBlur={handleNicknameSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNicknameSave();
                  } else if (e.key === "Escape") {
                    handleNicknameCancel();
                  }
                }}
              />
              <div className="club-profile-edit-nickname-actions">
                <button
                  className="club-profile-edit-nickname-save"
                  onClick={handleNicknameSave}
                  disabled={saving}
                >
                  저장
                </button>
                <button
                  className="club-profile-edit-nickname-cancel"
                  onClick={handleNicknameCancel}
                  disabled={saving}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div
              className="club-profile-edit-nickname"
              onClick={handleNicknameClick}
              style={{ cursor: "pointer" }}
            >
              {clubNickname}
            </div>
          )}
          {/* 섹션 C: personal_user 계정 닉네임 */}
          <div className="club-profile-edit-personal-name">{personalName}</div>
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="club-profile-edit-nav">
        <button
          className={`club-profile-edit-nav-item ${
            activeTab === "posts" ? "active" : ""
          }`}
          onClick={() => setActiveTab("posts")}
        >
          작성 글
        </button>
        <button
          className={`club-profile-edit-nav-item ${
            activeTab === "comments" ? "active" : ""
          }`}
          onClick={() => setActiveTab("comments")}
        >
          작성 댓글
        </button>
        <button
          className={`club-profile-edit-nav-item ${
            activeTab === "commented-posts" ? "active" : ""
          }`}
          onClick={() => setActiveTab("commented-posts")}
        >
          댓글단 글
        </button>
        <button
          className={`club-profile-edit-nav-item ${
            activeTab === "liked-posts" ? "active" : ""
          }`}
          onClick={() => setActiveTab("liked-posts")}
        >
          좋아요한 글
        </button>
      </div>

      {/* 리스트 영역 */}
      <div className="club-profile-edit-content">
        {loading ? (
          <div className="club-profile-edit-loading">로딩 중...</div>
        ) : (
          <>
            {/* 작성 글 */}
            {activeTab === "posts" && (
              <div className="club-profile-edit-list">
                {posts.length === 0 ? (
                  <div className="club-profile-edit-empty">
                    작성한 글이 없습니다.
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="club-profile-edit-list-item"
                      onClick={() => handlePostClick(post.id)}
                    >
                      <div className="club-profile-edit-item-title">
                        {post.title}
                      </div>
                      <div className="club-profile-edit-item-content">
                        {post.content.length > 100
                          ? `${post.content.substring(0, 100)}...`
                          : post.content}
                      </div>
                      <div className="club-profile-edit-item-date">
                        {formatDate(post.written_date || post.created_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 작성 댓글 */}
            {activeTab === "comments" && (
              <div className="club-profile-edit-list">
                {comments.length === 0 ? (
                  <div className="club-profile-edit-empty">
                    작성한 댓글이 없습니다.
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="club-profile-edit-list-item"
                    >
                      <div className="club-profile-edit-item-content">
                        {comment.content}
                      </div>
                      <div className="club-profile-edit-item-date">
                        {formatDate(
                          comment.commented_date || comment.created_at
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 댓글단 글 */}
            {activeTab === "commented-posts" && (
              <div className="club-profile-edit-list">
                {commentedPosts.length === 0 ? (
                  <div className="club-profile-edit-empty">
                    댓글을 단 글이 없습니다.
                  </div>
                ) : (
                  commentedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="club-profile-edit-list-item"
                      onClick={() => handlePostClick(post.id)}
                    >
                      <div className="club-profile-edit-item-title">
                        {post.title}
                      </div>
                      <div className="club-profile-edit-item-content">
                        {post.content.length > 100
                          ? `${post.content.substring(0, 100)}...`
                          : post.content}
                      </div>
                      <div className="club-profile-edit-item-date">
                        {formatDate(post.written_date || post.created_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 좋아요한 글 */}
            {activeTab === "liked-posts" && (
              <div className="club-profile-edit-list">
                {likedPosts.length === 0 ? (
                  <div className="club-profile-edit-empty">
                    좋아요한 글이 없습니다.
                  </div>
                ) : (
                  likedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="club-profile-edit-list-item"
                      onClick={() => handlePostClick(post.id)}
                    >
                      <div className="club-profile-edit-item-title">
                        {post.title}
                      </div>
                      <div className="club-profile-edit-item-content">
                        {post.content.length > 100
                          ? `${post.content.substring(0, 100)}...`
                          : post.content}
                      </div>
                      <div className="club-profile-edit-item-date">
                        {formatDate(post.written_date || post.created_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 동아리 탈퇴 버튼 */}
      <div className="club-profile-edit-leave-section">
        <button
          className="club-profile-edit-leave-btn"
          onClick={handleLeaveClubClick}
          disabled={leaving}
        >
          동아리 탈퇴하기
        </button>
      </div>

      {/* 탈퇴 확인 모달 */}
      {showLeaveConfirm && (
        <div className="club-profile-edit-leave-modal">
          <div className="club-profile-edit-leave-modal-content">
            <h3 className="club-profile-edit-leave-modal-title">동아리 탈퇴</h3>
            <p className="club-profile-edit-leave-modal-message">
              정말로 이 동아리에서 탈퇴하시겠습니까?
              <br />
              탈퇴 신청 후 관리자 승인을 거쳐 탈퇴가 처리됩니다.
            </p>
            <div className="club-profile-edit-leave-modal-actions">
              <button
                className="club-profile-edit-leave-modal-cancel"
                onClick={handleLeaveCancel}
                disabled={leaving}
              >
                취소
              </button>
              <button
                className="club-profile-edit-leave-modal-confirm"
                onClick={handleLeaveClub}
                disabled={leaving}
              >
                {leaving ? "처리 중..." : "탈퇴 신청하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubProfileEditScreen;
