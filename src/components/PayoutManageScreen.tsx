import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import { supabase } from "../lib/supabase";
import "./PayoutManageScreen.css";

interface UserData {
  type: "personal" | "club" | "group" | "admin";
  id: number;
  username: string;
  name: string;
  email: string;
}

interface StoredClub {
  id: number;
  name: string;
  club_user_id?: number;
  club_personal_id?: number;
  role?: string;
}

interface PayoutItem {
  id: number;
  title: string;
  totalMembers: number;
  requestDate: string;
  userStatus: "pending" | "paid" | "unpaid";
  userAmount?: number;
}

interface MonthlyGroup {
  year: number;
  month: number;
  payouts: PayoutItem[];
}

const PayoutManageScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedClub, setSelectedClub] = useState<StoredClub | null>(null);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    } else {
      navigate("/login");
      return;
    }

    const storedClub = sessionStorage.getItem("selectedClub");
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, [navigate]);

  useEffect(() => {
    if (!selectedClub?.club_personal_id || !userData) return;

    loadPayouts();
  }, [selectedClub, userData]);

  const loadPayouts = async () => {
    if (!selectedClub?.club_user_id || !selectedClub?.club_personal_id) {
      setPayouts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 자신이 등록한 정산만 가져오기 (club_personal_id로 필터링)
      const { data, error } = await supabase
        .from("club_personal_payout")
        .select(
          `
          id,
          title,
          content,
          applied_date,
          created_at,
          club_user_id,
          club_personal_id,
          payout_participant (
            id,
            payout_amount,
            club_personal_id,
            status
          )
        `
        )
        .eq("club_user_id", selectedClub.club_user_id)
        .eq("club_personal_id", selectedClub.club_personal_id)
        .order("applied_date", { ascending: false });

      if (error) {
        console.error("정산 데이터 로드 오류:", error);
        setPayouts([]);
        return;
      }

      const mapped: PayoutItem[] = (data || []).map((payout: any) => {
        const requestDate =
          payout.applied_date ||
          payout.created_at ||
          new Date().toISOString().split("T")[0];
        const participants = payout.payout_participant || [];
        const totalMembers = participants.length;
        const currentMemberId = selectedClub.club_personal_id;
        const currentParticipant = participants.find(
          (participant: any) =>
            String(participant.club_personal_id) ===
            String(currentMemberId || "")
        );
        const status = currentParticipant?.status || "pending";

        return {
          id: payout.id,
          title: payout.title,
          totalMembers,
          requestDate,
          userStatus:
            status === "paid"
              ? "paid"
              : status === "unpaid"
              ? "unpaid"
              : "pending",
          userAmount: currentParticipant?.payout_amount,
        };
      });

      // 중복 제거
      const uniqueMap = new Map<number, PayoutItem>();
      mapped.forEach((item) => {
        uniqueMap.set(item.id, item);
      });

      setPayouts(Array.from(uniqueMap.values()));
    } catch (error) {
      console.error("정산 데이터 로드 중 오류:", error);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  // 월별 그룹핑
  const groupedPayouts = payouts.reduce((groups, payout) => {
    const date = new Date(payout.requestDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;

    if (!groups[key]) {
      groups[key] = {
        year,
        month,
        payouts: [],
      };
    }

    groups[key].payouts.push(payout);
    return groups;
  }, {} as Record<string, MonthlyGroup>);

  const monthlyGroups = Object.values(groupedPayouts).sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return b.month - a.month;
  });

  const getKoreanMonth = (month: number) => {
    const months = [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ];
    return months[month - 1];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  return (
    <div className="payout-manage-screen">
      {/* 헤더: 뒤로가기 버튼 */}
      <div className="payout-manage-header-back">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </div>

      <div className="payout-manage-content">
        {loading ? (
          <div className="payout-manage-loading">로딩 중...</div>
        ) : monthlyGroups.length === 0 ? (
          <div className="payout-manage-empty">
            <p>등록한 정산이 없습니다.</p>
          </div>
        ) : (
          monthlyGroups.map((group) => (
            <div key={`${group.year}-${group.month}`} className="payout-month-group">
              {/* 섹션 A: 연, 월 표시 */}
              <div className="payout-month-header">
                <h2 className="payout-month-title">
                  {group.year}년 {getKoreanMonth(group.month)}
                </h2>
              </div>

              {/* 섹션 B: 정산 리스트 */}
              <div className="payout-list">
                {group.payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="payout-item-card"
                    onClick={() => navigate(`/myclub/manage/payout/${payout.id}`)}
                  >
                    <div className="payout-item-content">
                      {/* 섹션 B-A: 총 인원 */}
                      <div className="payout-item-members">
                        총 {payout.totalMembers}명
                      </div>
                      {/* 섹션 B-B: 정산 이름 */}
                      <div className="payout-item-title">
                        {payout.title}
                      </div>
                      {/* 섹션 B-C: 정산 요청 날짜, 섹션 B-D: 자신의 정산 현황 (같은 줄) */}
                      <div className="payout-item-footer">
                        <span className="payout-item-date">
                          {new Date(payout.requestDate).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span
                          className={`payout-item-status ${
                            payout.userStatus === "paid"
                              ? "status-paid"
                              : payout.userStatus === "pending"
                              ? "status-pending"
                              : "status-unpaid"
                          }`}
                        >
                          {payout.userStatus === "paid"
                            ? "완료"
                            : payout.userStatus === "pending"
                            ? "대기"
                            : "미납"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomTabBar />
    </div>
  );
};

export default PayoutManageScreen;

