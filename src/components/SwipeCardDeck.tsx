import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from "motion/react";
import { Startup, getTractionSummary } from "../types";
import { Heart, X, Sparkles, FolderOpen, MessageCircle, TrendingUp, Smile, Compass, AlertCircle, Bookmark, ChevronUp, ChevronDown, ListFilter, Check, Share2, RotateCcw, Linkedin, Globe, Mail, ExternalLink, Award } from "lucide-react";
import TeamDirectoryModal from "./TeamDirectoryModal";

interface SwipeCardDeckProps {
  startups: Startup[];
  onSwipeLeft: (startup: Startup) => void;
  onSwipeRight: (startup: Startup) => void;
  onUndoSwipe?: (startup: Startup, direction: "left" | "right") => void;
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
  onOpenFullProfile: (startup: Startup) => void;
  onShareStartup: (startup: Startup) => void;
  hideHeaderControls?: boolean;
}

export function getStartupAskAndEquity(startup: Startup) {
  switch(startup.id) {
    case "1": return { ask: "ZAR 1.5M-2.5M", equity: "15-25%" };
    case "2": return { ask: "ZAR 10.0M", equity: "25%" };
    case "3": return { ask: "ZAR 3.0M-10.0M", equity: "18-25%" };
    case "4": return { ask: "$1.8M-$2.0M", equity: "10-15%" };
    case "5": return { ask: "$1.0M", equity: "10-15%" };
    case "6": return { ask: "ZAR 500K", equity: "5-10%" };
    case "7": return { ask: "ZAR 100K", equity: "5-10%" };
    case "8": return { ask: "$250K", equity: "30%" };
    case "9": return { ask: "ZAR 1.5M", equity: "10-15%" };
    case "10": return { ask: "$100K", equity: "5-10%" };
    case "11": return { ask: "$150K", equity: "10-20%" };
    case "12": return { ask: "$250K", equity: "10-15%" };
    case "13": return { ask: "$875K", equity: "10-20%" };
    case "14": return { ask: "ZAR 1.5M", equity: "10-15%" };
    case "15": return { ask: "ZAR 3.5M", equity: "10-15%" };
    case "16": return { ask: "ZAR 500K", equity: "10-15%" };
    case "17": return { ask: "$500K-$1.0M", equity: "10-15%" };
    case "18": return { ask: "$2.5M", equity: "15-25%" };
    default: return { ask: "$750K-$3.0M", equity: "10-20%" };
  }
}

function usePanGesture({
  x,
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 120,
}: {
  x: any;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  swipeThreshold?: number;
}) {
  const onPan = (event: any, info: any) => {
    // Only pan horizontally if user isn't doing a pure vertical scroll.
    // If the touch movement is significantly vertical, we don't move the card.
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y) * 0.6) {
      x.set(info.offset.x);
    }
  };

  const onPanEnd = (event: any, info: any) => {
    if (info.offset.x > swipeThreshold) {
      // Fly out right and trigger state change
      animate(x, 500, {
        type: "spring",
        stiffness: 250,
        damping: 25,
        onComplete: () => {
          onSwipeRight();
        },
      });
    } else if (info.offset.x < -swipeThreshold) {
      // Fly out left and trigger state change
      animate(x, -500, {
        type: "spring",
        stiffness: 250,
        damping: 25,
        onComplete: () => {
          onSwipeLeft();
        },
      });
    } else {
      // Snap back smoothly
      animate(x, 0, {
        type: "spring",
        stiffness: 300,
        damping: 28,
      });
    }
  };

  return { onPan, onPanEnd };
}

