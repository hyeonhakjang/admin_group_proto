import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeScreen from "./components/HomeScreen";
import CommunityScreen from "./components/CommunityScreen";
import MyClubScreen from "./components/MyClubScreen";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/community" element={<CommunityScreen />} />
          <Route path="/myclub" element={<MyClubScreen />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
