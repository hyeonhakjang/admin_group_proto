import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./BottomTabBar.css";

// 이미지 상수들
const imgIcon = "/home.png"; // 홈 아이콘
const imgIcon1 = "/community.png"; // 커뮤니티 아이콘
const imgIcon2 = "/myclub.png"; // 내 클럽 아이콘
const imgIcon3 = "/booking.png"; // 예약/구매 아이콘
const imgIcon4 = "/chat.png"; // 채팅 아이콘

const BottomTabBar: React.FC = () => {
  const location = useLocation();

  return (
    <div
      className="bottom-tab-bar"
      data-name="Bottom Tab Bar with Labels"
      data-node-id="9:462"
    >
      <div className="tabs" data-name="tabs" data-node-id="9:463">
        {/* Home Tab */}
        <Link
          to="/"
          className={`tab ${location.pathname === "/" ? "active" : ""}`}
          data-name="tab1"
          data-node-id="9:603"
        >
          <div className="tab-icon" data-name="Icon" data-node-id="9:614">
            <img alt="Home Icon" className="icon" src={imgIcon} />
          </div>
          <p
            className={`tab-label ${location.pathname === "/" ? "active" : ""}`}
            data-node-id="9:605"
          >
            홈
          </p>
        </Link>

        {/* Community Tab */}
        <Link
          to="/community"
          className={`tab ${
            location.pathname === "/community" ? "active" : ""
          }`}
          data-name="tab2"
          data-node-id="9:559"
        >
          <div className="tab-icon" data-name="Icon" data-node-id="9:577">
            <img alt="Community Icon" className="icon" src={imgIcon1} />
          </div>
          <p
            className={`tab-label ${
              location.pathname === "/community" ? "active" : ""
            }`}
            data-node-id="9:561"
          >
            커뮤니티
          </p>
        </Link>

        {/* My Club Tab */}
        <Link
          to="/myclub"
          className={`tab ${location.pathname === "/myclub" ? "active" : ""}`}
          data-name="tab3?"
          data-node-id="9:524"
        >
          <div className="tab-icon" data-name="Icon" data-node-id="9:534">
            <img alt="My Club Icon" className="icon" src={imgIcon2} />
          </div>
          <p
            className={`tab-label ${
              location.pathname === "/myclub" ? "active" : ""
            }`}
            data-node-id="9:526"
          >
            내 동아리
          </p>
        </Link>

        {/* Booking/Purchase Tab */}
        <div className="tab" data-name="tab4?" data-node-id="9:499">
          <div className="tab-icon" data-name="Icon" data-node-id="9:508">
            <img alt="Booking Icon" className="icon" src={imgIcon3} />
          </div>
          <p className="tab-label" data-node-id="9:501">
            예약/구매
          </p>
        </div>

        {/* Chat Tab */}
        <div className="tab" data-name="tab5?" data-node-id="9:479">
          <div className="tab-icon" data-name="Icon" data-node-id="9:486">
            <img alt="Chat Icon" className="icon" src={imgIcon4} />
          </div>
          <p className="tab-label" data-node-id="9:481">
            채팅
          </p>
        </div>
      </div>
    </div>
  );
};

export default BottomTabBar;
