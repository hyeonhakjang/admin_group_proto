import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./AccountApprovalScreen.css";

// 이미지 상수
const imgSearchIcon = "/search-icon.png";

interface UserData {
  type: "admin" | "personal" | "club" | "group";
  id: number;
  username: string;
  name: string;
  email: string;
}

interface GroupAccount {
  id: number;
  group_user_name: string;
  group_name: string;
  group_email: string;
  manager_name: string;
  manager_phone_num?: string;
  manager_student_num?: string;
  manager_department?: string;
  approved: boolean;
  created_at: string;
}

interface ClubAccount {
  id: number;
  club_user_name: string;
  club_name: string;
  club_email: string;
  manager_name: string;
  manager_phone_num?: string;
  manager_student_num?: string;
  manager_department?: string;
  approved: boolean;
  created_at: string;
}

const AccountApprovalScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [groupAccounts, setGroupAccounts] = useState<GroupAccount[]>([]);
  const [clubAccounts, setClubAccounts] = useState<ClubAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<
    GroupAccount | ClubAccount | null
  >(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserData = () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
      } else {
        // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
        navigate("/login");
      }
    };

    loadUserData();
  }, [navigate]);

  // 계정 목록 로드
  useEffect(() => {
    if (userData) {
      loadAccounts();
    }
  }, [userData, activeTab]);

  const loadAccounts = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      if (userData.type === "admin") {
        // 관리자: 캠퍼스 계정(group_user) 관리
        const { data, error } = await supabase
          .from("group_user")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("계정 목록 로드 오류:", error);
        } else {
          if (activeTab === "pending") {
            // 승인 요청: approved가 false인 계정
            setGroupAccounts(
              (data || []).filter((acc) => acc.approved === false)
            );
          } else {
            // 등록된 계정: approved가 true인 계정
            setGroupAccounts(
              (data || []).filter((acc) => acc.approved === true)
            );
          }
        }
      } else if (userData.type === "group") {
        // 캠퍼스 계정: 동아리 계정(club_user) 관리
        const { data, error } = await supabase
          .from("club_user")
          .select("*")
          .eq("group_user_id", userData.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("계정 목록 로드 오류:", error);
        } else {
          if (activeTab === "pending") {
            // 승인 요청: approved가 false인 계정
            setClubAccounts(
              (data || []).filter((acc) => acc.approved === false)
            );
          } else {
            // 등록된 계정: approved가 true인 계정
            setClubAccounts(
              (data || []).filter((acc) => acc.approved === true)
            );
          }
        }
      }
    } catch (error) {
      console.error("계정 목록 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 필터링
  const getFilteredAccounts = () => {
    if (!searchQuery.trim()) {
      return userData?.type === "admin" ? groupAccounts : clubAccounts;
    }

    const query = searchQuery.toLowerCase();
    if (userData?.type === "admin") {
      return groupAccounts.filter(
        (acc) =>
          acc.group_name.toLowerCase().includes(query) ||
          acc.group_user_name.toLowerCase().includes(query) ||
          acc.manager_name.toLowerCase().includes(query)
      );
    } else {
      return clubAccounts.filter(
        (acc) =>
          acc.club_name.toLowerCase().includes(query) ||
          acc.club_user_name.toLowerCase().includes(query) ||
          acc.manager_name.toLowerCase().includes(query)
      );
    }
  };

  // 승인 처리
  const handleApprove = async (accountId: number) => {
    if (!userData) return;

    if (window.confirm("이 계정을 승인하시겠습니까?")) {
      try {
        if (userData.type === "admin") {
          // 캠퍼스 계정 승인
          const { error } = await supabase
            .from("group_user")
            .update({ approved: true })
            .eq("id", accountId);

          if (error) {
            console.error("승인 오류:", error);
            alert("승인 처리 중 오류가 발생했습니다.");
          } else {
            alert("계정이 승인되었습니다.");
            loadAccounts();
          }
        } else if (userData.type === "group") {
          // 동아리 계정 승인
          const { error } = await supabase
            .from("club_user")
            .update({ approved: true })
            .eq("id", accountId);

          if (error) {
            console.error("승인 오류:", error);
            alert("승인 처리 중 오류가 발생했습니다.");
          } else {
            alert("계정이 승인되었습니다.");
            loadAccounts();
          }
        }
      } catch (error) {
        console.error("승인 처리 오류:", error);
        alert("승인 처리 중 오류가 발생했습니다.");
      }
    }
  };

  // 거부 처리
  const handleReject = async (accountId: number) => {
    if (!userData) return;

    if (window.confirm("이 계정을 거부하시겠습니까?")) {
      try {
        if (userData.type === "admin") {
          // 캠퍼스 계정 삭제 (거부)
          const { error } = await supabase
            .from("group_user")
            .delete()
            .eq("id", accountId);

          if (error) {
            console.error("거부 오류:", error);
            alert("거부 처리 중 오류가 발생했습니다.");
          } else {
            alert("계정이 거부되었습니다.");
            loadAccounts();
          }
        } else if (userData.type === "group") {
          // 동아리 계정 삭제 (거부)
          const { error } = await supabase
            .from("club_user")
            .delete()
            .eq("id", accountId);

          if (error) {
            console.error("거부 오류:", error);
            alert("거부 처리 중 오류가 발생했습니다.");
          } else {
            alert("계정이 거부되었습니다.");
            loadAccounts();
          }
        }
      } catch (error) {
        console.error("거부 처리 오류:", error);
        alert("거부 처리 중 오류가 발생했습니다.");
      }
    }
  };

  // 계정 상세 정보 모달 열기
  const handleAccountClick = (account: GroupAccount | ClubAccount) => {
    setSelectedAccount(account);
    setShowDetailModal(true);
  };

  // 설정 버튼 클릭
  const handleSettings = (accountId: number) => {
    // TODO: 설정 페이지로 이동
    alert("설정 기능은 준비 중입니다.");
  };

  if (!userData) {
    return (
      <div className="account-approval-screen">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  const filteredAccounts = getFilteredAccounts();
  const accountType = userData.type === "admin" ? "캠퍼스" : "동아리";

  return (
    <div className="account-approval-screen" data-name="계정 승인 화면">
      {/* 헤더 */}
      <div className="approval-header" data-name="Approval Header">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          data-name="backButton"
        >
          ←
        </button>
        <h1 className="approval-header-title">{accountType} 계정 승인</h1>
        <div style={{ width: "44px" }}></div> {/* 공간 맞춤 */}
      </div>

      {/* 탑 네비게이션 */}
      <div className="approval-tabs" data-name="Approval Tabs">
        <button
          className={`approval-tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          승인 요청
        </button>
        <button
          className={`approval-tab ${activeTab === "approved" ? "active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          등록된 계정
        </button>
      </div>

      {/* 검색 영역 */}
      <div className="approval-search-section">
        <div className="approval-search-container">
          <img
            src={imgSearchIcon}
            alt="검색"
            className="approval-search-icon"
          />
          <input
            type="text"
            className="approval-search-input"
            placeholder="이름으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 계정 목록 */}
      <div className="approval-content">
        {loading ? (
          <div className="approval-loading">로딩 중...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="approval-empty">
            {activeTab === "pending"
              ? "승인 요청된 계정이 없습니다."
              : "등록된 계정이 없습니다."}
          </div>
        ) : (
          <div className="approval-account-list">
            {userData.type === "admin"
              ? // 캠퍼스 계정 목록
                (filteredAccounts as GroupAccount[]).map((account) => (
                  <div key={account.id} className="approval-account-item">
                    <button
                      className="approval-account-name"
                      onClick={() => handleAccountClick(account)}
                    >
                      {account.group_name}
                    </button>
                    {activeTab === "pending" ? (
                      <div className="approval-account-actions">
                        <button
                          className="approval-button approve"
                          onClick={() => handleApprove(account.id)}
                        >
                          승인
                        </button>
                        <button
                          className="approval-button reject"
                          onClick={() => handleReject(account.id)}
                        >
                          거부
                        </button>
                      </div>
                    ) : (
                      <button
                        className="approval-settings-button"
                        onClick={() => handleSettings(account.id)}
                      >
                        설정
                      </button>
                    )}
                  </div>
                ))
              : // 동아리 계정 목록
                (filteredAccounts as ClubAccount[]).map((account) => (
                  <div key={account.id} className="approval-account-item">
                    <button
                      className="approval-account-name"
                      onClick={() => handleAccountClick(account)}
                    >
                      {account.club_name}
                    </button>
                    {activeTab === "pending" ? (
                      <div className="approval-account-actions">
                        <button
                          className="approval-button approve"
                          onClick={() => handleApprove(account.id)}
                        >
                          승인
                        </button>
                        <button
                          className="approval-button reject"
                          onClick={() => handleReject(account.id)}
                        >
                          거부
                        </button>
                      </div>
                    ) : (
                      <button
                        className="approval-settings-button"
                        onClick={() => handleSettings(account.id)}
                      >
                        설정
                      </button>
                    )}
                  </div>
                ))}
          </div>
        )}
      </div>

      {/* 계정 상세 정보 모달 */}
      {showDetailModal && selectedAccount && (
        <>
          <div
            className="approval-modal-overlay"
            onClick={() => {
              setShowDetailModal(false);
              setSelectedAccount(null);
            }}
          ></div>
          <div className="approval-modal" onClick={(e) => e.stopPropagation()}>
            <div className="approval-modal-header">
              <h2 className="approval-modal-title">계정 정보</h2>
              <button
                className="approval-modal-close"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAccount(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="approval-modal-body">
              <div className="approval-modal-info-item">
                <span className="approval-modal-label">계정 이름:</span>
                <span className="approval-modal-value">
                  {userData.type === "admin"
                    ? (selectedAccount as GroupAccount).group_name
                    : (selectedAccount as ClubAccount).club_name}
                </span>
              </div>
              <div className="approval-modal-info-item">
                <span className="approval-modal-label">담당자 이름:</span>
                <span className="approval-modal-value">
                  {selectedAccount.manager_name}
                </span>
              </div>
              <div className="approval-modal-info-item">
                <span className="approval-modal-label">이메일:</span>
                <span className="approval-modal-value">
                  {userData.type === "admin"
                    ? (selectedAccount as GroupAccount).group_email
                    : (selectedAccount as ClubAccount).club_email}
                </span>
              </div>
              <div className="approval-modal-info-item">
                <span className="approval-modal-label">연락처:</span>
                <span className="approval-modal-value">
                  {selectedAccount.manager_phone_num || "없음"}
                </span>
              </div>
              {selectedAccount.manager_student_num && (
                <div className="approval-modal-info-item">
                  <span className="approval-modal-label">학번:</span>
                  <span className="approval-modal-value">
                    {selectedAccount.manager_student_num}
                  </span>
                </div>
              )}
              {selectedAccount.manager_department && (
                <div className="approval-modal-info-item">
                  <span className="approval-modal-label">학과:</span>
                  <span className="approval-modal-value">
                    {selectedAccount.manager_department}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountApprovalScreen;
