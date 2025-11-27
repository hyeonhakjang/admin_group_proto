import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ClubAccountScreens.css";

interface ClubAccountInfo {
  bankName: string;
  accountNumber: string;
}

const LOCAL_STORAGE_KEY = "clubAccountInfo";

interface StoredClub {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
  role?: string;
}

const ClubAccountScreen: React.FC = () => {
  const navigate = useNavigate();
  const [accountInfo, setAccountInfo] = useState<ClubAccountInfo | null>(null);
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      try {
        setSelectedClub(JSON.parse(storedClub));
      } catch (error) {
        console.error("동아리 정보 파싱 오류:", error);
      }
    }
  }, []);

  useEffect(() => {
    const loadAccountInfo = async () => {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setAccountInfo(JSON.parse(stored));
      }

      if (!selectedClub?.club_user_id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("club_user")
          .select("bank_name, bank_account_number")
          .eq("id", selectedClub.club_user_id)
          .single();

        if (error) {
          throw error;
        }

        if (data?.bank_name && data.bank_account_number) {
          const info = {
            bankName: data.bank_name,
            accountNumber: data.bank_account_number,
          };
          setAccountInfo(info);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
        }
      } catch (error) {
        console.error("동아리 계좌 정보 조회 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountInfo();
  }, [selectedClub?.club_user_id]);

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
        </header>

        <h1 className="club-account-title">통장 등록</h1>

        <section>
          <h2 className="club-account-section-title">계좌 등록</h2>
          <div
            className={`club-account-card ${
              accountInfo ? "club-account-card-filled" : "empty"
            }`}
            onClick={handleCardClick}
          >
            {isLoading ? (
              <div className="account-loading">계좌 정보를 불러오는 중...</div>
            ) : accountInfo ? (
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
    </div>
  );
};

export default ClubAccountScreen;
