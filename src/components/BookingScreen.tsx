import React, { useState } from "react";
import Header from "./Header";
import BottomTabBar from "./BottomTabBar";
import "./BookingScreen.css";

type CategoryType = "회식" | "펜션" | "파티룸" | "장소 대관" | "식품" | "교통";

interface Store {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  hours: string;
  location: string;
  image: string;
  isAd?: boolean;
  badge?: string;
  distance?: string;
}

const BookingScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("회식");

  // 카테고리별 더미 데이터
  const categoryStores: Record<CategoryType, Store[]> = {
    회식: [
      {
        id: 1,
        name: "맛있는 회식장",
        rating: 4.8,
        reviewCount: 142,
        hours: "17:00~02:00",
        location: "홍대입구역 2번출구 도보 3분",
        image: "/profile-icon.png",
        isAd: true,
        distance: "0.5KM",
      },
      {
        id: 2,
        name: "고기집 대학로점",
        rating: 4.6,
        reviewCount: 89,
        hours: "16:00~24:00",
        location: "대학로역 1번출구 앞",
        image: "/profile-icon.png",
        badge: "단체 할인",
        distance: "1.2KM",
      },
      {
        id: 3,
        name: "해물찜 전문점",
        rating: 4.9,
        reviewCount: 256,
        hours: "17:30~23:00",
        location: "합정역 1번출구 인근",
        image: "/profile-icon.png",
        distance: "2.5KM",
      },
      {
        id: 4,
        name: "치킨&맥주",
        rating: 4.7,
        reviewCount: 123,
        hours: "16:00~01:00",
        location: "상수역 도보 5분",
        image: "/profile-icon.png",
        distance: "0.8KM",
      },
      {
        id: 5,
        name: "한정식 전문점",
        rating: 4.5,
        reviewCount: 67,
        hours: "12:00~22:00",
        location: "공덕역 10번출구 앞",
        image: "/profile-icon.png",
        distance: "1.5KM",
      },
    ],
    펜션: [
      {
        id: 11,
        name: "강원도 힐링 펜션",
        rating: 4.8,
        reviewCount: 234,
        hours: "체크인 15:00 / 체크아웃 11:00",
        location: "강원도 춘천시 남산면",
        image: "/profile-icon.png",
        isAd: true,
        distance: "80KM",
      },
      {
        id: 12,
        name: "경주 한옥 펜션",
        rating: 4.7,
        reviewCount: 156,
        hours: "체크인 16:00 / 체크아웃 11:00",
        location: "경주시 보문단지",
        image: "/profile-icon.png",
        badge: "조식 포함",
        distance: "350KM",
      },
      {
        id: 13,
        name: "제주 바다뷰 펜션",
        rating: 4.9,
        reviewCount: 312,
        hours: "체크인 15:00 / 체크아웃 11:00",
        location: "제주시 애월읍",
        image: "/profile-icon.png",
        distance: "450KM",
      },
      {
        id: 14,
        name: "가평 계곡 펜션",
        rating: 4.6,
        reviewCount: 189,
        hours: "체크인 15:00 / 체크아웃 11:00",
        location: "경기도 가평군",
        image: "/profile-icon.png",
        distance: "60KM",
      },
      {
        id: 15,
        name: "부산 해운대 펜션",
        rating: 4.8,
        reviewCount: 278,
        hours: "체크인 15:00 / 체크아웃 11:00",
        location: "부산시 해운대구",
        image: "/profile-icon.png",
        distance: "400KM",
      },
    ],
    파티룸: [
      {
        id: 21,
        name: "홍대 파티룸 스튜디오",
        rating: 4.7,
        reviewCount: 98,
        hours: "24시간 예약 가능",
        location: "홍대입구역 9번출구 도보 2분",
        image: "/profile-icon.png",
        isAd: true,
        distance: "0.3KM",
      },
      {
        id: 22,
        name: "강남 프리미엄 파티룸",
        rating: 4.9,
        reviewCount: 145,
        hours: "10:00~02:00",
        location: "강남역 2번출구 인근",
        image: "/profile-icon.png",
        badge: "최신 시설",
        distance: "8KM",
      },
      {
        id: 23,
        name: "이태원 루프탑 파티룸",
        rating: 4.6,
        reviewCount: 87,
        hours: "18:00~02:00",
        location: "이태원역 1번출구 도보 5분",
        image: "/profile-icon.png",
        distance: "6KM",
      },
      {
        id: 24,
        name: "합정 파티룸",
        rating: 4.5,
        reviewCount: 76,
        hours: "24시간 예약 가능",
        location: "합정역 2번출구 앞",
        image: "/profile-icon.png",
        distance: "2.2KM",
      },
      {
        id: 25,
        name: "대학로 파티룸",
        rating: 4.8,
        reviewCount: 112,
        hours: "14:00~24:00",
        location: "혜화역 3번출구 도보 3분",
        image: "/profile-icon.png",
        distance: "3KM",
      },
    ],
    "장소 대관": [
      {
        id: 31,
        name: "컨벤션 센터 대관",
        rating: 4.8,
        reviewCount: 234,
        hours: "09:00~22:00",
        location: "서울시 강남구",
        image: "/profile-icon.png",
        isAd: true,
        distance: "10KM",
      },
      {
        id: 33,
        name: "세미나실 대관",
        rating: 4.6,
        reviewCount: 156,
        hours: "08:00~20:00",
        location: "서울시 종로구",
        image: "/profile-icon.png",
        distance: "5KM",
      },
      {
        id: 34,
        name: "스튜디오 대관",
        rating: 4.9,
        reviewCount: 267,
        hours: "10:00~20:00",
        location: "서울시 마포구",
        image: "/profile-icon.png",
        distance: "1.5KM",
      },
      {
        id: 35,
        name: "야외 행사장 대관",
        rating: 4.5,
        reviewCount: 98,
        hours: "06:00~22:00",
        location: "경기도 고양시",
        image: "/profile-icon.png",
        distance: "25KM",
      },
    ],
    식품: [
      {
        id: 41,
        name: "신선한 과일 배송",
        rating: 4.8,
        reviewCount: 342,
        hours: "09:00~18:00",
        location: "서울시 강남구",
        image: "/profile-icon.png",
        isAd: true,
        badge: "당일 배송",
        distance: "8KM",
      },
      {
        id: 42,
        name: "유기농 채소 전문",
        rating: 4.7,
        reviewCount: 234,
        hours: "08:00~20:00",
        location: "서울시 마포구",
        image: "/profile-icon.png",
        distance: "2KM",
      },
      {
        id: 43,
        name: "수입 식품 전문점",
        rating: 4.9,
        reviewCount: 456,
        hours: "10:00~22:00",
        location: "서울시 강남구",
        image: "/profile-icon.png",
        badge: "신상품",
        distance: "10KM",
      },
      {
        id: 44,
        name: "건강식품 전문점",
        rating: 4.6,
        reviewCount: 178,
        hours: "09:00~21:00",
        location: "서울시 서초구",
        image: "/profile-icon.png",
        distance: "12KM",
      },
      {
        id: 45,
        name: "냉동식품 배송",
        rating: 4.5,
        reviewCount: 123,
        hours: "24시간 주문 가능",
        location: "서울시 송파구",
        image: "/profile-icon.png",
        distance: "15KM",
      },
    ],
    교통: [
      {
        id: 51,
        name: "프리미엄 렌터카",
        rating: 4.8,
        reviewCount: 567,
        hours: "24시간 예약 가능",
        location: "서울시 강남구",
        image: "/profile-icon.png",
        isAd: true,
        badge: "신차",
        distance: "8KM",
      },
      {
        id: 52,
        name: "장거리 버스 예약",
        rating: 4.7,
        reviewCount: 1234,
        hours: "06:00~24:00",
        location: "서울고속버스터미널",
        image: "/profile-icon.png",
        distance: "12KM",
      },
      {
        id: 53,
        name: "공항 리무진 예약",
        rating: 4.9,
        reviewCount: 890,
        hours: "05:00~23:00",
        location: "인천공항",
        image: "/profile-icon.png",
        badge: "할인",
        distance: "60KM",
      },
      {
        id: 54,
        name: "택시 예약 서비스",
        rating: 4.6,
        reviewCount: 456,
        hours: "24시간 운영",
        location: "서울 전역",
        image: "/profile-icon.png",
        distance: "0KM",
      },
      {
        id: 55,
        name: "화물 운송 서비스",
        rating: 4.5,
        reviewCount: 234,
        hours: "08:00~20:00",
        location: "서울시 마포구",
        image: "/profile-icon.png",
        distance: "2KM",
      },
    ],
  };

  const categories: CategoryType[] = [
    "회식",
    "펜션",
    "파티룸",
    "장소 대관",
    "식품",
    "교통",
  ];

  // 현재 선택된 카테고리의 상점 목록
  const stores = categoryStores[activeCategory] || [];

  return (
    <div className="booking-screen">
      <Header />

      {/* 탑 네비게이션: 카테고리 */}
      <div className="booking-category-nav">
        <div className="booking-category-scroll">
          {categories.map((category) => (
            <button
              key={category}
              className={`booking-category-item ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 상점 리스트 */}
      <div className="booking-content">
        <div className="booking-store-list">
          {stores.map((store) => (
            <div key={store.id} className="booking-store-card">
              {/* 상점 이미지 */}
              <div className="booking-store-image-wrapper">
                <img
                  src={store.image}
                  alt={store.name}
                  className="booking-store-image"
                />
                {store.badge && (
                  <div className="booking-store-badge">{store.badge}</div>
                )}
                {store.distance && (
                  <div className="booking-store-distance">
                    <span className="distance-icon">📍</span>
                    {store.distance}
                  </div>
                )}
                {store.isAd && <div className="booking-store-ad">AD</div>}
              </div>

              {/* 상점 정보 */}
              <div className="booking-store-info">
                <div className="booking-store-header">
                  <h3 className="booking-store-name">{store.name}</h3>
                  {store.isAd && (
                    <span className="booking-store-ad-badge">AD</span>
                  )}
                </div>

                <div className="booking-store-rating">
                  <span className="rating-star">⭐</span>
                  <span className="rating-value">
                    {store.rating} ({store.reviewCount})
                  </span>
                  <span className="rating-separator">|</span>
                  <span className="store-hours">{store.hours}</span>
                </div>

                <div className="booking-store-location">{store.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default BookingScreen;
