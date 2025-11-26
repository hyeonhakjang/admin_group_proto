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
import ProfileScreen from "./components/ProfileScreen";
import AccountApprovalScreen from "./components/AccountApprovalScreen";
import ScheduleAddScreen from "./components/ScheduleAddScreen";
import ClubAccountScreen from "./components/ClubAccountScreen";
import ClubAccountRegisterScreen from "./components/ClubAccountRegisterScreen";
import ClubAccountBankInputScreen from "./components/ClubAccountBankInputScreen";
import PayoutRegisterScreen from "./components/PayoutRegisterScreen";
import PayoutMemberSearchScreen from "./components/PayoutMemberSearchScreen";
import PayoutDetailScreen from "./components/PayoutDetailScreen";
import MemberManageScreen from "./components/MemberManageScreen";
import PostWriteScreen from "./components/PostWriteScreen";
import ScheduleSelectScreen from "./components/ScheduleSelectScreen";
import PayoutSelectScreen from "./components/PayoutSelectScreen";
import ClubPostDetailScreen from "./components/ClubPostDetailScreen";
import PayoutManageScreen from "./components/PayoutManageScreen";
import PayoutManageDetailScreen from "./components/PayoutManageDetailScreen";
import ClubProfileEditScreen from "./components/ClubProfileEditScreen";
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
            element={
              <ComingSoonScreen title="예약/구매" showBottomTabBar />
            }
          />
          <Route
            path="/chat"
            element={<ComingSoonScreen title="채팅" showBottomTabBar />}
          />
          <Route path="/myclub/post/write" element={<PostWriteScreen />} />
          <Route
            path="/myclub/post/write/schedule"
            element={<ScheduleSelectScreen />}
          />
          <Route
            path="/myclub/post/write/payout"
            element={<PayoutSelectScreen />}
          />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/account-approval" element={<AccountApprovalScreen />} />
          <Route path="/myclub/schedule/add" element={<ScheduleAddScreen />} />
          <Route
            path="/myclub/manage/account"
            element={<ClubAccountScreen />}
          />
          <Route
            path="/myclub/manage/account/register"
            element={<ClubAccountRegisterScreen />}
          />
          <Route
            path="/myclub/manage/account/register/:bankId"
            element={<ClubAccountBankInputScreen />}
          />
          <Route
            path="/myclub/payout/register"
            element={<PayoutRegisterScreen />}
          />
          <Route
            path="/myclub/payout/register/members"
            element={<PayoutMemberSearchScreen />}
          />
          <Route path="/myclub/payout/:id" element={<PayoutDetailScreen />} />
          <Route
            path="/myclub/manage/members"
            element={<MemberManageScreen />}
          />
          <Route path="/myclub/post/:id" element={<ClubPostDetailScreen />} />
          <Route
            path="/myclub/manage/payout"
            element={<PayoutManageScreen />}
          />
          <Route
            path="/myclub/manage/payout/:id"
            element={<PayoutManageDetailScreen />}
          />
          <Route
            path="/myclub/manage/accounting"
            element={<ComingSoonScreen title="회계 내역" />}
          />
          <Route
            path="/myclub/manage/events"
            element={<ComingSoonScreen title="행사 관리" />}
          />
          <Route
            path="/myclub/manage/archive"
            element={<ComingSoonScreen title="임원진 자료" />}
          />
          <Route
            path="/myclub/manage/approvals"
            element={<ComingSoonScreen title="신청폼 관리" />}
          />
          <Route
            path="/myclub/page/edit"
            element={<ComingSoonScreen title="동아리 페이지 관리" />}
          />
          <Route
            path="/myclub/profile/edit"
            element={<ClubProfileEditScreen />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
