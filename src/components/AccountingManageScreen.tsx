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

      // TODO: 실제 DB 테이블과 연동 필요
      // 현재는 임시 데이터 구조만 제공
      // const { data, error } = await supabase
      //   .from("accounting_transaction")
      //   .select("*")
      //   .eq("club_user_id", selectedClub.club_user_id)
      //   .gte("date", `${year}-${String(month).padStart(2, "0")}-01`)
      //   .lt("date", `${year}-${String(month + 1).padStart(2, "0")}-01`)
      //   .order("date", { ascending: false })
      //   .order("time", { ascending: false });

      // 임시 데이터 (실제 구현 시 제거)
      const mockTransactions: AccountingTransaction[] = [];
      let runningBalance = 0;
      let totalIncome = 0;
      let totalExpense = 0;

      // TODO: 실제 데이터로 교체
      setTransactions(mockTransactions);
      setBalance(runningBalance);
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
    return timeString;
  };

  // 날짜별로 그룹화
  const groupedTransactions = transactions.reduce(
    (groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {} as Record<string, AccountingTransaction[]>
  );

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="accounting-manage-screen">
      {/* 헤더: 뒤로가기 버튼 */}
      <header className="accounting-manage-header">
        <button className="accounting-manage-back-btn" onClick={() => navigate(-1)}>
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
                                transaction.type === "income" ? "income" : "expense"
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

