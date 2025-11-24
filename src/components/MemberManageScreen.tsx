import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./MemberManageScreen.css";

interface UserData {
  type: "personal" | "club" | "group" | "admin";
  id: number;
  username: string;
  name: string;
  email: string;
}

interface Club {
  id: number;
  name: string;
  avatar: string;
  role: string;
  club_user_id?: number;
  club_personal_id?: number;
}

interface Member {
  id: number;
  clubPersonalId: number;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  isOwner: boolean;
  avatar: string;
}

const MemberManageScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMemberForRole, setSelectedMemberForRole] = useState<
    number | null
  >(null);

  // 사용자 정보 및 동아리 정보 로드
  useEffect(() => {
    const loadUserData = () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
      }
    };

    const loadSelectedClub = () => {
      const storedClub = sessionStorage.getItem("selectedClub");
      if (storedClub) {
        try {
          const club = JSON.parse(storedClub);
          setSelectedClub(club);
        } catch (error) {
          console.error("동아리 정보 파싱 오류:", error);
        }
      }
    };

    loadUserData();
    loadSelectedClub();
  }, []);

  // 멤버 로드 함수
  const loadMembers = useCallback(async () => {
    if (!selectedClub?.club_user_id) return;

    try {
      const { data: members, error } = await supabase
        .from("club_personal")
        .select(
          `
          id,
          role,
          approved,
          personal_user:personal_user_id (
            id,
            personal_name,
            email,
            profile_image_url
          )
        `
        )
        .eq("club_user_id", selectedClub.club_user_id)
        .order("approved", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("멤버 로드 오류:", error);
      } else if (members) {
        const transformedMembers = members.map((member: any) => ({
          id: member.personal_user?.id || member.id,
          clubPersonalId: member.id,
          name: member.personal_user?.personal_name || "이름 없음",
          email: member.personal_user?.email || "",
          role: member.role || "동아리원",
          approved: member.approved || false,
          isOwner: member.role === "회장" || member.role === "관리자",
          avatar:
            member.personal_user?.profile_image_url || "/profile-icon.png",
        }));

        // 역할 순서로 정렬: 회장 - 스태프 - 회원
        const roleOrder: { [key: string]: number } = {
          관리자: 0,
          회장: 1,
          스태프: 2,
          회원: 3,
        };

        const sortedMembers = transformedMembers.sort((a, b) => {
          const aOrder = roleOrder[a.role] ?? 999;
          const bOrder = roleOrder[b.role] ?? 999;
          return aOrder - bOrder;
        });

        setMembers(sortedMembers);
      }
    } catch (error) {
      console.error("멤버 로드 중 오류:", error);
    }
  }, [selectedClub]);

  // 멤버 승인 처리 함수
  const handleApproveMember = useCallback(
    async (clubPersonalId: number) => {
      try {
        const { error } = await supabase
          .from("club_personal")
          .update({ approved: true })
          .eq("id", clubPersonalId);

        if (error) {
          console.error("멤버 승인 오류:", error);
          alert("멤버 승인 중 오류가 발생했습니다.");
          return;
        }

        await loadMembers();
      } catch (error) {
        console.error("멤버 승인 처리 중 오류:", error);
        alert("멤버 승인 중 오류가 발생했습니다.");
      }
    },
    [loadMembers]
  );

  // 멤버 역할 변경 함수
  const handleChangeMemberRole = useCallback(
    async (clubPersonalId: number, newRole: string) => {
      try {
        const { error } = await supabase
          .from("club_personal")
          .update({ role: newRole })
          .eq("id", clubPersonalId);

        if (error) {
          console.error("멤버 역할 변경 오류:", error);
          alert("멤버 역할 변경 중 오류가 발생했습니다.");
          return;
        }

        await loadMembers();
        setSelectedMemberForRole(null);
      } catch (error) {
        console.error("멤버 역할 변경 처리 중 오류:", error);
        alert("멤버 역할 변경 중 오류가 발생했습니다.");
      }
    },
    [loadMembers]
  );

  // 멤버 목록 로드
  useEffect(() => {
    if (selectedClub?.club_user_id) {
      loadMembers();
    }
  }, [selectedClub?.club_user_id, loadMembers]);

  // 필터링된 멤버 목록
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  return (
    <div className="member-manage-screen">
      {/* 헤더: 뒤로가기 버튼만 */}
      <div className="member-manage-header-back">
        <button className="member-manage-back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      {/* Main Content */}
      <div className="member-manage-main-content">
        <div className="members-content">
          {/* 멤버 헤더 */}
          <div className="members-header">
            <h2 className="members-title">멤버</h2>
            <button
              className="invite-btn"
              onClick={async () => {
                if (!selectedClub?.club_user_id) {
                  alert("동아리 정보를 불러올 수 없습니다.");
                  return;
                }

                // 동아리 상세 페이지 URL 생성
                const inviteUrl = `${window.location.origin}/community/club/${selectedClub.club_user_id}`;

                try {
                  // 클립보드에 복사
                  await navigator.clipboard.writeText(inviteUrl);
                  alert("초대 링크가 클립보드에 복사되었습니다!");
                } catch (err) {
                  console.error("클립보드 복사 실패:", err);
                  // 클립보드 API가 실패한 경우, 텍스트 영역을 사용한 대체 방법
                  const textArea = document.createElement("textarea");
                  textArea.value = inviteUrl;
                  textArea.style.position = "fixed";
                  textArea.style.left = "-999999px";
                  document.body.appendChild(textArea);
                  textArea.select();
                  try {
                    document.execCommand("copy");
                    alert("초대 링크가 클립보드에 복사되었습니다!");
                  } catch (e) {
                    alert(`초대 링크: ${inviteUrl}`);
                  }
                  document.body.removeChild(textArea);
                }
              }}
            >
              + Invite
            </button>

          {/* 검색 필드 */}
          <div className="members-search-container">
            <img src="/search-icon.png" alt="검색" className="search-icon" />
            <input
              type="text"
              className="members-search-input"
              placeholder="Search"
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
            />
          </div>

          {/* 멤버 리스트 */}
          <div className="members-list">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className={`member-item ${
                  selectedMemberForRole === member.clubPersonalId
                    ? "dropdown-open"
                    : ""
                }`}
              >
                <div className="member-info">
                  <div className="member-avatar">
                    <img src={member.avatar} alt={member.name} />
                  </div>
                  <div className="member-details">
                    <div className="member-name">{member.name}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </div>
                {member.approved ? (
                  <div style={{ position: "relative" }}>
                    <button
                      className={`member-role-btn ${
                        member.role === "관리자" ? "owner-role" : ""
                      }`}
                      onClick={() => {
                        // club_user 계정 또는 personal_user 계정 중 회장인 경우에만 역할 변경 가능
                        // 단, 회장 자기 자신은 역할 변경 불가
                        const canChangeRole =
                          (userData?.type === "club" ||
                            (userData?.type === "personal" &&
                              selectedClub?.role === "회장")) &&
                          member.role !== "관리자" &&
                          member.role !== "회장";
                        if (canChangeRole) {
                          setSelectedMemberForRole(
                            selectedMemberForRole === member.clubPersonalId
                              ? null
                              : member.clubPersonalId
                          );
                        }
                      }}
                      disabled={
                        member.role === "관리자" || member.role === "회장"
                      }
                    >
                      {member.role}
                      {member.role !== "관리자" &&
                        member.role !== "회장" &&
                        (userData?.type === "club" ||
                          (userData?.type === "personal" &&
                            selectedClub?.role === "회장")) && (
                          <span className="dropdown-icon">▼</span>
                        )}
                    </button>
                    {selectedMemberForRole === member.clubPersonalId &&
                      (userData?.type === "club" ||
                        (userData?.type === "personal" &&
                          selectedClub?.role === "회장")) &&
                      member.role !== "관리자" &&
                      member.role !== "회장" && (
                        <div className="role-dropdown">
                          <button
                            className="role-option"
                            onClick={() =>
                              handleChangeMemberRole(
                                member.clubPersonalId,
                                "스태프"
                              )
                            }
                          >
                            스태프
                          </button>
                          <button
                            className="role-option"
                            onClick={() =>
                              handleChangeMemberRole(
                                member.clubPersonalId,
                                "회원"
                              )
                            }
                          >
                            회원
                          </button>
                        </div>
                      )}
                  </div>
                ) : (
                  <button
                    className="member-approve-btn"
                    onClick={() => handleApproveMember(member.clubPersonalId)}
                  >
                    승인
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberManageScreen;
