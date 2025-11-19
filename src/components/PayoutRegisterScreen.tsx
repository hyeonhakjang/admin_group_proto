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
      `정산 "${title}"이 등록되었습니다. (멤버 ${members.length}명, 총 ${members.reduce(
        (sum, member) => sum + member.amount,
        0
      )}원)`
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
          <h1 className="payout-title">정산 등록</h1>
        </header>

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
            <div className="payout-member-list">
              {members.map((member) => (
                <div key={member.id} className="payout-member-item">
                  <div className="payout-member-name">{member.name}</div>
                  <input
                    type="number"
                    min={0}
                    className="payout-member-amount"
                    value={member.amount}
                    onChange={(event) =>
                      handleAmountChange(member.id, event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="payout-remove-btn"
                    onClick={() => handleRemoveMember(member.id)}
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

