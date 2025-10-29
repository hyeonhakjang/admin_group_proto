import React from "react";
import Header from "./Header";
import BottomTabBar from "./BottomTabBar";
import "./HomeScreen.css";

const HomeScreen: React.FC = () => {
  return (
    <div className="home-screen" data-name="홈 화면" data-node-id="9:2">
      <Header />

      {/* Main Content */}
      <div
        className="main-content"
        data-name="Main Content"
        data-node-id="9:157"
      />

      <BottomTabBar />
    </div>
  );
};

export default HomeScreen;
