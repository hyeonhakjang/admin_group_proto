import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import { supabase } from "../lib/supabase";
import "./PayoutScreens.css";

const STORAGE_KEY = "payoutSelectedMembers";

interface SelectedMember {
  id: string;
  name: string;
  amount: number;
}

interface StoredClub {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
  role?: string;
}

const PayoutRegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<SelectedMember[]>([]);
  const [bulkAmount, setBulkAmount] = useState<string>("");
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
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
    alert(
      `등록된 멤버 ${
        members.length
      }명의 금액이 ${parsed.toLocaleString()}원으로 통일되었습니다.`
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      alert("정산 이름을 입력해 주세요.");
      return;
    }
    if (members.length === 0) {
      alert("정산 요청할 멤버를 등록해 주세요.");
      return;
    }
    if (!selectedClub) {
      alert("동아리 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const creatorClubPersonalId = selectedClub.club_personal_id || null;
    const appliedDate = new Date().toISOString().split("T")[0];
    const totalAmount = members.reduce(
      (sum, member) => sum + Number(member.amount || 0),
      0
    );

    try {
      setIsSubmitting(true);
      const { data: payoutData, error: payoutError } = await supabase
        .from("club_personal_payout")
        .insert({
          title: title.trim(),
          content: description.trim() || null,
          applied_date: appliedDate,
          club_personal_id: creatorClubPersonalId,
        })
        .select("id")
        .single();

      if (payoutError || !payoutData) {
        throw payoutError || new Error("정산 정보 저장에 실패했습니다.");
      }

      const participantPayload = members.map((member) => ({
        payout_id: payoutData.id,
        club_personal_id: Number(member.id),
        payout_amount: Number(member.amount || 0),
      }));

      if (participantPayload.length > 0) {
        const { error: participantError } = await supabase
          .from("payout_participant")
          .insert(participantPayload);

        if (participantError) {
          throw participantError;
        }
      }

      alert(
        `정산 "${title}"이 등록되었습니다. (멤버 ${members.length}명, 총 ${totalAmount.toLocaleString()}원)`
      );
      setTitle("");
      setDescription("");
      setMembers([]);
      setBulkAmount("");
    } catch (error) {
      console.error("정산 등록 오류:", error);
      alert("정산 등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
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
                  금액 통일
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

          <button
            type="submit"
            className="payout-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "등록 중..." : "정산 등록하기"}
          </button>
        </form>
      </div>
      <BottomTabBar />
    </div>
  );
};

export default PayoutRegisterScreen;
