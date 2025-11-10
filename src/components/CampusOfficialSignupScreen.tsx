import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./CampusOfficialSignupScreen.css";

const CampusOfficialSignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 그룹 사용자 등록 (approved는 false로 설정 - 관리자 승인 필요)
      const { error: insertError } = await supabase
        .from("group_user")
        .insert({
          group_user_name: formData.userId,
          password: formData.password, // 실제로는 해시된 비밀번호를 저장해야 함
          group_name: formData.groupName,
          group_email: formData.groupEmail,
          manager_name: formData.managerName,
          manager_phone_num: formData.contact,
          manager_student_num: formData.studentId,
          manager_department: formData.department,
          approved: false, // 관리자 승인 대기 상태
          univ_id: null, // 폼에 학교 선택이 없으므로 null
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          // Unique constraint violation
          setError("이미 사용 중인 아이디 또는 이메일입니다.");
        } else {
          setError("회원가입 중 오류가 발생했습니다.");
          console.error("회원가입 오류:", insertError);
        }
      } else {
        // 회원가입 성공
        alert(
          "회원가입이 완료되었습니다.\n관리자 승인 후 로그인할 수 있습니다."
        );
        navigate("/login");
      }
    } catch (err) {
      console.error("회원가입 오류:", err);
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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

          {error && <div className="signup-error">{error}</div>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CampusOfficialSignupScreen;
