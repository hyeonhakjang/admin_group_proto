import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./AccountingEditScreen.css";

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

interface EditableTransaction extends AccountingTransaction {
  isEditing?: boolean;
  editingField?: "name" | "amount" | "time" | "date";
}

const AccountingEditScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<EditableTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

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
      const lastDay = new Date(year, month, 0).getDate();
      const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      const { data, error } = await supabase
        .from("accounting_transaction")
        .select("*")
        .eq("club_user_id", selectedClub.club_user_id)
        .gte("transaction_date", monthStart)
        .lte("transaction_date", monthEnd)
        .order("transaction_date", { ascending: false })
        .order("transaction_time", { ascending: false });

      if (error) {
        throw error;
      }

      const mappedTransactions: EditableTransaction[] = (data || []).map(
        (transaction: any) => ({
          id: transaction.id,
          date: transaction.transaction_date,
          name: transaction.name,
          time: transaction.transaction_time,
          amount: transaction.amount,
          type: transaction.type as "income" | "expense",
          balance: transaction.balance,
          icon: transaction.icon,
          isEditing: false,
        })
      );

      setTransactions(mappedTransactions);
    } catch (error) {
      console.error("회계 데이터 로드 오류:", error);
      setTransactions([]);
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
    if (!timeString) return "";
    const parts = timeString.split(":");
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  const handleFieldClick = (transactionId: number, field: "name" | "amount" | "time" | "date") => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? { ...t, isEditing: true, editingField: field }
          : { ...t, isEditing: false }
      )
    );
  };

  const handleFieldChange = (
    transactionId: number,
    field: "name" | "amount" | "time" | "date",
    value: string
  ) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          if (field === "amount") {
            const numValue = parseInt(value.replace(/,/g, "")) || 0;
            return { ...t, amount: numValue };
          } else if (field === "time") {
            return { ...t, time: value };
          } else if (field === "date") {
            return { ...t, date: value };
          } else {
            return { ...t, name: value };
          }
        }
        return t;
      })
    );
  };

  const handleFieldBlur = async (transaction: EditableTransaction) => {
    if (!transaction.editingField) return;

    setSaving(transaction.id);
    try {
      const updateData: any = {};
      
      if (transaction.editingField === "name") {
        updateData.name = transaction.name;
      } else if (transaction.editingField === "amount") {
        updateData.amount = transaction.amount;
      } else if (transaction.editingField === "time") {
        updateData.transaction_time = transaction.time;
      } else if (transaction.editingField === "date") {
        updateData.transaction_date = transaction.date;
      }

      const { error } = await supabase
        .from("accounting_transaction")
        .update(updateData)
        .eq("id", transaction.id);

      if (error) {
        throw error;
      }

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transaction.id
            ? { ...t, isEditing: false, editingField: undefined }
            : t
        )
      );

      // 데이터 다시 로드하여 최신 상태 반영
      await loadAccountingData();
    } catch (error) {
      console.error("거래 내역 업데이트 오류:", error);
      alert("거래 내역을 업데이트하는 중 오류가 발생했습니다.");
    } finally {
      setSaving(null);
    }
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
    {} as Record<string, EditableTransaction[]>
  );

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="accounting-edit-screen">
      {/* 헤더: 뒤로가기 버튼 */}
      <header className="accounting-edit-header">
        <button
          className="accounting-edit-back-btn"
          onClick={() => navigate(-1)}
        >
          ← 뒤로가기
        </button>
      </header>

      <main className="accounting-edit-content">
        {loading ? (
          <div className="accounting-edit-loading">로딩 중...</div>
        ) : (
          <>
            {/* 섹션 D: Date Navigator */}
            <section className="accounting-edit-section-d">
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

            {/* 섹션 E: 회계 리스트 (수정 가능) */}
            <section className="accounting-edit-section-e">
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
                            {/* 이름 수정 가능 */}
                            {transaction.isEditing &&
                            transaction.editingField === "name" ? (
                              <input
                                type="text"
                                className="accounting-edit-input"
                                value={transaction.name}
                                onChange={(e) =>
                                  handleFieldChange(
                                    transaction.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                onBlur={() => handleFieldBlur(transaction)}
                                autoFocus
                              />
                            ) : (
                              <div
                                className="accounting-transaction-name accounting-editable"
                                onClick={() =>
                                  handleFieldClick(transaction.id, "name")
                                }
                              >
                                {transaction.name}
                              </div>
                            )}

                            {/* 시간 수정 가능 */}
                            {transaction.isEditing &&
                            transaction.editingField === "time" ? (
                              <input
                                type="time"
                                className="accounting-edit-input accounting-edit-time"
                                value={formatTime(transaction.time)}
                                onChange={(e) =>
                                  handleFieldChange(
                                    transaction.id,
                                    "time",
                                    e.target.value
                                  )
                                }
                                onBlur={() => handleFieldBlur(transaction)}
                                autoFocus
                              />
                            ) : (
                              <div
                                className="accounting-transaction-time accounting-editable"
                                onClick={() =>
                                  handleFieldClick(transaction.id, "time")
                                }
                              >
                                {formatTime(transaction.time)}
                                {saving === transaction.id && " (저장 중...)"}
                              </div>
                            )}
                          </div>
                          <div className="accounting-transaction-amount">
                            {/* 금액 수정 가능 */}
                            {transaction.isEditing &&
                            transaction.editingField === "amount" ? (
                              <input
                                type="text"
                                className="accounting-edit-input accounting-edit-amount"
                                value={formatAmount(transaction.amount)}
                                onChange={(e) =>
                                  handleFieldChange(
                                    transaction.id,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                onBlur={() => handleFieldBlur(transaction)}
                                autoFocus
                              />
                            ) : (
                              <div
                                className={`accounting-amount-value ${
                                  transaction.type === "income"
                                    ? "income"
                                    : "expense"
                                } accounting-editable`}
                                onClick={() =>
                                  handleFieldClick(transaction.id, "amount")
                                }
                              >
                                {transaction.type === "income" ? "+" : "-"}
                                {formatAmount(Math.abs(transaction.amount))}원
                              </div>
                            )}
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
          </>
        )}
      </main>
    </div>
  );
};

export default AccountingEditScreen;

