import React, { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import CommunityScreen from "./components/CommunityScreen";
import "./App.css";

function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'community'>('home');

  const handleScreenChange = (screen: 'home' | 'community') => {
    setCurrentScreen(screen);
  };

  return (
    <div className="App">
      {currentScreen === 'home' && (
        <HomeScreen onScreenChange={handleScreenChange} />
      )}
      {currentScreen === 'community' && (
        <CommunityScreen onScreenChange={handleScreenChange} />
      )}
    </div>
  );
}

export default App;
