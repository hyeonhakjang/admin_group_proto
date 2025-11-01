import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CampusOfficialSignupScreen.css";

const CampusOfficialSignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    groupName: "",
    groupEmail: "",
    managerName: "",
    studentId: "",
    department: "",
    contact: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 회원가입 로직 구현 예정
    console.log("캠퍼스 공식 계정 가입:", formData);
    // 회원가입 완료 후 로그인 페이지로 이동
    navigate("/login");
  };

  return (
    <div className="campus-official-signup-screen">
      {/* 헤더: 뒤로가기 */}
      <div className="signup-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      {/* 회원가입 폼 */}
      <div className="signup-form-container">
        <h2 className="signup-title">캠퍼스 공식 계정 가입</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label className="form-label">아이디</label>
            <input
              type="text"
              name="userId"
              className="form-input"
              placeholder="아이디를 입력하세요"
              value={formData.userId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">단체명</label>
            <input
              type="text"
              name="groupName"
              className="form-input"
              placeholder="단체명을 입력하세요"
              value={formData.groupName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">단체 이메일</label>
            <input
              type="email"
              name="groupEmail"
              className="form-input"
              placeholder="단체 이메일을 입력하세요"
              value={formData.groupEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">담당자 이름</label>
            <input
              type="text"
              name="managerName"
              className="form-input"
              placeholder="담당자 이름을 입력하세요"
              value={formData.managerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">학번</label>
            <input
              type="text"
              name="studentId"
              className="form-input"
              placeholder="학번을 입력하세요"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">학과</label>
            <input
              type="text"
              name="department"
              className="form-input"
              placeholder="학과를 입력하세요"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">연락처</label>
            <input
              type="tel"
              name="contact"
              className="form-input"
              placeholder="연락처를 입력하세요"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default CampusOfficialSignupScreen;
