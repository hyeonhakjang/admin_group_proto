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

  // 모든 정산이 완료되었는지 확인
  const isAllCompleted = useMemo(() => {
    if (!payout || payout.participants.length === 0) return false;
    return payout.participants.every(
      (participant) => participant.status === "paid"
    );
  }, [payout]);

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

  // 참가자 상태 변경 함수
  const handleStatusChange = async (
    participantId: number,
    newStatus: ParticipantStatus
  ) => {
    if (!payout) return;

    try {
      const { error } = await supabase
        .from("payout_participant")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", participantId);

      if (error) {
        throw error;
      }

      // 로컬 상태 업데이트
      setPayout((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.id === participantId
              ? { ...p, status: newStatus, timestamp: new Date().toISOString() }
              : p
          ),
        };
      });

      alert(
        newStatus === "paid"
          ? "정산 완료로 변경되었습니다."
          : "정산 미납으로 변경되었습니다."
      );
    } catch (error) {
      console.error("상태 변경 오류:", error);
      alert("상태를 변경하는 중 오류가 발생했습니다.");
    }
  };

  const renderParticipantList = (
    list: ParticipantItem[],
    emptyMessage: string,
    isPendingTab: boolean
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
        <div className="payout-manage-participant-actions">
          <span className="payout-manage-participant-time">
            {getDisplayDateTime(participant.timestamp)}
          </span>
          {isPendingTab ? (
            // 정산 미납 탭: 체크 버튼으로 완료 처리
            <button
              className="payout-manage-status-btn payout-manage-status-btn-complete"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(participant.id, "paid");
              }}
              title="정산 완료로 변경"
            >
              ✓
            </button>
          ) : (
            // 정산 완료 탭: X 버튼으로 미납 처리
            <button
              className="payout-manage-status-btn payout-manage-status-btn-unpaid"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(participant.id, "unpaid");
              }}
              title="정산 미납으로 변경"
            >
              ✕
            </button>
          )}
        </div>
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
          <span className="payout-manage-detail-amount-label">
            총 정산 금액
          </span>
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
                  "모든 정산이 완료됐어요.",
                  true
                )
              : renderParticipantList(
                  completedParticipants,
                  "정산 완료된 내역이 없어요.",
                  false
                )}
          </div>
        </section>

        {/* 정산 마감 버튼 (모든 정산 완료 시에만 표시) */}
        {isAllCompleted && (
          <section className="payout-manage-detail-section payout-manage-detail-close">
            <button
              className="payout-manage-close-btn"
              onClick={async () => {
                if (!payout || !selectedClub?.club_user_id) {
                  return;
                }

                if (
                  !window.confirm(
                    "정산을 마감하시겠습니까? 마감 후에는 수정할 수 없습니다."
                  )
                ) {
                  return;
                }

                try {
                  const { error } = await supabase
                    .from("club_personal_payout")
                    .update({ closed_at: new Date().toISOString() })
                    .eq("id", payout.id)
                    .eq("club_user_id", selectedClub.club_user_id);

                  if (error) {
                    throw error;
                  }

                  alert("정산이 마감되었습니다.");
                  navigate("/myclub/manage/payout");
                } catch (error) {
                  console.error("정산 마감 오류:", error);
                  alert("정산 마감 중 오류가 발생했습니다.");
                }
              }}
            >
              정산 마감
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default PayoutManageDetailScreen;
