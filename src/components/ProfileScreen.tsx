import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ProfileScreen.css";

// 이미지 상수
const imgBackIcon = "/search-icon.png"; // 뒤로가기 아이콘 (임시)
const imgSettingsIcon = "/cogwheel.png"; // 톱니바퀴 아이콘
const imgProfilePlaceholder = "/profile-icon.png"; // 프로필 이미지 플레이스홀더

interface UserData {
  type: "admin" | "personal" | "club" | "group";
  id: number;
  username: string;
  name: string;
  email: string;
}

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [loading, setLoading] = useState(false);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserData = () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
        setNickname(user.name || "");

        // 프로필 이미지 로드 (데이터베이스에서 가져오기)
        loadProfileImage(user);
      }
    };

    loadUserData();
  }, []);

  // 프로필 이미지 로드
  const loadProfileImage = async (user: UserData) => {
    try {
      let imageUrl = null;

      if (user.type === "personal") {
        const { data } = await supabase
          .from("personal_user")
          .select("profile_image_url")
          .eq("id", user.id)
          .single();
        imageUrl = data?.profile_image_url || null;
      } else if (user.type === "club") {
        // 클럽 사용자는 프로필 이미지가 없을 수 있음
        imageUrl = null;
      } else if (user.type === "group") {
        // 그룹 사용자는 프로필 이미지가 없을 수 있음
        imageUrl = null;
      } else if (user.type === "admin") {
        // 관리자는 프로필 이미지가 없을 수 있음
        imageUrl = null;
      }

      setProfileImage(imageUrl);
    } catch (error) {
      console.error("프로필 이미지 로드 오류:", error);
    }
  };

  // 프로필 이미지 변경
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData) return;

    // 이미지 미리보기
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: 실제로는 Supabase Storage에 업로드하고 URL을 저장해야 함
    // 현재는 미리보기만 구현
  };

  // 닉네임 수정
  const handleNicknameSave = async () => {
    if (!userData || !nickname.trim()) return;

    setLoading(true);
    try {
      // 데이터베이스 업데이트
      if (userData.type === "personal") {
        await supabase
          .from("personal_user")
          .update({ personal_name: nickname })
          .eq("id", userData.id);
      } else if (userData.type === "club") {
        await supabase
          .from("club_user")
          .update({ club_name: nickname })
          .eq("id", userData.id);
      } else if (userData.type === "group") {
        await supabase
          .from("group_user")
          .update({ group_name: nickname })
          .eq("id", userData.id);
      } else if (userData.type === "admin") {
        await supabase
          .from("admin_user")
          .update({ admin_name: nickname })
          .eq("id", userData.id);
      }

      // 세션 업데이트
      const updatedUser = { ...userData, name: nickname };
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }
      setUserData(updatedUser);
      setIsEditingNickname(false);
    } catch (error) {
      console.error("닉네임 업데이트 오류:", error);
      alert("닉네임 업데이트 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = () => {
    // TODO: 비밀번호 변경 모달 또는 페이지로 이동
    alert("비밀번호 변경 기능은 준비 중입니다.");
  };

  // 승인 관리 (관리자 또는 캠퍼스 계정)
  const handleApprovalManagement = () => {
    if (userData?.type === "admin") {
      // TODO: 캠퍼스 계정 승인 페이지로 이동
      alert("캠퍼스 계정 승인 기능은 준비 중입니다.");
    } else if (userData?.type === "group") {
      // TODO: 동아리 계정 승인 페이지로 이동
      alert("동아리 계정 승인 기능은 준비 중입니다.");
    }
  };

  // 커뮤니티 메뉴 클릭
  const handleCommunityMenuClick = (menu: string) => {
    // TODO: 각 메뉴에 해당하는 페이지로 이동
    alert(`${menu} 기능은 준비 중입니다.`);
  };

  // 이용 안내 메뉴 클릭
  const handleInfoMenuClick = (menu: string) => {
    // TODO: 각 메뉴에 해당하는 페이지로 이동
    alert(`${menu} 기능은 준비 중입니다.`);
  };

  // 로그아웃
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      // localStorage와 sessionStorage에서 사용자 정보 제거
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      // 로그인 페이지로 리다이렉트
      navigate("/login");
    }
  };

  if (!userData) {
    return (
      <div className="profile-screen">
        <div className="profile-loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="profile-screen" data-name="프로필 화면">
      {/* 헤더 */}
      <div className="profile-header" data-name="Profile Header">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          data-name="backButton"
        >
          ←
        </button>
        <h1 className="profile-header-title">내 프로필</h1>
        <button
          className="settings-button"
          onClick={() => alert("설정 기능은 준비 중입니다.")}
          data-name="settingsButton"
        >
          <img alt="Settings" className="settings-icon" src={imgSettingsIcon} />
        </button>
      </div>

      {/* 섹션 A: 프로필 이미지 */}
      <div className="profile-section-a" data-name="Profile Image Section">
        <div className="profile-image-container">
          <img
            alt="Profile"
            className="profile-image"
            src={profileImage || imgProfilePlaceholder}
          />
          <button
            className="profile-image-edit-button"
            onClick={() => fileInputRef.current?.click()}
          >
            사진 변경
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* 섹션 B: 닉네임 */}
      <div className="profile-section-b" data-name="Nickname Section">
        {isEditingNickname ? (
          <div className="nickname-edit-container">
            <input
              type="text"
              className="nickname-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 입력"
            />
            <button
              className="nickname-save-button"
              onClick={handleNicknameSave}
              disabled={loading || !nickname.trim()}
            >
              저장
            </button>
            <button
              className="nickname-cancel-button"
              onClick={() => {
                setIsEditingNickname(false);
                setNickname(userData.name || "");
              }}
            >
              취소
            </button>
          </div>
        ) : (
          <div className="nickname-display-container">
            <span className="nickname-text">{nickname || "닉네임 없음"}</span>
            <button
              className="nickname-edit-button"
              onClick={() => setIsEditingNickname(true)}
            >
              수정
            </button>
          </div>
        )}
      </div>

      {/* 섹션 C: 비밀번호 변경 */}
      <div className="profile-section-c" data-name="Password Change Section">
        <button
          className="password-change-button"
          onClick={handlePasswordChange}
        >
          비밀번호 변경
        </button>
      </div>

      {/* 섹션 D: 승인 관리 (조건부) */}
      {(userData.type === "admin" || userData.type === "group") && (
        <div
          className="profile-section-d"
          data-name="Approval Management Section"
        >
          <button
            className="approval-management-button"
            onClick={handleApprovalManagement}
          >
            {userData.type === "admin"
              ? "캠퍼스 계정 승인"
              : "동아리 계정 승인"}
          </button>
        </div>
      )}

      {/* 섹션 E: 커뮤니티 영역 */}
      <div className="profile-section-e" data-name="Community Section">
        <h2 className="section-title">커뮤니티</h2>
        <div className="community-menu-list">
          <button
            className="community-menu-item"
            onClick={() => handleCommunityMenuClick("내가 쓴 글")}
          >
            내가 쓴 글
          </button>
          <button
            className="community-menu-item"
            onClick={() => handleCommunityMenuClick("내가 쓴 댓글")}
          >
            내가 쓴 댓글
          </button>
          <button
            className="community-menu-item"
            onClick={() => handleCommunityMenuClick("댓글 단 글")}
          >
            댓글 단 글
          </button>
        </div>
      </div>

      {/* 섹션 F: 이용 안내 영역 */}
      <div className="profile-section-f" data-name="Info Section">
        <h2 className="section-title">이용 안내</h2>
        <div className="info-menu-list">
          <button
            className="info-menu-item"
            onClick={() => handleInfoMenuClick("진행중인 이벤트")}
          >
            진행중인 이벤트
          </button>
          <button
            className="info-menu-item"
            onClick={() => handleInfoMenuClick("공지사항")}
          >
            공지사항
          </button>
          <button
            className="info-menu-item"
            onClick={() => handleInfoMenuClick("문의하기")}
          >
            문의하기
          </button>
          <button
            className="info-menu-item"
            onClick={() => handleInfoMenuClick("약관 및 정책")}
          >
            약관 및 정책
          </button>
        </div>
      </div>

      {/* 섹션 G: 로그아웃 */}
      <div className="profile-section-g" data-name="Logout Section">
        <button className="logout-button" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
