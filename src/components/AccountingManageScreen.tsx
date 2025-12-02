import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

interface DateGroup {
  date: string;
  dayOfWeek: string;
  transactions: AccountingTransaction[];
}

const AccountingManageScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [balance, setBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [transactions, setTransactions] = useState<DateGroup[]>([]);

  useEffect(() => {
    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, []);

  // TODO: 실제 데이터 로드
  useEffect(() => {
    // 임시 데이터
    const mockTransactions: AccountingTransaction[] = [
      {
        id: 1,
        date: "2024-10-01",
        name: "통장 이자",
        time: "04:59",
        amount: 2,
        type: "income",
        balance: 2,
        icon: "💳",
      },
      {
        id: 2,
        date: "2024-09-07",
        name: "19홍인기",
        time: "18:07",
        amount: 45000,
        type: "income",
        balance: 180000,
        icon: "👤",
      },
      {
        id: 3,
        date: "2024-09-07",
        name: "22 조재성",
        time: "18:02",
        amount: 45000,
        type: "income",
        balance: 135000,
        icon: "👤",
      },
      {
        id: 4,
        date: "2024-09-07",
        name: "25 서정호",
        time: "18:01",
        amount: 45000,
        type: "income",
        balance: 90000,
        icon: "👤",
      },
      {
        id: 5,
        date: "2024-09-07",
        name: "22 김형준",
        time: "18:00",
        amount: 45000,
        type: "income",
        balance: 45000,
        icon: "👤",
      },
      {
        id: 6,
        date: "2024-09-01",
        name: "통장 이자",
        time: "05:06",
        amount: 81,
        type: "income",
        balance: 348935,
        icon: "💳",
      },
      {
        id: 7,
        date: "2024-08-04",
        name: "에스케이플래닛(주)",
        time: "20:40",
        amount: 7500,
        type: "income",
        balance: 1256609,
        icon: "🏢",
      },
    ];

    // 현재 월 필터링
    const filtered = mockTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() + 1 === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    // 날짜별 그룹화
    const grouped = filtered.reduce((groups, transaction) => {
      const date = new Date(transaction.date);
      const dateKey = transaction.date;
      const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][
        date.getDay()
      ];

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          dayOfWeek,
          transactions: [],
        };
      }

      groups[dateKey].transactions.push(transaction);
      return groups;
    }, {} as Record<string, DateGroup>);

    const sortedGroups = Object.values(grouped).sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    // 각 날짜 내 거래를 시간 역순으로 정렬
    sortedGroups.forEach((group) => {
      group.transactions.sort((a, b) => b.time.localeCompare(a.time));
    });

    setTransactions(sortedGroups);

    // 총 수익/비용 계산
    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setMonthlyIncome(income);
    setMonthlyExpense(expense);

    // 잔액 계산 (가장 최근 거래의 잔액)
    if (filtered.length > 0) {
      setBalance(filtered[0].balance);
    }
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getKoreanMonth = (month: number) => {
    return `${month}월`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  return (
    <div className="accounting-manage-screen">
      {/* 헤더: 뒤로가기 */}
      <header className="accounting-manage-header">
        <button className="accounting-back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </header>

      <main className="accounting-manage-content">
        <div className="accounting-manage-content-inner">
          {/* 섹션 A: 회계 잔액 */}
          <section className="accounting-balance-section">
            <div className="accounting-balance-label">회계 잔액</div>
            <div className="accounting-balance-amount">
              {balance.toLocaleString()}원
            </div>
          </section>

          {/* 섹션 B, C: 월별 수익/비용 */}
          <section className="accounting-summary-section">
            <div className="accounting-summary-item accounting-income">
              <div className="accounting-summary-label">해당 월 총 수익</div>
              <div className="accounting-summary-amount income">
                +{monthlyIncome.toLocaleString()}원
              </div>
            </div>
            <div className="accounting-summary-item accounting-expense">
              <div className="accounting-summary-label">해당 월 총 비용</div>
              <div className="accounting-summary-amount expense">
                -{monthlyExpense.toLocaleString()}원
              </div>
            </div>
          </section>

          {/* 섹션 D: Date Navigator */}
          <section className="accounting-date-navigator">
            <button
              className="accounting-nav-btn"
              onClick={handlePrevMonth}
              aria-label="이전 달"
            >
              &lt;
            </button>
            <div className="accounting-date-display">
              {getKoreanMonth(currentMonth)}
            </div>
            <button
              className="accounting-nav-btn"
              onClick={handleNextMonth}
              aria-label="다음 달"
            >
              &gt;
            </button>
          </section>

          {/* 섹션 E: 회계 리스트 */}
          <section className="accounting-list-section">
            {transactions.length === 0 ? (
              <div className="accounting-empty">
                <p>해당 월의 거래 내역이 없습니다.</p>
              </div>
            ) : (
              transactions.map((group) => (
                <div key={group.date} className="accounting-date-group">
                  <div className="accounting-date-header">
                    {formatDate(group.date)} {group.dayOfWeek}요일
                  </div>
                  <div className="accounting-transactions">
                    {group.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="accounting-transaction-item"
                      >
                        <div className="accounting-transaction-icon">
                          {transaction.icon || "💳"}
                        </div>
                        <div className="accounting-transaction-info">
                          <div className="accounting-transaction-name">
                            {transaction.name}
                          </div>
                          <div className="accounting-transaction-time">
                            {transaction.time}
                          </div>
                        </div>
                        <div className="accounting-transaction-amounts">
                          <div
                            className={`accounting-transaction-amount ${
                              transaction.type === "income" ? "income" : "expense"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {transaction.amount.toLocaleString()}원
                          </div>
                          <div className="accounting-transaction-balance">
                            {transaction.balance.toLocaleString()}원
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
          <section className="accounting-actions-section">
            <button className="accounting-action-btn accounting-receipt-btn">
              영수증 첨부
            </button>
            <button className="accounting-action-btn accounting-edit-btn">
              수정하기
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AccountingManageScreen;

