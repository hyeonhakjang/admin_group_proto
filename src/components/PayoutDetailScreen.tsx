import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import "./PayoutScreens.css";

const LOCAL_STORAGE_KEY = "clubAccountInfo";

interface ClubAccountInfo {
  bankName: string;
  accountNumber: string;
}

interface PayoutDetail {
  id: string;
  title: string;
  totalMembers: number;
  requestDate: string;
  requestTime: string;
  description: string;
  userAmount: number;
  userStatus: "pending" | "paid" | "unpaid";
}

const PayoutDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [payout, setPayout] = useState<PayoutDetail | null>(null);
  const [accountInfo, setAccountInfo] = useState<ClubAccountInfo | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    // 동아리 계좌 정보 로드
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setAccountInfo(JSON.parse(stored));
    }

    // 정산 상세 정보 로드 (mock 데이터)
    if (id) {
      // TODO: 실제 데이터베이스에서 정산 정보 로드
      const mockPayout: PayoutDetail = {
        id: id,
        title: "11월 회비 정산",
        totalMembers: 15,
        requestDate: "2025-11-15",
        requestTime: "14:30",
        description:
          "11월 정기 회비를 정산합니다. 회비는 동아리 활동비로 사용됩니다.",
        userAmount: 50000,
        userStatus: "pending",
      };
      setPayout(mockPayout);
      setIsPaid(mockPayout.userStatus === "paid");
    }
  }, [id]);

  const handleTossTransfer = () => {
    if (!accountInfo || !payout) {
      alert("동아리 계좌 정보가 없습니다.");
      return;
    }

    // 은행 이름 인코딩
    const encodedBankName = encodeURIComponent(accountInfo.bankName);
    const amount = payout.userAmount;
    const accountNo = accountInfo.accountNumber;

    // 토스 앱 URL 생성
    const tossUrl = `supertoss://send?amount=${amount}&bank=${encodedBankName}&accountNo=${accountNo}&origin=qr`;

    // 토스 앱 열기 시도
    window.location.href = tossUrl;

    // 토스 앱이 설치되지 않은 경우를 대비해 약간의 지연 후 처리
    setTimeout(() => {
      // 토스 웹 버전으로 리다이렉트하거나 안내 메시지 표시
      alert("토스 앱이 설치되어 있지 않습니다. 토스 앱을 설치해주세요.");
    }, 1000);
  };

  const handlePaymentToggle = () => {
    if (!payout) return;

    const newStatus = !isPaid;
    setIsPaid(newStatus);

    // TODO: 실제 데이터베이스에 송금 완료 상태 업데이트
    if (newStatus) {
      alert("송금 완료로 표시되었습니다.");
    } else {
      alert("송금 완료 표시가 취소되었습니다.");
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
        <BottomTabBar />
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
          >
            {isPaid ? "✓ 송금 완료" : "송금 미완료"}
          </button>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
};

export default PayoutDetailScreen;

