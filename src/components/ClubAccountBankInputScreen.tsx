import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ClubAccountScreens.css";
import { getBankById } from "./clubAccountBanks";

const LOCAL_STORAGE_KEY = "clubAccountInfo";

interface StoredClub {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
  role?: string;
}

const ClubAccountBankInputScreen: React.FC = () => {
  const navigate = useNavigate();
  const { bankId } = useParams<{ bankId: string }>();
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [selectedBankName, setSelectedBankName] =
    useState<string>("선택되지 않음");
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);

  useEffect(() => {
    const bank = getBankById(bankId);
    if (bank) {
      setSelectedBankName(bank.name);
    } else {
      setSelectedBankName("알 수 없는 은행");
    }
  }, [bankId]);

  useEffect(() => {
    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      const parsed: StoredClub = JSON.parse(storedClub);
      setSelectedClub(parsed);
      setIsAuthorized(
        parsed.role === "회장" ||
          parsed.role === "스태프" ||
          parsed.role === "관리자"
      );
    }
  }, []);

  useEffect(() => {
    const loadExistingAccount = async () => {
      if (!selectedClub?.club_user_id) return;
      setIsLoadingAccount(true);
      try {
        const { data, error } = await supabase
          .from("club_user")
          .select(
            `
            bank_name,
            bank_account_number,
            bank_account_holder
          `
          )
          .eq("id", selectedClub.club_user_id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          if (!bankId && data.bank_name) {
            setSelectedBankName(data.bank_name);
          }
          setAccountNumber(data.bank_account_number || "");
          setAccountHolder(data.bank_account_holder || "");
        }
      } catch (error) {
        console.error("동아리 계좌 정보 로드 오류:", error);
      } finally {
        setIsLoadingAccount(false);
      }
    };

    loadExistingAccount();
  }, [bankId, selectedClub?.club_user_id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isAuthorized) {
      alert("해당 기능은 회장 또는 스태프만 사용할 수 있습니다.");
      return;
    }

    if (!selectedClub?.club_user_id) {
      alert("동아리 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!accountNumber.trim() || !selectedBankName || !accountHolder.trim()) {
      alert("은행, 계좌번호, 예금주를 모두 입력해주세요.");
      return;
    }

    const formattedAccount = {
      bankName: selectedBankName,
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
    };

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("club_user")
        .update({
          bank_name: selectedBankName,
          bank_account_number: accountNumber.trim(),
          bank_account_holder: accountHolder.trim(),
        })
        .eq("id", selectedClub.club_user_id);

      if (error) {
        throw error;
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formattedAccount));
      alert("동아리 계좌 정보가 등록되었습니다.");
      navigate("/myclub/manage/account");
    } catch (error) {
      console.error("계좌 정보 저장 오류:", error);
      alert("계좌 정보를 저장하는 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="club-account-screen" data-name="은행 계좌 입력">
      <div className="club-account-inner">
        <header className="club-account-header">
          <button
            className="club-account-back-btn"
            onClick={() => navigate(-1)}
          >
            ← 뒤로가기
          </button>
        </header>

        <h1 className="club-account-title">계좌 입력</h1>

        <section>
          <h2 className="club-account-section-title">선택한 은행</h2>
          <div className="club-account-card">
            <strong className="selected-bank-name">{selectedBankName}</strong>
            <span className="secondary-text">
              다른 은행을 선택하려면 이전 화면으로 돌아가주세요.
            </span>
          </div>
        </section>

        {!isAuthorized ? (
          <section>
            <div className="club-account-card warning-card">
              <strong>접근 권한이 없습니다.</strong>
              <p>회장 또는 스태프만 계좌 정보를 등록할 수 있습니다.</p>
            </div>
          </section>
        ) : (
          <section>
            <form className="bank-input-form" onSubmit={handleSubmit}>
              <div className="bank-input-field">
                <label htmlFor="accountNumber">계좌 번호</label>
                <input
                  id="accountNumber"
                  type="text"
                  placeholder="하이픈(-) 없이 입력"
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value)}
                  disabled={isLoadingAccount || isSubmitting}
                />
              </div>

              <div className="bank-input-field">
                <label htmlFor="accountHolder">예금주 이름</label>
                <input
                  id="accountHolder"
                  type="text"
                  placeholder="예금주 이름을 입력하세요"
                  value={accountHolder}
                  onChange={(event) => setAccountHolder(event.target.value)}
                  disabled={isLoadingAccount || isSubmitting}
                />
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={isSubmitting || isLoadingAccount}
              >
                {isSubmitting ? "등록 중..." : "계좌 등록하기"}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};

export default ClubAccountBankInputScreen;
