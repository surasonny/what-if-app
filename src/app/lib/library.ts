/** 내 서재에 저장된 유니버스 데이터 타입 */
export type SavedUniverse = {
  id: string; // 고유 ID (타임스탬프 기반)
  universeName: string; // 유니버스 이름
  heading: string; // 장면 제목
  paragraphs: string[]; // 본문
  imageUrl?: string; // 스냅샷 이미지 URL
  savedAt: number; // 저장 시각 (타임스탬프)
};

const STORAGE_KEY = "what-if-library";

/** localStorage에서 저장된 유니버스 목록 가져오기 */
export function getSavedUniverses(): SavedUniverse[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("[서재] 데이터 로드 실패:", err);
    return [];
  }
}

/** 유니버스를 서재에 저장 (중복 방지) */
export function saveToLibrary(universe: {
  universeName: string;
  heading: string;
  paragraphs: string[];
  imageUrl?: string;
}): SavedUniverse | null {
  const existing = getSavedUniverses();
  
  // 중복 체크: 같은 이름, 제목, 그리고 본문 내용이 동일한지 확인
  const isDuplicate = existing.some((saved) => {
    const sameName = saved.universeName === universe.universeName;
    const sameHeading = saved.heading === universe.heading;
    const sameParagraphs = 
      Array.isArray(saved.paragraphs) && 
      Array.isArray(universe.paragraphs) &&
      saved.paragraphs.length === universe.paragraphs.length &&
      saved.paragraphs.every((p, i) => p === universe.paragraphs[i]);
    
    return sameName && sameHeading && sameParagraphs;
  });
  
  if (isDuplicate) {
    // 중복이면 저장하지 않고 null 반환
    return null;
  }
  
  const saved: SavedUniverse = {
    id: `universe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    universeName: universe.universeName,
    heading: universe.heading,
    paragraphs: [...universe.paragraphs],
    imageUrl: universe.imageUrl,
    savedAt: Date.now(),
  };

  const updated = [saved, ...existing]; // 최신이 위로
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  return saved;
}

/** 서재에서 유니버스 삭제 */
export function removeFromLibrary(id: string): void {
  const existing = getSavedUniverses();
  const updated = existing.filter((u) => u.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
