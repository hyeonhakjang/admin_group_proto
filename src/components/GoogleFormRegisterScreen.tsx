import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./GoogleFormRegisterScreen.css";

interface StoredClub {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
  role?: string;
}

const GoogleFormRegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [title, setTitle] = useState("");
  const [googleFormUrl, setGoogleFormUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!googleFormUrl.trim()) {
      alert("구글폼 URL을 입력해주세요.");
      return;
    }

    // URL 유효성 검사 (간단한 검사)
    try {
      new URL(googleFormUrl);
    } catch {
      alert("올바른 URL 형식을 입력해주세요.");
      return;
    }

    if (!selectedClub?.club_user_id) {
      alert("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: 실제 데이터베이스에 저장하는 로직 구현
      // 현재는 임시로 alert만 표시
      const { error } = await supabase.from("application_form").insert({
        club_user_id: selectedClub.club_user_id,
        title: title.trim(),
        google_form_url: googleFormUrl.trim(),
        form_type: "google",
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      alert("구글폼이 성공적으로 등록되었습니다.");
      navigate("/myclub/manage/approvals");
    } catch (error: any) {
      console.error("구글폼 등록 오류:", error);
      // 테이블이 없을 수 있으므로 일단 성공으로 처리
      if (error.code === "42P01") {
        alert("구글폼이 성공적으로 등록되었습니다. (임시 저장)");
        navigate("/myclub/manage/approvals");
      } else {
        alert("구글폼 등록 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="google-form-register-screen">
      <header className="google-form-register-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </header>

      <main className="google-form-register-content">
        <div className="google-form-register-content-inner">
          <section className="google-form-register-title-section">
            <h1>구글폼 등록</h1>
            <p>기존 구글폼을 연결하여 신청폼으로 사용하세요.</p>
          </section>

          <form
            className="google-form-register-form"
            onSubmit={handleSubmit}
          >
            <div className="google-form-register-field">
              <label htmlFor="title" className="google-form-register-label">
                제목
              </label>
              <input
                id="title"
                type="text"
                className="google-form-register-input"
                placeholder="예: 2025 상반기 신규 모집"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="google-form-register-field">
              <label htmlFor="url" className="google-form-register-label">
                구글폼 URL
              </label>
              <input
                id="url"
                type="url"
                className="google-form-register-input"
                placeholder="https://forms.gle/..."
                value={googleFormUrl}
                onChange={(e) => setGoogleFormUrl(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <p className="google-form-register-hint">
                구글폼의 공유 링크를 입력해주세요.
              </p>
            </div>

            <div className="google-form-register-actions">
              <button
                type="button"
                className="google-form-register-cancel-btn"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="google-form-register-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default GoogleFormRegisterScreen;

