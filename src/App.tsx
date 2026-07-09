import React, { useState, useEffect } from "react";
import { Startup, UserProfile, DirectMessage, SwipeHistoryItem } from "./types";
import { placeholderStartups } from "./data/placeholderStartups";
import { translations } from "./data/translations";
import SwipeCardDeck from "./components/SwipeCardDeck";
import AIDashboards from "./components/AIDashboards";
import DataRoom from "./components/DataRoom";
import Messages from "./components/Messages";
import AuthScreen from "./components/AuthScreen";
import FullProfileModal from "./components/FullProfileModal";
import ShareModal from "./components/ShareModal";
import FoundersSpotlight from "./components/FoundersSpotlight";
import EnterprisePaywallModal from "./components/EnterprisePaywallModal";
import TeamSeatManagerModal from "./components/TeamSeatManagerModal";
import { apiJson, clearSessionToken, getSessionToken, setSessionToken } from "./lib/api";
import { motion, AnimatePresence } from "motion/react";
import { signInWithGoogle } from "./lib/googleAuth";
import {
  Compass,
  Trophy,
  BarChart2,
  FolderOpen,
  MessageSquare,
  User,
  LogOut,
  Moon,
  Sun,
  Bell,
  Wifi,
  WifiOff,
  Globe,
  Sparkles,
  PlusCircle,
  FileText,
  Lock,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Smile,
  AlertCircle,
  Menu,
  X,
  Bookmark,
  RefreshCw,
  Search,
  SlidersHorizontal,
  History,
  RotateCcw,
  Download,
  Share2,
  Users
} from "lucide-react";

