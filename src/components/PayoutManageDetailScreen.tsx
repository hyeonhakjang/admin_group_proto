import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./PayoutManageDetailScreen.css";

interface StoredClub {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
  role?: string;
}

type ParticipantStatus = "pending" | "paid" | "unpaid";

interface ParticipantItem {
  id: number;
  name: string;
  avatar?: string;
  amount: number;
  status: ParticipantStatus;
  timestamp: string;
}

interface PayoutManageDetail {
  id: number;
  title: string;
  description: string;
  requestDate: string;
  requestTime: string;
  totalAmount: number;
  participants: ParticipantItem[];
}

const PayoutManageDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [payout, setPayout] = useState<PayoutManageDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "paid">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, []);

  useEffect(() => {
    const loadPayoutDetail = async () => {
      if (!id || !selectedClub?.club_user_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("club_personal_payout")
          .select(
            `
            id,
            title,
            content,
            applied_date,
            created_at,
            payout_participant (
              id,
              payout_amount,
              status,
              created_at,
              updated_at,
              club_personal:club_personal_id (
                id,
                personal_user:personal_user_id (
                  personal_name,
                  profile_image_url
                )
              )
            )
          `
          )
          .eq("id", Number(id))
          .eq("club_user_id", selectedClub.club_user_id)
          .single();

        if (error || !data) {
          throw error || new Error("정산 정보를 찾을 수 없습니다.");
        }

        const requestDate =
          data.applied_date ||
          data.created_at ||
          new Date().toISOString().split("T")[0];

        const requestTime = data.created_at
          ? new Date(data.created_at).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";

        const participants: ParticipantItem[] = (
          data.payout_participant || []
        ).map((participant: any) => {
          const personalUser = Array.isArray(
            participant.club_personal?.personal_user
          )
            ? participant.club_personal.personal_user[0]
            : participant.club_personal?.personal_user;
          const name = personalUser?.personal_name || "이름 없는 회원";
          const avatar = personalUser?.profile_image_url || "/profile-icon.png";
          const timestamp =
            participant.updated_at ||
            participant.created_at ||
            data.created_at ||
            "";

          return {
            id: participant.id,
            name,
            avatar,
            amount: participant.payout_amount || 0,
            status:
              participant.status === "paid"
                ? "paid"
                : participant.status === "unpaid"
                ? "unpaid"
                : "pending",
            timestamp,
          };
        });

        const totalAmount = participants.reduce(
          (sum, participant) => sum + (participant.amount || 0),
          0
        );

        setPayout({
          id: data.id,
          title: data.title,
          description: data.content || "정산 내용이 없습니다.",
          requestDate,
          requestTime,
          totalAmount,
          participants,
        });
      } catch (err) {
        console.error("정산 관리 상세 로드 오류:", err);
        alert("정산 정보를 불러오는 중 오류가 발생했습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadPayoutDetail();
  }, [id, navigate, selectedClub?.club_user_id]);

  const pendingParticipants = useMemo(
    () =>
      payout?.participants.filter(
        (participant) => participant.status !== "paid"
      ) || [],
    [payout]
  );

  const completedParticipants = useMemo(
    () =>
      payout?.participants.filter(
        (participant) => participant.status === "paid"
      ) || [],
    [payout]
  );

  const getDisplayDateTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return `${date.getFullYear().toString().slice(2)}.${String(
      date.getMonth() + 1
    ).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}(${
      ["일", "월", "화", "수", "목", "금", "토"][date.getDay()]
    }) ${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  const renderParticipantList = (
    list: ParticipantItem[],
    emptyMessage: string
  ) => {
    if (list.length === 0) {
      return (
        <div className="payout-manage-detail-empty">
          <span className="payout-manage-detail-empty-icon">✓</span>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return list.map((participant) => (
      <div key={participant.id} className="payout-manage-participant-item">
        <div className="payout-manage-participant-info">
          <img
            src={participant.avatar || "/profile-icon.png"}
            alt={participant.name}
            className="payout-manage-participant-avatar"
          />
          <div className="payout-manage-participant-text">
            <span className="payout-manage-participant-name">
              {participant.name}
            </span>
            <span className="payout-manage-participant-amount">
              {participant.amount.toLocaleString()}원
            </span>
          </div>
        </div>
        <span className="payout-manage-participant-time">
          {getDisplayDateTime(participant.timestamp)}
        </span>
      </div>
    ));
  };

  if (loading || !payout) {
    return (
      <div className="payout-manage-detail-screen">
        <div className="payout-manage-detail-inner">
          <header className="payout-manage-detail-header">
            <button
              className="payout-manage-detail-back-btn"
              onClick={() => navigate(-1)}
            >
              ← 뒤로가기
            </button>
          </header>
          <div className="payout-manage-detail-loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payout-manage-detail-screen">
      <div className="payout-manage-detail-inner">
        {/* 헤더 */}
        <header className="payout-manage-detail-header">
          <button
            className="payout-manage-detail-back-btn"
            onClick={() => navigate(-1)}
          >
            ← 뒤로가기
          </button>
        </header>

        {/* 요약 블록 */}
        <section className="payout-manage-detail-section payout-manage-detail-summary">
          <div className="payout-manage-detail-label">정산 관리</div>
          <h1 className="payout-manage-detail-title">{payout.title}</h1>
          <p className="payout-manage-detail-description">
            {payout.description}
          </p>
          <div className="payout-manage-detail-date">
            정산 요청{" "}
            {new Date(payout.requestDate).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            {payout.requestTime}
          </div>
        </section>

        {/* 총 정산 금액 블록 */}
        <section className="payout-manage-detail-section payout-manage-detail-amount-card">
          <span className="payout-manage-detail-amount-label">총 정산 금액</span>
          <strong className="payout-manage-detail-amount-value">
            {payout.totalAmount.toLocaleString()}원
          </strong>
        </section>

        {/* 섹션 F: 네비게이션 */}
        <section className="payout-manage-detail-section payout-manage-detail-nav">
          <div className="payout-manage-detail-tabs">
            <button
              className={`payout-manage-detail-tab ${
                activeTab === "pending" ? "active" : ""
              }`}
              onClick={() => setActiveTab("pending")}
            >
              정산 미납{" "}
              <span className="tab-count">{pendingParticipants.length}</span>
            </button>
            <button
              className={`payout-manage-detail-tab ${
                activeTab === "paid" ? "active" : ""
              }`}
              onClick={() => setActiveTab("paid")}
            >
              정산 완료{" "}
              <span className="tab-count">{completedParticipants.length}</span>
            </button>
          </div>

          <div className="payout-manage-detail-tab-content">
            {activeTab === "pending"
              ? renderParticipantList(
                  pendingParticipants,
                  "모든 정산이 완료됐어요."
                )
              : renderParticipantList(
                  completedParticipants,
                  "정산 완료된 내역이 없어요."
                )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PayoutManageDetailScreen;
