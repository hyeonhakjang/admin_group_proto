import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import BottomTabBar from "./BottomTabBar";
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

  // 데이터 리스트
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentedPosts, setCommentedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [loading, setLoading] = useState(false);

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
      const articleIds = [
        ...new Set(
          commentsData
            .map((c) => c.club_personal_article_id)
            .filter((id) => id !== null)
        ),
      ];

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
      const articleIds = [
        ...new Set(
          likesData
            .map((l) => l.club_personal_article_id)
            .filter((id) => id !== null)
        ),
      ];

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
        <div className="club-profile-edit-image-wrapper">
          <img
            src={profileImage}
            alt="프로필"
            className="club-profile-edit-image"
          />
        </div>

        {/* 섹션 B, C: 닉네임 정보 */}
        <div className="club-profile-edit-info">
          {/* 섹션 B: 동아리 닉네임 */}
          <div className="club-profile-edit-nickname">{clubNickname}</div>
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

      <BottomTabBar />
    </div>
  );
};

export default ClubProfileEditScreen;

