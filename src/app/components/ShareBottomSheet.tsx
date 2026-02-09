"use client";

import { useEffect, useRef } from "react";
import html2canvas from "html2canvas";

type ShareBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  universeName: string;
  heading: string;
  imageUrl?: string;
  snapshotElementId?: string; // 스냅샷 카드 요소의 ID
};

declare global {
  interface Window {
    Kakao: any;
  }
}

export default function ShareBottomSheet({
  isOpen,
  onClose,
  universeName,
  heading,
  imageUrl,
  snapshotElementId = "snapshot-card",
}: ShareBottomSheetProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // 카카오톡 SDK 로드
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Kakao) {
      const script = document.createElement("script");
      script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
      script.integrity = "sha384-TiCue00KKUbg6w4wL0hp7eXrvUq+1qAc2a+pXs2+1qZ5jV4AB2Q4YgDmT2F8xYg";
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          // 카카오톡 JavaScript 키는 환경변수로 관리
          // .env.local에 NEXT_PUBLIC_KAKAO_JS_KEY를 추가하세요
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
          if (kakaoKey) {
            window.Kakao.init(kakaoKey);
          } else {
            console.warn("[카카오톡] JavaScript 키가 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_KAKAO_JS_KEY를 추가하세요.");
          }
        }
      };
      script.onerror = () => {
        console.error("[카카오톡] SDK 로드 실패");
      };
      document.head.appendChild(script);
    }
  }, []);

  // 바텀 시트 애니메이션
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        if (backdropRef.current) backdropRef.current.style.opacity = "1";
        if (sheetRef.current) sheetRef.current.style.transform = "translateY(0)";
      }, 10);
    } else {
      document.body.style.overflow = "";
      if (backdropRef.current) backdropRef.current.style.opacity = "0";
      if (sheetRef.current) sheetRef.current.style.transform = "translateY(100%)";
    }
  }, [isOpen]);

  // 이미지 다운로드
  async function handleDownloadImage() {
    try {
      const element = document.getElementById(snapshotElementId);
      if (!element) {
        alert("스냅샷을 찾을 수 없습니다. 스냅샷을 먼저 생성해주세요.");
        return;
      }

      // html2canvas로 캡처
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff", // 폴라로이드 배경색
        scale: 2, // 고해상도
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      // PNG로 다운로드
      const link = document.createElement("a");
      const fileName = `${universeName.replace(/\s+/g, "_")}_${Date.now()}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 성공 피드백
      setTimeout(() => {
        alert("이미지가 다운로드되었습니다!");
      }, 100);
    } catch (err) {
      console.error("[이미지 다운로드 실패]", err);
      alert("이미지 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  // 링크 복사
  async function handleCopyLink() {
    try {
      const currentUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${currentUrl}?universe=${encodeURIComponent(universeName)}`;

      await navigator.clipboard.writeText(shareUrl);
      alert("링크가 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("[링크 복사 실패]", err);
      alert("링크 복사에 실패했습니다.");
    }
  }

  // 카카오톡 공유
  function handleKakaoShare() {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert("카카오톡 공유 기능을 준비 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const currentUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${currentUrl}?universe=${encodeURIComponent(universeName)}`;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${universeName} - ${heading}`,
        description: "내가 바꾼 운명을 확인해봐!",
        imageUrl: imageUrl || `${currentUrl}/images/sample-1.png`,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: "이야기 보기",
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  }

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        style={{ opacity: 0 }}
      />

      {/* 바텀 시트 */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-t border-white/10 rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out"
        style={{ transform: "translateY(100%)" }}
      >
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="px-6 pb-4">
          <h2 className="text-lg font-semibold text-zinc-100">공유하기</h2>
          <p className="mt-1 text-sm text-zinc-400">{universeName}</p>
        </div>

        {/* 공유 옵션 */}
        <div className="px-6 pb-8 space-y-3">
          {/* 카카오톡 공유 */}
          <button
            type="button"
            onClick={handleKakaoShare}
            className="flex w-full items-center gap-4 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-yellow-400/15 px-5 py-4 text-left transition-all hover:from-yellow-500/30 hover:to-yellow-400/25 active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-500/20">
              <svg className="h-7 w-7 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-yellow-200">카카오톡으로 공유</p>
              <p className="mt-0.5 text-xs text-yellow-300/70">친구에게 내가 바꾼 운명을 보여줘</p>
            </div>
            <svg
              className="h-5 w-5 text-yellow-400/60"
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

          {/* 이미지 다운로드 */}
          <button
            type="button"
            onClick={handleDownloadImage}
            className="flex w-full items-center gap-4 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/20 to-purple-500/15 px-5 py-4 text-left transition-all hover:from-violet-500/30 hover:to-purple-500/25 active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
              <svg
                className="h-6 w-6 text-violet-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-violet-200">이미지 저장</p>
              <p className="mt-0.5 text-xs text-violet-300/70">인스타그램 등에 올리기</p>
            </div>
            <svg
              className="h-5 w-5 text-violet-400/60"
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

          {/* 링크 복사 */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex w-full items-center gap-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/15 px-5 py-4 text-left transition-all hover:from-cyan-500/30 hover:to-blue-500/25 active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/20">
              <svg
                className="h-6 w-6 text-cyan-300"
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
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-cyan-200">링크 복사</p>
              <p className="mt-0.5 text-xs text-cyan-300/70">이야기를 공유할 수 있는 링크</p>
            </div>
            <svg
              className="h-5 w-5 text-cyan-400/60"
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

        {/* 닫기 버튼 */}
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-center text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 active:scale-[0.98]"
          >
            닫기
          </button>
        </div>

        {/* Safe area padding */}
        <div className="h-[env(safe-area-inset-bottom)] bg-zinc-950" />
      </div>
    </>
  );
}
