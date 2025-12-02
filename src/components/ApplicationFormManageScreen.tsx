import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ApplicationFormManageScreen.css";

interface ApplicationForm {
  id: number;
  name: string;
  createdAt: string;
}

const mockForms: ApplicationForm[] = [
  { id: 1, name: "2025 상반기 신규 모집", createdAt: "2025.02.01" },
  { id: 2, name: "스터디 참여 신청", createdAt: "2025.01.15" },
  { id: 3, name: "신입 기획단 모집", createdAt: "2024.12.20" },
  { id: 4, name: "오디션 신청서", createdAt: "2024.11.02" },
];

const ApplicationFormManageScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="application-form-manage-screen">
      <header className="application-form-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </header>

      <main className="application-form-content">
        <div className="application-form-content-inner">
          <section className="application-form-title-section">
            <div>
              <h1>신청폼 관리</h1>
              <p>동아리 신청폼을 만들고 관리하세요.</p>
            </div>
            <button
              className="application-form-add-btn"
              onClick={() => setShowModal(true)}
            >
              + 신청폼 만들기
            </button>
          </section>

          <section className="application-form-grid">
            {mockForms.map((form) => (
              <div key={form.id} className="application-form-card">
                <div className="application-form-card-icon">
                  <div className="application-form-card-icon-circle">
                    <span role="img" aria-label="document">
                      📄
                    </span>
                  </div>
                </div>
                <div className="application-form-card-body">
                  <h3>{form.name}</h3>
                  <span>{form.createdAt}</span>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* 선택 모달 */}
      {showModal && (
        <div
          className="application-form-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="application-form-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="application-form-modal-header">
              <h2>신청폼 만들기</h2>
              <button
                className="application-form-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="application-form-modal-options">
              <button
                className="application-form-modal-option"
                onClick={() => {
                  setShowModal(false);
                  navigate("/myclub/manage/approvals/google-form/register");
                }}
              >
                <div className="application-form-modal-option-icon">
                  <span role="img" aria-label="google">
                    🔗
                  </span>
                </div>
                <div className="application-form-modal-option-text">
                  <h3>구글폼 등록</h3>
                  <p>기존 구글폼을 연결하여 사용하세요</p>
                </div>
              </button>
              <button
                className="application-form-modal-option"
                onClick={() => {
                  setShowModal(false);
                  // TODO: 직접 만들기 페이지로 이동
                  alert("직접 만들기 기능은 준비 중입니다.");
                }}
              >
                <div className="application-form-modal-option-icon">
                  <span role="img" aria-label="create">
                    ✏️
                  </span>
                </div>
                <div className="application-form-modal-option-text">
                  <h3>직접 만들기</h3>
                  <p>새로운 신청폼을 직접 작성하세요</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationFormManageScreen;
