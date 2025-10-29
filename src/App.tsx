import React, { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import CommunityScreen from "./components/CommunityScreen";
import MyClubScreen from "./components/MyClubScreen";
import "./App.css";

function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "home" | "community" | "myclub"
  >("home");

  const handleScreenChange = (screen: "home" | "community" | "myclub") => {
    setCurrentScreen(screen);
  };

  return (
    <div className="App">
      {currentScreen === "home" && (
        <HomeScreen onScreenChange={handleScreenChange} />
      )}
      {currentScreen === "community" && (
        <CommunityScreen onScreenChange={handleScreenChange} />
      )}
      {currentScreen === "myclub" && (
        <MyClubScreen onScreenChange={handleScreenChange} />
      )}
    </div>
  );
}

export default App;
