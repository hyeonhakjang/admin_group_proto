import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./PersonalSignupScreen.css";

const PersonalSignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    name: "",
    university: "",
    email: "",
    emailVerified: false,
    studentId: "",
    department: "",
    phone: "",
    phoneVerified: false,
    birthDate: "",
  });

  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailVerification = () => {
    // 학교 이메일 인증 로직 구현 예정
    setShowEmailVerification(true);
  };

  const handlePhoneVerification = () => {
    // 모바일 인증 로직 구현 예정
    setShowPhoneVerification(true);
  };

  const verifyEmailCode = () => {
    // 인증 코드 확인 로직 구현 예정
    if (emailVerificationCode) {
      setFormData((prev) => ({ ...prev, emailVerified: true }));
      setShowEmailVerification(false);
      setEmailVerificationCode("");
    }
  };

  const verifyPhoneCode = () => {
    // 인증 코드 확인 로직 구현 예정
    if (phoneVerificationCode) {
      setFormData((prev) => ({ ...prev, phoneVerified: true }));
      setShowPhoneVerification(false);
      setPhoneVerificationCode("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 이메일 및 휴대폰 인증 확인
    if (!formData.emailVerified) {
      setError("이메일 인증을 완료해주세요.");
      setLoading(false);
      return;
    }

    if (!formData.phoneVerified) {
      setError("휴대폰 인증을 완료해주세요.");
      setLoading(false);
      return;
    }

    try {
      // 대학교 ID 찾기 (university 테이블에서)
      let univId: number | null = null;
      if (formData.university) {
        const { data: univData } = await supabase
          .from("university")
          .select("id")
          .eq("univ_name", formData.university)
          .single();

        if (univData) {
          univId = univData.id;
        } else {
          // 대학교가 없으면 새로 생성
          const { data: newUniv, error: univError } = await supabase
            .from("university")
            .insert({ univ_name: formData.university })
            .select("id")
            .single();

          if (newUniv && !univError) {
            univId = newUniv.id;
          }
        }
      }

      // 개인 사용자 등록
      const { data, error: insertError } = await supabase
        .from("personal_user")
        .insert({
          personal_user_name: formData.userId,
          password: formData.password, // 실제로는 해시된 비밀번호를 저장해야 함
          email: formData.email,
          personal_name: formData.name,
          university: formData.university,
          student_num: formData.studentId,
          department: formData.department,
          phone_num: formData.phone,
          birthdate: formData.birthDate || null,
          univ_id: univId,
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
        alert("회원가입이 완료되었습니다.");
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
    <div className="personal-signup-screen">
      {/* 헤더: 뒤로가기 */}
      <div className="signup-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      {/* 회원가입 폼 */}
      <div className="signup-form-container">
        <h2 className="signup-title">개인 계정 가입</h2>
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
            <label className="form-label">이름</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">학교</label>
            <input
              type="text"
              name="university"
              className="form-input"
              placeholder="학교를 입력하세요"
              value={formData.university}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">이메일 (학교 이메일 인증)</label>
            <div className="verification-input-wrapper">
              <input
                type="email"
                name="email"
                className="form-input verification-input"
                placeholder="학교 이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="verification-btn"
                onClick={handleEmailVerification}
                disabled={!formData.email}
              >
                인증
              </button>
            </div>
            {formData.emailVerified && (
              <span className="verification-status verified">✓ 인증 완료</span>
            )}
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
            <label className="form-label">휴대폰 번호 (모바일 인증)</label>
            <div className="verification-input-wrapper">
              <input
                type="tel"
                name="phone"
                className="form-input verification-input"
                placeholder="휴대폰 번호를 입력하세요"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="verification-btn"
                onClick={handlePhoneVerification}
                disabled={!formData.phone}
              >
                인증
              </button>
            </div>
            {formData.phoneVerified && (
              <span className="verification-status verified">✓ 인증 완료</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">생년월일</label>
            <input
              type="date"
              name="birthDate"
              className="form-input"
              value={formData.birthDate}
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

      {/* 이메일 인증 모달 */}
      {showEmailVerification && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowEmailVerification(false)}
          ></div>
          <div className="verification-modal">
            <div className="verification-modal-header">
              <h3>이메일 인증</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowEmailVerification(false)}
              >
                ✕
              </button>
            </div>
            <div className="verification-modal-body">
              <p>
                {formData.email}로 인증 코드를 발송했습니다.
                <br />
                인증 코드를 입력해주세요.
              </p>
              <input
                type="text"
                className="verification-code-input"
                placeholder="인증 코드 입력"
                value={emailVerificationCode}
                onChange={(e) => setEmailVerificationCode(e.target.value)}
                maxLength={6}
              />
              <button
                type="button"
                className="verify-btn"
                onClick={verifyEmailCode}
                disabled={!emailVerificationCode}
              >
                확인
              </button>
            </div>
          </div>
        </>
      )}

      {/* 휴대폰 인증 모달 */}
      {showPhoneVerification && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowPhoneVerification(false)}
          ></div>
          <div className="verification-modal">
            <div className="verification-modal-header">
              <h3>휴대폰 인증</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowPhoneVerification(false)}
              >
                ✕
              </button>
            </div>
            <div className="verification-modal-body">
              <p>
                {formData.phone}로 인증 코드를 발송했습니다.
                <br />
                인증 코드를 입력해주세요.
              </p>
              <input
                type="text"
                className="verification-code-input"
                placeholder="인증 코드 입력"
                value={phoneVerificationCode}
                onChange={(e) => setPhoneVerificationCode(e.target.value)}
                maxLength={6}
              />
              <button
                type="button"
                className="verify-btn"
                onClick={verifyPhoneCode}
                disabled={!phoneVerificationCode}
              >
                확인
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PersonalSignupScreen;
