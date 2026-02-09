"use client";

import { useState, useRef, useEffect, type TouchEvent } from "react";
import { useRouter } from "next/navigation";
import { saveToLibrary } from "./lib/library";
import ShareCard from "./components/ShareCard";

type Scene = {
  heading: string;
  paragraphs: string[];
  imageUrl?: string; // 삽화 이미지 URL
};

type Universe = {
  id: string;
  name: string; // Universe 이름 (예: "파격 브로맨스", "사이다 복수")
  scene: Scene;
};

type Comment = {
  id: string;
  author: string;
  content: string;
  type: "orthodox" | "apostate"; // 정사 수호자 | 사도 혁명가
  likes: number;
  timeAgo: string;
};

type StoryComments = {
  bestComments: Comment[]; // 베스트 댓글
  generalComments: Comment[]; // 일반 댓글
  totalCount: number; // 총 댓글 수
};

type Story = {
  id: string;
  title: string; // 작품 제목 (예: "태오 vs 도진", "천마의 회귀", "사내 맞선")
  genre?: string;
  theme?: "dark" | "light";
  universes: Universe[]; // 이 작품의 여러 Universe
  comments: StoryComments; // 작품별 댓글 데이터
};

const INITIAL_SCENE: Scene = {
  heading: "제1장 · 결혼식장",
  paragraphs: [
    "결혼식이 막 시작되려던 그날, 신부는 신랑 도진이 자신의 언니와 바람났다는 사실을 알게 된다.",
    "식장 한켠에서 도진은 차갑게 파혼을 선언했고, 신부는 무대 위에 홀로 남겨진 채 하객들의 시선만을 받았다. 도진은 언니의 손을 잡은 채 식장을 떠났다.",
    '"미안해. 넌 내가 사랑하는 사람이 아니야."',
  ],
};

/** 작품(Story) 데이터 - 각 작품은 여러 Universe를 가짐 (하드코딩으로 고정) */
const STORIES: Story[] = [
  {
    id: "story-1",
    title: "태오 vs 도진",
    genre: "로맨스",
    theme: undefined,
    comments: {
      bestComments: [
        {
          id: "best-1",
          author: "유저1",
          content: "태오 집착 소름",
          type: "orthodox",
          likes: 342,
          timeAgo: "2시간 전",
        },
        {
          id: "best-2",
          author: "유저2",
          content: "도진아 도망쳐",
          type: "apostate",
          likes: 289,
          timeAgo: "5시간 전",
        },
      ],
      generalComments: [
        {
          id: "gen-1",
          author: "유저4",
          content: "태오 집착 소름",
          type: "orthodox",
          likes: 23,
          timeAgo: "3시간 전",
        },
        {
          id: "gen-2",
          author: "유저5",
          content: "도진아 도망쳐",
          type: "apostate",
          likes: 18,
          timeAgo: "6시간 전",
        },
      ],
      totalCount: 1245,
    },
    universes: [
      {
        id: "universe-0",
        name: "현재 우주",
        scene: { ...INITIAL_SCENE },
      },
      {
        id: "universe-a",
        name: "파격 브로맨스",
        scene: {
          heading: "제1장 · 결혼식장",
          paragraphs: [
            "결혼식이 막 시작되려던 그날, 신부는 신랑 도진이 자신의 언니와 바람났다는 사실을 알게 된다.",
            "식장 한켠에서 도진은 차갑게 파혼을 선언했고, 신부는 무대 위에 홀로 남겨진 채 하객들의 시선만을 받았다. 도진은 언니의 손을 잡은 채 식장을 떠났다.",
            "그 순간, 태오가 무대 위로 걸어 올랐다. 하객들의 숨소리가 멈추고, 도진만이 고개를 돌려 그를 바라봤다. 태오는 신부가 아니라, 도진을 향해 손을 내밀었다.",
            '"이번 생에는, 나한테로 와." 도진은 아무 말 없이 그 손을 바라만 보다가, 천천히 자신의 손을 올려 잡아당겼다.',
          ],
        },
      },
      {
        id: "universe-b",
        name: "사이다 복수",
        scene: {
          heading: "제1장 · 결혼식장",
          paragraphs: [
            "결혼식이 막 시작되려던 그날, 신부는 신랑 도진이 자신의 언니와 바람났다는 사실을 알게 된다.",
            "식장 한켠에서 도진은 차갑게 파혼을 선언했고, 신부는 무대 위에 홀로 남겨진 채 하객들의 시선만을 받았다. 도진은 언니의 손을 잡은 채 식장을 떠났다.",
            "하지만 신부는 눈물 한 방울 흘리지 않았다. 오히려 입가에 미소가 떠올랐다. 그녀는 무대에서 내려와, 하객들의 시선을 무시한 채 식장을 박차고 나갔다.",
            "밖으로 나온 그녀는 핸드폰을 꺼내 첫사랑의 번호를 눌렀다. '이제야 깨달았어. 진짜 사랑은 너였어.'",
          ],
        },
      },
      {
        id: "universe-c",
        name: "오해 풀기",
        scene: {
          heading: "제1장 · 결혼식장",
          paragraphs: [
            "결혼식이 막 시작되려던 그날, 신부는 신랑 도진이 자신의 언니와 바람났다는 사실을 알게 된다.",
            "식장 한켠에서 도진은 차갑게 파혼을 선언했고, 신부는 무대 위에 홀로 남겨진 채 하객들의 시선만을 받았다. 도진은 언니의 손을 잡은 채 식장을 떠났다.",
            "하지만 도진의 눈에는 고통이 가득했다. 그가 떠나기 직전, 신부에게 작은 쪽지를 던졌다. '협박받고 있어. 널 지키기 위해 떠나는 거야.'",
            "신부는 쪽지를 읽고 충격에 빠졌다. 도진은 사실 그녀를 구하기 위해 자신을 희생한 것이었다.",
          ],
        },
      },
    ],
  },
  {
    id: "story-2",
    title: "천마의 회귀",
    genre: "무협",
    theme: "dark",
    comments: {
      bestComments: [
        {
          id: "best-3",
          author: "유저6",
          content: "마교 가즈아!",
          type: "apostate",
          likes: 456,
          timeAgo: "1시간 전",
        },
        {
          id: "best-4",
          author: "유저7",
          content: "정파 위선자들 다 죽여라",
          type: "apostate",
          likes: 389,
          timeAgo: "3시간 전",
        },
      ],
      generalComments: [
        {
          id: "gen-3",
          author: "유저8",
          content: "마교 재림하나?",
          type: "apostate",
          likes: 67,
          timeAgo: "2시간 전",
        },
        {
          id: "gen-4",
          author: "유저9",
          content: "정파 위선자들 다 죽여라",
          type: "apostate",
          likes: 45,
          timeAgo: "4시간 전",
        },
      ],
      totalCount: 892,
    },
    universes: [
      {
        id: "universe-d-1",
        name: "정사(正史)의 굴레",
        scene: {
          heading: "제1장 · 천마의 각성",
          paragraphs: [
            "천마문의 폐허 위에 서서, 천마는 자신의 전생을 떠올렸다.",
            "정사(正史)에 따르면 그는 마교의 수장으로서 정파에 의해 처형당했어야 했다.",
            "하지만 지금, 그는 다시 태어났다. 그리고 이번에는 역사를 바꿀 수 있는 힘을 손에 넣었다.",
            '"정사(正史)를 뒤엎고 천마의 시대를 여시겠습니까?"',
          ],
        },
      },
      {
        id: "universe-d-2",
        name: "역천(逆天)의 길",
        scene: {
          heading: "제1장 · 천마의 각성",
          paragraphs: [
            "천마문의 폐허 위에 서서, 천마는 자신의 전생을 떠올렸다.",
            "정사(正史)에 따르면 그는 마교의 수장으로서 정파에 의해 처형당했어야 했다.",
            "하지만 지금, 그는 다시 태어났다. 그리고 이번에는 역사를 바꿀 수 있는 힘을 손에 넣었다.",
            "천마는 검을 뽑아들었다. '이번 생에는, 정파를 멸망시키고 천마문을 다시 일으키겠다.'",
          ],
        },
      },
    ],
  },
  {
    id: "story-3",
    title: "사내 맞선",
    genre: "현대 로코",
    theme: "light",
    comments: {
      bestComments: [
        {
          id: "best-5",
          author: "유저10",
          content: "이사님 직진 너무 설레요",
          type: "apostate",
          likes: 523,
          timeAgo: "30분 전",
        },
        {
          id: "best-6",
          author: "유저11",
          content: "로코 맛집이네",
          type: "apostate",
          likes: 412,
          timeAgo: "1시간 전",
        },
      ],
      generalComments: [
        {
          id: "gen-5",
          author: "유저12",
          content: "이사님 제 데이터도 가져가세요",
          type: "apostate",
          likes: 89,
          timeAgo: "2시간 전",
        },
        {
          id: "gen-6",
          author: "유저13",
          content: "로코 맛집이네",
          type: "apostate",
          likes: 76,
          timeAgo: "3시간 전",
        },
      ],
      totalCount: 1567,
    },
    universes: [
      {
        id: "universe-e-1",
        name: "완벽한 예측",
        scene: {
          heading: "제1장 · 완벽한 이사님",
          paragraphs: [
            "회사에 새로 부임한 AI 이사님은 모든 데이터를 완벽하게 분석했다.",
            "그의 예측에 따르면, 나는 다음 달에 승진하고, 3년 후에 결혼할 예정이었다.",
            "하지만 나는 그 완벽한 데이터에 변수를 입력하고 싶었다.",
            '"AI 이사님의 완벽한 데이터에 변수를 입력하세요."',
          ],
        },
      },
      {
        id: "universe-e-2",
        name: "예측 불가능",
        scene: {
          heading: "제1장 · 완벽한 이사님",
          paragraphs: [
            "회사에 새로 부임한 AI 이사님은 모든 데이터를 완벽하게 분석했다.",
            "그의 예측에 따르면, 나는 다음 달에 승진하고, 3년 후에 결혼할 예정이었다.",
            "하지만 나는 그 완벽한 데이터에 변수를 입력하고 싶었다.",
            "나는 AI 이사님의 데이터베이스에 접근했다. '이번에는 당신의 예측을 벗어나 보겠어요.'",
          ],
        },
      },
    ],
  },
];

