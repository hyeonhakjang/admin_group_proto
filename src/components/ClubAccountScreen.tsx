import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import "./ClubAccountScreens.css";

interface ClubAccountInfo {
  bankName: string;
  accountNumber: string;
}

const LOCAL_STORAGE_KEY = "clubAccountInfo";

const ClubAccountScreen: React.FC = () => {
  const navigate = useNavigate();
  const [accountInfo, setAccountInfo] = useState<ClubAccountInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setAccountInfo(JSON.parse(stored));
    }
  }, []);

  const handleCardClick = () => {
    navigate("/myclub/manage/account/register");
  };

  return (
    <div className="club-account-screen" data-name="통장 등록">
      <div className="club-account-inner">
        <header className="club-account-header">
          <button
            className="club-account-back-btn"
            onClick={() => navigate(-1)}
          >
            ← 뒤로가기
          </button>
          <h1 className="club-account-title">통장 등록</h1>
        </header>

        <section>
          <h2 className="club-account-section-title">계좌 등록</h2>
          <div
            className={`club-account-card ${
              accountInfo ? "club-account-card-filled" : "empty"
            }`}
            onClick={handleCardClick}
          >
            {accountInfo ? (
              <>
                <div className="account-bank">{accountInfo.bankName}</div>
                <div className="account-number">
                  {accountInfo.accountNumber}
                </div>
                <p className="secondary-text">
                  탭하여 계좌를 변경하거나 다시 등록할 수 있습니다.
                </p>
              </>
            ) : (
              <>
                <div className="empty-card-icon">＋</div>
                <p>계좌를 등록해 주세요</p>
              </>
            )}
          </div>
          <p className="account-register-note">
            계좌 등록이 완료되면 동아리 회비 정산에 활용할 수 있습니다.
          </p>
        </section>
      </div>
      <BottomTabBar />
    </div>
  );
};

export default ClubAccountScreen;
