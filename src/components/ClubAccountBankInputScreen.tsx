import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import "./ClubAccountScreens.css";
import { bankOptions, getBankById } from "./clubAccountBanks";

const LOCAL_STORAGE_KEY = "clubAccountInfo";

const ClubAccountBankInputScreen: React.FC = () => {
  const navigate = useNavigate();
  const { bankId } = useParams<{ bankId: string }>();
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [selectedBankName, setSelectedBankName] =
    useState<string>("선택되지 않음");

  useEffect(() => {
    const bank = getBankById(bankId);
    if (bank) {
      setSelectedBankName(bank.name);
    } else {
      setSelectedBankName("알 수 없는 은행");
    }
  }, [bankId]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!accountNumber.trim() || !selectedBankName || !accountHolder.trim()) {
      alert("은행, 계좌번호, 예금주를 모두 입력해주세요.");
      return;
    }

    const formattedAccount = {
      bankName: selectedBankName,
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formattedAccount));
    navigate("/myclub/manage/account");
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
          <h1 className="club-account-title">계좌 입력</h1>
        </header>

        <section>
          <h2 className="club-account-section-title">선택한 은행</h2>
          <div className="club-account-card">
            <strong className="selected-bank-name">{selectedBankName}</strong>
            <span className="secondary-text">
              다른 은행을 선택하려면 이전 화면으로 돌아가주세요.
            </span>
          </div>
        </section>

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
              />
            </div>

            <button type="submit" className="primary-btn">
              계좌 등록하기
            </button>
          </form>
        </section>
      </div>
      <BottomTabBar />
    </div>
  );
};

export default ClubAccountBankInputScreen;
