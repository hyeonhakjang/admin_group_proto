import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ClubSignupScreen.css";

const ClubSignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    groupName: "",
    email: "",
    managerName: "",
    contact: "",
    university: "",
    noUniversity: false,
    affiliatedGroup: "",
  });
  const [showUniversitySearch, setShowUniversitySearch] = useState(false);
  const [showGroupSearch, setShowGroupSearch] = useState(false);
  const [universitySearch, setUniversitySearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");

  // 샘플 데이터
  const universities = [
    "홍익대학교",
    "서울대학교",
    "연세대학교",
    "고려대학교",
    "한국과학기술원",
  ];

  const campusGroups = formData.university
    ? [
        "총동아리연합회",
        "경영대학 학생회",
        "공과대학 학생회",
        "문과대학 학생회",
      ]
    : [];

  const filteredUniversities = universities.filter((univ) =>
    univ.toLowerCase().includes(universitySearch.toLowerCase())
  );

  const filteredGroups = campusGroups.filter((group) =>
    group.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        university: checked ? "" : prev.university,
        affiliatedGroup: checked ? "없음" : prev.affiliatedGroup,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "university" && !value) {
        setFormData((prev) => ({ ...prev, affiliatedGroup: "없음" }));
      }
    }
  };

  const handleUniversitySelect = (university: string) => {
    setFormData((prev) => ({ ...prev, university }));
    setShowUniversitySearch(false);
    setUniversitySearch("");
  };

  const handleGroupSelect = (group: string) => {
    setFormData((prev) => ({ ...prev, affiliatedGroup: group }));
    setShowGroupSearch(false);
    setGroupSearch("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("클럽 계정 가입:", formData);
    navigate("/login");
  };

  return (
    <div className="club-signup-screen">
      {/* 헤더: 뒤로가기 */}
      <div className="signup-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      {/* 회원가입 폼 */}
      <div className="signup-form-container">
        <h2 className="signup-title">클럽 계정 가입</h2>
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

          <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="noUniversity"
                  checked={formData.noUniversity}
                  onChange={handleChange}
                />
                <span>학교 없음</span>
              </label>
            </div>
            {!formData.noUniversity && (
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
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setShowUniversitySearch(true)}
                >
                  검색
                </button>
              </div>
            )}
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
            <label className="form-label">소속된 캠퍼스 공식 단체</label>
            {formData.noUniversity || !formData.university ? (
              <input
                type="text"
                className="form-input"
                value="없음"
                readOnly
                disabled
              />
            ) : (
              <>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    name="affiliatedGroup"
                    className="form-input search-input"
                    placeholder="소속 단체를 검색하세요"
                    value={formData.affiliatedGroup}
                    onChange={handleChange}
                    onFocus={() =>
                      formData.university && setShowGroupSearch(true)
                    }
                    readOnly
                  />
                  <button
                    type="button"
                    className="search-btn"
                    onClick={() =>
                      formData.university && setShowGroupSearch(true)
                    }
                    disabled={!formData.university}
                  >
                    검색
                  </button>
                </div>
                {showGroupSearch && formData.university && (
                  <>
                    <div
                      className="modal-overlay"
                      onClick={() => setShowGroupSearch(false)}
                    ></div>
                    <div className="search-modal">
                      <div className="search-modal-header">
                        <h3>소속 단체 검색</h3>
                        <button
                          type="button"
                          className="close-btn"
                          onClick={() => setShowGroupSearch(false)}
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="text"
                        className="search-input-modal"
                        placeholder="소속 단체를 입력하세요"
                        value={groupSearch}
                        onChange={(e) => setGroupSearch(e.target.value)}
                        autoFocus
                      />
                      <div className="search-results">
                        {filteredGroups.length > 0 ? (
                          filteredGroups.map((group) => (
                            <div
                              key={group}
                              className="search-result-item"
                              onClick={() => handleGroupSelect(group)}
                            >
                              {group}
                            </div>
                          ))
                        ) : (
                          <div className="no-results">검색 결과가 없습니다</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <button type="submit" className="submit-btn">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClubSignupScreen;
