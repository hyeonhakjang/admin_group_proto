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
import LoginScreen from "./components/LoginScreen";
import SignupSelectionScreen from "./components/SignupSelectionScreen";
import CampusOfficialSignupScreen from "./components/CampusOfficialSignupScreen";
import ClubSignupScreen from "./components/ClubSignupScreen";
import PersonalSignupScreen from "./components/PersonalSignupScreen";
import SocialPersonalSignupScreen from "./components/SocialPersonalSignupScreen";
import PostDetailScreen from "./components/PostDetailScreen";
import ComingSoonScreen from "./components/ComingSoonScreen";
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
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup/selection" element={<SignupSelectionScreen />} />
          <Route
            path="/signup/campus-official"
            element={<CampusOfficialSignupScreen />}
          />
          <Route path="/signup/club" element={<ClubSignupScreen />} />
          <Route path="/signup/personal" element={<PersonalSignupScreen />} />
          <Route
            path="/signup/social-personal"
            element={<SocialPersonalSignupScreen />}
          />
          <Route path="/community/post/:id" element={<PostDetailScreen />} />
          <Route
            path="/booking"
            element={<ComingSoonScreen title="예약/구매" />}
          />
          <Route path="/chat" element={<ComingSoonScreen title="채팅" />} />
          <Route
            path="/myclub/post/write"
            element={<ComingSoonScreen title="글 작성" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
