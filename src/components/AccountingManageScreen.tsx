import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./AccountingManageScreen.css";

interface StoredClub {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
  role?: string;
}

interface AccountingTransaction {
  id: number;
  date: string;
  name: string;
  time: string;
  amount: number;
  type: "income" | "expense";
  balance: number;
  icon?: string;
}

interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
}

const AccountingManageScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [balance, setBalance] = useState(0);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary>({
    totalIncome: 0,
    totalExpense: 0,
  });
  const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, []);

  const loadAccountingData = useCallback(async () => {
    if (!selectedClub?.club_user_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
      // 해당 월의 마지막 날 계산
      const lastDay = new Date(year, month, 0).getDate();
      const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      console.log("회계 데이터 조회:", {
        club_user_id: selectedClub.club_user_id,
        year,
        month,
        monthStart,
        monthEnd,
      });

      // DB에서 회계 거래 내역 가져오기
      const { data, error } = await supabase
        .from("accounting_transaction")
        .select("*")
        .eq("club_user_id", selectedClub.club_user_id)
        .gte("transaction_date", monthStart)
        .lte("transaction_date", monthEnd)
        .order("transaction_date", { ascending: false })
        .order("transaction_time", { ascending: false });

      if (error) {
        console.error("회계 데이터 조회 오류:", error);
        throw error;
      }

      console.log("조회된 거래 내역:", data);

      // 전체 잔액 계산 (가장 최근 거래의 balance 사용)
      let currentBalance = 0;
      if (data && data.length > 0) {
        // 최신 거래의 balance를 현재 잔액으로 사용
        const latestTransaction = data.sort(
          (a, b) =>
            new Date(`${b.transaction_date}T${b.transaction_time}`).getTime() -
            new Date(`${a.transaction_date}T${a.transaction_time}`).getTime()
        )[0];
        currentBalance = latestTransaction.balance || 0;
      } else {
        // 해당 월에 거래가 없으면 이전 월의 마지막 잔액을 가져와야 하지만,
        // 간단하게 0으로 설정 (실제로는 이전 월 데이터 조회 필요)
        const { data: prevData } = await supabase
          .from("accounting_transaction")
          .select("balance")
          .eq("club_user_id", selectedClub.club_user_id)
          .lt("transaction_date", monthStart)
          .order("transaction_date", { ascending: false })
          .order("transaction_time", { ascending: false })
          .limit(1)
          .single();

        if (prevData) {
          currentBalance = prevData.balance || 0;
        }
      }

      // 월별 수익/비용 계산
      let totalIncome = 0;
      let totalExpense = 0;

      const mappedTransactions: AccountingTransaction[] = (data || []).map(
        (transaction: any) => {
          if (transaction.type === "income") {
            totalIncome += transaction.amount || 0;
          } else {
            totalExpense += transaction.amount || 0;
          }

          return {
            id: transaction.id,
            date: transaction.transaction_date,
            name: transaction.name,
            time: transaction.transaction_time,
            amount: transaction.amount,
            type: transaction.type as "income" | "expense",
            balance: transaction.balance,
            icon: transaction.icon,
          };
        }
      );

      setTransactions(mappedTransactions);
      setBalance(currentBalance);
      setMonthlySummary({ totalIncome, totalExpense });
    } catch (error) {
      console.error("회계 데이터 로드 오류:", error);
      setTransactions([]);
      setBalance(0);
      setMonthlySummary({ totalIncome: 0, totalExpense: 0 });
    } finally {
      setLoading(false);
    }
  }, [selectedClub?.club_user_id, currentDate]);

  useEffect(() => {
    if (!selectedClub?.club_user_id) return;
    loadAccountingData();
  }, [selectedClub, currentDate, loadAccountingData]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getKoreanMonth = (month: number) => {
    return `${month}월`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];
    return `${month}월 ${day}일 ${weekday}요일`;
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ko-KR");
  };

  const formatTime = (timeString: string) => {
    // TIME 형식 (HH:MM:SS)을 HH:MM으로 변환
    if (!timeString) return "";
    const parts = timeString.split(":");
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  // 날짜별로 그룹화
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, AccountingTransaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="accounting-manage-screen">
      {/* 헤더: 뒤로가기 버튼 */}
      <header className="accounting-manage-header">
        <button
          className="accounting-manage-back-btn"
          onClick={() => navigate(-1)}
        >
          ← 뒤로가기
        </button>
      </header>

      <main className="accounting-manage-content">
        {loading ? (
          <div className="accounting-manage-loading">로딩 중...</div>
        ) : (
          <>
            {/* 섹션 A: 회계 잔액 */}
            <section className="accounting-manage-section-a">
              <div className="accounting-balance-label">회계 잔액</div>
              <div className="accounting-balance-amount">
                {formatAmount(balance)}원
              </div>
            </section>

            {/* 섹션 B, C: 월별 수익/비용 */}
            <section className="accounting-manage-section-bc">
              <div className="accounting-monthly-income">
                <div className="accounting-monthly-label">이번 달 수익</div>
                <div className="accounting-monthly-amount income">
                  +{formatAmount(monthlySummary.totalIncome)}원
                </div>
              </div>
              <div className="accounting-monthly-expense">
                <div className="accounting-monthly-label">이번 달 비용</div>
                <div className="accounting-monthly-amount expense">
                  -{formatAmount(monthlySummary.totalExpense)}원
                </div>
              </div>
            </section>

            {/* 섹션 D: Date Navigator */}
            <section className="accounting-manage-section-d">
              <button
                className="accounting-date-nav-btn"
                onClick={handlePrevMonth}
              >
                &lt;
              </button>
              <div className="accounting-date-display">
                {currentDate.getFullYear()}년{" "}
                {getKoreanMonth(currentDate.getMonth() + 1)}
              </div>
              <button
                className="accounting-date-nav-btn"
                onClick={handleNextMonth}
              >
                &gt;
              </button>
            </section>

            {/* 섹션 E: 회계 리스트 */}
            <section className="accounting-manage-section-e">
              {sortedDates.length === 0 ? (
                <div className="accounting-empty">
                  <p>거래 내역이 없습니다.</p>
                </div>
              ) : (
                sortedDates.map((date) => (
                  <div key={date} className="accounting-date-group">
                    <div className="accounting-date-header">
                      {formatDate(date)}
                    </div>
                    <div className="accounting-transaction-list">
                      {groupedTransactions[date].map((transaction) => (
                        <div
                          key={transaction.id}
                          className="accounting-transaction-item"
                        >
                          <div className="accounting-transaction-icon">
                            {transaction.icon || (
                              <div className="accounting-transaction-icon-default">
                                {transaction.type === "income" ? "💰" : "💸"}
                              </div>
                            )}
                          </div>
                          <div className="accounting-transaction-content">
                            <div className="accounting-transaction-name">
                              {transaction.name}
                            </div>
                            <div className="accounting-transaction-time">
                              {formatTime(transaction.time)}
                            </div>
                          </div>
                          <div className="accounting-transaction-amount">
                            <div
                              className={`accounting-amount-value ${
                                transaction.type === "income"
                                  ? "income"
                                  : "expense"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              {formatAmount(Math.abs(transaction.amount))}원
                            </div>
                            <div className="accounting-balance-value">
                              {formatAmount(transaction.balance)}원
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* 섹션 F: 액션 버튼 */}
            <section className="accounting-manage-section-f">
              <button
                className="accounting-action-btn accounting-receipt-btn"
                onClick={() => {
                  // TODO: 영수증 첨부 기능 구현
                  alert("영수증 첨부 기능은 준비 중입니다.");
                }}
              >
                영수증 첨부
              </button>
              <button
                className="accounting-action-btn accounting-edit-btn"
                onClick={() => {
                  // TODO: 수정하기 기능 구현
                  alert("수정하기 기능은 준비 중입니다.");
                }}
              >
                수정하기
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AccountingManageScreen;
