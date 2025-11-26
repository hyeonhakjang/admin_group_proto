import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./PayoutScreens.css";

const LOCAL_STORAGE_KEY = "clubAccountInfo";

interface ClubAccountInfo {
  bankName: string;
  accountNumber: string;
}

interface StoredClub {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
  role?: string;
}

interface PayoutParticipant {
  id: number;
  club_personal_id: number;
  payout_amount: number;
  status: "pending" | "paid" | "unpaid";
}

interface PayoutDetail {
  id: number;
  title: string;
  totalMembers: number;
  requestDate: string;
  requestTime: string;
  description: string;
  userAmount: number;
  userStatus: "pending" | "paid" | "unpaid";
  participants: PayoutParticipant[];
}

const PayoutDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [payout, setPayout] = useState<PayoutDetail | null>(null);
  const [accountInfo, setAccountInfo] = useState<ClubAccountInfo | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setAccountInfo(JSON.parse(stored));
    }

    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, []);

  useEffect(() => {
    const fetchClubAccount = async () => {
      if (!selectedClub?.club_user_id) return;
      try {
        const { data, error } = await supabase
          .from("club_user")
          .select("bank_name, bank_account_number")
          .eq("id", selectedClub.club_user_id)
          .single();

        if (error) {
          throw error;
        }

        if (data?.bank_name && data?.bank_account_number) {
          const info = {
            bankName: data.bank_name,
            accountNumber: data.bank_account_number,
          };
          setAccountInfo(info);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
        }
      } catch (error) {
        console.error("동아리 계좌 정보 로드 오류:", error);
      }
    };

    fetchClubAccount();
  }, [selectedClub?.club_user_id]);

  useEffect(() => {
    const loadPayoutDetail = async () => {
      if (!id) return;

      try {
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
              club_personal_id,
              payout_amount,
              status
            )
          `
          )
          .eq("id", Number(id))
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
        const participants: PayoutParticipant[] = (
          data.payout_participant || []
        ).map((participant: any) => ({
          id: participant.id,
          club_personal_id: participant.club_personal_id,
          payout_amount: participant.payout_amount || 0,
          status:
            participant.status === "paid"
              ? "paid"
              : participant.status === "unpaid"
              ? "unpaid"
              : "pending",
        }));

        const totalMembers = participants.length;
        const currentParticipant = participants.find(
          (participant) =>
            String(participant.club_personal_id) ===
            String(selectedClub?.club_personal_id || "")
        );

        const payoutDetail: PayoutDetail = {
          id: data.id,
          title: data.title,
          totalMembers,
          requestDate,
          requestTime,
          description: data.content || "정산 설명이 없습니다.",
          userAmount: currentParticipant?.payout_amount || 0,
          userStatus: currentParticipant?.status || "pending",
          participants,
        };

        setPayout(payoutDetail);
        setIsPaid(currentParticipant?.status === "paid");
        setParticipantId(currentParticipant?.id || null);
      } catch (error) {
        console.error("정산 상세 로드 오류:", error);
        alert("정산 정보를 불러오는 중 오류가 발생했습니다.");
        navigate(-1);
      }
    };

    loadPayoutDetail();
  }, [id, navigate, selectedClub?.club_personal_id]);

  const handleTossTransfer = () => {
    if (!accountInfo || !payout) {
      alert("동아리 계좌 정보가 없습니다.");
      return;
    }

    const encodedBankName = encodeURIComponent(accountInfo.bankName);
    const amount = payout.userAmount;
    const accountNo = accountInfo.accountNumber;

    const tossUrl = `supertoss://send?amount=${amount}&bank=${encodedBankName}&accountNo=${accountNo}&origin=qr`;

    window.location.href = tossUrl;
  };

  const handlePaymentToggle = async () => {
    if (!payout) return;
    if (!participantId) {
      alert("정산 참가자 정보가 없습니다.");
      return;
    }

    const newStatus = !isPaid;
    const nextStatus = newStatus ? "paid" : "pending";

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from("payout_participant")
        .update({ status: nextStatus })
        .eq("id", participantId);

      if (error) {
        throw error;
      }

      setIsPaid(newStatus);
      setPayout((prev) =>
        prev
          ? {
              ...prev,
              userStatus: nextStatus as "pending" | "paid" | "unpaid",
            }
          : prev
      );
      alert(
        newStatus
          ? "송금 완료로 표시되었습니다."
          : "송금 완료 표시가 취소되었습니다."
      );
    } catch (error) {
      console.error("송금 상태 업데이트 오류:", error);
      alert("송금 상태를 업데이트하는 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!payout) {
    return (
      <div className="payout-screen" data-name="정산 상세">
        <div className="payout-inner">
          <header className="payout-header-block">
            <button className="payout-back-btn" onClick={() => navigate(-1)}>
              ← 뒤로가기
            </button>
          </header>
          <div className="payout-loading">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payout-screen" data-name="정산 상세">
      <div className="payout-inner">
        {/* 헤더: 뒤로가기 */}
        <header className="payout-header-block">
          <button className="payout-back-btn" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
        </header>

        {/* 섹션 A: 총 인원 */}
        <div className="payout-detail-section payout-detail-members">
          총 {payout.totalMembers}명
        </div>

        {/* 섹션 B: 정산 이름 */}
        <div className="payout-detail-section payout-detail-title">
          {payout.title}
        </div>

        {/* 섹션 C: 정산 요청 날짜와 시간 */}
        <div className="payout-detail-section payout-detail-datetime">
          {new Date(payout.requestDate).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          {payout.requestTime}
        </div>

        {/* 섹션 D: 정산 요청 내용 */}
        <div className="payout-detail-section payout-detail-description">
          <h3 className="payout-detail-section-title">정산 요청 내용</h3>
          <p className="payout-detail-description-text">{payout.description}</p>
        </div>

        {/* 섹션 E: 정산 요청 금액 */}
        <div className="payout-detail-section payout-detail-amount">
          <h3 className="payout-detail-section-title">정산 요청 금액</h3>
          <div className="payout-detail-amount-value">
            {payout.userAmount.toLocaleString()}원
          </div>
        </div>

        {/* 섹션 F: 토스로 바로 송금 버튼 */}
        <div className="payout-detail-section payout-detail-toss">
          <button
            className="payout-toss-transfer-btn"
            onClick={handleTossTransfer}
            disabled={!accountInfo}
          >
            토스로 바로 송금
          </button>
          {!accountInfo && (
            <p className="payout-toss-warning">
              동아리 계좌 정보가 없습니다. 계좌를 등록해주세요.
            </p>
          )}
        </div>

        {/* 섹션 G: 송금 완료 체크 버튼 */}
        <div className="payout-detail-section payout-detail-payment-status">
          <button
            className={`payout-payment-status-btn ${
              isPaid ? "status-paid" : "status-unpaid"
            }`}
            onClick={handlePaymentToggle}
            disabled={isUpdating}
          >
            {isPaid ? "✓ 송금 완료" : "송금 미완료"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayoutDetailScreen;
