import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import { supabase } from "../lib/supabase";
import "./PostWriteScreen.css";

interface UserData {
  type: "personal" | "club" | "group" | "admin";
  id: number;
  username: string;
  name: string;
  email: string;
}

interface StoredClub {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
  role?: string;
}

interface SelectedSchedule {
  id: number;
  title: string;
  date: string;
}

interface SelectedPayout {
  id: number;
  title: string;
  applied_date: string;
}

const PostWriteScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [clubPersonalId, setClubPersonalId] = useState<number | null>(null);

  // 폼 상태
  const [category, setCategory] = useState<string>("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isNotice, setIsNotice] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedSchedule, setSelectedSchedule] =
    useState<SelectedSchedule | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<SelectedPayout | null>(
    null
  );
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 카테고리 목록
  const categories = ["공지", "일정", "정산", "자유", "질문", "정보", "기타"];

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
    const loadClubPersonalId = async () => {
      if (!userData || !selectedClub) return;

      try {
        if (userData.type === "personal") {
          const { data: clubPersonals, error } = await supabase
            .from("club_personal")
            .select("id")
            .eq("personal_user_id", userData.id)
            .eq("club_user_id", selectedClub.club_user_id)
            .eq("approved", true)
            .limit(1);

          if (error) {
            console.error("club_personal 조회 오류:", error);
            return;
          }

          if (clubPersonals && clubPersonals.length > 0) {
            setClubPersonalId(clubPersonals[0].id);
          }
        } else if (userData.type === "club") {
          // club 계정은 club_personal_id가 없을 수 있음
          setClubPersonalId(null);
        }
      } catch (error) {
        console.error("동아리 정보 로드 오류:", error);
      }
    };

    loadClubPersonalId();
  }, [userData, selectedClub]);

  // 선택된 행사/정산 정보 로드 및 폼 데이터 복원
  useEffect(() => {
    const storedSchedule = sessionStorage.getItem("selectedArticleSchedule");
    if (storedSchedule) {
      setSelectedSchedule(JSON.parse(storedSchedule));
      sessionStorage.removeItem("selectedArticleSchedule");
    }

    const storedPayout = sessionStorage.getItem("selectedArticlePayout");
    if (storedPayout) {
      setSelectedPayout(JSON.parse(storedPayout));
      sessionStorage.removeItem("selectedArticlePayout");
    }

    // 저장된 폼 데이터 복원
    const storedData = sessionStorage.getItem("articleWriteData");
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (data.category) setCategory(data.category);
        if (data.isNotice !== undefined) setIsNotice(data.isNotice);
        if (data.title) setTitle(data.title);
        if (data.content) setContent(data.content);
        if (data.selectedSchedule) setSelectedSchedule(data.selectedSchedule);
        if (data.selectedPayout) setSelectedPayout(data.selectedPayout);
        sessionStorage.removeItem("articleWriteData");
      } catch (error) {
        console.error("폼 데이터 복원 오류:", error);
      }
    }
  }, []);

  const handleNavigateScheduleSelect = () => {
    sessionStorage.setItem(
      "articleWriteData",
      JSON.stringify({
        category,
        isNotice,
        title,
        content,
        selectedSchedule,
        selectedPayout,
      })
    );
    navigate("/myclub/post/write/schedule");
  };

  const handleNavigatePayoutSelect = () => {
    sessionStorage.setItem(
      "articleWriteData",
      JSON.stringify({
        category,
        isNotice,
        title,
        content,
        selectedSchedule,
        selectedPayout,
      })
    );
    navigate("/myclub/post/write/payout");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      alert("카테고리를 선택해 주세요.");
      return;
    }

    if (!title.trim()) {
      alert("글 제목을 입력해 주세요.");
      return;
    }

    if (!content.trim()) {
      alert("글 내용을 입력해 주세요.");
      return;
    }

    if (!selectedClub) {
      alert("동아리 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    if (userData?.type === "personal" && !clubPersonalId) {
      alert(
        "동아리 멤버 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 게시글 저장
      const { data: article, error: articleError } = await supabase
        .from("club_personal_article")
        .insert({
          title: title.trim(),
          content: content.trim(),
          written_date: new Date().toISOString().split("T")[0],
          club_personal_id: clubPersonalId,
          notification: isNotice,
        })
        .select()
        .single();

      if (articleError) {
        throw articleError;
      }

      if (!article) {
        throw new Error("게시글 저장 실패");
      }

      // 2. 카테고리 저장 (필수)
      const { error: categoryError } = await supabase
        .from("club_personal_article_category")
        .insert({
          club_personal_article_id: article.id,
          name: category,
        });

      if (categoryError) {
        console.error("카테고리 저장 오류:", categoryError);
        throw categoryError;
      }

      // 3. 행사 첨부 저장
      if (selectedSchedule) {
        const { error: scheduleError } = await supabase
          .from("club_personal_article_schedule")
          .insert({
            club_personal_article_id: article.id,
            club_personal_schedule_id: selectedSchedule.id,
          });

        if (scheduleError) {
          console.error("행사 첨부 저장 오류:", scheduleError);
        }
      }

      // 4. 정산 첨부 저장
      if (selectedPayout) {
        const { error: payoutLinkError } = await supabase
          .from("club_personal_article_payout")
          .insert({
            club_personal_article_id: article.id,
            club_personal_payout_id: selectedPayout.id,
          });

        if (payoutLinkError) {
          console.error("정산 첨부 저장 오류:", payoutLinkError);
        }
      }

      // 5. 첨부 파일은 추후 구현 (Supabase Storage 사용)

      alert("게시글이 등록되었습니다.");
      navigate("/myclub");
    } catch (error) {
      console.error("게시글 등록 오류:", error);
      alert("게시글 등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-write-screen">
      <div className="post-write-inner">
        {/* 헤더 */}
        <header className="post-write-header">
          <button className="post-write-back-btn" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
        </header>

        {/* 메인 컨텐츠 */}
        <form className="post-write-form" onSubmit={handleSubmit}>
          {/* 섹션 A: 카테고리 드롭다운 + 공지글 토글 */}
          <div className="post-write-section-a">
            <div className="post-write-category-wrapper">
              <button
                type="button"
                className="post-write-category-btn"
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                }}
              >
                {category || "카테고리"} ▼
              </button>
              {showCategoryDropdown && (
                <div className="post-write-category-dropdown">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className="post-write-category-option"
                      onClick={() => {
                        setCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="post-write-notice-toggle-wrapper">
              <label className="post-write-toggle-switch">
                <input
                  type="checkbox"
                  checked={isNotice}
                  onChange={(e) => setIsNotice(e.target.checked)}
                />
                <span className="post-write-toggle-label">공지글</span>
                <span className="post-write-toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* 글 제목 */}
          <div className="post-write-field">
            <label className="post-write-label">글 제목</label>
            <input
              type="text"
              className="post-write-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* 글 내용 */}
          <div className="post-write-field">
            <label className="post-write-label">글 내용</label>
            <textarea
              className="post-write-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={10}
            />
          </div>

          {/* 행사 첨부 */}
          <div className="post-write-field">
            <label className="post-write-label">행사 첨부</label>
            <button
              type="button"
              className="post-write-attach-btn"
              onClick={handleNavigateScheduleSelect}
            >
              {selectedSchedule
                ? `${selectedSchedule.title} (${selectedSchedule.date})`
                : "행사 선택"}
            </button>
            {selectedSchedule && (
              <button
                type="button"
                className="post-write-remove-attach-btn"
                onClick={() => setSelectedSchedule(null)}
              >
                X
              </button>
            )}
          </div>

          {/* 정산 첨부 */}
          <div className="post-write-field">
            <label className="post-write-label">정산 첨부</label>
            <button
              type="button"
              className="post-write-attach-btn"
              onClick={handleNavigatePayoutSelect}
            >
              {selectedPayout
                ? `${selectedPayout.title} (${selectedPayout.applied_date})`
                : "정산 선택"}
            </button>
            {selectedPayout && (
              <button
                type="button"
                className="post-write-remove-attach-btn"
                onClick={() => setSelectedPayout(null)}
              >
                X
              </button>
            )}
          </div>

          {/* 첨부 자료 */}
          <div className="post-write-field">
            <label className="post-write-label">첨부 자료</label>
            <input
              type="file"
              className="post-write-file-input"
              onChange={handleFileChange}
              multiple
            />
            {attachedFiles.length > 0 && (
              <div className="post-write-files-list">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="post-write-file-item">
                    <span className="post-write-file-name">{file.name}</span>
                    <button
                      type="button"
                      className="post-write-file-remove-btn"
                      onClick={() => handleRemoveFile(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="post-write-submit-btn"
            disabled={isSubmitting || !category || !title.trim() || !content.trim()}
          >
            {isSubmitting ? "등록 중..." : "등록"}
          </button>
        </form>
      </div>
      <BottomTabBar />
    </div>
  );
};

export default PostWriteScreen;
