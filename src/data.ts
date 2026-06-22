import { PortfolioItem, DashboardChartData } from './types';

export const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: 1,
    title: "프리미엄 로봇청소기 '클린봇 X' 상세페이지",
    category: "테크",
    client: "넥스트가전",
    beforeRate: "1.1%",
    afterRate: "4.5%",
    increase: "309% 상승",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    tags: ["3D 기획", "심리 카피라이팅", "프리미엄 디자인"]
  },
  {
    id: 2,
    title: "유기농 비건 화장품 '아워그린' 런칭 패키지",
    category: "뷰티",
    client: "그린코스메틱",
    beforeRate: "0.8%",
    afterRate: "3.2%",
    increase: "300% 상승",
    imageUrl: "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80",
    tags: ["스토리텔링 기획", "소프트 비주얼", "모바일 최적화"]
  },
  {
    id: 3,
    title: "수제 글루텐프리 베이커리 '밀가루제로' 통합 상세페이지",
    category: "푸드",
    client: "밀가루제로 베이커리",
    beforeRate: "1.5%",
    afterRate: "5.1%",
    increase: "240% 상승",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    tags: ["구매 심리 자극", "고해상도 푸드 스타일링", "유지보수 멤버십"]
  },
  {
    id: 4,
    title: "애슬레저 브랜드 '러너스 하이' 레깅스 상세페이지",
    category: "패션",
    client: "러너스하이스포츠",
    beforeRate: "1.2%",
    afterRate: "4.2%",
    increase: "250% 상승",
    imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&q=80",
    tags: ["기능성 인포그래픽", "고객 설득 스토리", "프로페셔널 패키지"]
  }
];

export const DASHBOARD_CHART_DATA: DashboardChartData[] = [
  { name: "1주차", 일반상세: 1.2, 혁신상세: 1.2 },
  { name: "2주차", 일반상세: 1.3, 혁신상세: 2.8 },
  { name: "3주차", 일반상세: 1.1, 혁신상세: 3.9 },
  { name: "4주차", 일반상세: 1.2, 혁신상세: 4.8 },
];
