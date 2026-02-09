"use client";

import { useEffect, useRef, useState } from "react";

type ShareCardProps = {
  isOpen: boolean;
  onClose: () => void;
  universeName: string;
  universeIndex: number;
  heading: string;
  imageUrl?: string;
};

export default function ShareCard({
  isOpen,
  onClose,
  universeName,
  universeIndex,
  heading,
  imageUrl,
}: ShareCardProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 바텀 시트 애니메이션
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        if (backdropRef.current) backdropRef.current.style.opacity = "1";
        if (cardRef.current) {
          cardRef.current.style.transform = "translateY(0)";
        }
      }, 10);
    } else {
      document.body.style.overflow = "";
      if (backdropRef.current) backdropRef.current.style.opacity = "0";
      if (cardRef.current) {
        cardRef.current.style.transform = "translateY(100%)";
      }
    }
  }, [isOpen]);

  // 토스트 메시지 표시
  function showToastMessage(message: string) {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 1000); // 1초로 변경
  }

  // 공유 버튼 핸들러
  function handleShare(type: "kakao" | "instagram" | "link") {
    if (type === "kakao" || type === "instagram") {
      showToastMessage("성공적으로 공유되었습니다!");
    } else {
      showToastMessage("링크가 복사되었습니다!");
    }
    
    // 링크 복사의 경우 실제로 클립보드에 복사
    if (type === "link") {
      const currentUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${currentUrl}?universe=${encodeURIComponent(universeName)}`;
      navigator.clipboard.writeText(shareUrl).catch(() => {
        console.error("링크 복사 실패");
      });
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 (블러 효과) */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] transition-opacity duration-300"
        style={{ opacity: 0 }}
      />

      {/* 바텀 시트 카드 */}
      <div
        ref={cardRef}
        className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none"
        style={{ transform: "translateY(100%)" }}
      >
        <div
          className="w-full max-w-md mx-auto bg-gray-900 border-t border-x border-white/20 rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-auto transition-transform duration-500 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 핸들 바 */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white transition-all hover:bg-black/80 active:scale-95"
            aria-label="닫기"
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
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* 카드 내용 */}
          <div className="px-6 pb-6 space-y-5">
            {/* 웹툰 삽화 썸네일 */}
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-zinc-900 border border-white/10">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={heading}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {/* 그라데이션 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg
                    className="h-16 w-16 text-zinc-600"
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
              )}
            </div>

            {/* 소설 제목 영역 */}
            <div className="text-center space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400/90">
                {heading}
              </p>
              <h2 className="text-2xl font-bold text-white leading-tight">
                내가 바꾼 운명
              </h2>
              <p className="text-lg font-bold text-violet-300">
                Universe #{universeIndex + 1}
              </p>
              <p className="text-sm text-zinc-400 mt-1">{universeName}</p>
            </div>

            {/* 공유 아이콘들 */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {/* 카카오톡 */}
              <button
                type="button"
                onClick={() => handleShare("kakao")}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-[0.92] active:duration-100"
                aria-label="카카오톡 공유"
              >
                <svg className="h-7 w-7 text-yellow-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                </svg>
              </button>

              {/* 인스타그램 */}
              <button
                type="button"
                onClick={() => handleShare("instagram")}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-[0.92] active:duration-100"
                aria-label="인스타그램 공유"
              >
                <svg
                  className="h-7 w-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 1.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 1.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-1.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-1.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </button>

              {/* 링크 복사 */}
              <button
                type="button"
                onClick={() => handleShare("link")}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-[0.92] active:duration-100"
                aria-label="링크 복사"
              >
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Safe area padding */}
          <div className="h-[env(safe-area-inset-bottom)] bg-gray-900" />
        </div>
      </div>

      {/* 토스트 메시지 (상단) */}
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 bg-zinc-800/95 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl animate-[toast-slide-down_0.3s_ease-out]">
          <p className="text-sm font-medium text-white text-center">{toastMessage}</p>
        </div>
      )}
    </>
  );
}
