import React from "react";
import { useNavigate } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import "./ClubAccountScreens.css";
import { bankOptions } from "./clubAccountBanks";

const ClubAccountRegisterScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="club-account-screen" data-name="계좌 등록 선택">
      <div className="club-account-inner">
        <header className="club-account-header">
          <button
            className="club-account-back-btn"
            onClick={() => navigate(-1)}
          >
            ← 뒤로가기
          </button>
          <h1 className="club-account-title">계좌 등록</h1>
        </header>

        <section>
          <h2 className="club-account-section-title">
            등록할 은행을 선택해주세요.
          </h2>
          <p className="bank-selection-info">
            계좌를 보유하고 있는 은행을 선택한 후 계좌번호를 입력하면 등록이
            완료됩니다.
          </p>
        </section>

        <section className="bank-list">
          {bankOptions.map((bank) => (
            <button
              key={bank.id}
              className="bank-list-item"
              onClick={() =>
                navigate(`/myclub/manage/account/register/${bank.id}`)
              }
            >
              {bank.name}
              <span>선택</span>
            </button>
          ))}
        </section>
      </div>
      <BottomTabBar />
    </div>
  );
};

export default ClubAccountRegisterScreen;
