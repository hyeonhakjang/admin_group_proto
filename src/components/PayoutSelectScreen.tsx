import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./PostWriteScreen.css";

interface StoredClub {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
  role?: string;
}

interface Payout {
  id: number;
  title: string;
  applied_date: string;
  content?: string;
  created_at: string;
}

const PayoutSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [selectedPayoutId, setSelectedPayoutId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, []);

  useEffect(() => {
    if (!selectedClub?.club_user_id) return;

    const loadPayouts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("club_personal_payout")
          .select("*")
          .eq("club_user_id", selectedClub.club_user_id)
          .order("applied_date", { ascending: false });

        if (error) {
          console.error("정산 로드 오류:", error);
          return;
        }

        if (data) {
          setPayouts(data as Payout[]);
        }
      } catch (error) {
        console.error("정산 로드 중 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPayouts();
  }, [selectedClub]);

  const handleSelectPayout = () => {
    if (!selectedPayoutId) {
      alert("정산을 선택해 주세요.");
      return;
    }

    const selectedPayout = payouts.find((p) => p.id === selectedPayoutId);
    if (!selectedPayout) {
      alert("선택한 정산을 찾을 수 없습니다.");
      return;
    }

    sessionStorage.setItem(
      "selectedArticlePayout",
      JSON.stringify({
        id: selectedPayout.id,
        title: selectedPayout.title,
        applied_date: selectedPayout.applied_date,
      })
    );

    // 저장된 폼 데이터 복원
    const storedData = sessionStorage.getItem("articleWriteData");
    if (storedData) {
      const data = JSON.parse(storedData);
      sessionStorage.setItem("articleWriteData", JSON.stringify(data));
    }

    navigate(-1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <div className="post-write-screen">
      <div className="post-write-inner">
        <header className="post-write-header">
          <button
            className="post-write-back-btn"
            onClick={() => navigate(-1)}
          >
            ← 뒤로가기
          </button>
        </header>

        <h1 className="post-write-select-title">정산 선택</h1>

        {loading ? (
          <div className="post-write-loading">로딩 중...</div>
        ) : payouts.length === 0 ? (
          <div className="post-write-empty">등록된 정산이 없습니다.</div>
        ) : (
          <div className="post-write-payout-list">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className={`post-write-payout-card ${
                  selectedPayoutId === payout.id ? "selected" : ""
                }`}
                onClick={() => setSelectedPayoutId(payout.id)}
              >
                <div className="post-write-payout-title">{payout.title}</div>
                <div className="post-write-payout-date">
                  {formatDate(payout.applied_date)}
                </div>
                {payout.content && (
                  <div className="post-write-payout-content">
                    {payout.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 선택 완료 버튼 */}
        {selectedPayoutId && (
          <button
            className="post-write-select-complete-btn"
            onClick={handleSelectPayout}
          >
            선택 완료
          </button>
        )}
      </div>
    </div>
  );
};

export default PayoutSelectScreen;

