import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import { Startup } from "../types";
import { Heart, X, Sparkles, FolderOpen, MessageCircle, TrendingUp, Smile, Compass, AlertCircle, Bookmark, ChevronUp, ChevronDown } from "lucide-react";

interface SwipeCardDeckProps {
  startups: Startup[];
  onSwipeLeft: (startup: Startup) => void;
  onSwipeRight: (startup: Startup) => void;
  onSelectAIInsights: (startup: Startup) => void;
  onOpenDataRoom: (startup: Startup) => void;
  onStartChat: (startup: Startup) => void;
  onActiveCardChange?: (startup: Startup | null) => void;
  lang: string;
  translations: any;
  bookmarks: string[];
  onToggleBookmark: (startupId: string) => void;
  isBottomBarCollapsed?: boolean;
  onToggleBottomBar?: () => void;
}

export default function SwipeCardDeck({
  startups,
  onSwipeLeft,
  onSwipeRight,
  onSelectAIInsights,
  onOpenDataRoom,
  onStartChat,
  onActiveCardChange,
  lang,
  translations,
  bookmarks,
  onToggleBookmark,
  isBottomBarCollapsed = false,
  onToggleBottomBar
}: SwipeCardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeStartup = startups[currentIndex];
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Reset index to 0 if the startups list changes (due to filtering/search)
  useEffect(() => {
    setCurrentIndex(0);
  }, [startups.length, startups.map(s => s.id).join(",")]);

  const updateScrollIndicators = (target: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight } = target;
    setShowScrollUp(scrollTop > 5);
    setShowScrollDown(scrollTop + clientHeight < scrollHeight - 5);
  };

  useEffect(() => {
    if (onActiveCardChange) {
      onActiveCardChange(activeStartup || null);
    }

    // Reset scroll indicator states when the active card changes
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
        updateScrollIndicators(scrollContainerRef.current);
      } else {
        setShowScrollUp(false);
        setShowScrollDown(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [currentIndex, startups, onActiveCardChange, activeStartup]);

  const motionValue = useMotionValue(0);
  const rotateTransform = useTransform(motionValue, [-200, 200], [-30, 30]);
  const opacityTransform = useTransform(motionValue, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 120) {
      // Swiped right
      handleSwipe("right");
    } else if (info.offset.x < -120) {
      // Swiped left
      handleSwipe("left");
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (!activeStartup) return;
    if (direction === "right") {
      onSwipeRight(activeStartup);
    } else {
      onSwipeLeft(activeStartup);
    }
    setCurrentIndex((prev) => prev + 1);
    motionValue.set(0);
  };

  const resetDeck = () => {
    setCurrentIndex(0);
  };

  if (currentIndex >= startups.length) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-[#0D1117] rounded-2xl border border-[#30363D] w-full max-h-[500px] h-full">
        <Compass className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500 mb-3 sm:mb-4 animate-pulse" />
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">
          No More Startups Nearby
        </h3>
        <p className="text-xs sm:text-sm text-[#8B949E] max-w-xs mb-4 sm:mb-6">
          You have swiped through all available venture opportunities for today. Try updating your investment criteria or reload.
        </p>
        <button
          onClick={resetDeck}
          className="px-5 py-2 sm:px-6 sm:py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg shadow-md transition-all active:scale-95 text-xs sm:text-sm"
        >
          Reload Startups Database
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto flex-1 h-full min-h-0">
      {/* Cards container */}
      <div className="relative w-full flex-1 h-full min-h-0 flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {startups.slice(currentIndex, currentIndex + 2).reverse().map((startup, idx) => {
            const isTop = idx === 1 || startups.slice(currentIndex, currentIndex + 2).length === 1;

            return (
              <motion.div
                key={startup.id}
                className="absolute w-full h-full bg-[#0D1117] rounded-2xl shadow-2xl border border-[#30363D] overflow-hidden flex flex-col justify-between cursor-grab active:cursor-grabbing select-none"
                style={
                  isTop
                    ? {
                        x: motionValue,
                        rotate: rotateTransform,
                        opacity: opacityTransform,
                        zIndex: 10,
                      }
                    : {
                        scale: 0.95,
                        y: 10,
                        opacity: 0.7,
                        zIndex: 1,
                      }
                }
                drag={isTop ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={isTop ? { scale: 1, y: 0 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Header info */}
                <div className="p-5 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/20 uppercase tracking-wider">
                        {startup.category || "General Tech"}
                      </span>
                      <h2 className="text-xl font-bold text-white mt-1.5 leading-tight">
                        {startup.companyName}
                      </h2>
                      <p className="text-xs text-[#8B949E] flex items-center gap-1 mt-0.5">
                        📍 {startup.country} • {startup.fundingStage}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-[#161B22] border border-[#30363D] px-2 py-0.5 rounded-md">
                        <Sparkles className="w-2.5 h-2.5 fill-current text-amber-400" />
                        <span>Score: {startup.pitchScore || 85}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Central body container with absolute floating indicators and vertical toolbelt */}
                <div className="relative flex-1 flex flex-col min-h-0">
                  {/* Floating Scroll Up Indicator */}
                  <AnimatePresence>
                    {isTop && showScrollUp && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-1 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-[#161B22]/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#30363D] shadow-xl flex items-center gap-1.5"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                        <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider">Scroll Up</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Floating Vertical Toolbelt (Bookmark, AI Insights, Dataroom, Chat) */}
                  {isTop && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="absolute right-[10px] bottom-6 flex flex-col gap-2.5 z-30 items-center justify-center"
                    >
                      {/* Bookmark Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(startup.id);
                        }}
                        className={`w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg border transition-all active:scale-90 shrink-0 ${
                          bookmarks.includes(startup.id)
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/35"
                            : "bg-[#0D1117]/90 text-[#8B949E] hover:text-[#E0E0E0] border-[#30363D] hover:bg-[#161B22]"
                        }`}
                        title={bookmarks.includes(startup.id) ? "Remove Bookmark" : "Save Bookmark"}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(startup.id) ? "fill-current" : ""}`} />
                      </button>

                      {/* AI Insights */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAIInsights(startup);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 hover:text-indigo-300 border border-indigo-500/25 transition-all active:scale-90 shrink-0"
                        title="Makwa AI Insights"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {/* Dataroom */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDataRoom(startup);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 hover:text-amber-300 border border-amber-500/25 transition-all active:scale-90 shrink-0"
                        title="View Secure Data Room"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                      </button>

                      {/* Chat */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartChat(startup);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg bg-[#0D1117]/90 hover:bg-[#161B22] text-[#C9D1D9] border border-[#30363D] transition-all active:scale-90 shrink-0"
                        title="Direct Chat with Founder"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      {/* Collapse/Expand Bottom Bar */}
                      {onToggleBottomBar && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBottomBar();
                          }}
                          className={`w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg border transition-all active:scale-90 shrink-0 ${
                            isBottomBarCollapsed
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30 animate-pulse"
                              : "bg-[#0D1117]/90 text-[#8B949E] hover:text-[#E0E0E0] border-[#30363D] hover:bg-[#161B22]"
                          }`}
                          title={isBottomBarCollapsed ? "Expand Bottom Navigation / Status Bar" : "Collapse Bottom Navigation / Status Bar"}
                        >
                          {isBottomBarCollapsed ? (
                            <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#8B949E]" />
                          )}
                        </button>
                      )}
                    </motion.div>
                  )}

                  <div
                    ref={isTop ? scrollContainerRef : null}
                    onScroll={(e) => {
                      if (isTop) updateScrollIndicators(e.currentTarget);
                    }}
                    className="pl-5 pr-14 py-2 overflow-y-auto flex-1 space-y-3.5 no-scrollbar"
                  >
                    <div>
                      <h4 className="text-[10px] font-bold text-[#8B949E] uppercase tracking-widest flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Problem & Solution
                      </h4>
                      <p className="text-xs text-[#C9D1D9] mt-1 leading-relaxed">
                        {startup.problem}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" /> Traction Highlights
                      </h4>
                      <p className="text-xs text-[#C9D1D9] mt-1 leading-relaxed bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/15">
                        {startup.traction}
                      </p>
                    </div>

                    {/* Badges for AI forecast & sentiment */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="flex items-center gap-2 p-2 bg-purple-500/5 border border-purple-500/15 rounded-lg">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <div>
                          <p className="text-[9px] text-[#8B949E] font-medium leading-none">Funding Success</p>
                          <p className="text-[11px] font-bold text-purple-400 mt-0.5">{startup.fundingSuccessRate || 80}% Prob</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-sky-500/5 border border-sky-500/15 rounded-lg">
                        <Smile className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <div>
                          <p className="text-[9px] text-[#8B949E] font-medium leading-none">Founder Sentiment</p>
                          <p className="text-[11px] font-bold text-sky-400 mt-0.5">{startup.sentimentScore || 85}% Opt</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Scroll Down Indicator */}
                  <AnimatePresence>
                    {isTop && showScrollDown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-[#161B22]/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#30363D] shadow-xl flex items-center gap-1.5"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                        <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider">Scroll Down</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card controls (Unified Bottom Action Bar - Tinder-style Circular buttons for Pass & Match) */}
                <div className="px-4 py-2.5 bg-[#161B22] border-t border-[#30363D] flex items-center justify-center gap-6 shrink-0">
                  {/* Swipe Left (Pass) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwipe("left");
                    }}
                    className="w-[34px] h-[34px] bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/15 rounded-full flex items-center justify-center transition-all active:scale-90 hover:rotate-[-6deg]"
                    title={translations.swipeLeft}
                  >
                    <X className="w-4 h-4" />
                  </button>
 
                  {/* Swipe Right (Match) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwipe("right");
                    }}
                    className="w-[40px] h-[40px] bg-emerald-500 hover:bg-emerald-600 text-black rounded-full flex items-center justify-center transition-all active:scale-90 hover:rotate-[6deg] shadow-lg shadow-emerald-500/20"
                    title={translations.swipeRight}
                  >
                    <Heart className="w-[18px] h-[18px] fill-current" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
