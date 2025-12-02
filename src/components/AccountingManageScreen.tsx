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

interface AccountingItem {
  id: number;
  date: string;
  name: string;
  time: string;
  amount: number;
  type: "income" | "expense";
  cumulativeIncome: number;
  cumulativeExpense: number;
}

const AccountingManageScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [accountingItems, setAccountingItems] = useState<AccountingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);

  useEffect(() => {
    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, []);

  const getKoreanMonth = (date: Date) => {
    return date.getMonth() + 1;
  };

  const getKoreanMonthName = (date: Date) => {
    return `${getKoreanMonth(date)}월`;
  };

  const changeMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const loadAccountingData = useCallback(async () => {
    if (!selectedClub?.club_user_id) {
      setAccountingItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0)
        .toISOString()
        .split("T")[0];

      // TODO: 실제 accounting 테이블에서 데이터 가져오기
      // 현재는 임시 데이터 구조만 정의
      const { data, error } = await supabase
        .from("accounting_transaction")
        .select("*")
        .eq("club_user_id", selectedClub.club_user_id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error && error.code !== "42P01") {
        // 테이블이 없으면 임시 데이터 사용
        console.error("회계 데이터 로드 오류:", error);
      }

      // 임시 데이터 (실제 구현 시 제거)
      const mockData: AccountingItem[] = [
        {
          id: 1,
          date: "2025.01.15",
          name: "회비 수입",
          time: "14:30",
          amount: 50000,
          type: "income",
          cumulativeIncome: 50000,
          cumulativeExpense: 0,
        },
        {
          id: 2,
          date: "2025.01.14",
          name: "행사비",
          time: "10:20",
          amount: 30000,
          type: "expense",
          cumulativeIncome: 50000,
          cumulativeExpense: 30000,
        },
        {
          id: 3,
          date: "2025.01.13",
          name: "후원금",
          time: "16:45",
          amount: 100000,
          type: "income",
          cumulativeIncome: 150000,
          cumulativeExpense: 30000,
        },
      ];

      const items = data && data.length > 0 ? data : mockData;

      // 누적 계산
      let cumulativeIncome = 0;
      let cumulativeExpense = 0;
      const processedItems = items.map((item: any) => {
        if (item.type === "income") {
          cumulativeIncome += item.amount || 0;
        } else {
          cumulativeExpense += item.amount || 0;
        }
        return {
          id: item.id,
          date: item.date || new Date(item.created_at).toLocaleDateString("ko-KR").replace(/\./g, "."),
          name: item.name || item.title || "항목",
          time: item.time || new Date(item.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
          amount: item.amount || 0,
          type: item.type || "expense",
          cumulativeIncome,
          cumulativeExpense,
        };
      });

      setAccountingItems(processedItems);

      // 월별 통계 계산
      const income = processedItems
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);
      const expense = processedItems
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

      setMonthlyIncome(income);
      setMonthlyExpense(expense);
      setBalance(income - expense);
    } catch (error) {
      console.error("회계 데이터 로드 중 오류:", error);
      setAccountingItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClub?.club_user_id, currentMonth]);

  useEffect(() => {
    if (!selectedClub?.club_user_id) return;
    loadAccountingData();
  }, [selectedClub, loadAccountingData]);

  return (
    <div className="accounting-manage-screen">
      {/* 헤더: 뒤로가기 */}
      <header className="accounting-manage-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </header>

      <main className="accounting-manage-content">
        {/* 섹션 A: 회계 잔액 */}
        <section className="accounting-balance-section">
          <div className="accounting-balance-label">회계 잔액</div>
          <div className="accounting-balance-amount">
            {balance.toLocaleString()}원
          </div>
        </section>

        {/* 섹션 B, C: 월별 수익/비용 */}
        <section className="accounting-stats-section">
          <div className="accounting-stat-item">
            <div className="accounting-stat-label">해당 월 총 수익</div>
            <div className="accounting-stat-value income">
              {monthlyIncome.toLocaleString()}원
            </div>
          </div>
          <div className="accounting-stat-item">
            <div className="accounting-stat-label">해당 월 총 비용</div>
            <div className="accounting-stat-value expense">
              {monthlyExpense.toLocaleString()}원
            </div>
          </div>
        </section>

        {/* 섹션 D: Date Navigator */}
        <section className="accounting-date-navigator">
          <button
            className="date-nav-btn"
            onClick={() => changeMonth("prev")}
            aria-label="이전 달"
          >
            &lt;
          </button>
          <span className="date-nav-month">
            {getKoreanMonthName(currentMonth)}
          </span>
          <button
            className="date-nav-btn"
            onClick={() => changeMonth("next")}
            aria-label="다음 달"
          >
            &gt;
          </button>
        </section>

        {/* 섹션 E: 회계 리스트 */}
        <section className="accounting-list-section">
          {loading ? (
            <div className="accounting-loading">로딩 중...</div>
          ) : accountingItems.length === 0 ? (
            <div className="accounting-empty">
              <p>회계 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="accounting-list">
              {accountingItems.map((item) => (
                <div key={item.id} className="accounting-item">
                  <div className="accounting-item-left">
                    <div className="accounting-item-date-time">
                      <span className="accounting-item-date">{item.date}</span>
                      <span className="accounting-item-time">{item.time}</span>
                    </div>
                    <div className="accounting-item-name">{item.name}</div>
                  </div>
                  <div className="accounting-item-right">
                    <div
                      className={`accounting-item-amount ${
                        item.type === "income" ? "income" : "expense"
                      }`}
                    >
                      {item.type === "income" ? "+" : "-"}
                      {item.amount.toLocaleString()}원
                    </div>
                    <div className="accounting-item-cumulative">
                      {item.type === "income"
                        ? `누적 수익: ${item.cumulativeIncome.toLocaleString()}원`
                        : `누적 비용: ${item.cumulativeExpense.toLocaleString()}원`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 섹션 F: 액션 버튼 */}
        <section className="accounting-actions-section">
          <button
            className="accounting-action-btn receipt-btn"
            onClick={() => {
              // TODO: 영수증 첨부 기능
              alert("영수증 첨부 기능은 준비 중입니다.");
            }}
          >
            영수증 첨부
          </button>
          <button
            className="accounting-action-btn edit-btn"
            onClick={() => {
              // TODO: 수정하기 기능
              alert("수정하기 기능은 준비 중입니다.");
            }}
          >
            수정하기
          </button>
        </section>
      </main>
    </div>
  );
};

export default AccountingManageScreen;