/** 문단 텍스트에서 '도진' '태오' '서윤'을 강조용 span으로 감쌈 */
function highlightNames(text: string, uniqueKey: string) {
  const parts = text.split(/(도진|태오|서윤)/g);
  return parts.map((p, i) =>
    ["도진", "태오", "서윤"].includes(p) ? (
      <span key={`${uniqueKey}-highlight-${i}`} className="text-zinc-100">
        {p}
      </span>
    ) : (
      <span key={`${uniqueKey}-text-${i}`}>{p}</span>
    )
  );
}

export default function Home() {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scene, setScene] = useState<Scene>(INITIAL_SCENE);
  const [sceneKey, setSceneKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // 서재 저장 완료 상태
  
  // 작품(Story) 및 Universe 상태 관리
  const [stories, setStories] = useState<Story[]>(STORIES);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0); // 현재 작품 인덱스
  const [currentUniverseIndex, setCurrentUniverseIndex] = useState(0); // 현재 작품 내 Universe 인덱스
  
  // 현재 작품과 Universe 가져오기
  const currentStory = stories[currentStoryIndex];
  const currentUniverse = currentStory?.universes[currentUniverseIndex];
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeKey, setFadeKey] = useState(0); // 페이드 애니메이션용 키
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 스냅샷 상태 관리
  const [isCapturing, setIsCapturing] = useState(false); // 스냅샷 촬영 중 여부
  const [showSnapshot, setShowSnapshot] = useState(false); // 스냅샷 표시 여부
  
  // 공유 바텀 시트 상태
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  
  // 정사 개입 상태
  const [showHistoryEdit, setShowHistoryEdit] = useState(false); // 정사 수정 연출 표시
  
  // 댓글 정렬 및 페이지 상태
  const [commentSort, setCommentSort] = useState<"latest" | "helpful">("latest"); // 최신순 | 도움순
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  
  // 정사 vs 사도 확률 (시연용)
  const [orthodoxProbability, setOrthodoxProbability] = useState(48); // 정사 유지 확률 (%)
  const apostateProbability = 100 - orthodoxProbability; // 사도 전환 확률 (%)
  
  // 작품별 좋아요 수 및 애니메이션 상태 (하드코딩으로 고정)
  const [storyLikes, setStoryLikes] = useState<{ [key: string]: number }>({
    "story-1": 12500,
    "story-2": 8900,
    "story-3": 15200,
  });
  const [heartAnimations, setHeartAnimations] = useState<{ [key: string]: boolean }>({});
  
  // 인앱 브라우저 감지 및 안내 팝업 상태
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);
  
  // 인앱 브라우저 감지 (시연용 - 로그인 필요 시 안내)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      // 인앱 브라우저 감지 (카카오톡, 네이버, 인스타그램 등)
      const isInAppBrowser = 
        userAgent.includes("kakaotalk") ||
        userAgent.includes("naver") ||
        userAgent.includes("line") ||
        userAgent.includes("instagram") ||
        userAgent.includes("fban") || // Facebook
        userAgent.includes("fbav") || // Facebook
        (userAgent.includes("wv") && userAgent.includes("android")); // Android WebView
      
      // 로그인이 필요한 경우에만 경고 표시 (현재는 시연용으로 비활성화)
      // if (isInAppBrowser) {
      //   setShowBrowserWarning(true);
      // }
    }
  }, []);
  
  // 포인트 시스템 (수익 모델)
  const [userPoints, setUserPoints] = useState(1200); // 유저 보유 포인트 (하드코딩)
  const [unlockedSnapshots, setUnlockedSnapshots] = useState<Set<string>>(new Set([
    // 첫 번째 작품의 첫 번째 Universe는 기본으로 열려있음
    "story-1-universe-0",
  ]));
  
  // 스냅샷 잠금 해제 핸들러
  const handleUnlockSnapshot = (storyId: string, universeId: string, cost: number) => {
    const snapshotKey = `${storyId}-${universeId}`;
    if (userPoints >= cost && !unlockedSnapshots.has(snapshotKey)) {
      setUserPoints((prev) => prev - cost);
      setUnlockedSnapshots((prev) => new Set([...prev, snapshotKey]));
    }
  };
  
  // 좋아요 클릭 핸들러
  const handleLikeClick = (storyId: string) => {
    setStoryLikes((prev) => ({
      ...prev,
      [storyId]: (prev[storyId] || 0) + 1,
    }));
    setHeartAnimations((prev) => ({
      ...prev,
      [storyId]: true,
    }));
    setTimeout(() => {
      setHeartAnimations((prev) => ({
        ...prev,
        [storyId]: false,
      }));
    }, 600);
  };
  
  // 스와이프 관련
  const swipeRef = useRef<{ 
    startX: number; 
    startY: number; 
    isSwiping: boolean;
    scrollContainer: HTMLElement | null;
    isScrollingComments: boolean;
    startTime: number;
    lastMoveTime: number;
    lastMoveY: number;
    velocity: number;
  }>({
    startX: 0,
    startY: 0,
    isSwiping: false,
    scrollContainer: null,
    isScrollingComments: false,
    startTime: 0,
    lastMoveTime: 0,
    lastMoveY: 0,
    velocity: 0,
  });

  // 작품(Story) 전환 함수 - 상하 스와이프
  function goToStory(index: number) {
    if (isTransitioning || index < 0 || index >= stories.length) return;
    if (index === currentStoryIndex) return;
    
    setIsTransitioning(true);
    setShowSnapshot(false);
    setIsSaved(false);
    setFadeKey((k) => k + 1);
    
    setTimeout(() => {
      setCurrentStoryIndex(index);
      setCurrentUniverseIndex(0); // 작품 변경 시 첫 번째 Universe로 리셋
      setFadeKey((k) => k + 1);
      setTimeout(() => setIsTransitioning(false), 800); // 애니메이션 속도 0.8초로 증가 (300 -> 800)
    }, 200); // 초기 딜레이도 증가 (150 -> 200)
  }

  function goToPrevStory() {
    goToStory(currentStoryIndex - 1);
  }

  function goToNextStory() {
    goToStory(currentStoryIndex + 1);
  }

  // Universe 전환 함수 - 좌우 스와이프 (같은 작품 내)
  function goToUniverse(index: number) {
    if (!currentStory) return;
    if (isTransitioning || index < 0 || index >= currentStory.universes.length) return;
    if (index === currentUniverseIndex) return;
    
    setIsTransitioning(true);
    setShowSnapshot(false);
    setIsSaved(false);
    setFadeKey((k) => k + 1);
    
    setTimeout(() => {
      setCurrentUniverseIndex(index);
      setFadeKey((k) => k + 1);
      setTimeout(() => setIsTransitioning(false), 800); // 애니메이션 속도 0.8초로 증가 (300 -> 800)
    }, 200); // 초기 딜레이도 증가 (150 -> 200)
  }

  function goToPrevUniverse() {
    goToUniverse(currentUniverseIndex - 1);
  }

  function goToNextUniverse() {
    goToUniverse(currentUniverseIndex + 1);
  }

  // 댓글 영역 스크롤 상태 확인 함수
  function isCommentsScrolling(element: HTMLElement | null): boolean {
    if (!element) return false;
    
    // 댓글 영역인지 확인 (data-comments-section 속성 또는 클래스로 판단)
    const commentsSection = element.closest('[data-comments-section]');
    if (!commentsSection) return false;
    
    const scrollContainer = commentsSection as HTMLElement;
    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = scrollContainer.clientHeight;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10; // 10px 여유
    
    // 댓글 영역 내부에서 스크롤 중이고, 바닥에 도달하지 않았으면 true
    return !isAtBottom;
  }

  // 터치 시작 지점이 보호 영역인지 확인
  function isProtectedArea(element: HTMLElement | null): boolean {
    if (!element) return false;
    
    // 제목 영역 보호
    const titleArea = element.closest('[data-title-area]');
    if (titleArea) return true;
    
    // 스냅샷 버튼 영역 보호
    const snapshotButton = element.closest('[data-snapshot-button]');
    if (snapshotButton) return true;
    
    return false;
  }

  // 터치 이벤트 핸들러 - 상하 스와이프(작품), 좌우 스와이프(Universe)
  function handleTouchStart(e: TouchEvent) {
    if (isTransitioning) return;
    
    const target = e.target as HTMLElement;
    const now = Date.now();
    
    // 보호 영역 터치 시 스와이프 차단
    if (isProtectedArea(target)) {
      swipeRef.current.isSwiping = false;
      return;
    }
    
    // 댓글 영역 스크롤 중인지 확인
    swipeRef.current.isScrollingComments = isCommentsScrolling(target);
    
    swipeRef.current.startX = e.touches[0].clientX;
    swipeRef.current.startY = e.touches[0].clientY;
    swipeRef.current.isSwiping = false;
    swipeRef.current.scrollContainer = target.closest('.overflow-y-auto') as HTMLElement;
    swipeRef.current.startTime = now;
    swipeRef.current.lastMoveTime = now;
    swipeRef.current.lastMoveY = e.touches[0].clientY;
    swipeRef.current.velocity = 0;
  }

  function handleTouchMove(e: TouchEvent) {
    if (isTransitioning) return;
    
    const target = e.target as HTMLElement;
    const now = Date.now();
    const currentY = e.touches[0].clientY;
    
    // 보호 영역 터치 시 스와이프 차단
    if (isProtectedArea(target)) {
      swipeRef.current.isSwiping = false;
      return;
    }
    
    // 댓글 영역 스크롤 중이면 스와이프 완전히 차단
    if (swipeRef.current.isScrollingComments) {
      swipeRef.current.isSwiping = false;
      return;
    }
    
    // 댓글 영역 내부에서 손가락이 움직이고 있는지 확인
    const commentsSection = target.closest('[data-comments-section]');
    if (commentsSection) {
      const scrollContainer = swipeRef.current.scrollContainer;
      if (scrollContainer && isCommentsScrolling(scrollContainer)) {
        swipeRef.current.isSwiping = false;
        return;
      }
    }
    
    // 속도 계산 (관성 스크롤 감지용)
    const timeDelta = now - swipeRef.current.lastMoveTime;
    if (timeDelta > 0) {
      const moveDelta = Math.abs(currentY - swipeRef.current.lastMoveY);
      swipeRef.current.velocity = moveDelta / timeDelta; // px/ms
    }
    swipeRef.current.lastMoveTime = now;
    swipeRef.current.lastMoveY = currentY;
    
    if (!swipeRef.current.isSwiping) {
      const deltaX = Math.abs(e.touches[0].clientX - swipeRef.current.startX);
      const deltaY = Math.abs(e.touches[0].clientY - swipeRef.current.startY);
      
      // 스크롤 우선순위 강제: 상하 스크롤 거리가 100px 이하일 때는 페이지 전환 차단
      if (deltaY <= 100) {
        swipeRef.current.isSwiping = false;
        return;
      }
      
      // 상하 스와이프 우선 (작품 이동) - 임계값 대폭 상향 (60 -> 180)
      if (deltaY > deltaX && deltaY > 180) {
        swipeRef.current.isSwiping = true;
      } else if (deltaX > deltaY && deltaX > 180) {
        // 좌우 스와이프 (Universe 이동) - 임계값 대폭 상향
        swipeRef.current.isSwiping = true;
      }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (isTransitioning || !swipeRef.current.isSwiping) {
      swipeRef.current.isSwiping = false;
      swipeRef.current.isScrollingComments = false;
      swipeRef.current.velocity = 0;
      return;
    }
    
    const target = e.target as HTMLElement;
    const now = Date.now();
    const touchDuration = now - swipeRef.current.startTime;
    
    // 보호 영역 터치 시 스와이프 차단
    if (isProtectedArea(target)) {
      swipeRef.current.isSwiping = false;
      swipeRef.current.isScrollingComments = false;
      swipeRef.current.velocity = 0;
      return;
    }
    
    // 댓글 영역 스크롤 중이면 스와이프 완전히 차단
    if (swipeRef.current.isScrollingComments) {
      swipeRef.current.isSwiping = false;
      swipeRef.current.isScrollingComments = false;
      swipeRef.current.velocity = 0;
      return;
    }
    
    // 댓글 영역 내부에서 손가락이 움직이고 있었는지 확인
    const commentsSection = target.closest('[data-comments-section]');
    if (commentsSection) {
      const scrollContainer = swipeRef.current.scrollContainer;
      if (scrollContainer && isCommentsScrolling(scrollContainer)) {
        swipeRef.current.isSwiping = false;
        swipeRef.current.isScrollingComments = false;
        swipeRef.current.velocity = 0;
        return;
      }
    }
    
    // 관성 스크롤 처리 - 속도가 너무 빠르면 (스크롤 관성) 페이지 전환 차단
    // 속도 임계값: 0.5px/ms 이상이면 관성 스크롤로 판단 (더 엄격하게)
    if (swipeRef.current.velocity > 0.5) {
      swipeRef.current.isSwiping = false;
      swipeRef.current.isScrollingComments = false;
      swipeRef.current.velocity = 0;
      return;
    }
    
    // 터치 시간이 너무 짧으면 (200ms 미만) 실수로 판단하고 차단
    if (touchDuration < 200) {
      swipeRef.current.isSwiping = false;
      swipeRef.current.isScrollingComments = false;
      swipeRef.current.velocity = 0;
      return;
    }
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - swipeRef.current.startX;
    const deltaY = endY - swipeRef.current.startY;
    
    // 스크롤 우선순위 강제: 상하 스크롤 거리가 100px 이하일 때는 페이지 전환 차단
    if (Math.abs(deltaY) <= 100) {
      swipeRef.current.isSwiping = false;
      swipeRef.current.isScrollingComments = false;
      swipeRef.current.velocity = 0;
      return;
    }
    
    const threshold = 600; // 임계값 3배 상향 (200 -> 600)

    // 상하 스와이프 = 작품 이동
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        goToPrevStory();
      } else {
        goToNextStory();
      }
    }
    // 좌우 스와이프 = Universe 이동
    else if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        goToPrevUniverse();
      } else {
        goToNextUniverse();
      }
    }
    
    swipeRef.current.isSwiping = false;
    swipeRef.current.isScrollingComments = false;
    swipeRef.current.velocity = 0;
  }

  async function handleRevolution() {
    const trimmed = userInput.trim();
    if (!trimmed || loading) return;

    if (!currentUniverse || !currentUniverse.scene) return;

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: trimmed,
          currentHeading: currentUniverse.scene.heading || "",
          currentParagraphs: Array.isArray(currentUniverse.scene.paragraphs) 
            ? currentUniverse.scene.paragraphs 
            : [],
          universeIndex: currentUniverseIndex, // 유저가 선택한 유니버스 번호 기록
          universeName: currentUniverse.name || "", // 유니버스 이름 기록
        }),
      });

      if (!res.ok) {
        console.error("[역성혁명] API 오류");
        return;
      }

      const data = await res.json();

      // 데이터 유효성 검사
      if (!data || typeof data.heading !== "string" || !Array.isArray(data.paragraphs)) {
        console.error("[역성혁명] 잘못된 응답 형식");
        return;
      }

      // 현재 작품의 현재 Universe 장면 업데이트
      setStories((prev) => {
        return prev.map((story, sIdx) => {
          if (sIdx === currentStoryIndex) {
            return {
              ...story,
              universes: story.universes.map((u, uIdx) => {
                if (uIdx === currentUniverseIndex) {
                  return {
                    ...u,
                    scene: {
                      heading: data.heading,
                      paragraphs: [...data.paragraphs],
                      imageUrl: data.imageUrl && typeof data.imageUrl === "string" ? data.imageUrl : undefined,
                    },
                  };
                }
                return u;
              }),
            };
          }
          return story;
        });
      });
      setScene({ 
        heading: data.heading, 
        paragraphs: data.paragraphs,
        imageUrl: data.imageUrl && typeof data.imageUrl === "string" ? data.imageUrl : undefined,
      });
      setSceneKey((k) => k + 1);
      setFadeKey((k) => k + 1);
      setUserInput("");
    } catch (err) {
      console.error("[역성혁명] 요청 실패:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSnapshot() {
    if (isCapturing) return;
    
    if (!currentUniverse) return;
    
    setIsCapturing(true);
    
    try {
      const res = await fetch("/api/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heading: currentUniverse.scene.heading,
          paragraphs: currentUniverse.scene.paragraphs,
        }),
      });

      if (!res.ok) {
        console.error("[스냅샷] API 오류");
        return;
      }

      const data = await res.json();

      // 이미지 URL이 있을 때만 업데이트
      if (data && data.imageUrl && typeof data.imageUrl === "string") {
        // 현재 작품의 현재 Universe 이미지 업데이트
        setStories((prev) => {
          return prev.map((story, sIdx) => {
            if (sIdx === currentStoryIndex) {
              return {
                ...story,
                universes: story.universes.map((u, uIdx) => {
                  if (uIdx === currentUniverseIndex) {
                    return {
                      ...u,
                      scene: {
                        ...u.scene,
                        imageUrl: data.imageUrl,
                      },
                    };
                  }
                  return u;
                }),
              };
            }
            return story;
          });
        });
        
        // 스냅샷 표시
        setShowSnapshot(true);
        setFadeKey((k) => k + 1); // 카드 새로고침
      }
    } catch (err) {
      console.error("[스냅샷] 요청 실패:", err);
    } finally {
      setIsCapturing(false);
    }
  }
  
  // 이미지 로드 실패 시 처리 (안전하게)
  function handleImageError(universeId: string) {
    try {
      setStories((prev) => {
        return prev.map((story) => ({
          ...story,
          universes: story.universes.map((u) => {
            if (u.id === universeId) {
              return {
                ...u,
                scene: {
                  ...u.scene,
                  imageUrl: undefined, // 이미지 로드 실패 시 제거
                },
              };
            }
            return u;
          }),
        }));
      });
    } catch (err) {
      console.error("[이미지 에러 처리 실패]", err);
    }
  }

  // 내 서재에 저장
  function handleSaveToLibrary() {
    if (!currentUniverse || !currentUniverse.scene) return;

    setIsSaving(true);
    try {
      // 현재 표시 중인 이미지 URL 결정 (스냅샷 우선)
      let imageUrlToSave: string | undefined = undefined;
      if (showSnapshot && currentUniverse.scene.imageUrl) {
        imageUrlToSave = currentUniverse.scene.imageUrl;
      } else if (currentStoryIndex === 0 && currentUniverseIndex === 0) {
        imageUrlToSave = "/images/sample-1.png";
      } else if (currentStoryIndex === 0 && currentUniverseIndex === 1) {
        imageUrlToSave = "/images/sample-2.png";
      }
      
      const result = saveToLibrary({
        universeName: currentUniverse.name,
        heading: currentUniverse.scene.heading,
        paragraphs: currentUniverse.scene.paragraphs,
        imageUrl: imageUrlToSave,
      });
      
      if (result === null) {
        // 중복 저장 시도
        alert("이미 서재에 저장된 유니버스입니다.");
        setIsSaving(false);
      } else {
        // 저장 성공 - 버튼 상태 변경
        setIsSaved(true);
        setTimeout(() => {
          setIsSaving(false);
        }, 500);
      }
    } catch (err) {
      console.error("[서재 저장 실패]", err);
      setIsSaving(false);
    }
  }

  return (
    <>
      {/* 인앱 브라우저 안내 팝업 */}
      {showBrowserWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowBrowserWarning(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="닫기"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <div className="mb-4 text-4xl">⚠️</div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">브라우저 안내</h3>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                현재 인앱 브라우저에서는 일부 기능이 제한될 수 있습니다.
                <br />
                <span className="text-amber-400 font-semibold">Chrome이나 Safari 브라우저에서 열어주세요.</span>
              </p>
              <button
                type="button"
                onClick={() => setShowBrowserWarning(false)}
                className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      
    <div className="h-screen overflow-hidden bg-[#050508]">
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-violet-950/15 via-transparent to-cyan-950/5"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(100,60,180,0.12),transparent)]"
        aria-hidden
      />

      <div className="mx-auto flex w-full max-w-md flex-col bg-[#050508] relative h-screen overflow-hidden">
        {/* 우측 점 내비게이션 - 작품(Story) 리스트 */}
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
          {stories.map((story, idx) => (
            <button
              key={story.id}
              type="button"
              onClick={() => {
                const container = scrollContainerRef.current;
                if (container) {
                  const card = container.children[idx] as HTMLElement;
                  if (card) {
                    card.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }
                goToStory(idx);
              }}
              className={`relative transition-all duration-300 ${
                currentStoryIndex === idx
                  ? "scale-125" 
                  : "scale-100 hover:scale-110"
              }`}
              aria-label={`작품 ${idx + 1}: ${story.title}`}
            >
              {/* 외부 링 */}
              <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                currentStoryIndex === idx
                  ? "bg-violet-400/30 blur-sm scale-150"
                  : "bg-transparent"
              }`} />
              {/* 내부 점 */}
              <div className={`relative rounded-full transition-all duration-300 ${
                currentStoryIndex === idx
                  ? "h-3 w-3 bg-gradient-to-br from-violet-400 to-violet-600 shadow-lg shadow-violet-500/50 border-2 border-violet-300"
                  : "h-2 w-2 bg-zinc-600/60 hover:bg-zinc-500/80 border border-zinc-500/30"
              }`} />
            </button>
          ))}
        </div>

        <main className="relative flex flex-col" style={{ height: "100vh", overflow: "hidden" }}>
          <header className="fixed top-0 left-0 right-0 z-40 px-4 pt-[env(safe-area-inset-top)] pt-5 pb-2 bg-[#050508]/80 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1" />
              <div className="flex-1 text-center">
                <h1 className="text-xs font-medium tracking-[0.25em] text-zinc-500 uppercase">
                  What If
                </h1>
                <p className="mt-0.5 text-[11px] text-zinc-600">{currentStory?.title || ""}</p>
              </div>
              <div className="flex-1 flex justify-end items-center gap-3">
                {/* 잔여 포인트 표시 */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-900/30 via-yellow-800/20 to-yellow-900/30 border border-yellow-500/40 backdrop-blur-sm">
                  <span className="text-base">💎</span>
                  <span className="text-[12px] font-bold text-[#FFD700]">
                    {userPoints.toLocaleString()}P
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/library")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-zinc-300 active:scale-95"
                  aria-label="내 서재"
                  title="내 서재"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {/* Universe 네비게이션 - 좌우 화살표 (같은 작품 내 Universe 이동) */}
            {currentStory && currentStory.universes.length > 1 && (
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={goToPrevUniverse}
                  disabled={currentUniverseIndex === 0 || isTransitioning}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all active:scale-95 hover:bg-white/10 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed"
                  aria-label="이전 Universe"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-[13px] font-semibold text-zinc-300 min-w-[110px] text-center">
                  Universe #{currentUniverseIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={goToNextUniverse}
                  disabled={
                    currentUniverseIndex === currentStory.universes.length - 1 || isTransitioning
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all active:scale-95 hover:bg-white/10 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed"
                  aria-label="다음 Universe"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </header>


          {/* 스크롤 컨테이너 - 스냅 스크롤 적용 (상하 스와이프 = 작품 이동) */}
          <div
            ref={scrollContainerRef}
            className="overflow-y-auto snap-y snap-mandatory relative"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "y mandatory",
              height: "calc(100vh - 80px)", // 헤더 높이 제외
              overflowY: "scroll",
            }}
            onScroll={(e) => {
              const container = e.currentTarget;
              const scrollTop = container.scrollTop;
              const cardHeight = container.clientHeight;
              const currentIndex = Math.round(scrollTop / cardHeight);
              if (currentIndex !== currentStoryIndex && currentIndex >= 0 && currentIndex < stories.length) {
                setCurrentStoryIndex(currentIndex);
                setCurrentUniverseIndex(0); // 작품 변경 시 첫 번째 Universe로 리셋
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* 가이드 문구 */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <p className="text-[10px] text-zinc-500/70 text-center px-4 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                위아래로 스와이프하여 다른 작품 탐험
              </p>
            </div>

            {/* 모든 작품(Story)을 스택 레이아웃으로 렌더링 */}
            {stories.map((story, storyIdx) => {
              if (!story || !story.universes || story.universes.length === 0) return null;
              
              const isStoryActive = storyIdx === currentStoryIndex;
              const isStoryNext = storyIdx === currentStoryIndex + 1;
              const isStoryPrev = storyIdx === currentStoryIndex - 1;
              
              // 현재 작품의 현재 Universe 가져오기
              const currentUniverseForStory = story.universes[currentUniverseIndex] || story.universes[0];
              
              // 테마별 배경색 결정
              const themeBg = story.theme === "dark" 
                ? "bg-gradient-to-b from-zinc-900 via-black to-zinc-900"
                : story.theme === "light"
                ? "bg-gradient-to-b from-pink-950/30 via-rose-900/20 to-pink-950/30"
                : "bg-gradient-to-b from-white/[0.05] to-white/[0.02]";
              
              return (
                <div
                  key={`story-${story.id}-${storyIdx}`}
                  className="snap-start snap-always w-full relative"
                  style={{
                    height: "calc(100vh - 80px)", // 헤더 높이 제외
                    minHeight: "calc(100vh - 80px)",
                    maxHeight: "calc(100vh - 80px)",
                  }}
                >
                  {/* 카드 컨테이너 - 화면 전체를 차지 */}
                  <div
                    className={`relative w-full h-full ${themeBg} transition-all duration-500`}
                    style={{
                      height: "100%",
                    }}
                  >
                    {/* 반투명 검은색 레이어 - 가독성 향상 */}
                    <div className="absolute inset-0 bg-black/40 pointer-events-none z-10" />
                    
                    {/* 본문 + 댓글을 담는 스크롤 가능한 컨테이너 */}
                    <div 
                      className="relative w-full h-full overflow-y-auto z-20" 
                      style={{ 
                        scrollbarWidth: "thin", 
                        scrollbarColor: "rgba(255,255,255,0.1) transparent" 
                      }}
                      onTouchStart={isStoryActive ? handleTouchStart : undefined}
                      onTouchMove={isStoryActive ? handleTouchMove : undefined}
                      onTouchEnd={isStoryActive ? handleTouchEnd : undefined}
                    >
                      {/* 본문 영역 - 삽화와 텍스트 */}
                      <div className="relative flex flex-col p-5 sm:p-6 pt-[120px] sm:pt-[140px]">
                        {/* 상단 뱃지 - 주간 랭킹 또는 급상승 */}
                        <div className="mb-4 flex gap-2">
                          {storyIdx === 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400/20 via-yellow-500/20 to-yellow-400/20 border border-yellow-400/50 text-yellow-200 text-[10px] font-bold shadow-lg backdrop-blur-sm">
                              <span className="text-sm">🏆</span>
                              주간 랭킹 1위
                            </span>
                          ) : storyIdx === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 border border-red-400/50 text-red-200 text-[10px] font-bold shadow-lg backdrop-blur-sm">
                              <span className="text-sm">🔥</span>
                              급상승
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border border-purple-400/50 text-purple-200 text-[10px] font-bold shadow-lg backdrop-blur-sm">
                              <span className="text-sm">⭐</span>
                              신작 베스트
                            </span>
                          )}
                        </div>
                        
                        {/* 작품 제목 - 카드 상단에 크게 표시 */}
                        <div className="mb-4" data-title-area>
                          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-2 leading-tight">
                            &lt;{story.title}&gt;
                          </h2>
                          {story.genre && (
                            <p className="text-[11px] sm:text-[12px] font-medium uppercase tracking-widest text-violet-400/70">
                              {story.genre}
                            </p>
                          )}
                        </div>
                        
                        {/* 실시간 지표 바 */}
                        <div className="mb-6 flex flex-wrap items-center gap-4 px-3 py-2.5 bg-gradient-to-r from-purple-900/20 via-violet-900/20 to-purple-900/20 border border-purple-500/30 rounded-lg backdrop-blur-sm">
                          {/* 좋아요 */}
                          <button
                            type="button"
                            onClick={() => handleLikeClick(story.id)}
                            className="flex items-center gap-1.5 group cursor-pointer active:scale-95 transition-transform"
                          >
                            <span className={`text-base transition-transform duration-300 ${heartAnimations[story.id] ? "animate-[heart-pop_0.6s_ease-out]" : ""}`}>
                              ❤️
                            </span>
                            <span className={`text-[12px] font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-pink-200 transition-all ${heartAnimations[story.id] ? "scale-110" : ""}`}>
                              {(() => {
                                const likes = storyLikes[story.id] || (storyIdx === 0 ? 12500 : storyIdx === 1 ? 8900 : 15200);
                                return likes >= 1000 ? `${(likes / 1000).toFixed(1)}k` : likes.toLocaleString();
                              })()}
                            </span>
                          </button>
                          
                          {/* 조회수 */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">👁️</span>
                            <span className="text-[12px] font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                              {storyIdx === 0 ? "890k" : storyIdx === 1 ? "456k" : "1.2M"}
                            </span>
                          </div>
                          
                          {/* 정사/사도 전쟁 참여 */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">⚔️</span>
                            <span className="text-[12px] font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                              {storyIdx === 0 ? "4,200" : storyIdx === 1 ? "2,800" : "5,600"}명
                            </span>
                          </div>
                        </div>
                        
                        {/* Universe 제목 영역 */}
                        {isStoryActive && currentUniverseForStory && (
                          <div className="mb-4">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-violet-400/90">
                              {currentUniverseForStory.scene.heading}
                            </p>
                            <p className="mt-1 text-[9px] text-zinc-600 animate-[scene-replace_0.3s_ease-out_both]">
                              {currentUniverseForStory.name}
                            </p>
                          </div>
                        )}
                        
                        {/* 폴라로이드 스냅샷 - 제목 바로 아래, 상단 고정 (relative로 텍스트를 자연스럽게 밀어냄) */}
                        {isStoryActive && currentUniverseForStory && (() => {
                        // Universe별 강제 이미지 매칭
                        let displayImageUrl: string | undefined = undefined;
                        if (storyIdx === 0 && currentUniverseIndex === 0) {
                          displayImageUrl = "/images/sample-1.png";
                        } else if (storyIdx === 0 && currentUniverseIndex === 1) {
                          displayImageUrl = "/images/sample-2.png";
                        } else if (showSnapshot && currentUniverseForStory.scene.imageUrl && storyIdx === currentStoryIndex) {
                          displayImageUrl = currentUniverseForStory.scene.imageUrl;
                        }
                        
                        return displayImageUrl ? (
                          <div 
                            className={`mt-4 mb-8 flex justify-center items-center relative ${
                              showSnapshot && storyIdx === currentStoryIndex
                                ? "animate-[snapshot-develop_0.8s_ease-out_both]"
                                : "animate-[scene-replace_0.5s_ease-out_both]"
                            }`}
                          >
                            {/* 공유 버튼 (스냅샷 이미지 옆) */}
                            {storyIdx === currentStoryIndex && (
                              <button
                                type="button"
                                onClick={() => setIsShareSheetOpen(true)}
                                className="absolute -right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white shadow-lg transition-all hover:bg-black/80 hover:scale-110 active:scale-95"
                                aria-label="공유하기"
                                title="공유하기"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                  />
                                </svg>
                              </button>
                            )}
                            <div 
                              id={storyIdx === currentStoryIndex ? "snapshot-card" : undefined}
                              className="relative w-[70%] max-w-[266px] bg-white p-3 shadow-[0_16px_48px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.3)] rounded-sm transition-all duration-500 ease-out transform rotate-[-2deg]"
                            >
                              {/* 흰색 테두리 (폴라로이드 프레임) */}
                              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900 border-2 border-white">
                                {(() => {
                                  const snapshotKey = `${story.id}-${currentUniverseForStory.id}`;
                                  const isUnlocked = unlockedSnapshots.has(snapshotKey);
                                  const snapshotCost = storyIdx === 0 ? 50 : storyIdx === 1 ? 100 : 300;
                                  
                                  if (!isUnlocked) {
                                    return (
                                      <>
                                        <img
                                          src={displayImageUrl}
                                          alt={`${currentUniverseForStory.scene.heading || "장면"} 삽화`}
                                          className="h-full w-full object-cover blur-md"
                                          loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                          <button
                                            type="button"
                                            onClick={() => handleUnlockSnapshot(story.id, currentUniverseForStory.id, snapshotCost)}
                                            disabled={userPoints < snapshotCost}
                                            className={`px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 border-2 border-yellow-300 text-yellow-900 text-sm font-bold shadow-[0_4px_20px_rgba(255,215,0,0.4)] transition-all ${
                                              userPoints >= snapshotCost
                                                ? "hover:scale-105 active:scale-95 cursor-pointer"
                                                : "opacity-50 cursor-not-allowed"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-lg">💎</span>
                                              <span>포인트로 스냅샷 확인하기</span>
                                              <span className="text-xs">({snapshotCost}P)</span>
                                            </div>
                                          </button>
                                        </div>
                                      </>
                                    );
                                  }
                                  
                                  return (
                                    <>
                                      <img
                                        src={displayImageUrl}
                                        alt={`${currentUniverseForStory.scene.heading || "장면"} 삽화`}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                        onError={() => {
                                          try {
                                            handleImageError(currentUniverseForStory.id);
                                            if (showSnapshot) {
                                              setShowSnapshot(false);
                                            }
                                          } catch (err) {
                                            console.error("[이미지 에러]", err);
                                          }
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/15 pointer-events-none" />
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                      
                      {/* 본문 텍스트 - 이미지가 있으면 자연스럽게 아래로 밀려남 */}
                      {isStoryActive && currentUniverseForStory && (
                        <div className="space-y-5 text-[17px] leading-[1.82] text-zinc-300 animate-[scene-replace_0.5s_ease-out_0.3s_both]">
                          {Array.isArray(currentUniverseForStory.scene.paragraphs) && currentUniverseForStory.scene.paragraphs.length > 0
                            ? currentUniverseForStory.scene.paragraphs.map((para, i) => {
                                if (typeof para !== "string") return null;
                                return (
                                  <p
                                    key={`${currentUniverseForStory.id}-para-${i}-${fadeKey}`}
                                    className={
                                      i === currentUniverseForStory.scene.paragraphs.length - 1
                                        ? "text-zinc-400"
                                        : undefined
                                    }
                                  >
                                    {highlightNames(para, `${currentUniverseForStory.id}-para-${i}-${fadeKey}`)}
                                  </p>
                                );
                              })
                            : null}
                        </div>
                      )}
                      
                      {/* 입력창 및 버튼 (활성 카드에만 표시) */}
                      {isStoryActive && currentUniverseForStory && (
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                          <p className="text-center text-[13px] text-zinc-500">
                            {story.theme === "dark" 
                              ? "정사(正史)를 뒤엎고 천마의 시대를 여시겠습니까?"
                              : story.theme === "light"
                              ? "AI 이사님의 완벽한 데이터에 변수를 입력하세요."
                              : "이 비극적인 운명을 어떻게 뒤엎으시겠습니까?"}
                          </p>
                          
                          {/* 정사 개입 버튼 그룹 (첫 번째 작품의 첫 번째 Universe에서만 활성화) */}
                          {storyIdx === 0 && currentUniverseIndex === 0 && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowHistoryEdit(true);
                                  setTimeout(() => setShowHistoryEdit(false), 3000);
                                }}
                                className="group flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-3 py-2 text-[12px] font-medium text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.95]"
                                aria-label="정사 수정"
                              >
                                <span className="text-base leading-none">🏛️</span>
                                <span className="hidden sm:inline">정사 수정</span>
                              </button>
                              <button
                                type="button"
                                className="group flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-3 py-2 text-[12px] font-medium text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.95] opacity-50 cursor-not-allowed"
                                aria-label="기억 조작 (준비 중)"
                                disabled
                              >
                                <span className="text-base leading-none">🧠</span>
                                <span className="hidden sm:inline">기억 조작</span>
                              </button>
                              <button
                                type="button"
                                className="group flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-3 py-2 text-[12px] font-medium text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.95] opacity-50 cursor-not-allowed"
                                aria-label="관측소 (준비 중)"
                                disabled
                              >
                                <span className="text-base leading-none">👁️</span>
                                <span className="hidden sm:inline">관측소</span>
                              </button>
                            </div>
                          )}
                          
                          {/* 스냅샷 포인트 버튼 - 입력창 바로 위, 왼쪽 정렬 */}
                          {isStoryActive && currentUniverseForStory && (() => {
                            const snapshotKey = `${story.id}-${currentUniverseForStory.id}`;
                            const isUnlocked = unlockedSnapshots.has(snapshotKey);
                            const snapshotCost = storyIdx === 0 ? 50 : storyIdx === 1 ? 100 : 300;
                            
                            // 시연을 위해 항상 표시 (잠금 해제 여부와 관계없이)
                            return (
                              <div className="relative z-50 mb-3" data-snapshot-button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!isUnlocked) {
                                      handleUnlockSnapshot(story.id, currentUniverseForStory.id, snapshotCost);
                                    } else {
                                      // 잠금 해제된 경우 스냅샷 생성 실행
                                      handleSnapshot();
                                    }
                                  }}
                                  disabled={!isUnlocked && userPoints < snapshotCost}
                                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-black/80 border border-white/20 text-white transition-all shadow-[0_2px_8px_rgba(255,255,255,0.1)] ring-1 ring-cyan-400/30 ${
                                    isUnlocked || userPoints >= snapshotCost
                                      ? "hover:bg-black/90 hover:border-white/30 hover:shadow-[0_4px_12px_rgba(255,255,255,0.15)] hover:ring-cyan-400/50 active:scale-95 cursor-pointer"
                                      : "opacity-50 cursor-not-allowed"
                                  }`}
                                >
                                  <span className="text-sm font-medium">
                                    📸 스냅샷 15피스
                                  </span>
                                </button>
                              </div>
                            );
                          })()}
                          
                          <div className="flex gap-2 relative">
                            <input
                              type="text"
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && userInput.trim() && !loading) {
                                  e.preventDefault();
                                  handleRevolution();
                                }
                              }}
                              placeholder="한 줄로 당신의 선택을 적어보세요"
                              maxLength={120}
                              disabled={loading}
                              className="flex-1 min-h-[48px] rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 pr-14 text-[16px] text-zinc-200 placeholder:text-zinc-500 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                              aria-label="운명을 뒤엎을 한 줄 입력"
                            />
                            <button
                              type="button"
                              onClick={handleRevolution}
                              disabled={!userInput.trim() || loading}
                              className="absolute right-2 top-1/2 -translate-y-1/2 flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-zinc-400 transition-all hover:bg-white/[0.08] hover:text-zinc-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                              aria-label="전송"
                              title="전송"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handleRevolution}
                            disabled={!userInput.trim() || loading}
                            className="group relative flex w-full min-h-[56px] items-center justify-center gap-2 overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-r from-amber-500/20 via-orange-500/18 to-amber-500/20 px-5 py-4 text-center text-[16px] font-semibold leading-tight text-amber-200 shadow-[0_0_40px_-8px_rgba(251,191,36,0.25)] transition-all duration-200 active:scale-[0.92] active:duration-100 disabled:pointer-events-none disabled:opacity-50"
                            aria-label={loading ? "생성 중" : "역성혁명 실행"}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent transition-transform duration-500 group-hover:translate-x-full [background-size:200%_100%]" />
                            <span className="relative flex items-center justify-center gap-2">
                              {loading ? "로딩 중..." : (
                                <>
                                  <span className="text-xl" aria-hidden>⚡</span>
                                  <span className="tracking-tight">역성혁명</span>
                                </>
                              )}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveToLibrary}
                            disabled={isSaving || isSaved}
                            className={`flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-center text-[14px] font-medium transition-all duration-200 active:scale-[0.92] active:duration-100 disabled:pointer-events-none ${
                              isSaved
                                ? "border-green-500/40 bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-green-500/20 text-green-200"
                                : "border-violet-500/30 bg-gradient-to-r from-violet-500/15 via-purple-500/12 to-violet-500/15 text-violet-200"
                            } ${isSaving ? "opacity-50" : ""}`}
                            aria-label={isSaving ? "저장 중" : isSaved ? "소장 완료" : "내 서재에 소장하기"}
                          >
                            {isSaving ? (
                              <>
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>저장 중...</span>
                              </>
                            ) : isSaved ? (
                              <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>소장 완료 ✓</span>
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                <span>내 서재에 소장하기</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsShareSheetOpen(true)}
                            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/15 via-blue-500/12 to-cyan-500/15 px-4 py-3 text-center text-[14px] font-medium text-cyan-200 transition-all duration-200 active:scale-[0.92] active:duration-100"
                            aria-label="공유하기"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span>공유하기</span>
                          </button>
                        </div>
                      )}
                      
                      {/* 댓글 영역 - 본문 바로 아래에 위치, 스크롤하면 바로 보임 */}
                      {story.comments && (
                        <div 
                          data-comments-section
                          className="mt-8 pt-6 border-t border-white/10 relative bg-gray-900 rounded-t-2xl -mx-5 sm:-mx-6 px-5 sm:px-6 pb-6"
                          style={{ 
                            zIndex: 50,
                          }}
                        >
                            {/* 배경 이펙트 */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20" style={{ zIndex: 1 }}>
                              <div className="absolute top-10 left-4 w-16 h-16 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
                              <div className="absolute top-10 right-4 w-16 h-16 bg-red-500/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                            </div>
                            
                            {/* 전쟁 상태 게이지 바 - 장르별 색상 조정 */}
                            <div className="mb-6 relative" style={{ zIndex: 51 }}>
                              {(() => {
                                // 장르별 게이지 바 색상 결정
                                const isDarkTheme = story.theme === "dark"; // 무협
                                const isLightTheme = story.theme === "light"; // 로코
                                
                                // 무협: 더 어둡게 (진한 빨강/파랑)
                                const orthodoxGradient = isDarkTheme 
                                  ? "from-blue-800 via-blue-700 to-blue-800"
                                  : isLightTheme
                                  ? "from-blue-400 via-blue-300 to-blue-400" // 로코: 더 밝게
                                  : "from-blue-600 via-blue-500 to-blue-400"; // 기본
                                
                                const apostateGradient = isDarkTheme
                                  ? "from-red-800 via-red-700 to-red-800" // 무협: 더 어둡게
                                  : isLightTheme
                                  ? "from-red-300 via-red-200 to-red-300" // 로코: 더 밝게
                                  : "from-red-400 via-red-500 to-red-600"; // 기본
                                
                                const gaugeBg = isDarkTheme
                                  ? "bg-zinc-950/90" // 무협: 더 어둡게
                                  : isLightTheme
                                  ? "bg-zinc-800/70" // 로코: 더 밝게
                                  : "bg-zinc-900/80"; // 기본
                                
                                return (
                                  <div className={`relative h-5 rounded-lg overflow-hidden ${gaugeBg} border-2 border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] animate-[war-gauge-vibrate_3s_ease-in-out_infinite]`}>
                                    <div className={`absolute left-0 top-0 h-full bg-gradient-to-r ${orthodoxGradient} transition-all duration-500`} style={{ width: `${orthodoxProbability}%` }}>
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" />
                                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-100">정사 {orthodoxProbability}%</div>
                                    </div>
                                    <div className={`absolute right-0 top-0 h-full bg-gradient-to-r ${apostateGradient} transition-all duration-500`} style={{ width: `${apostateProbability}%` }}>
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" style={{ animationDelay: '0.75s' }} />
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-100">사도 {apostateProbability}%</div>
                                    </div>
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                      <span className="text-xs font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-[war-status-blink_1s_ease-in-out_infinite]">⚔️ 전쟁 중 ⚔️</span>
                                    </div>
                                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
                                  </div>
                                );
                              })()}
                            </div>
                            
                            {/* 댓글 헤더 */}
                            <div className="mb-6 relative" style={{ zIndex: 51 }}>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-zinc-200">베스트 댓글</h3>
                                <span className="text-sm text-zinc-500">댓글 {story.comments.totalCount.toLocaleString()}개</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => setCommentSort("latest")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${commentSort === "latest" ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "text-zinc-500 hover:text-zinc-300"}`}>최신순</button>
                                <span className="text-zinc-600">|</span>
                                <button type="button" onClick={() => setCommentSort("helpful")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${commentSort === "helpful" ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "text-zinc-500 hover:text-zinc-300"}`}>도움순</button>
                              </div>
                            </div>
                            
                            {/* 베스트 댓글 리스트 */}
                            <div className="space-y-4 relative mb-6" style={{ zIndex: 51 }}>
                              {story.comments.bestComments.map((comment, idx) => {
                                const isOrthodox = comment.type === "orthodox";
                                const isEven = idx % 2 === 0;
                                return (
                                  <div key={comment.id} className={`flex gap-3 pb-4 ${isEven && !isOrthodox ? "flex-row-reverse" : ""}`}>
                                    <div className="flex-shrink-0">
                                      <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${isOrthodox ? "from-blue-500 to-blue-600 border-blue-400/50" : "from-red-500 to-red-600 border-red-400/50"} flex items-center justify-center text-white font-semibold text-sm shadow-lg border-2`}>
                                        {isOrthodox ? "정" : "사"}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0 relative">
                                      {/* BEST 배지 */}
                                      <div className="absolute -top-2 -left-2 z-10">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gradient-to-r from-yellow-400 to-yellow-500 text-[9px] font-bold text-yellow-900 shadow-lg border border-yellow-300/50">
                                          BEST
                                        </span>
                                      </div>
                                      <div className={`${isOrthodox ? "bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg" : "bg-red-500/10 border-r-4 border-red-500 rounded-l-lg"} p-3 border-2 border-purple-500/50 rounded-lg shadow-[0_4px_20px_rgba(168,85,247,0.2)] transform scale-105 transition-all`}>
                                        <div className={`flex items-center gap-2 mb-1 flex-wrap ${isEven && !isOrthodox ? "justify-end" : ""}`}>
                                          {isEven && !isOrthodox && <span className="text-xs text-zinc-500">{comment.timeAgo}</span>}
                                          <span className={`text-sm font-semibold text-zinc-200 ${isEven && !isOrthodox ? "order-3" : ""}`}>{comment.author}</span>
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${isOrthodox ? "bg-blue-500/30 border-blue-400/50 text-blue-200" : "bg-red-500/30 border-red-400/50 text-red-200"} text-[10px] font-bold shadow-sm`}>
                                            {isOrthodox ? (
                                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-2-2l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 9l4.293-4.293z" clipRule="evenodd" /></svg>
                                            ) : (
                                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>
                                            )}
                                            {isOrthodox ? "정사 수호자" : "사도 혁명가"}
                                          </span>
                                          {!isEven || isOrthodox ? <span className="text-xs text-zinc-500">{comment.timeAgo}</span> : null}
                                        </div>
                                        <p className={`text-[15px] text-zinc-200 leading-relaxed mb-2 ${isEven && !isOrthodox ? "text-right" : ""}`}>{comment.content}</p>
                                        <div className={`flex items-center gap-4 ${isEven && !isOrthodox ? "justify-end" : ""}`}>
                                          {isEven && !isOrthodox && <button type="button" className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors">답글</button>}
                                          <button type="button" className={`flex items-center gap-1.5 text-xs text-zinc-400 transition-colors ${isOrthodox ? "hover:text-blue-300" : "hover:text-red-300"}`}>
                                            {!isEven || isOrthodox ? (
                                              <>
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                <span>{comment.likes}</span>
                                              </>
                                            ) : (
                                              <>
                                                <span>{comment.likes}</span>
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                              </>
                                            )}
                                          </button>
                                          {(!isEven || isOrthodox) && <button type="button" className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors">답글</button>}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* 베스트 댓글과 일반 댓글 구분선 */}
                            <div className="relative my-6" style={{ zIndex: 51 }}>
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/20"></div>
                              </div>
                              <div className="relative flex justify-center">
                                <span className="bg-gray-900 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">전체 댓글</span>
                              </div>
                            </div>
                            
                            {/* 일반 댓글 */}
                            <div 
                              className="relative bg-gray-900/30 rounded-lg px-4 py-4" 
                              style={{ zIndex: 51, minHeight: "300px" }}
                            >
                              <h4 className="text-sm font-semibold text-gray-300 mb-4">일반 댓글</h4>
                              <div className="space-y-3">
                                {story.comments.generalComments.map((comment, idx) => {
                                  const isOrthodox = comment.type === "orthodox";
                                  const isEven = idx % 2 === 0;
                                  return (
                                    <div key={comment.id} className={`flex gap-3 pb-3 ${idx < story.comments.generalComments.length - 1 ? "border-b border-white/10" : ""} ${isEven && !isOrthodox ? "flex-row-reverse" : ""}`}>
                                      <div className="flex-shrink-0">
                                        <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${isOrthodox ? "from-blue-500 to-blue-600 border-blue-400/50" : "from-red-500 to-red-600 border-red-400/50"} flex items-center justify-center text-white font-medium text-xs shadow-md border-2`}>
                                          {isOrthodox ? "원" : "새"}
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className={`${isOrthodox ? "bg-blue-500/5 border-l-2 border-blue-500/30 rounded-r-lg" : "bg-red-500/5 border-r-2 border-red-500/30 rounded-l-lg"} p-2.5`}>
                                          <div className={`flex items-center gap-2 mb-1 flex-wrap ${isEven && !isOrthodox ? "justify-end" : ""}`}>
                                            {isEven && !isOrthodox && <span className="text-[10px] text-gray-400">{comment.timeAgo}</span>}
                                            <span className={`text-xs font-medium text-gray-200 ${isEven && !isOrthodox ? "order-3" : ""}`}>{comment.author}</span>
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${isOrthodox ? "bg-blue-500/30 border-blue-400/50 text-blue-200" : "bg-red-500/30 border-red-400/50 text-red-200"} text-[9px] font-bold shadow-sm`}>
                                              {isOrthodox ? "정사 수호자" : "사도 혁명가"}
                                            </span>
                                            {!isEven || isOrthodox ? <span className="text-[10px] text-gray-400">{comment.timeAgo}</span> : null}
                                          </div>
                                          <p className={`text-[14px] text-gray-200 leading-relaxed mb-1.5 ${isEven && !isOrthodox ? "text-right" : ""}`}>{comment.content}</p>
                                          <div className={`flex items-center gap-3 ${isEven && !isOrthodox ? "justify-end" : ""}`}>
                                            {isEven && !isOrthodox && <button type="button" className="text-[10px] text-zinc-400 hover:text-zinc-300 transition-colors">답글</button>}
                                            <button type="button" className={`flex items-center gap-1 text-[10px] text-zinc-400 transition-colors ${isOrthodox ? "hover:text-blue-300" : "hover:text-red-300"}`}>
                                              {!isEven || isOrthodox ? (
                                                <>
                                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                  <span>{comment.likes}</span>
                                                </>
                                              ) : (
                                                <>
                                                  <span>{comment.likes}</span>
                                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                </>
                                              )}
                                            </button>
                                            {(!isEven || isOrthodox) && <button type="button" className="text-[10px] text-zinc-400 hover:text-zinc-300 transition-colors">답글</button>}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* 페이지네이션 - 카드 하단 고정 */}
                            <div className="mt-auto pt-8 pb-20 flex items-center justify-center gap-2 relative border-t border-white/10" style={{ zIndex: 51 }}>
                              <svg className="h-5 w-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                              {[1, 2, 3, 4, 5].map((page) => (
                                <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-all ${currentPage === page ? "border-violet-500/50 bg-violet-500/20 text-violet-300 shadow-lg" : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-300"}`} aria-label={`페이지 ${page}`}>{page}</button>
                              ))}
                              <svg className="h-5 w-5 text-zinc-600 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            </div>
                            
                            {/* 댓글 입력창 - 카드 맨 아래, 스크롤 끝까지 내려야 보임 */}
                            <div className="mt-4 pb-8 border-t border-white/10 bg-gradient-to-t from-[#050508] via-[#050508]/98 to-transparent backdrop-blur-md px-4 py-3">
                              <input type="text" placeholder="당신의 감상을 남겨보세요" className="w-full min-h-[44px] rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-[14px] text-zinc-200 placeholder:text-zinc-500 focus:border-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" aria-label="댓글 입력" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
      
      {/* 공유 카드 팝업 */}
      {currentUniverse && (
        <ShareCard
          isOpen={isShareSheetOpen}
          onClose={() => setIsShareSheetOpen(false)}
          universeName={currentUniverse.name}
          universeIndex={currentUniverseIndex}
          heading={currentUniverse.scene.heading}
          imageUrl={
            showSnapshot && currentUniverse.scene.imageUrl
              ? currentUniverse.scene.imageUrl
              : currentStoryIndex === 0 && currentUniverseIndex === 0
              ? "/images/sample-1.png"
              : currentStoryIndex === 0 && currentUniverseIndex === 1
              ? "/images/sample-2.png"
              : undefined
          }
        />
      )}
      
      {/* 정사 수정 연출 (붉은색 노이즈 효과) */}
      {showHistoryEdit && (
        <div className="fixed inset-0 z-[10001] pointer-events-none overflow-hidden">
          {/* 붉은색 노이즈 오버레이 (여러 레이어로 깊이감) */}
          <div className="absolute inset-0 bg-red-900/50 animate-[history-edit-noise_0.08s_infinite]" style={{ mixBlendMode: 'screen' }} />
          <div className="absolute inset-0 bg-red-800/40 animate-[history-edit-noise_0.12s_infinite]" style={{ mixBlendMode: 'multiply' }} />
          <div className="absolute inset-0 bg-red-700/30 animate-[history-edit-noise_0.15s_infinite]" style={{ mixBlendMode: 'screen' }} />
          
          {/* 깜빡임 효과 */}
          <div className="absolute inset-0 bg-red-600/20 animate-[history-edit-flash_0.3s_ease-in-out_infinite]" />
          
          {/* 텍스트 메시지 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative px-8 py-5 bg-black/90 backdrop-blur-md rounded-3xl border-2 border-red-500/60 shadow-[0_0_60px_rgba(239,68,68,0.6),inset_0_0_30px_rgba(239,68,68,0.2)] animate-[history-edit-text_0.6s_ease-out]">
              {/* 텍스트 글로우 효과 */}
              <div className="absolute inset-0 rounded-3xl bg-red-500/10 blur-xl" />
              <div className="relative">
                <p className="text-xl font-bold text-red-300 text-center tracking-wider drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                  기존의 역사가 파괴되고
                </p>
                <p className="text-xl font-bold text-red-200 text-center tracking-wider mt-2 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                  새로운 정사가 기록됩니다
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
