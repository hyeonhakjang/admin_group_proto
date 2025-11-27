import React from "react";
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
              onClick={() => alert("신청폼 추가 기능은 준비 중입니다.")}
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
    </div>
  );
};

export default ApplicationFormManageScreen;
