import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ClubSignupScreen.css";

interface GroupUser {
  id: number;
  group_name: string;
  group_user_name: string;
}

const ClubSignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    groupName: "",
    email: "",
    managerName: "",
    contact: "",
    university: "",
    universityId: null as number | null,
    noUniversity: false,
    affiliatedGroup: "",
    affiliatedGroupId: null as number | null,
  });
  const [showUniversitySearch, setShowUniversitySearch] = useState(false);
  const [showGroupSearch, setShowGroupSearch] = useState(false);
  const [universitySearch, setUniversitySearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [universities, setUniversities] = useState<string[]>([]);
  const [campusGroups, setCampusGroups] = useState<GroupUser[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // 대학 목록 로드
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const { data, error } = await supabase
          .from("university")
          .select("univ_name")
          .order("univ_name", { ascending: true });

        if (error) {
          console.error("대학 목록 로드 오류:", error);
        } else {
          setUniversities((data || []).map((u) => u.univ_name));
        }
      } catch (err) {
        console.error("대학 목록 로드 오류:", err);
      }
    };

    loadUniversities();
  }, []);

  // 선택한 대학의 승인된 캠퍼스 공식 단체 로드
  useEffect(() => {
    const loadCampusGroups = async () => {
      if (!formData.university || !formData.universityId || formData.noUniversity) {
        setCampusGroups([]);
        return;
      }

      setLoadingGroups(true);
      try {
        const { data, error } = await supabase
          .from("group_user")
          .select("id, group_name, group_user_name")
          .eq("univ_id", formData.universityId)
          .eq("approved", true)
          .order("group_name", { ascending: true });

        if (error) {
          console.error("캠퍼스 단체 목록 로드 오류:", error);
          setCampusGroups([]);
        } else {
          setCampusGroups(data || []);
        }
      } catch (err) {
        console.error("캠퍼스 단체 목록 로드 오류:", err);
        setCampusGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    loadCampusGroups();
  }, [formData.university, formData.universityId, formData.noUniversity]);

  const filteredUniversities = universities.filter((univ) =>
    univ.toLowerCase().includes(universitySearch.toLowerCase())
  );

  const filteredGroups = campusGroups.filter((group) =>
    group.group_name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        university: checked ? "" : prev.university,
        universityId: checked ? null : prev.universityId,
        affiliatedGroup: checked ? "없음" : prev.affiliatedGroup,
        affiliatedGroupId: checked ? null : prev.affiliatedGroupId,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "university" && !value) {
        setFormData((prev) => ({
          ...prev,
          affiliatedGroup: "없음",
          affiliatedGroupId: null,
        }));
      }
    }
  };

  const handleUniversitySelect = async (university: string) => {
    // 대학 ID 찾기
    let univId: number | null = null;
    try {
      const { data: univData } = await supabase
        .from("university")
        .select("id")
        .eq("univ_name", university)
        .single();

      if (univData) {
        univId = univData.id;
      }
    } catch (err) {
      console.error("대학 ID 찾기 오류:", err);
    }

    setFormData((prev) => ({
      ...prev,
      university,
      universityId: univId,
      affiliatedGroup: "",
      affiliatedGroupId: null,
    }));
    setShowUniversitySearch(false);
    setUniversitySearch("");
  };

  const handleGroupSelect = (group: GroupUser) => {
    setFormData((prev) => ({
      ...prev,
      affiliatedGroup: group.group_name,
      affiliatedGroupId: group.id,
    }));
    setShowGroupSearch(false);
    setGroupSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 그룹 사용자 ID 사용 (이미 선택된 affiliatedGroupId 사용)
      const groupUserId = formData.affiliatedGroupId;

      // 클럽 사용자 등록 (approved는 0으로 설정 - 캠퍼스 계정 승인 필요)
      const { error: insertError } = await supabase
        .from("club_user")
        .insert({
          club_user_name: formData.userId,
          password: formData.password, // 실제로는 해시된 비밀번호를 저장해야 함
          club_name: formData.groupName,
          club_email: formData.email,
          manager_name: formData.managerName,
          manager_phone_num: formData.contact,
          manager_student_num: undefined, // 폼에 없음
          manager_department: undefined, // 폼에 없음
          approved: 0, // 캠퍼스 계정 승인 대기 상태
          group_user_id: groupUserId,
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
          "회원가입이 완료되었습니다.\n캠퍼스 공식 계정 승인 후 로그인할 수 있습니다."
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
                        {loadingGroups ? (
                          <div className="no-results">로딩 중...</div>
                        ) : filteredGroups.length > 0 ? (
                          filteredGroups.map((group) => (
                            <div
                              key={group.id}
                              className="search-result-item"
                              onClick={() => handleGroupSelect(group)}
                            >
                              {group.group_name}
                            </div>
                          ))
                        ) : (
                          <div className="no-results">
                            {formData.university
                              ? "승인된 캠퍼스 공식 단체가 없습니다."
                              : "검색 결과가 없습니다"}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
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

export default ClubSignupScreen;
