import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ClubJoinSuccessScreen.css";

const ClubJoinSuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const clubId = searchParams.get("club_id") || id;
  const [userData, setUserData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasAttemptedAutoJoin, setHasAttemptedAutoJoin] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
      } else {
        alert("로그인이 필요합니다.");
        navigate("/login");
      }
    };
    loadUserData();
  }, [navigate]);

  // 페이지 로드 시 자동으로 가입 신청 처리
  useEffect(() => {
    if (
      userData &&
      userData.type === "personal" &&
      clubId &&
      !hasAttemptedAutoJoin
    ) {
      setHasAttemptedAutoJoin(true);
      handleCompleteJoin(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, clubId, hasAttemptedAutoJoin]);

  const handleCompleteJoin = async (isAuto: boolean = false) => {
    if (!userData || userData.type !== "personal" || !clubId) {
      if (!isAuto) {
        alert("가입 신청을 완료할 수 없습니다.");
      }
      return;
    }

    setIsProcessing(true);
    try {
      // 이미 가입 신청한 경우 확인
      const { data: existingMembership } = await supabase
        .from("club_personal")
        .select("id")
        .eq("personal_user_id", userData.id)
        .eq("club_user_id", parseInt(clubId))
        .single();

      if (existingMembership) {
        if (!isAuto) {
          alert("이미 가입 신청하셨습니다.");
        }
        setIsCompleted(true);
        return;
      }

      // club_personal 테이블에 추가
      const { error: insertError } = await supabase
        .from("club_personal")
        .insert({
          personal_user_id: userData.id,
          club_user_id: parseInt(clubId),
          role: "member",
          approved: false,
        });

      if (insertError) {
        console.error("가입 신청 오류:", insertError);
        if (!isAuto) {
          alert("가입 신청 중 오류가 발생했습니다.");
        }
        return;
      }

      // 세션에서 대기 상태 제거
      sessionStorage.removeItem(`pending_join_${clubId}`);
      setIsCompleted(true);
    } catch (error) {
      console.error("가입 신청 처리 중 오류:", error);
      if (!isAuto) {
        alert("가입 신청 중 오류가 발생했습니다.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="club-join-success-screen">
      <div className="club-join-success-container">
        <div className="club-join-success-icon">✅</div>
        <h1 className="club-join-success-title">구글폼 제출 완료</h1>
        <p className="club-join-success-description">
          구글폼 제출이 완료되었습니다.
          <br />
          아래 버튼을 눌러 동아리 가입 신청을 완료해주세요.
        </p>
        {!isCompleted ? (
          <button
            className="club-join-success-btn"
            onClick={() => handleCompleteJoin(false)}
            disabled={isProcessing}
          >
            {isProcessing ? "처리 중..." : "가입 신청 완료"}
          </button>
        ) : (
          <div className="club-join-success-completed">
            <p>가입 신청이 완료되었습니다!</p>
            <p className="club-join-success-message">
              관리자의 승인 이후 활동하실 수 있습니다.
            </p>
            <button
              className="club-join-success-btn"
              onClick={() => navigate(`/community/club/${clubId}`)}
            >
              동아리 페이지로 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubJoinSuccessScreen;
