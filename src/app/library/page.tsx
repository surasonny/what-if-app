"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedUniverses, removeFromLibrary, type SavedUniverse } from "../lib/library";

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

export default function LibraryPage() {
  const router = useRouter();
  const [savedUniverses, setSavedUniverses] = useState<SavedUniverse[]>([]);

  useEffect(() => {
    // 컴포넌트 마운트 시 localStorage에서 데이터 로드
    setSavedUniverses(getSavedUniverses());
  }, []);

  function handleDelete(id: string) {
    if (confirm("정말 이 유니버스를 서재에서 삭제하시겠습니까?")) {
      removeFromLibrary(id);
      setSavedUniverses(getSavedUniverses());
    }
  }

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#050508]">
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-violet-950/15 via-transparent to-cyan-950/5"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(100,60,180,0.12),transparent)]"
        aria-hidden
      />

      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-[#050508]">
        <main className="relative flex min-h-[100dvh] flex-col">
          {/* 헤더 */}
          <header className="shrink-0 px-4 pt-[env(safe-area-inset-top)] pt-5 pb-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-zinc-300 active:scale-95"
                aria-label="뒤로 가기"
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
              <h1 className="text-sm font-semibold text-zinc-300">내 서재</h1>
              <div className="w-9" /> {/* 균형을 위한 빈 공간 */}
            </div>
          </header>

          {/* 서재 리스트 */}
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {savedUniverses.length === 0 ? (
              <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                <svg
                  className="h-16 w-16 mb-4 text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p className="text-zinc-500 text-[15px]">아직 저장된 유니버스가 없습니다</p>
                <p className="mt-2 text-zinc-600 text-[13px]">
                  소설 카드 하단의 [내 서재에 소장하기] 버튼을 눌러 저장하세요
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedUniverses.map((saved) => (
                  <div
                    key={saved.id}
                    onClick={() => router.push("/")}
                    className="group relative flex gap-3 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4 shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:border-white/[0.1] hover:shadow-[0_0_40px_-8px_rgba(100,60,180,0.3)] cursor-pointer active:scale-[0.98]"
                  >
                    {/* 썸네일 (왼쪽) - 웹툰 스타일 */}
                    <div className="relative h-[110px] w-[80px] flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-white/10 shadow-lg">
                      {saved.imageUrl ? (
                        <img
                          src={saved.imageUrl}
                          alt={`${saved.heading} 썸네일`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            // 이미지 로드 실패 시 플레이스홀더로 대체
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/30 to-purple-900/20 ${saved.imageUrl ? 'hidden' : ''}`}
                      >
                        <svg
                          className="h-8 w-8 text-zinc-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>

                      {/* 텍스트 콘텐츠 (오른쪽) */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-violet-400/90 truncate">
                              {saved.heading}
                            </p>
                            <p className="mt-1.5 text-[14px] font-bold text-zinc-100 leading-tight">
                              {saved.universeName}
                            </p>
                          </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
                            handleDelete(saved.id);
                          }}
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400"
                          aria-label="삭제"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      
                      {/* 짧은 줄거리 (첫 문단 일부) */}
                      <p className="mt-3 line-clamp-2 text-[13px] leading-[1.6] text-zinc-400">
                        {saved.paragraphs && saved.paragraphs.length > 0
                          ? saved.paragraphs[0].length > 100
                            ? `${saved.paragraphs[0].substring(0, 100)}...`
                            : saved.paragraphs[0]
                          : "줄거리 없음"}
                      </p>
                      
                      {/* 저장 시간 */}
                      <div className="mt-auto pt-3 flex items-center gap-1.5">
                        <svg
                          className="h-3 w-3 text-zinc-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-[11px] text-zinc-500">
                          {formatDate(saved.savedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