export default function SwipeCardDeck({
  startups,
  onSwipeLeft,
  onSwipeRight,
  onUndoSwipe,
  onSelectAIInsights,
  onOpenDataRoom,
  onStartChat,
  onActiveCardChange,
  lang,
  translations,
  bookmarks,
  onToggleBookmark,
  isBottomBarCollapsed = false,
  onToggleBottomBar,
  onOpenFullProfile,
  onShareStartup,
  hideHeaderControls = false
}: SwipeCardDeckProps) {
  const [localStartups, setLocalStartups] = useState<Startup[]>(startups);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkDecisions, setBulkDecisions] = useState<Record<string, "like" | "skip" | null>>({});
  const [sessionMatches, setSessionMatches] = useState(0);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);

  const [lastSwipe, setLastSwipe] = useState<{ startup: Startup; direction: "left" | "right"; timestamp: number } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [expandedImage, setExpandedImage] = useState<{ url: string; title: string } | null>(null);
  const [showTeamDirectory, setShowTeamDirectory] = useState(false);
  const [expandedFounder, setExpandedFounder] = useState<{
    name: string;
    role: string;
    photoUrl: string;
    companyName: string;
    email: string;
    phone?: string;
    bio: string;
    linkedin: string;
    twitter?: string;
    github?: string;
  } | null>(null);

  const activeStartup = localStartups[0];
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isButtonsVisible, setIsButtonsVisible] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Synchronize with startups prop when it changes
  useEffect(() => {
    setLocalStartups(startups);
    setBulkDecisions({});
    setLastSwipe(null);
  }, [startups]);

  // 5-second undo timer effect
  useEffect(() => {
    if (!lastSwipe) return;
    setSecondsLeft(5);
    const interval = setInterval(() => {
      const elapsed = (Date.now() - lastSwipe.timestamp) / 1000;
      const remaining = Math.max(0, 5 - Math.floor(elapsed));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setLastSwipe(null);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [lastSwipe]);

  const updateScrollIndicators = (target: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight } = target;
    setShowScrollUp(scrollTop > 5);
    setShowScrollDown(scrollTop + clientHeight < scrollHeight - 5);
    if (scrollTop > 10) {
      setIsButtonsVisible(false);
    }
  };

  useEffect(() => {
    if (onActiveCardChange) {
      onActiveCardChange(activeStartup || null);
    }
    setIsButtonsVisible(true);

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
  }, [localStartups, onActiveCardChange, activeStartup]);

  const motionValue = useMotionValue(0);
  const rotateTransform = useTransform(motionValue, [-200, 200], [-30, 30]);
  const opacityTransform = useTransform(motionValue, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  const handleSwipe = (direction: "left" | "right") => {
    if (!activeStartup) return;
    const swiped = activeStartup;
    if (direction === "right") {
      onSwipeRight(swiped);
      setSessionMatches((prev) => prev + 1);
    } else {
      onSwipeLeft(swiped);
    }
    setSessionReviewed((prev) => prev + 1);
    setLocalStartups((prev) => prev.slice(1));
    motionValue.set(0);

    setLastSwipe({
      startup: swiped,
      direction,
      timestamp: Date.now()
    });
  };

  const handleUndo = () => {
    if (!lastSwipe) return;
    const { startup, direction } = lastSwipe;

    // Restore to top of localStartups deck
    setLocalStartups((prev) => [startup, ...prev]);
    setSessionReviewed((prev) => Math.max(0, prev - 1));
    if (direction === "right") {
      setSessionMatches((prev) => Math.max(0, prev - 1));
    }

    if (onUndoSwipe) {
      onUndoSwipe(startup, direction);
    }

    setLastSwipe(null);
  };

  const panGesture = usePanGesture({
    x: motionValue,
    onSwipeLeft: () => handleSwipe("left"),
    onSwipeRight: () => handleSwipe("right"),
    swipeThreshold: 120,
  });

  const resetDeck = () => {
    setLocalStartups(startups);
    setBulkDecisions({});
    setSessionMatches(0);
    setSessionReviewed(0);
  };

  if (localStartups.length === 0) {
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

      {/* Mode switcher toggle bar */}
      {!hideHeaderControls && (
        <div className="w-full flex justify-between items-center px-4 py-2.5 mb-3 bg-[#161B22]/60 rounded-xl border border-[#30363D]/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
              {isBulkMode ? "Bulk Review Engine" : "Tinder Swipe Mode"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isBulkMode && (
              <button
                onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
                className="px-2.5 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-emerald-400 text-[10px] font-bold rounded-lg border border-[#30363D] transition-all flex items-center gap-1 cursor-pointer"
                title={isStatsCollapsed ? "Show Session Stats" : "Hide Session Stats"}
              >
                {isStatsCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronUp className="w-3.5 h-3.5" />}
                <span>{isStatsCollapsed ? "Show Stats" : "Hide Stats"}</span>
              </button>
            )}

            <button
              onClick={() => setIsBulkMode(!isBulkMode)}
              className="px-3.5 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-[#E0E0E0] hover:text-emerald-400 text-xs font-bold rounded-lg border border-[#30363D] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {isBulkMode ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Switch to Cards Mode</span>
                </>
              ) : (
                <>
                  <ListFilter className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Quick Bulk Review ({localStartups.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {isBulkMode ? (
        <div className="w-full flex-1 flex flex-col bg-[#0D1117] border border-[#30363D] rounded-2xl overflow-hidden h-full min-h-0 shadow-2xl">
          {/* Sticky Sub-Header with Batch controls */}
          <div className="p-4 bg-[#161B22] border-b border-[#30363D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Venture Pipeline Bulk Broker
              </h3>
              <p className="text-[11px] text-[#8B949E] mt-0.5">
                Batch-decide remaining deals before committing to your deal flow registry.
              </p>
            </div>

            {/* Quick Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newDecisions = { ...bulkDecisions };
                  localStartups.forEach(s => {
                    newDecisions[s.id] = "like";
                  });
                  setBulkDecisions(newDecisions);
                }}
                className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold rounded border border-emerald-500/20 transition-all cursor-pointer"
              >
                All Interested
              </button>
              <button
                onClick={() => {
                  const newDecisions = { ...bulkDecisions };
                  localStartups.forEach(s => {
                    newDecisions[s.id] = "skip";
                  });
                  setBulkDecisions(newDecisions);
                }}
                className="px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-bold rounded border border-red-500/20 transition-all cursor-pointer"
              >
                All Skip
              </button>
              <button
                onClick={() => setBulkDecisions({})}
                className="px-2.5 py-1 bg-[#21262D] text-[#8B949E] hover:text-white text-[10px] font-bold rounded border border-[#30363D] transition-all cursor-pointer"
              >
                Reset Selection
              </button>
            </div>
          </div>

          {/* Scrollable list of deals */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#30363D]/60 p-2 space-y-2 no-scrollbar">
            {localStartups.map((startup, idx) => {
              const decision = bulkDecisions[startup.id] || null;
              return (
                <motion.div
                  key={startup.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                  className={`p-3 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    decision === "like"
                      ? "bg-emerald-500/5 border-emerald-500/30"
                      : decision === "skip"
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-[#161B22]/40 border-[#30363D] hover:bg-[#161B22]/80"
                  }`}
                >
                  {/* Col 1: Startup Basics */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-indigo-500/15 border border-[#30363D] flex items-center justify-center font-black text-xs text-emerald-400 shrink-0">
                      {startup.companyName ? startup.companyName.substring(0, 2).toUpperCase() : "ST"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{startup.companyName}</h4>
                        <span className="px-1.5 py-0.5 bg-[#161B22] text-[#8B949E] text-[8px] font-semibold rounded border border-[#30363D] uppercase">
                          {startup.category || "Tech"}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8B949E] truncate mt-0.5">
                        📍 {startup.country} • {startup.fundingStage}
                      </p>
                      <p className="text-[10px] text-[#C9D1D9] line-clamp-1 mt-1 font-medium leading-relaxed italic">
                        "{startup.description}"
                      </p>
                    </div>
                  </div>

                  {/* Col 2: Deal Ask & Equity */}
                  <div className="grid grid-cols-2 gap-2 min-w-[120px] md:min-w-[150px] shrink-0">
                    <div className="bg-[#0D1117]/60 border border-[#30363D]/80 p-1.5 rounded-lg text-center flex flex-col justify-center">
                      <span className="text-[7px] text-[#8B949E] font-bold uppercase tracking-wider block">ASK</span>
                      <span className="text-[10px] font-bold text-white mt-0.5 truncate block">
                        {getStartupAskAndEquity(startup).ask}
                      </span>
                    </div>
                    <div className="bg-[#0D1117]/60 border border-[#30363D]/80 p-1.5 rounded-lg text-center flex flex-col justify-center">
                      <span className="text-[7px] text-[#8B949E] font-bold uppercase tracking-wider block">EQUITY</span>
                      <span className="text-[10px] font-bold text-white mt-0.5 truncate block">
                        {getStartupAskAndEquity(startup).equity}
                      </span>
                    </div>
                  </div>

                  {/* Col 3: Pitch Score & Founder */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[9px] text-[#8B949E]">Score</div>
                      <div className="text-xs font-black text-amber-400 font-mono mt-0.5">
                        🔥 {startup.pitchScore || 85}
                      </div>
                    </div>

                    {/* Decisions Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* Skip Toggle */}
                      <button
                        onClick={() => {
                          setBulkDecisions(prev => ({
                            ...prev,
                            [startup.id]: prev[startup.id] === "skip" ? null : "skip"
                          }));
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          decision === "skip"
                            ? "bg-red-500 text-white shadow-md shadow-red-500/20 scale-105"
                            : "bg-[#161B22] border border-[#30363D] text-red-400/70 hover:text-red-400 hover:bg-red-500/5"
                        }`}
                        title="Mark to Skip"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Interested Toggle */}
                      <button
                        onClick={() => {
                          setBulkDecisions(prev => ({
                            ...prev,
                            [startup.id]: prev[startup.id] === "like" ? null : "like"
                          }));
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          decision === "like"
                            ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 scale-105"
                            : "bg-[#161B22] border border-[#30363D] text-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/5"
                        }`}
                        title="Mark Interested"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Profile Shortcut */}
                      <button
                        onClick={() => onOpenFullProfile(startup)}
                        className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-[10px] font-bold text-emerald-400 hover:text-emerald-300 rounded border border-[#30363D] transition-all cursor-pointer"
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Commit Footer */}
          <div className="p-3 bg-[#161B22] border-t border-[#30363D] flex items-center justify-between gap-4 shrink-0">
            <div className="text-xs text-[#8B949E]">
              Decisions made: <strong className="text-white">{Object.values(bulkDecisions).filter(Boolean).length}</strong> / {localStartups.length}
            </div>
            <button
              onClick={() => {
                const decidedList = localStartups.filter(s => bulkDecisions[s.id] !== undefined && bulkDecisions[s.id] !== null);
                if (decidedList.length === 0) return;

                decidedList.forEach(startup => {
                  const decision = bulkDecisions[startup.id];
                  if (decision === "like") {
                    onSwipeRight(startup);
                    setSessionMatches((prev) => prev + 1);
                  } else if (decision === "skip") {
                    onSwipeLeft(startup);
                  }
                  setSessionReviewed((prev) => prev + 1);
                });

                setLocalStartups(prev => prev.filter(s => bulkDecisions[s.id] === undefined || bulkDecisions[s.id] === null));
                setBulkDecisions({});
                setIsBulkMode(false);
              }}
              disabled={Object.values(bulkDecisions).filter(Boolean).length === 0}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-lg ${
                Object.values(bulkDecisions).filter(Boolean).length > 0
                  ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20 cursor-pointer"
                  : "bg-[#21262D] text-[#8B949E] border border-[#30363D] cursor-not-allowed"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Commit Batch Decisions ({Object.values(bulkDecisions).filter(Boolean).length})</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col min-h-0">
          {/* Gamified Personal Success Rate HUD Overlay */}
          {!hideHeaderControls && !isStatsCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full grid grid-cols-3 gap-2 px-4 py-2.5 mb-3 bg-[#161B22]/50 rounded-xl border border-[#30363D]/60 shrink-0 text-center select-none shadow-md overflow-hidden"
            >
              <div className="flex flex-col justify-center items-center">
                <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <Heart className="w-3 h-3 text-emerald-400 fill-current animate-pulse" />
                  Session Matches
                </span>
                <span className="text-base font-black text-white font-mono mt-0.5">
                  {sessionMatches}
                </span>
              </div>
              
              <div className="flex flex-col justify-center items-center border-x border-[#30363D]/50">
                <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-extrabold">
                  Success Rate
                </span>
                <span className="text-base font-black text-amber-400 font-mono mt-0.5">
                  {sessionReviewed > 0 ? `${Math.round((sessionMatches / sessionReviewed) * 100)}%` : "0%"}
                </span>
              </div>
              
              <div className="flex flex-col justify-center items-center">
                <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-extrabold">
                  Deals Reviewed
                </span>
                <span className="text-base font-black text-indigo-400 font-mono mt-0.5">
                  {sessionReviewed}
                </span>
              </div>
            </motion.div>
          )}

          <div className="relative w-full flex-1 h-full min-h-0 flex items-center justify-center p-3">
          <AnimatePresence mode="popLayout">
            {localStartups.slice(0, 2).reverse().map((startup, idx) => {
              const isTop = idx === 1 || localStartups.slice(0, 2).length === 1;

            return (
              <motion.div
                key={startup.id}
                onClick={() => {
                  if (isTop) {
                    setIsButtonsVisible(prev => !prev);
                  }
                }}
                className="absolute inset-3 bg-[#0D1117] rounded-2xl shadow-2xl border border-[#30363D] overflow-hidden flex flex-col justify-between cursor-grab active:cursor-grabbing select-none"
                style={
                  isTop
                    ? {
                        x: motionValue,
                        rotate: rotateTransform,
                        opacity: opacityTransform,
                        zIndex: 10,
                      }
                    : {
                        zIndex: 1,
                      }
                }
                drag={isTop ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                onDragEnd={isTop ? (e, info) => {
                  if (info.offset.x > 100) {
                    handleSwipe("right");
                  } else if (info.offset.x < -100) {
                    handleSwipe("left");
                  } else {
                    animate(motionValue, 0, { type: "spring", stiffness: 300, damping: 28 });
                  }
                } : undefined}
                onPan={isTop ? panGesture.onPan : undefined}
                onPanEnd={isTop ? panGesture.onPanEnd : undefined}
                initial={
                  isTop
                    ? { scale: 0.92, y: 25, opacity: 0 }
                    : { scale: 0.85, y: 40, opacity: 0 }
                }
                animate={
                  isTop
                    ? { scale: 1, y: 0, opacity: 1 }
                    : { scale: 0.95, y: 10, opacity: 0.7 }
                }
                exit={{ scale: 0.9, y: -30, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 22,
                  delay: isTop ? 0 : 0.06
                }}
              >
                {/* Header info */}
                <div className="p-5 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 flex-1 pr-3">
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/20 uppercase tracking-wider">
                        {startup.category || "General Tech"}
                      </span>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white leading-tight">
                          {startup.companyName}
                        </h2>
                        {startup.logoUrl && (
                          <img
                            src={startup.logoUrl}
                            alt={startup.companyName}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedImage({ url: startup.logoUrl!, title: `${startup.companyName} - Brand Logo` });
                            }}
                            className="w-9 h-9 rounded-lg object-cover border border-[#30363D] shadow-sm bg-[#161B22] shrink-0 cursor-pointer hover:scale-105 transition hover:border-emerald-500"
                            title="Click to view larger logo"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>

                      {/* Founders vertically one on top of the other, clickable to expand */}
                      <div className="space-y-1.5 pt-1.5">
                        {startup.founderPhoto1 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedFounder({
                                name: `${startup.firstName} ${startup.lastName}`,
                                role: "Founder & Chief Executive Officer",
                                photoUrl: startup.founderPhoto1!,
                                companyName: startup.companyName,
                                email: startup.email,
                                phone: startup.phone,
                                bio: `${startup.firstName} ${startup.lastName} is the lead founder and visionary behind ${startup.companyName}. With extensive experience in product strategy, engineering, and market execution, ${startup.firstName} leads the company's core mission to transform industry standards across ${startup.country}.`,
                                linkedin: `https://linkedin.com/in/${startup.firstName.toLowerCase()}-${startup.lastName.toLowerCase()}`,
                                twitter: `https://twitter.com/${startup.firstName.toLowerCase()}_${startup.lastName.toLowerCase()}`,
                                github: `https://github.com/${startup.firstName.toLowerCase()}`
                              });
                            }}
                            className="flex items-center gap-2 p-1.5 bg-[#161B22]/70 hover:bg-[#161B22] rounded-xl border border-[#30363D]/80 cursor-pointer transition group w-fit max-w-full"
                            title="Click to view founder bio, LinkedIn & socials"
                          >
                            <img
                              src={startup.founderPhoto1}
                              alt={`${startup.firstName} ${startup.lastName}`}
                              className="w-7 h-7 rounded-full object-cover border border-emerald-500/40 group-hover:border-emerald-400 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 pr-1">
                              <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate">
                                {startup.firstName} {startup.lastName}
                              </p>
                              <p className="text-[10px] text-[#8B949E] truncate">Founder & CEO</p>
                            </div>
                          </div>
                        )}

                        {startup.founderPhoto2 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedFounder({
                                name: "Co-Founder / Executive Lead",
                                role: "Chief Technology Officer & Co-Founder",
                                photoUrl: startup.founderPhoto2!,
                                companyName: startup.companyName,
                                email: startup.email,
                                bio: `Co-founder and operational lead at ${startup.companyName}. Bringing robust expertise in technical execution, partnership development, and ecosystem growth.`,
                                linkedin: `https://linkedin.com/in/cofounder-${startup.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                                twitter: `https://twitter.com/${startup.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}_lead`
                              });
                            }}
                            className="flex items-center gap-2 p-1.5 bg-[#161B22]/70 hover:bg-[#161B22] rounded-xl border border-[#30363D]/80 cursor-pointer transition group w-fit max-w-full"
                            title="Click to view founder bio, LinkedIn & socials"
                          >
                            <img
                              src={startup.founderPhoto2}
                              alt="Co-Founder"
                              className="w-7 h-7 rounded-full object-cover border border-emerald-500/40 group-hover:border-emerald-400 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 pr-1">
                              <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate">
                                Co-Founder / Team Lead
                              </p>
                              <p className="text-[10px] text-[#8B949E] truncate">{startup.companyName}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-[#8B949E] flex items-center gap-1 pt-0.5">
                        📍 {startup.country} • {startup.fundingStage}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
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

                      {/* Share Deal Link */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareStartup(startup);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/25 transition-all active:scale-90 shrink-0"
                        title="Share Startup Deal Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
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
                    {/* Short Description */}
                    <p className="text-xs text-[#C9D1D9] leading-relaxed">
                      {startup.description}
                    </p>

                    {/* ASK and EQUITY grids (exactly like attachment) */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-3 flex flex-col justify-center min-h-[58px]">
                        <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider block">ASK</span>
                        <span className="text-[14px] sm:text-base font-extrabold text-white mt-0.5 block">
                          {getStartupAskAndEquity(startup).ask}
                        </span>
                      </div>
                      <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-3 flex flex-col justify-center min-h-[58px]">
                        <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider block">EQUITY</span>
                        <span className="text-[14px] sm:text-base font-extrabold text-white mt-0.5 block">
                          {getStartupAskAndEquity(startup).equity}
                        </span>
                      </div>
                    </div>

                    {/* TRACTION SIGNAL (attachment-style) */}
                    <div className="bg-[#161B22]/30 border border-[#30363D] p-3 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> TRACTION SIGNAL
                      </span>
                      <div className="py-1 px-2.5 bg-[#0D1117] border border-[#30363D] rounded-lg text-xs font-semibold text-emerald-400 font-mono tracking-wide">
                        {getTractionSummary(startup)}
                      </div>
                      <p className="text-xs text-[#C9D1D9] leading-relaxed">
                        {startup.traction}
                      </p>
                    </div>

                    {/* Problem and Solution section if the investor wants to read more details */}
                    <div>
                      <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Problem we solve
                      </span>
                      <p className="text-xs text-[#C9D1D9] mt-1.5 leading-relaxed">
                        {startup.problem}
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

                    {/* Founder & View Full Profile Footer (exactly like attachment) */}
                    <div className="flex items-center justify-between border-t border-[#30363D] pt-3.5 mt-2.5">
                      <span className="text-xs text-[#8B949E]">
                        Founder: <strong className="text-white font-semibold">{startup.firstName} {startup.lastName}</strong>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFullProfile(startup);
                        }}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        Full profile →
                      </button>
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

                {/* Floating Swipe Left & Right buttons center-aligned horizontally and positioned higher up */}
                {isTop && isButtonsVisible && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-20 flex items-center gap-6 z-40"
                  >
                    {/* Swipe Left (Pass) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwipe("left");
                      }}
                      className="w-11 h-11 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/25 transition-all active:scale-90"
                      title={translations.swipeLeft}
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Swipe Right (Match) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwipe("right");
                      }}
                      className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-black rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all active:scale-90"
                      title={translations.swipeRight}
                    >
                      <Heart className="w-6 h-6 fill-current" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
      )}
      {/* 5-second Undo Floating Notification Banner */}
      <AnimatePresence>
        {lastSwipe && secondsLeft > 0 && !isBulkMode && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 bg-[#161B22]/95 border border-amber-500/50 shadow-2xl rounded-2xl px-4 py-2 flex items-center gap-3 backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs text-white font-medium">
                Swiped <strong className={lastSwipe.direction === "right" ? "text-emerald-400" : "text-red-400"}>
                  {lastSwipe.direction === "right" ? "Interested" : "Skipped"}
                </strong> {lastSwipe.startup.companyName}
              </span>
            </div>

            <button
              onClick={handleUndo}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo ({secondsLeft}s)</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Image Lightbox Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(null)}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-center flex flex-col items-center"
            >
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 p-2 text-[#8B949E] hover:text-white bg-[#0D1117] rounded-full border border-[#30363D] transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-white mb-4 pr-8">{expandedImage.title}</h3>

              <div className="rounded-2xl overflow-hidden border border-[#30363D] shadow-2xl bg-[#0D1117] max-h-[70vh] flex items-center justify-center p-2">
                <img
                  src={expandedImage.url}
                  alt={expandedImage.title}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <button
                onClick={() => setExpandedImage(null)}
                className="mt-6 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm rounded-xl transition cursor-pointer"
              >
                Close View
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Founder Bio & Socials Modal */}
      <AnimatePresence>
        {expandedFounder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedFounder(null)}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-left flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setExpandedFounder(null)}
                className="absolute top-4 right-4 p-2 text-[#8B949E] hover:text-white bg-[#0D1117] rounded-full border border-[#30363D] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-5 pr-10">
                <img
                  src={expandedFounder.photoUrl}
                  alt={expandedFounder.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xl bg-[#0D1117] shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{expandedFounder.name}</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20">Verified</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold">{expandedFounder.role}</p>
                  <p className="text-xs text-[#8B949E]">At {expandedFounder.companyName}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-[#C9D1D9]">
                <div className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" /> Professional Bio & Vision
                  </h4>
                  <p className="text-sm leading-relaxed text-white">{expandedFounder.bio}</p>
                </div>

                <div className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-3">
                    Social & Professional Links
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href={expandedFounder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2.5 bg-[#161B22] hover:bg-[#1F242C] border border-[#30363D] rounded-xl text-white font-medium text-xs transition group"
                    >
                      <Linkedin className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="truncate flex-1">LinkedIn Profile</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-white" />
                    </a>

                    {expandedFounder.twitter && (
                      <a
                        href={expandedFounder.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2.5 bg-[#161B22] hover:bg-[#1F242C] border border-[#30363D] rounded-xl text-white font-medium text-xs transition group"
                      >
                        <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="truncate flex-1">Twitter / X</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-white" />
                      </a>
                    )}

                    <a
                      href={`mailto:${expandedFounder.email}`}
                      className="flex items-center gap-2.5 p-2.5 bg-[#161B22] hover:bg-[#1F242C] border border-[#30363D] rounded-xl text-white font-medium text-xs transition group sm:col-span-2"
                    >
                      <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate flex-1">{expandedFounder.email}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Direct Email</span>
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowTeamDirectory(true);
                      setExpandedFounder(null);
                    }}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <span>View Full Founder Bio & Team Page</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedFounder(null)}
                    className="py-3 px-5 bg-[#0D1117] hover:bg-[#1F242C] text-white border border-[#30363D] font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Directory Modal */}
      {showTeamDirectory && activeStartup && (
        <TeamDirectoryModal
          startup={activeStartup}
          initialFounderName={expandedFounder?.name}
          onClose={() => setShowTeamDirectory(false)}
          onConnectClick={onStartChat}
        />
      )}
    </div>
  );
}
