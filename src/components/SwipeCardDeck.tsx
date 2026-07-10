import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from "motion/react";
import { Startup, getTractionSummary } from "../types";
import { Heart, X, Sparkles, FolderOpen, MessageCircle, TrendingUp, Smile, Compass, AlertCircle, Bookmark, ChevronUp, ChevronDown, ListFilter, Check, Share2, RotateCcw, Linkedin, Globe, Mail, ExternalLink, Award, Video, Play, Pause, Volume2, Calendar } from "lucide-react";
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
  canReloadDeck?: boolean;
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
  swipeThreshold = 120,
}: {
  x: any;
  swipeThreshold?: number;
}) {
  const onPan = (event: any, info: any) => {
    // Only pan horizontally if user isn't doing a pure vertical scroll.
    // If the touch movement is significantly vertical, we don't move the card.
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y) * 0.6) {
      x.set(info.offset.x);
    }
  };

  return { onPan };
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
  hideHeaderControls = false,
  canReloadDeck = true,
}: SwipeCardDeckProps) {
  const [localStartups, setLocalStartups] = useState<Startup[]>(startups);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkDecisions, setBulkDecisions] = useState<Record<string, "like" | "skip" | null>>({});
  const [sessionMatches, setSessionMatches] = useState(0);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);

  const [lastSwipe, setLastSwipe] = useState<{ startup: Startup; direction: "left" | "right" } | null>(null);
  const [expandedImage, setExpandedImage] = useState<{ url: string; title: string } | null>(null);
  const [showTeamDirectory, setShowTeamDirectory] = useState(false);
  const [quickRefineStartupId, setQuickRefineStartupId] = useState<string | null>(null);
  const [refineFundingStage, setRefineFundingStage] = useState<string>("");
  const [refineTraction, setRefineTraction] = useState<string>("");
  const [refineRevenueStatus, setRefineRevenueStatus] = useState<string>("");
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

  const [activeVideoStartup, setActiveVideoStartup] = useState<Startup | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  useEffect(() => {
    let timer: any;
    if (activeVideoStartup && isVideoPlaying) {
      timer = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 15) {
            return 0; // loops every 15 seconds
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [activeVideoStartup, isVideoPlaying]);

  const activeStartup = localStartups[0];

  const handleQuickCalendar = (startup: Startup, e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    now.setDate(now.getDate() + 2);
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = "10:00";
    const startDateTime = `${dateStr.replace(/-/g, '')}T${timeStr.replace(':', '')}00Z`;
    const meetLink = `https://meet.jit.si/MakwaDiscovery_${startup.companyName.replace(/[^a-z0-9]/gi, '')}_${Date.now()}`;
    
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Makwa Africa//Discovery Call//EN
BEGIN:VEVENT
SUMMARY:Discovery Call: ${startup.companyName} & Investor
DESCRIPTION:Discovery call with ${startup.firstName} ${startup.lastName} (${startup.companyName}). Secure video link: ${meetLink}
DTSTART:${startDateTime}
DTEND:${startDateTime.replace(/T(\d{2})(\d{2})/, (match, h, m) => `T${String(Number(h)+1).padStart(2,'0')}${m}`)}
LOCATION:Secure Video Call
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${startup.companyName.replace(/[^a-z0-9]/gi, '_')}_Discovery_Call.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isButtonsVisible, setIsButtonsVisible] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Synchronize with startups prop when it changes
  useEffect(() => {
    setLocalStartups(startups);
    setBulkDecisions({});
  }, [startups]);

  // Keyboard arrow listeners for left/right swipe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBulkMode || !activeStartup) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSwipe("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSwipe("right");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBulkMode, activeStartup]);

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
  const boxShadowTransform = useTransform(
    motionValue,
    [-200, 0, 200],
    [
      "0 0 40px rgba(239, 68, 68, 0.7), inset 0 0 20px rgba(239, 68, 68, 0.35)",
      "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      "0 0 40px rgba(16, 185, 129, 0.7), inset 0 0 20px rgba(16, 185, 129, 0.35)"
    ]
  );
  const borderColorTransform = useTransform(
    motionValue,
    [-150, 0, 150],
    ["rgba(239, 68, 68, 0.95)", "rgba(48, 54, 61, 1)", "rgba(16, 185, 129, 0.95)"]
  );
  const leftOverlayOpacity = useTransform(motionValue, [0, -150], [0, 0.3]);
  const rightOverlayOpacity = useTransform(motionValue, [0, 150], [0, 0.3]);

  const handleSwipe = (direction: "left" | "right") => {
    if (!activeStartup) return;
    const swiped = activeStartup;
    const targetX = direction === "right" ? 720 : -720;

    animate(motionValue, targetX, {
      type: "tween",
      duration: 0.12,
      ease: "easeOut",
      onComplete: () => {
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
        });
      }
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
        {canReloadDeck ? (
          <button
            onClick={resetDeck}
            className="px-5 py-2 sm:px-6 sm:py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg shadow-md transition-all active:scale-95 text-xs sm:text-sm"
          >
            Reload Startups Database
          </button>
        ) : (
          <div className="px-4 py-2 text-[11px] sm:text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            Startup deck is locked. Upgrade to Enterprise to continue swiping.
          </div>
        )}
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
                ref={isTop ? scrollContainerRef : null}
                onScroll={(e) => {
                  if (isTop) updateScrollIndicators(e.currentTarget);
                }}
                className="absolute inset-3 bg-[#0D1117] rounded-2xl shadow-2xl border border-[#30363D] overflow-y-auto no-scrollbar flex flex-col justify-between cursor-grab active:cursor-grabbing select-none"
                style={
                  isTop
                    ? {
                        x: motionValue,
                        rotate: rotateTransform,
                        opacity: opacityTransform,
                        boxShadow: boxShadowTransform,
                        borderColor: borderColorTransform,
                        zIndex: 10,
                      }
                    : {
                        zIndex: 1,
                      }
                }
                drag={isTop ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.55}
                onDragEnd={isTop ? (e, info) => {
                  if (info.offset.x > 85) {
                    handleSwipe("right");
                  } else if (info.offset.x < -85) {
                    handleSwipe("left");
                  } else {
                    animate(motionValue, 0, { type: "spring", stiffness: 420, damping: 30 });
                  }
                } : undefined}
                onPan={isTop ? panGesture.onPan : undefined}
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
                {/* Dynamic swipe glow overlay */}
                {isTop && (
                  <>
                    <motion.div
                      className="absolute inset-0 bg-red-500 pointer-events-none rounded-2xl z-20"
                      style={{ opacity: leftOverlayOpacity }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-emerald-500 pointer-events-none rounded-2xl z-20"
                      style={{ opacity: rightOverlayOpacity }}
                    />
                  </>
                )}
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

                    <div className="flex flex-col items-end shrink-0 gap-1.5 max-w-[45%]">
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {/* Circular Pitch Confidence Meter */}
                        <div className="relative w-8 h-8 flex items-center justify-center shrink-0" title="Pitch Confidence Sentiment Meter">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-[#30363D]"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-emerald-400 transition-all duration-500"
                              strokeDasharray={`${startup.pitchScore || 85}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold font-mono text-white">
                            {startup.pitchScore || 85}%
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-amber-400 font-bold bg-[#161B22] border border-[#30363D] px-2 py-1 rounded-md shrink-0">
                          <Sparkles className="w-2.5 h-2.5 fill-current text-amber-400" />
                          <span>{startup.pitchScore || 85}</span>
                        </div>
                      </div>

                      {/* Quick Refine Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickRefineStartupId(startup.id);
                          setRefineFundingStage(startup.fundingStage);
                          setRefineTraction(startup.traction || "");
                          setRefineRevenueStatus(startup.revenueStatus || "Revenue Generating");
                        }}
                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                        title="Adjust funding stage & pitch claims for instant AI score recalculation"
                      >
                        <span>⚡ Refine</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Refine Inline Modal Overlay */}
                {quickRefineStartupId === startup.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 bg-[#0D1117]/95 backdrop-blur-md z-40 p-5 flex flex-col justify-between overflow-y-auto animate-fade-in"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                            ⚡
                          </span>
                          <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick Pitch Refiner</h3>
                            <p className="text-[10px] text-[#8B949E]">Adjust claims for instant AI Score recalculation</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setQuickRefineStartupId(null)}
                          className="w-7 h-7 rounded-full bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-white flex items-center justify-center text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Live AI Score Preview */}
                      {(() => {
                        let computed = 65;
                        if (refineFundingStage.toLowerCase().includes("seed") || refineFundingStage.toLowerCase().includes("series")) computed += 18;
                        if (refineRevenueStatus.toLowerCase().includes("revenue") || refineRevenueStatus.toLowerCase().includes("profitable")) computed += 14;
                        if (refineTraction.length > 25) computed += 10;
                        const finalScore = Math.min(99, computed);

                        return (
                          <div className="p-3 bg-[#161B22] border border-emerald-500/30 rounded-xl flex items-center justify-between">
                            <span className="text-xs font-bold text-[#C9D1D9]">Simulated AI Score</span>
                            <span className="text-sm font-black font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                              {finalScore} / 100
                            </span>
                          </div>
                        );
                      })()}

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block mb-1">Funding Stage</label>
                          <select
                            value={refineFundingStage}
                            onChange={(e) => setRefineFundingStage(e.target.value)}
                            className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Pre-Seed">Pre-Seed</option>
                            <option value="Seed">Seed</option>
                            <option value="Series A">Series A</option>
                            <option value="Series B">Series B</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block mb-1">Revenue Status</label>
                          <select
                            value={refineRevenueStatus}
                            onChange={(e) => setRefineRevenueStatus(e.target.value)}
                            className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Pre-Revenue">Pre-Revenue / MVP</option>
                            <option value="Revenue Generating">Revenue Generating</option>
                            <option value="Profitable">Profitable & Scaling</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block mb-1">Traction & Growth Notes</label>
                          <textarea
                            value={refineTraction}
                            onChange={(e) => setRefineTraction(e.target.value)}
                            rows={3}
                            className="w-full bg-[#161B22] border border-[#30363D] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                            placeholder="Describe pilot users, MRR growth, or signed contracts..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#30363D] flex items-center justify-end gap-2">
                      <button
                        onClick={() => setQuickRefineStartupId(null)}
                        className="px-3.5 py-2 bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] border border-[#30363D] text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          let computed = 65;
                          if (refineFundingStage.toLowerCase().includes("seed") || refineFundingStage.toLowerCase().includes("series")) computed += 18;
                          if (refineRevenueStatus.toLowerCase().includes("revenue") || refineRevenueStatus.toLowerCase().includes("profitable")) computed += 14;
                          if (refineTraction.length > 25) computed += 10;
                          const finalScore = Math.min(99, computed);

                          setLocalStartups(prev => prev.map(s => s.id === startup.id ? {
                            ...s,
                            fundingStage: refineFundingStage,
                            traction: refineTraction,
                            revenueStatus: refineRevenueStatus,
                            pitchScore: finalScore
                          } : s));
                          setQuickRefineStartupId(null);
                        }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                      >
                        Save & Recalculate AI Score
                      </button>
                    </div>
                  </div>
                )}

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
                  {isTop && isButtonsVisible && (
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

                      {/* Quick Add to Calendar (if passed AI sentiment threshold >= 80) */}
                      {((startup.pitchScore || startup.sentimentScore || 85) >= 80) && (
                        <button
                          onClick={(e) => handleQuickCalendar(startup, e)}
                          className="w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/25 transition-all active:scale-90 shrink-0"
                          title="Quick Add to Calendar (Discovery Call ICS)"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      )}

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

                      {/* 15s Video Pitch */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveVideoStartup(startup);
                          setVideoProgress(0);
                          setIsVideoPlaying(true);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 transition-all active:scale-90 shrink-0 group relative"
                        title="Play 15-Second Intro Video Pitch"
                      >
                        <Video className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
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
                    className={`pl-5 py-2 pb-4 space-y-3.5 ${isButtonsVisible ? "pr-14" : "pr-5"}`}
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

                {/* Floating Undo, Swipe Left & Right buttons center-aligned horizontally and positioned higher up */}
                {isTop && isButtonsVisible && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-20 flex items-center gap-4 z-40"
                  >
                    {/* Orange Undo Swipe Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (lastSwipe) handleUndo();
                      }}
                      disabled={!lastSwipe}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                        lastSwipe
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30 cursor-pointer opacity-100 animate-pulse"
                          : "bg-orange-500/40 text-white border border-orange-500/40 cursor-not-allowed opacity-70"
                      }`}
                      title={lastSwipe ? "Undo last swipe" : "No recent swipe to undo"}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

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

      {/* 15-Second Video Pitch Modal */}
      {activeVideoStartup && (
        <div className="absolute inset-0 bg-[#0D1117]/95 backdrop-blur-xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-500/30">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeVideoStartup.companyName}</span>
                  <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 font-mono">15s Pitch</span>
                </h3>
                <p className="text-[11px] text-[#8B949E]">Founder Intro Video • Looped Presentation</p>
              </div>
            </div>
            <button
              onClick={() => setActiveVideoStartup(null)}
              className="w-8 h-8 rounded-full bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-[#30363D] shadow-2xl flex flex-col justify-between group">
              {/* Simulated Video Feed Background */}
              <div className="absolute inset-0">
                <img
                  src={activeVideoStartup.founderPhoto1 || activeVideoStartup.logoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"}
                  alt={activeVideoStartup.companyName}
                  className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30" />
              </div>

              {/* Top video overlay badges */}
              <div className="relative z-10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-mono text-white">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>REC 00:{Math.floor(videoProgress).toString().padStart(2, '0')} / 00:15</span>
                </div>
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] text-orange-400 font-bold">
                  <span>HD 1080p</span>
                </div>
              </div>

              {/* Center Play/Pause toggle overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                {!isVideoPlaying && (
                  <div className="w-16 h-16 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md border border-orange-400/50">
                    <Play className="w-7 h-7 fill-current translate-x-0.5" />
                  </div>
                )}
              </div>

              {/* Bottom Video Info & Subtitle */}
              <div className="relative z-10 p-5 space-y-3">
                <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                  <p className="text-xs text-white font-medium italic">
                    "{activeVideoStartup.firstName} {activeVideoStartup.lastName}: We are solving {activeVideoStartup.problem.slice(0, 90)}... Join us as we scale {activeVideoStartup.companyName} across {activeVideoStartup.country}!"
                  </p>
                </div>

                {/* Animated Audio Equalizer Waveform */}
                <div className="flex items-center justify-between gap-1 h-6 px-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                  {[4, 10, 16, 8, 14, 20, 12, 6, 18, 9, 15, 7, 13, 19, 11, 5, 17, 8, 14, 10].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={isVideoPlaying ? { height: [`${Math.max(4, h * (Math.sin(videoProgress + i) + 1.2))}px`, "22px", "6px"] } : { height: "4px" }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.05 }}
                      className="w-1 bg-orange-400 rounded-full"
                    />
                  ))}
                </div>

                {/* Video Controls bar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                      className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition cursor-pointer"
                    >
                      {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    <span className="text-xs font-mono text-white/90">
                      {videoProgress.toFixed(1)}s / 15.0s
                    </span>
                  </div>

                  <button
                    onClick={() => setVideoProgress(0)}
                    className="px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full transition-all duration-100"
                    style={{ width: `${(videoProgress / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#30363D] flex items-center justify-between">
            <span className="text-xs text-[#8B949E]">
              💡 15-second looped founder pitch verified by Makwa VC
            </span>
            <button
              onClick={() => setActiveVideoStartup(null)}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-orange-500/20"
            >
              Done Watching
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