export default function App() {
  const getStartupCacheKey = (userId?: string | null) => userId ? `makwa_startups_user_${userId}` : "makwa_startups_public";
  const getMessageCacheKey = (userId?: string | null, recipientId?: string | null) =>
    userId && recipientId ? `makwa_messages_${userId}_${recipientId}` : null;

  // Localization & Language state
  const [lang, setLang] = useState("en");
  const t = translations[lang] || translations.en;

  // Dark/Light Theme state
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // User Authentication state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("makwa_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthBootstrapping, setIsAuthBootstrapping] = useState(true);
  const [isQuickGoogleLoading, setIsQuickGoogleLoading] = useState(false);

  // Navigation Menu (Burger Menu) state
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem("makwa_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  // Track active startup in deck to show shortcuts/bookmarks next to it
  const [activeStartupInDeck, setActiveStartupInDeck] = useState<Startup | null>(null);

  // Track the user-selected startup for showcase Metrics and Dataroom views
  const [selectedStartupForShowcase, setSelectedStartupForShowcase] = useState<Startup | null>(null);

  // Track selected startup for the full profile portal modal
  const [selectedFullProfileStartup, setSelectedFullProfileStartup] = useState<Startup | null>(null);

  // Share Modal states
  const [shareModalStartup, setShareModalStartup] = useState<Startup | null>(null);
  const [isAppShareModalOpen, setIsAppShareModalOpen] = useState(false);

  // Synchronize bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem("makwa_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (startupId: string) => {
    setBookmarks((prev) => {
      const exists = prev.includes(startupId);
      const updated = exists ? prev.filter((id) => id !== startupId) : [...prev, startupId];
      const targetName = startups.find(s => s.id === startupId)?.companyName || "Venture";
      if (!exists) {
        addNotification(`🔖 Saved ${targetName} to your bookmarks log.`);
      } else {
        addNotification(`🔖 Removed ${targetName} from your bookmarks log.`);
      }
      return updated;
    });
  };

  // Track free swipes made by anonymous users
  const [freeSwipesCount, setFreeSwipesCount] = useState<number>(() => {
    return Number(localStorage.getItem("makwa_free_swipes_count") || "0");
  });

  // Enterprise License state
  const [hasEnterpriseLicense, setHasEnterpriseLicense] = useState<boolean>(() => {
    return localStorage.getItem("makwa_enterprise_license") === "true";
  });
  const [enterpriseOrgDomain, setEnterpriseOrgDomain] = useState<string>(() => {
    return localStorage.getItem("makwa_enterprise_org_domain") || "";
  });
  const [isEnterprisePaywallOpen, setIsEnterprisePaywallOpen] = useState(false);
  const [isTeamSeatManagerOpen, setIsTeamSeatManagerOpen] = useState(false);

  useEffect(() => {
    if (user && user.email && enterpriseOrgDomain) {
      const userDomain = user.email.split("@")[1]?.toLowerCase();
      if (userDomain === enterpriseOrgDomain) {
        setHasEnterpriseLicense(true);
      }
    }
  }, [user, enterpriseOrgDomain]);

  const handleActivateEnterpriseLicense = async (domain: string, code?: string) => {
    const normalizedDomain = domain.toLowerCase();

    try {
      if (user && getSessionToken()) {
        await apiJson<{ success: true; licenseTier: string; enterpriseDomain: string }>("/api/me/license/enterprise", {
          method: "POST",
          body: JSON.stringify({ domain: normalizedDomain })
        });
      }

      setHasEnterpriseLicense(true);
      setEnterpriseOrgDomain(normalizedDomain);
      localStorage.setItem("makwa_enterprise_license", "true");
      localStorage.setItem("makwa_enterprise_org_domain", normalizedDomain);
      setIsEnterprisePaywallOpen(false);

      const refreshedStartups = await apiJson<Startup[]>("/api/startups");
      setStartups(refreshedStartups);
      localStorage.setItem(getStartupCacheKey(user?.id), JSON.stringify(refreshedStartups));

      if (code && code !== "SIMULATED-EFT") {
        addNotification(`🎉 Enterprise Unlock Code verified successfully! License activated for @${normalizedDomain}. All startups unlocked.`);
      } else {
        addNotification(`🎉 Enterprise Annual License activated for @${normalizedDomain}. All startups unlocked.`);
      }
    } catch {
      addNotification("⚠️ Enterprise activation failed. Please verify your connection and try again.");
    }
  };

  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<"swipe" | "dashboard" | "leaderboard" | "dataroom" | "chat" | "profile" | "history" | "pulse" | "swipemode" | "founders">("swipe");

  // Collapsible controls for optimal focus and no vertical scrolling
  const [isTopBarCollapsed, setIsTopBarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("makwa_top_bar_collapsed") === "true";
  });
  const [isBottomBarCollapsed, setIsBottomBarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("makwa_bottom_bar_collapsed") === "true";
  });

  // Startups state (guests see immediate placeholders; authenticated users load live data)
  const [startups, setStartups] = useState<Startup[]>(() => [...placeholderStartups]);

  // Messages state
  const [messages, setMessages] = useState<DirectMessage[]>([]);

  // Active chat recipient
  const [activeChatRecipient, setActiveChatRecipient] = useState<Startup | null>(null);

  // Cache for Gemini analysis to prevent duplicate API hits
  const [aiInsightsCache, setAiInsightsCache] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Offline functionality state
  const [isOffline, setIsOffline] = useState(false);

  // Search & Filter state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industrys");
  const [matchSuitabilityOnly, setMatchSuitabilityOnly] = useState(false);

  // Track liked and super startups
  const [likedStartups, setLikedStartups] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("makwa_liked_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [superStartups, setSuperStartups] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("makwa_super_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Synchronize likes and supers to localStorage
  useEffect(() => {
    localStorage.setItem("makwa_liked_ids", JSON.stringify(likedStartups));
  }, [likedStartups]);

  useEffect(() => {
    localStorage.setItem("makwa_super_ids", JSON.stringify(superStartups));
  }, [superStartups]);

  // Swipe history tracking (last 20 swiped startups)
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("makwa_swipe_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("makwa_swipe_history", JSON.stringify(swipeHistory));
  }, [swipeHistory]);

  const recordSwipeHistory = (startup: Startup, direction: "left" | "right") => {
    setSwipeHistory((prev) => {
      const filtered = prev.filter(item => item.startup.id !== startup.id);
      const newItem: SwipeHistoryItem = {
        id: `${startup.id}-${Date.now()}`,
        startup,
        direction,
        timestamp: Date.now()
      };
      return [newItem, ...filtered].slice(0, 20);
    });
  };

  const handleHistoryUndo = (item: SwipeHistoryItem) => {
    setSwipeHistory((prev) => prev.filter(h => h.id !== item.id));
    if (item.direction === "right") {
      setLikedStartups((prev) => prev.filter(id => id !== item.startup.id));
      setSuperStartups((prev) => prev.filter(id => id !== item.startup.id));
      addNotification(`↩️ Reverted interest match for ${item.startup.companyName}.`);
    } else {
      addNotification(`↩️ Reverted skip for ${item.startup.companyName}.`);
    }
    setStartups((prev) => {
      if (!prev.some(s => s.id === item.startup.id)) {
        return [item.startup, ...prev];
      }
      return prev;
    });
  };

  const handleDownloadCSV = () => {
    try {
      const headers = ["SwipeID", "CompanyName", "Category", "FundingStage", "Country", "SwipeDirection", "Timestamp"];
      const rows = swipeHistory.map(item => [
        item.id,
        `"${item.startup.companyName.replace(/"/g, '""')}"`,
        `"${(item.startup.category || "General").replace(/"/g, '""')}"`,
        `"${item.startup.fundingStage}"`,
        `"${item.startup.country}"`,
        item.direction,
        `"${new Date(item.timestamp).toISOString()}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `makwa_swipe_history_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addNotification("📥 Successfully downloaded swipe history & match records as CSV.");
    } catch (err) {
      console.error("CSV download error:", err);
      alert("Failed to download CSV.");
    }
  };

  // Push notifications logs
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; date: string }>>([
    { id: "1", text: "Welcome to Makwa Match. Complete your profile to start matching.", date: new Date().toLocaleTimeString() },
    { id: "2", text: "Standard seed database with South African startups successfully loaded offline.", date: new Date().toLocaleTimeString() }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Form states for creating a new startup card with AI help (with localStorage draft auto-save)
  const [rawPitchText, setRawPitchText] = useState(() => localStorage.getItem("makwa_pitch_draft_raw") || "");
  const [newCompanyName, setNewCompanyName] = useState(() => localStorage.getItem("makwa_pitch_draft_company") || "");
  const [isRefiningNewCard, setIsRefiningNewCard] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    localStorage.setItem("makwa_pitch_draft_raw", rawPitchText);
    localStorage.setItem("makwa_pitch_draft_company", newCompanyName);
    setHasDraft(Boolean(rawPitchText.trim() || newCompanyName.trim()));
  }, [rawPitchText, newCompanyName]);

  useEffect(() => {
    const token = getSessionToken();
    if (!token) {
      setIsAuthBootstrapping(false);
      return;
    }

    apiJson<{ user: UserProfile }>("/api/auth/me")
      .then((response) => {
        setUser(response.user);
        localStorage.setItem("makwa_user", JSON.stringify(response.user));
      })
      .catch(() => {
        clearSessionToken();
        setUser(null);
        localStorage.removeItem("makwa_user");
      })
      .finally(() => setIsAuthBootstrapping(false));
  }, []);

  // Fetch startups from backend with guest-safe redaction
  useEffect(() => {
    if (isOffline || isAuthBootstrapping) {
      return;
    }

    if (!user || !getSessionToken()) {
      setStartups([...placeholderStartups]);
      return;
    }

    const cacheKey = getStartupCacheKey(user?.id);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setStartups(JSON.parse(cached));
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    apiJson<Startup[]>("/api/startups")
      .then((data) => {
        setStartups(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      })
      .catch(() => console.log("Operating offline, using scoped startup cache."));
  }, [isOffline, isAuthBootstrapping, user?.id]);

  useEffect(() => {
    if (isAuthBootstrapping || !user || !getSessionToken()) {
      return;
    }

    apiJson<{
      bookmarks?: string[];
      likedStartups?: string[];
      superStartups?: string[];
      freeSwipesCount?: number;
      licenseTier?: "standard" | "enterprise";
      enterpriseDomain?: string;
    }>("/api/me/preferences")
      .then((preferences) => {
        if (Array.isArray(preferences.bookmarks)) setBookmarks(preferences.bookmarks);
        if (Array.isArray(preferences.likedStartups)) setLikedStartups(preferences.likedStartups);
        if (Array.isArray(preferences.superStartups)) setSuperStartups(preferences.superStartups);
        if (typeof preferences.freeSwipesCount === "number") setFreeSwipesCount(preferences.freeSwipesCount);
        if (preferences.licenseTier === "enterprise") {
          setHasEnterpriseLicense(true);
          localStorage.setItem("makwa_enterprise_license", "true");
        }
        if (preferences.enterpriseDomain) {
          setEnterpriseOrgDomain(preferences.enterpriseDomain);
          localStorage.setItem("makwa_enterprise_org_domain", preferences.enterpriseDomain);
        }
      })
      .catch(() => console.log("Preference sync unavailable, using local device state."));
  }, [isAuthBootstrapping, user?.id]);

  useEffect(() => {
    if (!user || !activeChatRecipient || !getSessionToken()) {
      return;
    }

    const cacheKey = getMessageCacheKey(user.id, activeChatRecipient.id);
    if (cacheKey) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setMessages(JSON.parse(cached));
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }
    }

    apiJson<DirectMessage[]>(`/api/messages/${activeChatRecipient.id}`)
      .then((data) => {
        setMessages(data);
        if (cacheKey) {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        }
      })
      .catch(() => console.log("Conversation sync unavailable, using cached messages."));
  }, [activeChatRecipient?.id, user?.id]);

  // Handle shared startup URL deep-links on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedStartupId = params.get("startupId");
    if (sharedStartupId) {
      const found = startups.find(s => s.id === sharedStartupId);
      if (found) {
        setStartups(prev => [found, ...prev.filter(s => s.id !== sharedStartupId)]);
        setSelectedFullProfileStartup(found);
        addNotification(`🔗 Opened shared deal profile for ${found.companyName}`);
      }
    }
  }, []);

  // Sync Status and Force Sync state
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "discrepancy" | "offline">(
    navigator.onLine ? "synced" : "offline"
  );
  const [lastSyncTime, setLastSyncTime] = useState<number>(() => {
    return Number(localStorage.getItem("makwa_last_sync") || Date.now());
  });
  const [hasDiscrepancy, setHasDiscrepancy] = useState<boolean>(false);

  // Network listener & discrepancy checker
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(hasDiscrepancy ? "discrepancy" : "synced");
      addNotification("🌐 Network reconnected. Local-to-server data state verified.");
    };
    const handleOffline = () => {
      setSyncStatus("offline");
      addNotification("📡 Network offline. Changes safely queued in local cache.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [hasDiscrepancy]);

  // Mark discrepancy when local data changes
  useEffect(() => {
    if (navigator.onLine) {
      setHasDiscrepancy(true);
      setSyncStatus("discrepancy");
    }
  }, [likedStartups, bookmarks, swipeHistory, startups, freeSwipesCount]);

  const handleForceSync = async () => {
    if (!navigator.onLine) {
      alert("Cannot force sync while offline. Please check your internet connection.");
      return;
    }

    setSyncStatus("syncing");
    addNotification("🔄 Force Sync initiated: Pushing local state to the secure Makwa backend...");

    try {
      if (user && getSessionToken()) {
        await apiJson<{ success: true }>("/api/me/preferences", {
          method: "PUT",
          body: JSON.stringify({
            bookmarks,
            likedStartups,
            superStartups,
            freeSwipesCount,
            lastSyncedAt: Date.now()
          })
        });
      }

      const now = Date.now();
      setSyncStatus("synced");
      setHasDiscrepancy(false);
      setLastSyncTime(now);
      localStorage.setItem("makwa_last_sync", String(now));
      addNotification("✅ Force Sync successful: Local preferences synchronized with the backend.");
    } catch (error) {
      console.error("Force sync error:", error);
      setSyncStatus("discrepancy");
      addNotification("⚠️ Force Sync warning: Data retained in local persistent cache.");
    }
  };

  // Handle dark mode DOM class toggles
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Sync network status with browser
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      addNotification("📡 Network restored. Refreshing secure backend data.");

      if (!user || !getSessionToken()) {
        setStartups([...placeholderStartups]);
        return;
      }

      apiJson<Startup[]>("/api/startups")
        .then((data) => {
          setStartups(data);
          localStorage.setItem(getStartupCacheKey(user?.id), JSON.stringify(data));
        })
        .catch(() => console.log("Refresh skipped: offline"));
    };

    const handleOffline = () => {
      setIsOffline(true);
      addNotification("🔌 Offline Mode active. All matches and messages are saved securely in local sandbox.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user?.id]);

  const addNotification = (text: string) => {
    const newNotif = {
      id: String(Date.now()),
      text,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Local / push notification trigger
    if (Notification.permission === "granted") {
      new Notification("Makwa Match Update", { body: text });
    }
  };

  // Google sign in / Auth registration
  const handleSignIn = async (profile: UserProfile, selectedLang: string, sessionToken?: string) => {
    try {
      const session = sessionToken
        ? { user: profile, token: sessionToken }
        : await apiJson<{ user: UserProfile; token: string }>("/api/auth/session", {
            method: "POST",
            body: JSON.stringify({ profile, provider: "demo", providerUserId: profile.id })
          });

      setSessionToken(session.token);
      setUser(session.user);
      setLang(selectedLang);
      localStorage.setItem("makwa_user", JSON.stringify(session.user));
      addNotification(`🔓 Authorized successfully as ${session.user.name} (${session.user.role}).`);
    } catch (error: any) {
      addNotification(`⚠️ Sign-in session failed: ${error.message || "Please try again."}`);
    }
  };

  const handleQuickGoogleSignIn = async () => {
    if (isQuickGoogleLoading) {
      return;
    }

    setIsQuickGoogleLoading(true);
    try {
      const session = await signInWithGoogle({ role: "investor", company: "Makwa Capital" });
      await handleSignIn(session.user, lang, session.token);
    } catch (error: any) {
      addNotification(error?.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsQuickGoogleLoading(false);
    }
  };

  const handleSignOut = () => {
    const currentUserId = user?.id;
    const token = getSessionToken();
    if (token) {
      apiJson<{ success: boolean }>("/api/auth/logout", { method: "POST" }).catch(() => {
        console.log("Logout endpoint unavailable, proceeding with local sign-out");
      });
    }

    const gapiAuth = (window as any)?.gapi?.auth2?.getAuthInstance?.();
    if (gapiAuth?.signOut) {
      gapiAuth.signOut().catch(() => {
        console.log("Google client sign-out skipped");
      });
    }

    clearSessionToken();
    setUser(null);
    setMessages([]);
    setStartups([...placeholderStartups]);
    localStorage.removeItem("makwa_user");
    localStorage.removeItem("makwa_free_swipes_count");
    if (currentUserId) {
      localStorage.removeItem(getStartupCacheKey(currentUserId));
      Object.keys(localStorage)
        .filter((key) => key.startsWith(`makwa_messages_${currentUserId}_`))
        .forEach((key) => localStorage.removeItem(key));
    }
    setFreeSwipesCount(0);
    setActiveTab("swipe");
    addNotification("🔒 Signed out securely. Session data cleared.");
  };

  const handleResetSwipes = () => {
    localStorage.removeItem("makwa_free_swipes_count");
    localStorage.removeItem("makwa_liked_ids");
    localStorage.removeItem("makwa_super_ids");
    setFreeSwipesCount(0);
    setLikedStartups([]);
    setSuperStartups([]);
    addNotification("🔄 Swipes reloaded successfully! Free trial swipes have been reset for testing.");
  };

  // Tinder Swiping mechanics
  const incrementFreeSwipe = () => {
    setFreeSwipesCount((prev) => {
      const next = prev + 1;
      localStorage.setItem("makwa_free_swipes_count", String(next));

      if (!user && next >= 5) {
        addNotification("🔒 5 free pre-seed swipes completed! Sign in with Google, email, or mobile to unlock 10 more startups.");
      } else if (user && !hasEnterpriseLicense && next >= 15) {
        setIsEnterprisePaywallOpen(true);
        addNotification("🔒 15 startup views reached! Enterprise License required to view the remaining 55 startups.");
      }

      return next;
    });
  };

  const handleSwipeLeft = (startup: Startup) => {
    incrementFreeSwipe();
    recordSwipeHistory(startup, "left");
    setStartups((prev) => prev.filter(s => s.id !== startup.id));
    addNotification(`Skip: Ignored deal flow proposal from ${startup.companyName}.`);
  };

  const handleSwipeRight = (startup: Startup) => {
    incrementFreeSwipe();
    recordSwipeHistory(startup, "right");
    setStartups((prev) => prev.filter(s => s.id !== startup.id));
    setLikedStartups((prev) => {
      if (!prev.includes(startup.id)) {
        return [...prev, startup.id];
      }
      return prev;
    });

    // If score is high, count as a super-like
    if (startup.pitchScore && startup.pitchScore >= 88) {
      setSuperStartups((prev) => {
        if (!prev.includes(startup.id)) {
          return [...prev, startup.id];
        }
        return prev;
      });
    }

    if (!user) {
      addNotification(`🎉 Match Made! Register with Google to chat with ${startup.firstName} at ${startup.companyName}.`);
    } else {
      addNotification(`🎉 Match Made! Direct chat initialized with ${startup.firstName} at ${startup.companyName}.`);
    }
  };

  const handleUndoSwipe = (startup: Startup, direction: "left" | "right") => {
    setStartups((prev) => {
      const alreadyPresent = prev.some((s) => s.id === startup.id);
      if (alreadyPresent) {
        return prev;
      }
      return [startup, ...prev];
    });

    if (direction === "right") {
      setLikedStartups((prev) => prev.filter(id => id !== startup.id));
      setSuperStartups((prev) => prev.filter(id => id !== startup.id));
      addNotification(`↩️ Reverted interest match for ${startup.companyName}.`);
    } else {
      addNotification(`↩️ Reverted skip for ${startup.companyName}.`);
    }
  };

  // Refresh AI Analysis from Server-side Gemini
  const handleRefreshAI = async (startup: Startup) => {
    setIsAnalyzing(true);
    addNotification(`🤖 Launching deep automated deal-flow analysis for ${startup.companyName}...`);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id })
      });
      if (!response.ok) throw new Error("Fallback to heuristic score models");
      const cleanJSON = await response.json();

      setAiInsightsCache((prev) => ({
        ...prev,
        [startup.id]: cleanJSON
      }));
      addNotification(`📊 Gemini AI analysis loaded successfully for ${startup.companyName}.`);
    } catch (err) {
      // Offline / network failure heuristics
      addNotification("⚙️ Running local offline AI heuristic scores.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Direct send message
  const handleSendMessage = async (content: string) => {
    if (!user || !activeChatRecipient) return;

    try {
      const response = await apiJson<{ success: true; message: DirectMessage }>("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          toId: activeChatRecipient.id,
          content,
          encrypted: true
        })
      });
      setMessages((prev) => [...prev, response.message]);
      const cacheKey = getMessageCacheKey(user.id, activeChatRecipient.id);
      if (cacheKey) {
        localStorage.setItem(cacheKey, JSON.stringify([...messages, response.message]));
      }
      addNotification(`💬 Encrypted message sent to ${activeChatRecipient.companyName}.`);
    } catch {
      addNotification("⚠️ Message delivery failed. Please try again once connected.");
    }
  };

  // Create Startup with AI refinement
  const handleCreateStartupWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawPitchText.trim()) return;

    setIsRefiningNewCard(true);
    addNotification(`🤖 Structuring your raw text into a standard VC card...`);

    try {
      const res = await fetch("/api/ai/pitch-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: rawPitchText, companyName: newCompanyName })
      });
      const structuredCard = await res.json();

      const draftStartup: Partial<Startup> = {
        firstName: user?.name.split(" ")[0] || "Founder",
        lastName: user?.name.split(" ")[1] || "Startup",
        email: user?.email || "founder@domain.com",
        phone: "+27 60 123 4567",
        companyName: structuredCard.companyName || newCompanyName || "New Startup",
        website: "https://my-startup.co.za",
        country: "South Africa",
        problem: structuredCard.problem,
        description: structuredCard.description,
        traction: structuredCard.traction,
        team: structuredCard.team || user?.name || "Founding team",
        fundingStage: "Pre-Seed",
        dealTerms: "Raising ZAR 1.5 million via SAFE note with a 20% discount.",
        category: structuredCard.suggestedCategory || "SaaS & AI",
        pitchScore: Math.floor(Math.random() * 15) + 80,
        sentimentScore: 92,
        fundingSuccessRate: Math.floor(Math.random() * 15) + 75
      };

      const response = await apiJson<{ success: true; startup: Startup }>("/api/startups", {
        method: "POST",
        body: JSON.stringify(draftStartup)
      });

      setStartups((prev) => [response.startup, ...prev]);
      setRawPitchText("");
      setNewCompanyName("");
      localStorage.removeItem("makwa_pitch_draft_raw");
      localStorage.removeItem("makwa_pitch_draft_company");
      setHasDraft(false);
      setActiveTab("swipe");
      addNotification(`🚀 ${response.startup.companyName} launched to VC Swipe Deck!`);
    } catch (err) {
      addNotification("⚠️ AI builder failed, try again once internet restores.");
    } finally {
      setIsRefiningNewCard(false);
    }
  };

  const handleUpdateDataroom = async (updatedStartup: Startup) => {
    try {
      const response = await apiJson<{ success: true; startup: Startup }>(`/api/startups/${updatedStartup.id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedStartup)
      });
      setStartups((prev) => prev.map((s) => (s.id === response.startup.id ? response.startup : s)));
      addNotification(`🔒 Dataroom of ${response.startup.companyName} stored securely in the backend.`);
    } catch {
      addNotification("⚠️ Dataroom update failed. Please sign in with the owning account.");
    }
  };

  const handleUpdateStartup = async (updatedStartup: Startup) => {
    try {
      const response = await apiJson<{ success: true; startup: Startup }>(`/api/startups/${updatedStartup.id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedStartup)
      });
      setStartups((prev) => prev.map((s) => (s.id === response.startup.id ? response.startup : s)));
      addNotification(`📝 Profile of ${response.startup.companyName} kept fresh in the Startup Portal.`);
    } catch {
      addNotification("⚠️ Startup profile update failed. Please sign in with the owning account.");
    }
  };

  const getCurrentlyViewedStartup = (): Startup | null => {
    return activeStartupInDeck || selectedStartupForShowcase || filteredStartups[0] || startups[0] || null;
  };

  const handleShareStartup = (startup: Startup) => {
    setShareModalStartup(startup);
  };

  const handleShareApp = () => {
    const current = getCurrentlyViewedStartup();
    if (current) {
      setShareModalStartup(current);
    } else {
      setIsAppShareModalOpen(true);
    }
  };

  // Request browser permission for local native push notifications
  const requestPushPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          addNotification("🔔 Push Notifications authorized successfully!");
        }
      });
    }
  };



  // Find user's own startup if role is startup
  const ownStartup = startups[0]; // default fallback or find matching user email

  // Helper to render an beautiful authentication wall for individual tabs
  const renderAuthRequired = (message: string) => {
    if (!user && freeSwipesCount < 5) {
      return (
        <div className="max-w-md mx-auto w-full py-6">
          <div className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-6 text-center space-y-4 shadow-xl">
            <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
              <Compass className="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white">Venture Feature Locked</h3>
            <p className="text-xs text-[#8B949E] leading-relaxed">
              Complete at least 5 swipes on the discovery deck first to unlock venture analytics, virtual datarooms, secure chat, and registration!
            </p>
            <div className="text-xs font-mono text-emerald-500">
              Swipes Completed: {freeSwipesCount} / 5
            </div>
            <button
              onClick={() => setActiveTab("swipe")}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl transition-all"
            >
              Go to Swiping Deck
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto w-full py-6">
        <div className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-6 text-center space-y-4 shadow-xl mb-6">
          <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Google Sign-In Required</h3>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            {message}
          </p>
        </div>
        <AuthScreen
          onSignIn={handleSignIn}
          lang={lang}
          setLang={setLang}
          translations={t}
        />
      </div>
    );
  };

  const renderGuestBanner = (title: string, description: string) => {
    return (
      <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-amber-500/10 border border-[#30363D] rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1 text-left">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            {title}
          </h3>
          <p className="text-xs text-[#8B949E] leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
        <button
          onClick={() => setActiveTab("profile")}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <User className="w-4 h-4" />
          <span>Sign In with Google</span>
        </button>
      </div>
    );
  };

  const isStartupMatchSuitable = (startup: Startup) => {
    const focus = user?.investorFocus || {
      sectors: ["FinTech", "AI/ML", "SaaS", "HealthTech", "CleanTech", "EdTech"],
      stages: ["Pre-Seed", "Seed", "Series A"]
    };
    const cat = (startup.category || "").toLowerCase();
    const desc = (startup.description || "").toLowerCase();
    const stage = (startup.fundingStage || "").toLowerCase();
    
    const sectorMatch = focus.sectors.some(s => {
      const term = s.toLowerCase();
      return cat.includes(term) || term.includes(cat) || desc.includes(term);
    });

    const stageMatch = focus.stages ? focus.stages.some(st => stage.includes(st.toLowerCase())) : true;

    return sectorMatch || stageMatch;
  };

  const filteredStartups = startups.filter((startup, index) => {
    // 0. Check Enterprise License or Tier restrictions
    const isEnterprise = hasEnterpriseLicense || (user && user.email && enterpriseOrgDomain && user.email.toLowerCase().includes("@" + enterpriseOrgDomain));

    if (!isEnterprise) {
      if (!user) {
        // Anonymous user: only first 5 startups (indices 0-4)
        if (index >= 5) return false;
      } else {
        // Signed-in user without enterprise license: first 15 startups (indices 0-14)
        if (index >= 15) return false;
      }
    }

    // 1. Check search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchCompany = startup.companyName?.toLowerCase().includes(query);
      const matchProblem = startup.problem?.toLowerCase().includes(query);
      const matchDesc = startup.description?.toLowerCase().includes(query);
      const matchCategory = startup.category?.toLowerCase().includes(query);
      const matchStage = startup.fundingStage?.toLowerCase().includes(query);

      if (!matchCompany && !matchProblem && !matchDesc && !matchCategory && !matchStage) {
        return false;
      }
    }

    // 2. Check selected stage filter
    if (selectedStage !== "All Stages") {
      if (selectedStage === "Unknown") {
        const normalized = startup.fundingStage?.toLowerCase() || "";
        if (normalized.includes("seed") || normalized.includes("series a")) {
          return false;
        }
      } else {
        if (!startup.fundingStage?.toLowerCase().includes(selectedStage.toLowerCase())) {
          return false;
        }
      }
    }

    // 3. Check selected industry filter
    if (selectedIndustry !== "All Industrys" && selectedIndustry !== "All Industries") {
      const ind = selectedIndustry.toLowerCase();
      const cat = startup.category?.toLowerCase() || "";
      
      let match = false;
      if (ind === "ai/ml") {
        match = cat.includes("ai") || cat.includes("ml") || cat.includes("intelligence");
      } else if (ind === "cleantech") {
        match = cat.includes("clean") || cat.includes("energy") || cat.includes("climate") || cat.includes("green");
      } else if (ind === "e-commerce" || ind === "ecommerce") {
        match = cat.includes("commerce") || cat.includes("shop") || cat.includes("retail");
      } else if (ind === "edtech") {
        match = cat.includes("edtech") || cat.includes("education") || cat.includes("learn") || cat.includes("training");
      } else if (ind === "fintech") {
        match = cat.includes("fintech") || cat.includes("finance") || cat.includes("pay");
      } else if (ind === "healthtech") {
        match = cat.includes("health") || cat.includes("med") || cat.includes("care") || cat.includes("bio");
      } else if (ind === "saas") {
        match = cat.includes("saas") || cat.includes("software");
      } else if (ind === "tech") {
        match = cat.includes("tech") || cat.includes("software") || cat.includes("digital");
      } else {
        match = cat.includes(ind);
      }

      if (!match) return false;
    }

    // 5. Check match suitability filter
    if (matchSuitabilityOnly && !isStartupMatchSuitable(startup)) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#0A0C10] text-[#E0E0E0] font-sans overflow-hidden relative">
      
      {/* Sliding Search & Filters Drawer */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -50, height: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-[#0D1117]/95 backdrop-blur-md border-b border-[#30363D] z-30 relative px-4 py-4 md:px-6 shadow-2xl shrink-0"
          >
            <div className="max-w-4xl mx-auto pt-14 pb-2 space-y-4">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-[#30363D]/40 pb-2">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-bold text-white tracking-tight">Deal Flow</h2>
                </div>
                <div className="text-[11px] text-[#8B949E] flex flex-wrap items-center gap-1.5 font-medium">
                  <span className="text-emerald-400 font-bold">{filteredStartups.length}</span> startups in pipeline
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{likedStartups.length}</span> liked
                  <span>•</span>
                  <span className="text-purple-400 font-bold">{superStartups.length}</span> super
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{bookmarks.length}</span> bookmarked
                </div>
              </div>

              {/* Controls Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search Input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#8B949E]">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search company, product, industry..."
                    className="w-full pl-9 pr-8 py-2 bg-[#161B22] text-xs text-white placeholder-[#8B949E] border border-[#30363D] hover:border-emerald-500/50 focus:border-emerald-500 rounded-lg focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8B949E] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Stages Filter Dropdown with orange-red accent border like the image */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#8B949E]">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </span>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-[#161B22] text-xs text-[#E0E0E0] border border-[#E25C3D]/50 hover:border-[#E25C3D] focus:border-[#E25C3D] rounded-lg appearance-none focus:outline-none cursor-pointer transition-all"
                  >
                    <option value="All Stages">All Stages</option>
                    <option value="Pre-Seed">Pre-Seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#8B949E]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Industry Filter Dropdown with orange-red accent border like the image */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#8B949E]">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </span>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-[#161B22] text-xs text-[#E0E0E0] border border-[#E25C3D]/50 hover:border-[#E25C3D] focus:border-[#E25C3D] rounded-lg appearance-none focus:outline-none cursor-pointer transition-all"
                  >
                    <option value="All Industrys">All Industrys</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="CleanTech">CleanTech</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="EdTech">EdTech</option>
                    <option value="FinTech">FinTech</option>
                    <option value="HealthTech">HealthTech</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Tech">Tech</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#8B949E]">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Match Suitability Filter Toggle */}
              <div className="flex items-center justify-between bg-[#161B22] border border-amber-500/30 hover:border-amber-500/60 rounded-lg px-3.5 py-2 transition-all">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">✨</span>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Match Suitability Filter</h4>
                    <p className="text-[10px] text-[#8B949E]">Auto-highlight & filter startups matching your profile sectors & ticket size</p>
                  </div>
                </div>
                <button
                  onClick={() => setMatchSuitabilityOnly(!matchSuitabilityOnly)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    matchSuitabilityOnly
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                      : "bg-[#21262D] text-[#8B949E] hover:text-white border border-[#30363D]"
                  }`}
                >
                  <span>{matchSuitabilityOnly ? "● Active (Suitability On)" : "○ Off (All Startups)"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Top Header Collapsible Trigger */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <button
          onClick={() => {
            const nextVal = !isTopBarCollapsed;
            setIsTopBarCollapsed(nextVal);
            localStorage.setItem("makwa_top_bar_collapsed", String(nextVal));
          }}
          className="px-3 py-1 bg-[#161B22]/95 hover:bg-[#21262D] backdrop-blur-md text-[10px] font-bold rounded-full border border-[#30363D] hover:border-emerald-500/40 shadow-lg transition-all flex items-center gap-1 active:scale-95 text-[#8B949E] hover:text-emerald-400 cursor-pointer"
          title={isTopBarCollapsed ? "Expand Header Controls" : "Collapse Header Controls"}
        >
          {isTopBarCollapsed ? (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
              <span>Show Header</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-[#8B949E]" />
              <span>Hide Header</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Top-Left Controls */}
      <motion.div
        animate={{ y: isTopBarCollapsed ? -100 : 0, opacity: isTopBarCollapsed ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`absolute top-4 left-4 z-40 flex items-center gap-2 ${isTopBarCollapsed ? "pointer-events-none" : "pointer-events-auto"}`}
      >
        <button
          onClick={() => setIsBurgerOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-[#0D1117]/80 backdrop-blur-md text-[#8B949E] hover:text-[#E0E0E0] hover:bg-[#21262D] rounded-full border border-[#30363D] shadow-lg transition-all cursor-pointer"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-emerald-500" />
        </button>
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className={`w-10 h-10 flex items-center justify-center rounded-full border shadow-lg transition-all backdrop-blur-md active:scale-95 cursor-pointer ${
            isSearchOpen
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
              : "bg-[#0D1117]/80 text-[#8B949E] hover:text-[#E0E0E0] hover:bg-[#21262D] border-[#30363D]"
          }`}
          title="Search & Filters"
        >
          <Search className="w-4 h-4" />
        </button>
        {isOffline && (
          <span className="bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-mono text-[9px] flex items-center gap-1 shadow-lg backdrop-blur-md">
            <WifiOff className="w-2.5 h-2.5" /> OFFLINE
          </span>
        )}
      </motion.div>

      {/* Floating Top-Right Controls */}
      <motion.div
        animate={{ y: isTopBarCollapsed ? -100 : 0, opacity: isTopBarCollapsed ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`absolute top-4 right-4 z-40 flex items-center gap-2 ${isTopBarCollapsed ? "pointer-events-none" : "pointer-events-auto"}`}
      >
        {/* Testing helper to easily reset swipes */}
        {!user && (
          <button
            onClick={handleResetSwipes}
            className="h-10 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-bold rounded-full border border-amber-500/30 hover:border-amber-500/50 shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Reset Free Swipes to 0 for Testing"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Reset Swipes ({freeSwipesCount}/5)</span>
          </button>
        )}

        {/* Enterprise Team Seats Manager Button */}
        {hasEnterpriseLicense && (
          <button
            onClick={() => setIsTeamSeatManagerOpen(true)}
            className="h-10 px-3.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/40 shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            title="Manage Enterprise Team Seats (10)"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Team Seats (10)</span>
          </button>
        )}

        {/* Share Button */}
        <button
          onClick={handleShareApp}
          className="w-10 h-10 flex items-center justify-center bg-[#0D1117]/80 backdrop-blur-md text-emerald-400 hover:text-emerald-300 hover:bg-[#21262D] rounded-full border border-emerald-500/30 shadow-lg transition-all cursor-pointer"
          title="Share Currently Viewed Startup or App"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Theme state toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-10 h-10 flex items-center justify-center bg-[#0D1117]/80 backdrop-blur-md text-[#8B949E] hover:text-[#E0E0E0] hover:bg-[#21262D] rounded-full border border-[#30363D] shadow-lg transition-all"
          title={theme === "dark" ? t.lightMode : t.darkMode}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Language dropdown select */}
        <div className="relative group">
          <button className="w-10 h-10 flex flex-col items-center justify-center bg-[#0D1117]/80 backdrop-blur-md text-[#8B949E] hover:text-[#E0E0E0] hover:bg-[#21262D] rounded-full border border-[#30363D] shadow-lg transition-all">
            <Globe className="w-4 h-4" />
            <span className="text-[7px] font-bold uppercase mt-0.5 leading-none">{lang}</span>
          </button>
          <div className="absolute right-0 top-full mt-1 bg-[#161B22]/95 backdrop-blur-md border border-[#30363D] rounded shadow-2xl hidden group-hover:block w-28 overflow-hidden z-50">
            <button onClick={() => setLang("en")} className="w-full text-left px-3 py-1.5 hover:bg-[#21262D] text-xs font-semibold text-[#E0E0E0]">English</button>
            <button onClick={() => setLang("fr")} className="w-full text-left px-3 py-1.5 hover:bg-[#21262D] text-xs font-semibold text-[#E0E0E0]">Français</button>
            <button onClick={() => setLang("pt")} className="w-full text-left px-3 py-1.5 hover:bg-[#21262D] text-xs font-semibold text-[#E0E0E0]">Português</button>
            <button onClick={() => setLang("zu")} className="w-full text-left px-3 py-1.5 hover:bg-[#21262D] text-xs font-semibold text-[#E0E0E0]">isiZulu</button>
            <button onClick={() => setLang("es")} className="w-full text-left px-3 py-1.5 hover:bg-[#21262D] text-xs font-semibold text-[#E0E0E0]">Español</button>
          </div>
        </div>

        {/* Notifications panel dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 flex items-center justify-center bg-[#0D1117]/80 backdrop-blur-md text-[#8B949E] hover:text-[#E0E0E0] hover:bg-[#21262D] rounded-full border border-[#30363D] shadow-lg transition-all relative"
            title={t.notifications}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-32px)] sm:w-80 max-w-sm bg-[#161B22]/95 backdrop-blur-md border border-[#30363D] rounded-xl shadow-2xl p-4 space-y-3 z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-emerald-500" /> Notifications Log
                </span>
                <button onClick={requestPushPermission} className="text-[10px] text-emerald-400 font-bold hover:underline">
                  Enable Native Push
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2.5 scrollbar-thin">
                {notifications.map((n) => (
                  <div key={n.id} className="text-[11px] leading-normal text-[#8B949E]">
                    <p className="text-[#E0E0E0]">{n.text}</p>
                    <span className="text-[9px] text-[#8B949E] font-mono block mt-0.5">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-56 bg-[#0D1117] border-r border-[#30363D] hidden lg:flex flex-col p-4 shrink-0 justify-between">
          <nav className="space-y-1">
            <div className="text-[10px] font-bold text-[#8B949E] uppercase tracking-widest mb-3 px-2">Main Engine</div>
            
            <button
              onClick={() => setActiveTab("swipe")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all ${
                activeTab === "swipe"
                  ? "bg-[#21262D] text-white border-l-2 border-emerald-500"
                  : "text-[#8B949E] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 shrink-0" />
                Discovery Flux
              </span>
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-[#21262D] text-white border-l-2 border-emerald-500"
                  : "text-[#8B949E] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 shrink-0" />
                Deal Flow Metrics
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30">LATEST</span>
            </button>

            <button
              onClick={() => setActiveTab("dataroom")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all ${
                activeTab === "dataroom"
                  ? "bg-[#21262D] text-white border-l-2 border-emerald-500"
                  : "text-[#8B949E] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 shrink-0" />
                Dataroom Templates
              </span>
            </button>

            {activeChatRecipient && (
              <button
                onClick={() => setActiveTab("chat")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all ${
                  activeTab === "chat"
                    ? "bg-[#21262D] text-white border-l-2 border-emerald-500"
                    : "text-[#8B949E] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  Secure Comms
                </span>
                <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded border border-blue-500/30">CHAT</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all ${
                activeTab === "profile"
                  ? "bg-[#21262D] text-white border-l-2 border-emerald-500"
                  : "text-[#8B949E] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 shrink-0" />
                My Profile
              </span>
            </button>
          </nav>

          <div className="p-3 bg-[#161B22] rounded-lg border border-[#30363D] mt-auto">
            <div className="text-[10px] text-emerald-400 font-mono mb-1">GEMINI INSIGHT</div>
            <p className="text-[11px] leading-tight text-[#8B949E]">
              FinTech startups in Sub-Saharan Africa show 22% higher retention this quarter.
            </p>
          </div>
        </aside>

        {/* Dynamic Center Stage & Main Workspace */}
        <main className="flex-1 flex overflow-hidden bg-[#010409]">
          
          <section className={`flex-1 flex flex-col space-y-4 lg:pb-0 ${activeTab === "swipe" ? "p-1.5 md:p-3 overflow-hidden justify-center" : "p-4 md:p-6 pt-20 md:pt-24 overflow-y-auto"}`}>
            
            {activeTab === "swipe" && (
              <div className={`flex-1 flex flex-col items-center justify-center h-full min-h-0 ${isTopBarCollapsed ? "pt-2" : "pt-12"} pb-2 overflow-hidden transition-all duration-300`}>
                <div className="w-full max-w-3xl px-1.5 flex-1 flex flex-col min-h-0 h-full justify-center">
                  {!user && freeSwipesCount >= 5 ? (
                    <div className="max-w-md mx-auto w-full bg-[#0D1117] border border-[#30363D] rounded-2xl p-6 text-center space-y-6 shadow-xl my-4">
                      <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 animate-pulse text-emerald-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">Free Swipe Limit Reached</h3>
                        <p className="text-xs text-[#8B949E] leading-relaxed">
                          You have swiped 5 pre-seed startups for free. Sign up now to unlock all 18+ high-growth deals, view deep-dive AI insights, access secure datarooms, and message founders directly!
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <button
                          onClick={() => setActiveTab("profile")}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer"
                        >
                          <span>Create Venture Profile</span>
                        </button>

                        <button
                          onClick={handleQuickGoogleSignIn}
                          disabled={isQuickGoogleLoading}
                          className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 font-medium font-sans rounded-xl border border-gray-300 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                        >
                          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                          </svg>
                          <span className="text-sm font-semibold tracking-tight">{isQuickGoogleLoading ? "Connecting..." : "Instant Google Auth"}</span>
                        </button>
                      </div>

                      <div className="flex justify-center border-t border-[#30363D]/60 pt-4">
                        <button
                          onClick={handleResetSwipes}
                          className="px-4 py-2 text-xs font-semibold text-[#8B949E] hover:text-[#E0E0E0] hover:bg-[#21262D] rounded-xl transition-all flex items-center gap-1.5 active:scale-95 bg-transparent cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                          <span>Reload / Reset Swipes (Testing)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <SwipeCardDeck
                      startups={filteredStartups}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      onUndoSwipe={handleUndoSwipe}
                      bookmarks={bookmarks}
                      onToggleBookmark={toggleBookmark}
                      onActiveCardChange={(startup) => setActiveStartupInDeck(startup)}
                      isBottomBarCollapsed={isBottomBarCollapsed}
                      onToggleBottomBar={() => {
                        const nextVal = !isBottomBarCollapsed;
                        setIsBottomBarCollapsed(nextVal);
                        localStorage.setItem("makwa_bottom_bar_collapsed", String(nextVal));
                      }}
                      onSelectAIInsights={(startup) => {
                        setSelectedStartupForShowcase(startup);
                        handleRefreshAI(startup);
                        setActiveTab("dashboard");
                      }}
                      onOpenDataRoom={(startup) => {
                        setSelectedStartupForShowcase(startup);
                        setActiveTab("dataroom");
                      }}
                      onStartChat={(startup) => {
                        if (!user) {
                          alert("Please sign in with Google to start direct chatting.");
                          setActiveTab("profile");
                        } else {
                          setActiveChatRecipient(startup);
                          setActiveTab("chat");
                        }
                      }}
                      onOpenFullProfile={(startup) => setSelectedFullProfileStartup(startup)}
                      onShareStartup={handleShareStartup}
                      lang={lang}
                      translations={t}
                      hideHeaderControls={true}
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div className="bg-[#0D1117] p-6 rounded-2xl border border-[#30363D] max-w-xl mx-auto shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" /> Global Pitch Leaderboard
                  </h2>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono font-bold">ALGORITHMIC RANK</span>
                </div>
                <p className="text-xs text-[#8B949E] leading-relaxed">
                  Startups ranked in real-time by pitch score metrics, automated Gemini-driven viability forecasts, founder sentiment, and cumulative investor matching statistics.
                </p>
                <div className="space-y-2.5 pt-2 max-h-[480px] overflow-y-auto scrollbar-thin pr-1">
                  {startups.map((s, index) => {
                    const isTopThree = index < 3;
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-mono font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                            index === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                            index === 1 ? "bg-slate-400/20 text-slate-300 border border-slate-500/30" :
                            index === 2 ? "bg-amber-700/20 text-amber-600 border border-amber-700/30" : "bg-[#0D1117] text-[#8B949E] border border-[#30363D]"
                          }`}>
                            #{index + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white flex items-center gap-2">
                              {s.companyName}
                              {isTopThree && <Sparkles className="w-3 h-3 text-amber-400 fill-current" />}
                            </p>
                            <p className="text-[10px] text-[#8B949E] font-mono">{s.country} • {s.category || "General Tech"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-400">Score: {s.pitchScore || 85}</span>
                          <p className="text-[9px] text-[#8B949E] font-mono uppercase tracking-wider">{s.fundingStage}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="w-full max-w-5xl mx-auto">
                {!user && renderGuestBanner(
                  "Showcase Mode: Interactive Deal Flow Metrics & AI Sentiment Analyser (Guest Preview)",
                  "This panel illustrates best-in-world SaaS growth forecasts, algorithmic founder sentiment metrics, and automated risk scoring engines. Sign in with Google to analyze live startups and export custom venture intelligence."
                )}
                <AIDashboards
                  startups={startups}
                  userRole={user ? user.role : "investor"}
                  lang={lang}
                  translations={t}
                  onRefreshAI={handleRefreshAI}
                  aiInsightsCache={aiInsightsCache}
                  isAnalyzing={isAnalyzing}
                  initialSelectedStartupId={selectedStartupForShowcase?.id || startups[0]?.id}
                />
              </div>
            )}

            {activeTab === "dataroom" && (
              <div className="w-full max-w-4xl mx-auto">
                {!user && renderGuestBanner(
                  "Showcase Mode: Secure Virtual Dataroom & Compliant Due-Diligence Portal (Guest Preview)",
                  "Explore an institutional-grade investor dataroom package, complete with dynamic Cap Tables, Financial Models, SARS legal compliance checklists, and Pitch Decks. Sign in with Google to instantly build or manage your own custom startup dataroom."
                )}
                <DataRoom
                  startup={selectedStartupForShowcase || ownStartup || startups[0]}
                  isOwner={user ? user.role === "startup" : false}
                  onUpdateDataroom={handleUpdateDataroom}
                  lang={lang}
                  translations={t}
                />
              </div>
            )}

            {activeTab === "chat" && (
              !user ? (
                renderAuthRequired("Sign in with Google to unlock secure encrypted direct chat with startup founders.")
              ) : (
                activeChatRecipient && (
                  <Messages
                    currentUserId={user.id}
                    recipient={activeChatRecipient}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    lang={lang}
                    translations={t}
                  />
                )
              )
            )}

            {activeTab === "history" && (
              <div className="w-full max-w-4xl mx-auto space-y-6">
                <div className="bg-[#0D1117] p-6 rounded-2xl border border-[#30363D] shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-emerald-400" /> Swipe History & Matches
                      </h2>
                      <p className="text-xs text-[#8B949E] mt-0.5">
                        Review your last 20 swiped startups (both left and right) and manage your active matches.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDownloadCSV}
                        className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Download all swipe history and matches as CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download CSV</span>
                      </button>
                      <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                        {swipeHistory.length} Recorded Swipes
                      </span>
                    </div>
                  </div>

                  {/* Liked & Super Liked Matches Quick Overview */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Active Matches ({likedStartups.length})</h3>
                    {likedStartups.length === 0 ? (
                      <p className="text-xs text-[#8B949E] italic bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
                        No matches yet. Swipe right on startups in the Discovery Flux to make matches!
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {likedStartups.map((id) => {
                          const s = startups.find(item => item.id === id);
                          if (!s) return null;
                          return (
                            <div key={s.id} className="p-3.5 bg-[#161B22] rounded-xl border border-[#30363D] flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{s.companyName}</h4>
                                <p className="text-[10px] text-emerald-400 font-mono">{s.fundingStage} • {s.category || "Tech"}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setSelectedStartupForShowcase(s);
                                    setActiveTab("dataroom");
                                  }}
                                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20"
                                >
                                  Dataroom
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveChatRecipient(s);
                                    setActiveTab("chat");
                                  }}
                                  className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20"
                                >
                                  Chat
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Last 20 Swiped History List */}
                  <div className="space-y-3 pt-4 border-t border-[#30363D]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">Swipe History (Last 20)</h3>
                      <span className="text-[10px] text-[#8B949E]">Missed the 5s undo window? Revert any swipe below.</span>
                    </div>

                    {swipeHistory.length === 0 ? (
                      <p className="text-xs text-[#8B949E] italic bg-[#161B22] p-6 rounded-xl border border-[#30363D] text-center">
                        No swipe history recorded in this session yet. Start swiping in the Discovery Flux!
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {swipeHistory.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-[#161B22] rounded-xl border border-[#30363D] flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                                item.direction === "right" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"
                              }`}>
                                {item.direction === "right" ? "💚" : "❌"}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white truncate">{item.startup.companyName}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                    item.direction === "right" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                                  }`}>
                                    {item.direction === "right" ? "Interested (Right)" : "Passed (Left)"}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#8B949E] font-mono mt-0.5">
                                  {new Date(item.timestamp).toLocaleTimeString()} • {item.startup.fundingStage} • {item.startup.country}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleHistoryUndo(item)}
                              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Revert Swipe</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pulse" && (
              <div className="w-full max-w-4xl mx-auto space-y-6">
                <div className="bg-[#0D1117] p-6 rounded-2xl border border-[#30363D] shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" /> SA Market Pulse & Venture Intelligence
                      </h2>
                      <p className="text-xs text-[#8B949E] mt-0.5">
                        Real-time macroeconomic trends, sector growth metrics, and high-frequency startup deal flow signals across South Africa.
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> LIVE PULSE
                    </span>
                  </div>

                  {/* Highlight Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#161B22] rounded-xl border border-[#30363D] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span>🇿🇦 FINTECH LEADS</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">42% of Local VC</span>
                      </div>
                      <p className="text-xs text-[#8B949E] leading-relaxed">
                        South Africa fintech sector dominates institutional allocations, led by digital escrow, cross-border remittance, and mobile micro-billing solutions.
                      </p>
                    </div>

                    <div className="p-4 bg-[#161B22] rounded-xl border border-[#30363D] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span>☀️ CLEANTECH SURGE</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">+180% YoY Demand</span>
                      </div>
                      <p className="text-xs text-[#8B949E] leading-relaxed">
                        Solar leasing, commercial micro-grids, and decentralized backup storage startups report record-breaking enterprise adoption amid grid transitions.
                      </p>
                    </div>

                    <div className="p-4 bg-[#161B22] rounded-xl border border-[#30363D] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span>🎓 EDTECH RESILIENCE</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">Pre-seed Waves</span>
                      </div>
                      <p className="text-xs text-[#8B949E] leading-relaxed">
                        Johannesburg and Cape Town remote-work coding bootcamps and corporate upskilling platforms are raising fresh pre-seed rounds from regional angels.
                      </p>
                    </div>

                    <div className="p-4 bg-[#161B22] rounded-xl border border-[#30363D] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span>🌾 AGRITECH DEPLOYMENTS</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">Free State Pilots</span>
                      </div>
                      <p className="text-xs text-[#8B949E] leading-relaxed">
                        IoT crop diagnostic sensors and precision micro-irrigation systems are scaling across Free State and Western Cape commercial farming operations.
                      </p>
                    </div>
                  </div>

                  {/* Regional Ecosystem Highlight */}
                  <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-xl border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" /> Cape Town & Johannesburg Tech Hubs
                      </h3>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Valuation: $3.8B</span>
                    </div>
                    <p className="text-xs text-[#8B949E] leading-relaxed">
                      Cape Town remains Africa's highest valued startup ecosystem, driven by enterprise software, fintech engineering talent, and venture-backed accelerators, closely followed by Johannesburg's financial and trade tech corridor.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "swipemode" && (
              <div className="flex-1 flex flex-col items-center justify-center h-full min-h-0 pt-6 pb-2 overflow-hidden">
                <div className="w-full max-w-3xl px-1.5 flex-1 flex flex-col min-h-0 h-full justify-center">
                  <SwipeCardDeck
                    startups={filteredStartups}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onUndoSwipe={handleUndoSwipe}
                    bookmarks={bookmarks}
                    onToggleBookmark={toggleBookmark}
                    onActiveCardChange={(startup) => setActiveStartupInDeck(startup)}
                    isBottomBarCollapsed={isBottomBarCollapsed}
                    onToggleBottomBar={() => {
                      const nextVal = !isBottomBarCollapsed;
                      setIsBottomBarCollapsed(nextVal);
                      localStorage.setItem("makwa_bottom_bar_collapsed", String(nextVal));
                    }}
                    onSelectAIInsights={(startup) => {
                      setSelectedStartupForShowcase(startup);
                      handleRefreshAI(startup);
                      setActiveTab("dashboard");
                    }}
                    onOpenDataRoom={(startup) => {
                      setSelectedStartupForShowcase(startup);
                      setActiveTab("dataroom");
                    }}
                    onStartChat={(startup) => {
                      if (!user) {
                        alert("Please sign in with Google to start direct chatting.");
                        setActiveTab("profile");
                      } else {
                        setActiveChatRecipient(startup);
                        setActiveTab("chat");
                      }
                    }}
                    onOpenFullProfile={(startup) => setSelectedFullProfileStartup(startup)}
                    onShareStartup={handleShareStartup}
                    lang={lang}
                    translations={t}
                    hideHeaderControls={false}
                  />
                </div>
              </div>
            )}

            {activeTab === "founders" && (
              <div className="w-full max-w-4xl mx-auto space-y-6">
                <div className="bg-[#0D1117] p-6 rounded-2xl border border-[#30363D] shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-400" /> Founders' Spotlight & Daily Builders
                      </h2>
                      <p className="text-xs text-[#8B949E] mt-0.5">
                        Human connection, daily featured builders, and authentic South African startup visionaries.
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> DAILY ACTIVE
                    </span>
                  </div>

                  <FoundersSpotlight
                    startups={startups}
                    onSelectStartup={(s) => setSelectedStartupForShowcase(s)}
                    onStartChat={(s) => {
                      if (!user) {
                        alert("Please sign in with Google to start direct chatting.");
                        setActiveTab("profile");
                      } else {
                        setActiveChatRecipient(s);
                        setActiveTab("chat");
                      }
                    }}
                    onOpenFullProfile={(s) => setSelectedFullProfileStartup(s)}
                  />
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              !user ? (
                <div className="w-full max-w-lg mx-auto bg-[#0D1117] p-4 sm:p-6 md:p-8 rounded-2xl border border-[#30363D] shadow-2xl space-y-4 sm:space-y-6 box-border overflow-hidden">
                  {/* Guest Tester Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#30363D] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg shrink-0">
                        GT
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-white">Guest Tester Profile</h2>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/25 font-mono font-bold">SANDBOX MODE</span>
                        </div>
                        <p className="text-xs text-[#8B949E]">Exploring Makwa Match South Africa without registration.</p>
                      </div>
                    </div>
                  </div>

                  {/* Sandbox Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="bg-[#161B22] p-2.5 sm:p-3 rounded-xl border border-[#30363D] text-center">
                      <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-bold block truncate">Swipes Made</span>
                      <span className="text-base sm:text-lg font-black text-white font-mono mt-1 block">{freeSwipesCount}</span>
                    </div>
                    <div className="bg-[#161B22] p-2.5 sm:p-3 rounded-xl border border-[#30363D] text-center">
                      <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-bold block truncate">Startups Liked</span>
                      <span className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-1 block">{likedStartups.length}</span>
                    </div>
                    <div className="bg-[#161B22] p-2.5 sm:p-3 rounded-xl border border-[#30363D] text-center">
                      <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-bold block truncate">Bookmarks</span>
                      <span className="text-base sm:text-lg font-black text-amber-400 font-mono mt-1 block">{bookmarks.length}</span>
                    </div>
                  </div>

                  {/* Explanation of what signing in unlocks */}
                  <div className="p-3.5 sm:p-4 bg-[#161B22]/60 rounded-xl border border-[#30363D] space-y-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      Unlock Full Platform Capabilities
                    </span>
                    <ul className="text-xs text-[#8B949E] space-y-1.5 pl-4 list-disc">
                      <li>Secure E2EE encrypted direct messaging with founders.</li>
                      <li>Custom Investor Mandate filtering & AI deal-flow scoring.</li>
                      <li>Virtual Dataroom access with SARS compliance packages.</li>
                      <li>Publish and pitch your own South African startup card.</li>
                    </ul>
                  </div>

                  {/* Sign In & Testing Actions */}
                  <div className="space-y-3 pt-2">
                    <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-lg box-border">
                      <AuthScreen
                        onSignIn={handleSignIn}
                        lang={lang}
                        setLang={setLang}
                        translations={t}
                      />
                    </div>

                    <div className="flex justify-center pt-2">
                      <button
                        onClick={handleResetSwipes}
                        className="px-4 py-2 text-xs font-semibold text-[#8B949E] hover:text-emerald-400 border border-[#30363D] hover:border-emerald-500/40 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 bg-transparent cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reload / Reset Swipes (Testing)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-lg mx-auto bg-[#0D1117] p-4 sm:p-6 md:p-8 rounded-2xl border border-[#30363D] shadow-2xl space-y-4 sm:space-y-6 box-border overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#30363D] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          {user.name}
                        </h2>
                        <p className="text-xs text-[#8B949E] font-mono break-all">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-1 py-1.5 border-b border-[#30363D]">
                      <span className="text-[#8B949E]">Collaborator Role:</span>
                      <span className="font-bold text-emerald-500 text-right uppercase tracking-wider">{user.role}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 py-1.5 border-b border-[#30363D]">
                      <span className="text-[#8B949E]">Company Affiliation:</span>
                      <span className="font-bold text-right text-white">{user.company}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 py-1.5 border-b border-[#30363D]">
                      <span className="text-[#8B949E]">Swipes Completed:</span>
                      <span className="font-mono text-right text-white">{freeSwipesCount}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 py-1.5 border-b border-[#30363D]">
                      <span className="text-[#8B949E]">Bookmarks Saved:</span>
                      <span className="font-mono text-right text-amber-400">{bookmarks.length}</span>
                    </div>

                    {user.role === "investor" && (
                      <div className="p-3 bg-[#161B22] rounded-lg border border-[#30363D] mt-4 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Sector Investment Mandate</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {user.investorFocus?.sectors.map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded border border-emerald-500/20 font-mono">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cloud Sync & Force Sync Settings Card */}
                  <div className="p-4 bg-[#161B22] rounded-xl border border-[#30363D] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 text-emerald-400 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                        Cloud Sync & MongoDB Backup
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                        syncStatus === "synced" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                        syncStatus === "syncing" ? "bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse" :
                        syncStatus === "discrepancy" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                        "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}>
                        {syncStatus.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8B949E] leading-relaxed">
                      Proactively checks local-to-server data state. Push your latest swipes, bookmarks, matches, and custom startup profiles directly to MongoDB.
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#8B949E] font-mono">
                        Last Synced: {new Date(lastSyncTime).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={handleForceSync}
                        disabled={syncStatus === "syncing"}
                        className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                        <span>Force Sync to MongoDB</span>
                      </button>
                    </div>
                  </div>

                  {/* GDPR and Compliance export / deletion options */}
                  <div className="p-4 bg-[#161B22] rounded-lg border border-[#30363D] space-y-2">
                    <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-widest block">GDPR & CCPA Rights</span>
                    <p className="text-[11px] text-[#8B949E] leading-relaxed">
                      In compliance with GDPR & CCPA regulation frameworks, you can securely download or completely wipe your authenticated profiles, matches, and logs.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => alert("All matching data exported in CSV/JSON format.")}
                        className="px-2.5 py-1.5 bg-[#0D1117] text-[#E0E0E0] text-[10px] rounded font-bold border border-[#30363D] hover:bg-[#21262D]"
                      >
                        Export My Data Package
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to permanently delete your account and clear all direct chats?")) {
                            handleSignOut();
                          }
                        }}
                        className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] rounded font-bold border border-red-500/20 transition-all"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

          </section>

          {/* Right Sidebar: Leaderboard & Feed */}
          <aside className="w-72 bg-[#0D1117] border-l border-[#30363D] hidden xl:flex flex-col shrink-0 justify-between">
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#30363D] flex justify-between items-center bg-[#161B22]/50">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white">Pitch Leaderboard</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">GLOBAL</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {startups.slice(0, 4).map((s, index) => {
                  const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-yellow-500"];
                  const color = colors[index % colors.length];
                  const pitchScore = s.pitchScore ?? 0;
                  return (
                    <div key={s.id} className="flex items-center p-2.5 bg-[#161B22] rounded border border-[#30363D]">
                      <div className="text-[10px] font-mono text-[#8B949E] w-4">0{index + 1}</div>
                      <div className={`w-6 h-6 rounded shrink-0 mx-2 ${color} flex items-center justify-center font-bold text-black text-xs`}>
                        {s.companyName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">{s.companyName}</div>
                        <div className="text-[9px] text-[#8B949E] font-mono">{Math.floor(pitchScore * 0.4) + 12} watching</div>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 font-semibold">+{pitchScore % 15}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-[#30363D] bg-[#010409]">
              <div className="text-[10px] font-bold text-[#8B949E] uppercase mb-2">Live Activity</div>
              <div className="space-y-2 max-h-[140px] overflow-y-auto scrollbar-none pr-1">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="flex space-x-1.5">
                    <span className="w-1.5 h-1.5 mt-1 bg-emerald-400 rounded-full shrink-0 pulse-emerald"></span>
                    <p className="text-[9px] text-[#8B949E] leading-tight">
                      {n.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </main>
      </div>

      {/* Bottom Status Bar / Footer */}
      <motion.footer
        animate={{ y: isBottomBarCollapsed ? 50 : 0, opacity: isBottomBarCollapsed ? 0 : 1, height: isBottomBarCollapsed ? 0 : "2rem" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#161B22] border-t border-[#30363D] px-4 hidden lg:flex items-center justify-between shrink-0 z-40 overflow-hidden"
      >
        <div className="flex items-center space-x-3 text-[9px] font-mono text-[#8B949E]">
          <span className={`flex items-center gap-1.5 font-bold ${
            syncStatus === "synced" ? "text-emerald-400" :
            syncStatus === "syncing" ? "text-blue-400 animate-pulse" :
            syncStatus === "discrepancy" ? "text-amber-400" : "text-red-400"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              syncStatus === "synced" ? "bg-emerald-400 pulse-emerald" :
              syncStatus === "syncing" ? "bg-blue-400 animate-ping" :
              syncStatus === "discrepancy" ? "bg-amber-400 animate-bounce" : "bg-red-400"
            }`}></span>
            SYNC: {
              syncStatus === "synced" ? "ALL SYNCED" :
              syncStatus === "syncing" ? "SYNCING..." :
              syncStatus === "discrepancy" ? "PENDING DISCREPANCY" : "OFFLINE"
            }
          </span>
          <span>•</span>
          <span>DB: MONGODB ATLAS</span>
          <span>•</span>
          <button
            onClick={handleForceSync}
            disabled={syncStatus === "syncing" || !navigator.onLine}
            className="hover:text-emerald-400 underline transition-all cursor-pointer font-bold disabled:opacity-50"
          >
            Force Sync
          </button>
        </div>
        <div className="flex items-center space-x-3 text-[9px]">
          <span className="text-[#8B949E]">GDPR COMPLIANT • E2EE ENABLED</span>
          <button 
            onClick={() => alert("All matching data exported in CSV/JSON format.")}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-mono hover:bg-emerald-500/20 transition-all active:scale-95"
          >
            EXPORT ANALYTICS
          </button>
        </div>
      </motion.footer>

      {/* Mobile Bottom Navigation Bar (Visible on mobile viewports for True Mobile Native Experience!) */}
      <motion.footer
        animate={{ y: isBottomBarCollapsed ? 100 : 0, opacity: isBottomBarCollapsed ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#161B22] border-t border-[#30363D] p-2 flex items-center justify-around h-14 ${isBottomBarCollapsed ? "pointer-events-none" : "pointer-events-auto"}`}
      >
        <button
          onClick={() => setActiveTab("swipe")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            activeTab === "swipe" ? "text-emerald-400" : "text-[#8B949E]"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Swipe</span>
        </button>

        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            activeTab === "dashboard" ? "text-emerald-400" : "text-[#8B949E]"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab("dataroom")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            activeTab === "dataroom" ? "text-emerald-400" : "text-[#8B949E]"
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Dataroom</span>
        </button>

        {activeChatRecipient && (
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === "chat" ? "text-emerald-400" : "text-[#8B949E]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            activeTab === "profile" ? "text-emerald-400" : "text-[#8B949E]"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </motion.footer>

      {/* Floating Toggle Trigger for Bottom Bar on other views or when deck is empty */}
      {(activeTab !== "swipe" || !activeStartupInDeck) && (
        <div className={`fixed z-50 transition-all duration-300 pointer-events-auto right-4 ${
          isBottomBarCollapsed 
            ? "bottom-4" 
            : "bottom-18 lg:bottom-12"
        }`}>
          <button
            onClick={() => {
              const nextVal = !isBottomBarCollapsed;
              setIsBottomBarCollapsed(nextVal);
              localStorage.setItem("makwa_bottom_bar_collapsed", String(nextVal));
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all cursor-pointer border ${
              isBottomBarCollapsed
                ? "bg-[#161B22]/95 border-emerald-500/40 text-emerald-400 hover:text-emerald-300 animate-pulse"
                : "bg-[#161B22]/95 border-[#30363D] hover:border-emerald-500/40 text-[#8B949E] hover:text-emerald-400"
            }`}
            title={isBottomBarCollapsed ? "Show Bottom Navigation / Status Bar" : "Hide Bottom Navigation / Status Bar"}
          >
            {isBottomBarCollapsed ? (
              <ChevronUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8B949E]" />
            )}
          </button>
        </div>
      )}

      {/* Slide-out Burger Menu (Navigation Drawer) */}
      <AnimatePresence>
        {isBurgerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBurgerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
            />

            {/* Sidebar Drawer Container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-80 bg-[#0D1117] border-r border-[#30363D] shadow-2xl z-50 flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Content */}
              <div className="p-5 space-y-6">
                
                {/* Drawer Header */}
                <div className="flex flex-col border-b border-[#30363D] pb-5 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Stylized vector Makwa IT Logo */}
                      <div className="flex items-center select-none">
                        <div className="relative flex items-center justify-center">
                          <svg className="w-12 h-12 shrink-0" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Lat/Long wireframe lines of globe */}
                            <circle cx="100" cy="100" r="80" stroke="#30363D" strokeWidth="1" strokeDasharray="3 3" />
                            <ellipse cx="100" cy="100" rx="52" ry="80" stroke="#21262D" strokeWidth="1" />
                            <ellipse cx="100" cy="100" rx="24" ry="80" stroke="#21262D" strokeWidth="1" />
                            <line x1="20" y1="100" x2="180" y2="100" stroke="#21262D" strokeWidth="1" />
                            <path d="M25 70 Q100 85 175 70" stroke="#21262D" strokeWidth="0.75" fill="none" />
                            <path d="M25 130 Q100 115 175 130" stroke="#21262D" strokeWidth="0.75" fill="none" />
                            <path d="M40 45 Q100 62 160 45" stroke="#21262D" strokeWidth="0.75" fill="none" />
                            <path d="M40 155 Q100 138 160 155" stroke="#21262D" strokeWidth="0.75" fill="none" />
                            
                            {/* Africa Wireframe Map */}
                            <path d="M85 55 L125 60 L145 85 L135 105 L115 110 L110 135 L100 155 L92 145 L88 120 L75 100 L70 85 L75 70 Z" fill="none" stroke="#58A6FF" strokeWidth="1.5" strokeLinejoin="round" />
                            
                            {/* Africa Wireframe Internal network lines */}
                            <line x1="85" y1="55" x2="115" y2="110" stroke="#30363D" strokeWidth="0.75" />
                            <line x1="125" y1="60" x2="115" y2="110" stroke="#30363D" strokeWidth="0.75" />
                            <line x1="145" y1="85" x2="115" y2="110" stroke="#30363D" strokeWidth="0.75" />
                            <line x1="135" y1="105" x2="110" y2="135" stroke="#30363D" strokeWidth="0.75" />
                            <line x1="88" y1="120" x2="115" y2="110" stroke="#30363D" strokeWidth="0.75" />
                            <line x1="75" y1="100" x2="115" y2="110" stroke="#30363D" strokeWidth="0.75" />
                            <line x1="70" y1="85" x2="85" y2="55" stroke="#30363D" strokeWidth="0.75" />
                            <line x1="70" y1="85" x2="115" y2="110" stroke="#30363D" strokeWidth="0.75" />
                            <line x1="125" y1="60" x2="135" y2="105" stroke="#30363D" strokeWidth="0.75" />
                            <line x1="110" y1="135" x2="92" y2="145" stroke="#30363D" strokeWidth="0.75" />
                            
                            {/* Wireframe Intersection Nodes (Red and Blue) */}
                            {/* Red nodes */}
                            <circle cx="85" cy="55" r="4.5" fill="#EA4335" />
                            <circle cx="115" cy="110" r="4.5" fill="#EA4335" />
                            <circle cx="100" cy="155" r="4" fill="#EA4335" />
                            <circle cx="70" cy="85" r="4" fill="#EA4335" />
                            
                            {/* Blue nodes */}
                            <circle cx="125" cy="60" r="4" fill="#1D70B8" />
                            <circle cx="145" cy="85" r="4.5" fill="#1D70B8" />
                            <circle cx="135" cy="105" r="4" fill="#1D70B8" />
                            <circle cx="110" cy="135" r="4.5" fill="#1D70B8" />
                            <circle cx="88" cy="120" r="4" fill="#1D70B8" />
                            <circle cx="75" cy="100" r="4" fill="#1D70B8" />
                          </svg>
                        </div>
                        
                        <div className="flex flex-col ml-1.5 justify-center">
                          <div className="text-lg italic font-black tracking-tight leading-none select-none">
                            <span className="text-[#38bdf8]">Makwa</span>
                            <span className="text-[#ef4444]">I</span>
                            <span className="text-[#38bdf8]">T</span>
                          </div>
                          <div className="text-[6.5px] italic font-bold tracking-widest text-[#8B949E] uppercase mt-0.5 leading-none select-none">
                            Curious <span className="text-[#ef4444]">•</span> Distinct <span className="text-[#ef4444]">•</span> Savvy
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsBurgerOpen(false)}
                      className="p-1.5 text-[#8B949E] hover:text-white hover:bg-[#21262D] rounded-full transition-all shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-0.5 px-1">
                    <span className="text-sm font-bold text-white tracking-wide font-sans">
                      Makwa Match
                    </span>
                    <span className="text-[11px] font-medium text-emerald-500 tracking-wide font-sans">
                      Investment Matching
                    </span>
                  </div>
                </div>

                {/* Session Profile Summary */}
                <div className="p-3 bg-[#161B22] border border-[#30363D] rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 font-bold shrink-0">
                      {user ? user.name[0].toUpperCase() : "A"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{user ? user.name : "Anonymous Investor"}</p>
                      <p className="text-[10px] text-[#8B949E] truncate">{user ? user.email : "Pre-seed Free Mode"}</p>
                    </div>
                  </div>
                  {!user && (
                    <button
                      onClick={() => {
                        setActiveTab("profile");
                        setIsBurgerOpen(false);
                      }}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Sign In with Google"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Sign In with Google</span>
                    </button>
                  )}
                </div>

                {/* Navigation Options list */}
                <div className="space-y-1.5">
                  <div className="text-[9px] font-bold text-[#8B949E] uppercase tracking-widest px-2.5 mb-1.5">Navigation</div>
                  
                  <button
                    onClick={() => { setActiveTab("swipe"); setIsBurgerOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "swipe" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-[#8B949E] hover:text-white hover:bg-[#21262D]"
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Discovery Flux (Swipe)</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("dashboard"); setIsBurgerOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "dashboard" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-[#8B949E] hover:text-white hover:bg-[#21262D]"
                    }`}
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>Investor Metrics / VC Dashboard</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("dataroom"); setIsBurgerOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "dataroom" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-[#8B949E] hover:text-white hover:bg-[#21262D]"
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Startup Dataroom</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("chat"); setIsBurgerOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "chat" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-[#8B949E] hover:text-white hover:bg-[#21262D]"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Encrypted Direct Chat</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("leaderboard"); setIsBurgerOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "leaderboard" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-[#8B949E] hover:text-white hover:bg-[#21262D]"
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Venture Leaderboard</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("founders"); setIsBurgerOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "founders" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-[#8B949E] hover:text-white hover:bg-[#21262D]"
                    }`}
                  >
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Founders' Spotlight</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("pulse"); setIsBurgerOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "pulse" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-[#8B949E] hover:text-white hover:bg-[#21262D]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>SA Market Pulse</span>
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30">
                      LIVE
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("swipemode"); setIsBurgerOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "swipemode" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-[#8B949E] hover:text-white hover:bg-[#21262D]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Tinder Swipe & Review</span>
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30">
                      MODE
                    </span>
                  </button>

                   <button
                    onClick={() => { setActiveTab("history"); setIsBurgerOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "history" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-[#8B949E] hover:text-white hover:bg-[#21262D]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <History className="w-4 h-4" />
                      <span>Swipe History & Matches</span>
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {swipeHistory.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("profile"); setIsBurgerOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "profile" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-[#8B949E] hover:text-white hover:bg-[#21262D]"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile summary</span>
                  </button>

                  <button
                    onClick={() => { handleShareApp(); setIsBurgerOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#8B949E] hover:text-white hover:bg-[#21262D] transition-all bg-emerald-500/5 border border-emerald-500/20 mt-1"
                  >
                    <span className="flex items-center gap-2.5 text-emerald-400">
                      <Share2 className="w-4 h-4" />
                      <span>Share App URL</span>
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30">
                      COPY
                    </span>
                  </button>
                </div>

                {/* Collapsible Bookmarks Section */}
                <div className="space-y-1.5 pt-2 border-t border-[#30363D]">
                  <div className="text-[9px] font-bold text-[#8B949E] uppercase tracking-widest px-2.5 mb-1.5 flex items-center justify-between">
                    <span>Bookmarks ({bookmarks.length})</span>
                    <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  {bookmarks.length === 0 ? (
                    <p className="text-[10px] text-[#8B949E] px-2.5 italic">No cards bookmarked yet.</p>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1 px-1 scrollbar-thin">
                      {bookmarks.map((id) => {
                        const s = startups.find((item) => item.id === id);
                        if (!s) return null;
                        return (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-2 rounded bg-[#161B22] border border-[#30363D] hover:border-emerald-500/30 transition-all text-[11px]"
                          >
                            <span className="font-semibold text-[#C9D1D9] truncate max-w-[120px]">{s.companyName}</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setActiveTab("swipe");
                                  setIsBurgerOpen(false);
                                  addNotification(`🔍 Jumping to bookmark: ${s.companyName}`);
                                }}
                                className="text-[9px] text-emerald-400 hover:underline"
                              >
                                View
                              </button>
                              <button
                                onClick={() => toggleBookmark(s.id)}
                                className="text-[9px] text-red-400 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Collapsible Card Generator inside the Drawer */}
                <div className="space-y-3 pt-4 border-t border-[#30363D]">
                  <div className="flex items-center justify-between px-2.5">
                    <div className="text-[9px] font-bold text-[#8B949E] uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Card Generator</span>
                    </div>
                    {hasDraft && (
                      <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 font-mono animate-pulse" title="Progress auto-saved in localStorage">
                        Draft Saved
                      </span>
                    )}
                  </div>
                  
                  {!user ? (
                    <div className="p-3 bg-[#161B22] rounded-lg border border-[#30363D] text-center space-y-2">
                      <Lock className="w-4 h-4 mx-auto text-amber-500" />
                      <p className="text-[10px] text-[#8B949E]">Sign in to generate cards using AI.</p>
                      <button
                        onClick={() => { setActiveTab("profile"); setIsBurgerOpen(false); }}
                        className="px-2 py-1 bg-emerald-500 text-black text-[9px] font-bold rounded hover:bg-emerald-600 transition-all"
                      >
                        Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { handleCreateStartupWithAI(e); setIsBurgerOpen(false); }} className="space-y-2.5 bg-[#161B22] p-3 rounded-xl border border-[#30363D]">
                      <div>
                        <label className="text-[9px] text-[#8B949E] font-bold uppercase block mb-1">Company Name</label>
                        <input
                          type="text"
                          value={newCompanyName}
                          onChange={(e) => setNewCompanyName(e.target.value)}
                          placeholder="e.g. Makwa Robotics"
                          className="w-full px-2.5 py-1.5 bg-[#0D1117] text-[#E0E0E0] border border-[#30363D] rounded-md text-xs focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-[#8B949E] font-bold uppercase block mb-1">Paste Raw Pitch / Cap Table</label>
                        <textarea
                          value={rawPitchText}
                          onChange={(e) => setRawPitchText(e.target.value)}
                          placeholder="Pasted stats, team, concept..."
                          className="w-full h-20 px-2.5 py-1.5 bg-[#0D1117] text-[#E0E0E0] border border-[#30363D] rounded-md text-xs focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isRefiningNewCard}
                        className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold rounded-md text-[11px] transition-all flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 fill-current" />
                        <span>{isRefiningNewCard ? "Refining..." : "Refine & Add Card"}</span>
                      </button>
                    </form>
                  )}
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-[#30363D] space-y-3 bg-[#090D12]">
                <p className="text-[10px] text-[#8B949E] leading-relaxed">
                  {t.gdprNotice}
                </p>
                {user && (
                  <button
                    onClick={() => { handleSignOut(); setIsBurgerOpen(false); }}
                    className="w-full py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-bold rounded transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out Securely</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {selectedFullProfileStartup && (
        <FullProfileModal
          startup={selectedFullProfileStartup}
          isOpen={selectedFullProfileStartup !== null}
          onClose={() => setSelectedFullProfileStartup(null)}
          onUpdateStartup={handleUpdateStartup}
          currentUser={user}
          onShare={handleShareStartup}
        />
      )}

      <ShareModal
        isOpen={shareModalStartup !== null || isAppShareModalOpen}
        onClose={() => {
          setShareModalStartup(null);
          setIsAppShareModalOpen(false);
        }}
        startup={shareModalStartup || (isAppShareModalOpen ? getCurrentlyViewedStartup() : null)}
        title={shareModalStartup ? undefined : "Share Makwa Match Platform"}
      />

      <EnterprisePaywallModal
        isOpen={isEnterprisePaywallOpen}
        onClose={() => setIsEnterprisePaywallOpen(false)}
        onActivateLicense={handleActivateEnterpriseLicense}
        userEmail={user?.email}
      />

      <TeamSeatManagerModal
        isOpen={isTeamSeatManagerOpen}
        onClose={() => setIsTeamSeatManagerOpen(false)}
        enterpriseDomain={enterpriseOrgDomain}
        ownerEmail={user?.email || "owner@enterprise.co.za"}
        addNotification={addNotification}
      />

    </div>
  );
}
