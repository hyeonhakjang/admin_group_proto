import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeScreen from "./components/HomeScreen";
import CommunityScreen from "./components/CommunityScreen";
import MyClubScreen from "./components/MyClubScreen";
import ClubDetailScreen from "./components/ClubDetailScreen";
import ExploreDomesticScreen from "./components/ExploreDomesticScreen";
import RankingDomesticScreen from "./components/RankingDomesticScreen";
import ExploreAllianceScreen from "./components/ExploreAllianceScreen";
import RankingAllianceScreen from "./components/RankingAllianceScreen";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/community" element={<CommunityScreen />} />
          <Route path="/myclub" element={<MyClubScreen />} />
          <Route path="/community/club/:id" element={<ClubDetailScreen />} />
          <Route
            path="/community/explore/domestic"
            element={<ExploreDomesticScreen />}
          />
          <Route
            path="/community/ranking/domestic"
            element={<RankingDomesticScreen />}
          />
          <Route
            path="/community/explore/alliance"
            element={<ExploreAllianceScreen />}
          />
          <Route
            path="/community/ranking/alliance"
            element={<RankingAllianceScreen />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
