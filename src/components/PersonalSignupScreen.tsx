import React, { useState, useEffect } from "react";
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
    studentId: "",
    department: "",
    phone: "",
    birthDate: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 학교 검색 관련 상태
  const [universities, setUniversities] = useState<string[]>([]);
  const [showUniversitySearch, setShowUniversitySearch] = useState(false);
  const [universitySearch, setUniversitySearch] = useState("");

  // 학교 목록 로드
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const { data, error } = await supabase
          .from("university")
          .select("univ_name")
          .order("univ_name", { ascending: true });

        if (error) {
          console.error("학교 목록 로드 오류:", error);
        } else {
          setUniversities((data || []).map((u) => u.univ_name));
        }
      } catch (err) {
        console.error("학교 목록 로드 중 오류:", err);
      }
    };

    loadUniversities();
  }, []);

  // 필터링된 학교 목록
  const filteredUniversities = universities.filter((univ) =>
    univ.toLowerCase().includes(universitySearch.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 학교 선택 핸들러
  const handleUniversitySelect = (university: string) => {
    setFormData((prev) => ({ ...prev, university }));
    setShowUniversitySearch(false);
    setUniversitySearch("");
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);


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
      const { error: insertError } = await supabase
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
            <div className="search-input-wrapper">
              <input
                type="text"
                name="university"
                className="form-input search-input"
                placeholder="학교를 검색하세요"
                value={formData.university}
                onChange={handleChange}
                onFocus={() => setShowUniversitySearch(true)}
                readOnly
                required
              />
              <button
                type="button"
                className="search-btn"
                onClick={() => setShowUniversitySearch(true)}
              >
                검색
              </button>
            </div>
            {showUniversitySearch && (
              <>
                <div
                  className="modal-overlay"
                  onClick={() => setShowUniversitySearch(false)}
                ></div>
                <div className="search-modal">
                  <div className="search-modal-header">
                    <h3>학교 검색</h3>
                    <button
                      type="button"
                      className="close-btn"
                      onClick={() => setShowUniversitySearch(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    className="search-input-modal"
                    placeholder="학교 이름을 입력하세요"
                    value={universitySearch}
                    onChange={(e) => setUniversitySearch(e.target.value)}
                    autoFocus
                  />
                  <div className="search-results">
                    {filteredUniversities.length > 0 ? (
                      filteredUniversities.map((univ) => (
                        <div
                          key={univ}
                          className="search-result-item"
                          onClick={() => handleUniversitySelect(univ)}
                        >
                          {univ}
                        </div>
                      ))
                    ) : (
                      <div className="no-results">검색 결과가 없습니다</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="이메일을 입력하세요"
              value={formData.email}
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
            <label className="form-label">휴대폰 번호</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="휴대폰 번호를 입력하세요"
              value={formData.phone}
              onChange={handleChange}
              required
            />
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

    </div>
  );
};

export default PersonalSignupScreen;
