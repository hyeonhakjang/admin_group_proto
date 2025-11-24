import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import "./PayoutScreens.css";

const STORAGE_KEY = "payoutSelectedMembers";

interface SelectedMember {
  id: string;
  name: string;
  amount: number;
}

const PayoutRegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<SelectedMember[]>([]);
  const [bulkAmount, setBulkAmount] = useState<string>("");

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: SelectedMember[] = JSON.parse(stored);
      const normalized = parsed.map((member) => ({
        ...member,
        amount: member.amount ?? 0,
      }));
      setMembers(normalized);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleNavigateMemberSearch = () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    navigate("/myclub/payout/register/members");
  };

  const handleAmountChange = (id: string, value: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, amount: Number(value || 0) } : member
      )
    );
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const handleApplyBulkAmount = () => {
    const parsed = Number(bulkAmount);
    if (Number.isNaN(parsed) || parsed < 0) {
      alert("0원 이상의 숫자를 입력해 주세요.");
      return;
    }
    setMembers((prev) => prev.map((member) => ({ ...member, amount: parsed })));
    alert(`등록된 멤버 ${members.length}명의 금액이 ${parsed.toLocaleString()}원으로 통일되었습니다.`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      alert("정산 이름을 입력해 주세요.");
      return;
    }
    if (members.length === 0) {
      alert("정산 요청할 멤버를 등록해 주세요.");
      return;
    }
    alert(
      `정산 "${title}"이 등록되었습니다. (멤버 ${
        members.length
      }명, 총 ${members.reduce((sum, member) => sum + member.amount, 0)}원)`
    );
    setTitle("");
    setDescription("");
    setMembers([]);
  };

  return (
    <div className="payout-screen" data-name="정산 등록">
      <div className="payout-inner">
        <header className="payout-header-block">
          <button className="payout-back-btn" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
        </header>

        <h1 className="payout-title">정산 등록</h1>

        <form className="payout-card" onSubmit={handleSubmit}>
          <div className="payout-form-field">
            <label htmlFor="payout-title">정산 이름</label>
            <input
              id="payout-title"
              type="text"
              placeholder="예: 10월 회비 정산"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="payout-form-field">
            <label htmlFor="payout-desc">정산 내용</label>
            <textarea
              id="payout-desc"
              placeholder="정산에 대한 내용을 입력해 주세요."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="payout-form-field">
            <label>정산 요청할 사람</label>
            <div className="payout-select-members">
              <span>정산할 멤버를 선택해 주세요.</span>
              <button
                type="button"
                onClick={handleNavigateMemberSearch}
                className="member-search-button"
              >
                정산 멤버 찾기
              </button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="payout-registered-member-list">
              <h3 className="payout-registered-member-list-title">
                등록한 정산 멤버
              </h3>
              <div className="payout-registered-member-bulk">
                <div className="payout-registered-member-bulk-input">
                  <input
                    type="number"
                    min={0}
                    value={bulkAmount}
                    onChange={(event) => setBulkAmount(event.target.value)}
                    placeholder="일괄 적용할 금액"
                  />
                  <span>원</span>
                </div>
                <button
                  type="button"
                  className="payout-registered-member-bulk-btn"
                  onClick={handleApplyBulkAmount}
                >
                  전체 금액 통일
                </button>
              </div>
              {members.map((member) => (
                <div key={member.id} className="payout-registered-member-item">
                  <div className="payout-registered-member-name">
                    {member.name}
                  </div>
                  <div className="payout-registered-member-amount-wrapper">
                    <input
                      type="number"
                      min={0}
                      className="payout-registered-member-amount"
                      value={member.amount}
                      onChange={(event) =>
                        handleAmountChange(member.id, event.target.value)
                      }
                      placeholder="금액 입력"
                    />
                    <span className="payout-registered-member-amount-unit">
                      원
                    </span>
                  </div>
                  <button
                    type="button"
                    className="payout-registered-member-remove-btn"
                    onClick={() => handleRemoveMember(member.id)}
                    aria-label="제거"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="payout-submit-btn">
            정산 등록하기
          </button>
        </form>
      </div>
      <BottomTabBar />
    </div>
  );
};

export default PayoutRegisterScreen;
