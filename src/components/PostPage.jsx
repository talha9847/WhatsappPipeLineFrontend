import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Inbox,
  AlertCircle,
  Plus,
  X,
  LogIn,
  MoreHorizontal,
  Heart,
  Share,
  Repeat2,
  MessageCircle,
  Hash,
  User,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../context/authContext";
import axios from "axios";

const DEBOUNCE_MS = 400;
const DEFAULT_LIMIT = 25;

function formatTimestamp(ts) {
  if (!ts) return "—";

  const d = new Date(ts);

  if (Number.isNaN(d.getTime())) {
    return "—";
  }

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRoleLabel(role) {
  if (!role) return "";

  return role.charAt(0).toUpperCase() + role.slice(1);
}

function PostContent({ content }) {
  if (!content) {
    return <span className="text-slate-500">No content available.</span>;
  }

  const parts = content.split(/(#[a-zA-Z0-9_]+)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("#")) {
          return (
            <span key={index} className="font-medium text-cyan-400">
              {part}
            </span>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}

function HashtagList({ hashtags }) {
  if (!hashtags || hashtags.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {hashtags.map((hashtag) => (
        <span
          key={hashtag.id}
          className="inline-flex items-center gap-1 rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 text-[11px] font-medium text-cyan-400"
        >
          <Hash size={11} />
          {hashtag.name}
        </span>
      ))}
    </div>
  );
}

function StatChip({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#111822] px-4 py-3 shadow-lg">
      <p className="text-xs text-gray-400">{label}</p>

      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111822] p-12 text-center shadow-lg">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />

      <p className="mt-4 text-sm text-gray-400">Loading posts…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111822] p-12 text-center shadow-lg">
      <Inbox size={32} className="mx-auto text-gray-600" />

      <p className="mt-3 text-sm font-medium text-white">No posts found</p>

      <p className="mt-1 text-sm text-gray-400">
        Try adjusting or clearing your filters.
      </p>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      <AlertCircle size={16} className="shrink-0" />

      {error}
    </div>
  );
}

export default function PostsPage() {
  const navigate = useNavigate();

  const { user: authUser, loading: authLoading } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [redirectCountdown, setRedirectCountdown] = useState(null);

  const [post, setPost] = useState("");

  const [q, setQ] = useState("");
  const [userId, setUserId] = useState("");
  const [hashtag, setHashtag] = useState("");

  const [page, setPage] = useState(1);

  const [posts, setPosts] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [creatingPost, setCreatingPost] = useState(false);

  const handleOpenPostModal = () => {
    setIsModalOpen(true);

    if (!authUser) {
      setRedirectCountdown(3);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRedirectCountdown(null);
  };

  const handleSubmit = async () => {
    if (!post.trim()) {
      return;
    }

    setCreatingPost(true);

    try {
      const response = await axios.post(
        "/api/post/createPost",
        {
          content: post.trim(),
        },
        {
          withCredentials: true,
        },
      );

      console.log("Post created:", response.data);

      setPost("");

      setIsModalOpen(false);

      setPage(1);

      fetchPosts();
    } catch (error) {
      console.error(
        "❌ create post error:",
        error.response?.data?.error || error.message,
      );
    } finally {
      setCreatingPost(false);
    }
  };

  useEffect(() => {
    let timer;

    if (isModalOpen && !authUser && redirectCountdown !== null) {
      if (redirectCountdown > 0) {
        timer = setTimeout(() => {
          setRedirectCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        setIsModalOpen(false);
        navigate("/signin");
      }
    }

    return () => clearTimeout(timer);
  }, [isModalOpen, authUser, redirectCountdown, navigate]);

  useEffect(() => {
    setPage(1);
  }, [q, userId, hashtag]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};

      if (q.trim()) {
        params.q = q.trim();
      }

      if (userId.trim()) {
        params.userId = userId.trim();
      }

      if (hashtag.trim()) {
        params.hashtag = hashtag.trim().replace(/^#/, "").toLowerCase();
      }

      params.page = page;
      params.limit = DEFAULT_LIMIT;

      const response = await axios.get("/api/post/getPosts", {
        params,
        withCredentials: true,
      });

      const data = response.data;

      setPosts(data.data || []);

      setPagination(
        data.pagination || {
          page: 1,
          totalPages: 1,
          total: (data.data || []).length,
        },
      );
    } catch (error) {
      console.error(
        "❌ fetch posts error:",
        error.response?.data?.error || error.message,
      );

      setError(error.response?.data?.error || "Could not load posts");
    } finally {
      setLoading(false);
    }
  }, [q, userId, hashtag, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchPosts]);

  const clearFilters = () => {
    setQ("");
    setUserId("");
    setHashtag("");
    setPage(1);
  };

  const hasFilters = q || userId || hashtag;

  const handleShare = async (postItem) => {
    const shareData = {
      title: postItem.user?.name || "Transport Post",
      text: postItem.content,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);

        console.log("Link copied");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("❌ share error:", error);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F14] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white md:flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {authUser && (
          <Navbar onOpenSidebar={() => setSidebarOpen(true)} user={authUser} />
        )}

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatChip label="Total posts" value={pagination.total} />

              <StatChip label="Shown this page" value={posts.length} />

              <StatChip label="Page" value={pagination.page} />
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#111822] p-4 shadow-lg md:p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-1">
                  <div className="flex items-center gap-2 rounded-xl bg-[#1A2330] px-3 focus-within:ring-2 focus-within:ring-cyan-400/60">
                    <Search size={16} className="shrink-0 text-gray-400" />

                    <input
                      type="text"
                      placeholder="Search posts..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 rounded-xl bg-[#1A2330] px-3 focus-within:ring-2 focus-within:ring-cyan-400/60">
                    <User size={16} className="shrink-0 text-gray-400" />

                    <input
                      type="text"
                      placeholder="Username"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 rounded-xl bg-[#1A2330] px-3 focus-within:ring-2 focus-within:ring-cyan-400/60">
                    <Hash size={16} className="shrink-0 text-gray-400" />

                    <input
                      type="text"
                      placeholder="Hashtag"
                      value={hashtag}
                      onChange={(e) => setHashtag(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-gray-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 inline-flex items-center gap-1.5 rounded text-sm text-cyan-400 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <RotateCcw size={14} />
                  Clear filters
                </button>
              )}
            </div>

            {error && <ErrorState error={error} />}

            {loading && posts.length === 0 ? (
              <LoadingState />
            ) : posts.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="hidden md:block">
                  <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border border-slate-800/80 bg-[#05070a] shadow-2xl shadow-black/20">
                    <div className="border-b border-slate-800/80 bg-[#070a0f]/95 px-6 py-4 backdrop-blur-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-white">
                              Community Feed
                            </h2>

                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            Latest posts from the transport community
                          </p>
                        </div>

                        <div className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400">
                          {posts.length} {posts.length === 1 ? "post" : "posts"}
                        </div>
                      </div>
                    </div>

                    <div>
                      {posts.map((postItem, index) => {
                        const isLast = index === posts.length - 1;

                        const user = postItem.user || {};

                        return (
                          <article
                            key={postItem.id}
                            className="group border-b border-slate-800/80 last:border-b-0 transition-colors duration-200 hover:bg-white/[0.012]"
                          >
                            <div className="flex gap-4 px-6 py-6">
                              <div className="flex w-11 shrink-0 flex-col items-center">
                                <div className="relative z-10 h-11 w-11 overflow-hidden rounded-full border border-slate-700 bg-slate-900 ring-4 ring-[#05070a] transition-all duration-200 group-hover:border-cyan-500/40">
                                  <img
                                    src={
                                      user.profile_image ||
                                      "https://i.pravatar.cc/100?img=12"
                                    }
                                    alt={user.name || "User"}
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                {!isLast && (
                                  <div className="mt-3 w-px flex-1 bg-slate-800 transition-colors duration-200 group-hover:bg-slate-700" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                      <span className="font-bold text-white">
                                        {user.name || "Unknown User"}
                                      </span>

                                      {user.username && (
                                        <span className="text-slate-500">
                                          @{user.username}
                                        </span>
                                      )}

                                      {user.role && (
                                        <>
                                          <span className="text-slate-700">
                                            ·
                                          </span>

                                          <span className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-1.5 py-0.5 text-[10px] font-medium capitalize text-cyan-400">
                                            {getRoleLabel(user.role)}
                                          </span>
                                        </>
                                      )}

                                      <span className="text-slate-700">·</span>

                                      <time className="text-slate-500">
                                        {formatTimestamp(postItem.created_at)}
                                      </time>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    aria-label="More options"
                                    className="shrink-0 rounded-full p-2 text-slate-600 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                                  >
                                    <MoreHorizontal size={18} />
                                  </button>
                                </div>

                                <div className="mt-3 max-w-5xl whitespace-pre-line break-words text-[15px] leading-6 text-slate-200">
                                  <PostContent content={postItem.content} />
                                </div>

                                <HashtagList hashtags={postItem.hashtags} />

                                <div className="mt-4 flex max-w-2xl items-center justify-between text-slate-600">
                                  <button
                                    type="button"
                                    className="group/action flex items-center gap-1.5 transition hover:text-cyan-400"
                                  >
                                    <span className="rounded-full p-2 transition group-hover/action:bg-cyan-500/10">
                                      <MessageCircle size={17} />
                                    </span>

                                    <span className="text-xs">
                                      {postItem.replyCount || 0}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    className="group/action flex items-center gap-1.5 transition hover:text-emerald-400"
                                  >
                                    <span className="rounded-full p-2 transition group-hover/action:bg-emerald-500/10">
                                      <Repeat2 size={17} />
                                    </span>

                                    <span className="text-xs">
                                      {postItem.repostCount || 0}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    className="group/action flex items-center gap-1.5 transition hover:text-rose-400"
                                  >
                                    <span className="rounded-full p-2 transition group-hover/action:bg-rose-500/10">
                                      <Heart size={17} />
                                    </span>

                                    <span className="text-xs">
                                      {postItem.likeCount || 0}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    aria-label="Share"
                                    onClick={() => handleShare(postItem)}
                                    className="rounded-full p-2 text-slate-600 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                                  >
                                    <Share size={17} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 md:hidden">
                  <div className="rounded-2xl border border-slate-800/80 bg-[#0a0e14] px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-white">
                          Community Feed
                        </h2>

                        <p className="mt-1 text-[11px] text-slate-500">
                          Latest community posts
                        </p>
                      </div>

                      <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-400">
                        {posts.length}
                      </div>
                    </div>
                  </div>

                  {posts.map((postItem) => {
                    const user = postItem.user || {};

                    return (
                      <article
                        key={postItem.id}
                        className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0a0f16] shadow-lg shadow-black/10"
                      >
                        <div className="flex gap-3 p-4">
                          <div className="flex w-9 shrink-0 flex-col items-center">
                            <div className="relative z-10 h-9 w-9 overflow-hidden rounded-full border border-slate-700 bg-slate-900 ring-2 ring-[#0a0f16]">
                              <img
                                src={
                                  user.profile_image ||
                                  "https://i.pravatar.cc/100?img=12"
                                }
                                alt={user.name || "User"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px]">
                                  <span className="font-bold text-white">
                                    {user.name || "Unknown User"}
                                  </span>

                                  {user.username && (
                                    <span className="text-slate-500">
                                      @{user.username}
                                    </span>
                                  )}

                                  {user.role && (
                                    <span className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-1.5 py-0.5 text-[9px] capitalize text-cyan-400">
                                      {getRoleLabel(user.role)}
                                    </span>
                                  )}

                                  <span className="text-slate-700">·</span>

                                  <time className="text-slate-500">
                                    {formatTimestamp(postItem.created_at)}
                                  </time>
                                </div>
                              </div>

                              <button
                                type="button"
                                aria-label="More options"
                                className="shrink-0 rounded-full p-1.5 text-slate-600 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </div>

                            <div className="mt-3 whitespace-pre-line break-words text-sm leading-5.5 text-slate-200">
                              <PostContent content={postItem.content} />
                            </div>

                            <HashtagList hashtags={postItem.hashtags} />

                            <div className="mt-3 flex items-center justify-between border-t border-slate-800/70 pt-2">
                              <button
                                type="button"
                                className="flex items-center gap-1.5 rounded-full p-1.5 text-slate-600 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                              >
                                <MessageCircle size={15} />

                                <span className="text-[10px]">
                                  {postItem.replyCount || 0}
                                </span>
                              </button>

                              <button
                                type="button"
                                className="flex items-center gap-1.5 rounded-full p-1.5 text-slate-600 transition hover:bg-emerald-500/10 hover:text-emerald-400"
                              >
                                <Repeat2 size={15} />

                                <span className="text-[10px]">
                                  {postItem.repostCount || 0}
                                </span>
                              </button>

                              <button
                                type="button"
                                className="flex items-center gap-1.5 rounded-full p-1.5 text-slate-600 transition hover:bg-rose-500/10 hover:text-rose-400"
                              >
                                <Heart size={15} />

                                <span className="text-[10px]">
                                  {postItem.likeCount || 0}
                                </span>
                              </button>

                              <button
                                type="button"
                                aria-label="Share"
                                onClick={() => handleShare(postItem)}
                                className="rounded-full p-1.5 text-slate-600 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                              >
                                <Share size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>

                  <span className="text-sm text-gray-400">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <button
        type="button"
        onClick={handleOpenPostModal}
        aria-label="Create Post"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 transition-transform duration-200 hover:scale-105 hover:bg-cyan-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/50"
      >
        <Plus size={28} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111822] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white">
                {authUser ? "Create New Post" : "Authentication Required"}
              </h3>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-6">
              {authUser ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                      Post Details
                    </label>

                    <textarea
                      rows={5}
                      value={post}
                      onChange={(e) => setPost(e.target.value)}
                      className="w-full rounded-xl bg-[#1A2330] p-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="What's happening? Add #hashtags..."
                      required
                    />

                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Hash size={12} />
                      Hashtags will be detected automatically.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingPost || !post.trim()}
                    className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingPost ? "Publishing..." : "Publish Post"}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                    <LogIn size={24} />
                  </div>

                  <p className="text-sm text-gray-300">
                    You must be logged in to create a post.
                  </p>

                  <p className="text-xs text-amber-400">
                    Redirecting to Sign In page in{" "}
                    <span className="font-bold text-white">
                      {redirectCountdown}
                    </span>{" "}
                    seconds...
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate("/signin");
                    }}
                    className="mt-2 w-full rounded-xl bg-cyan-500 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-400"
                  >
                    Go to Sign In Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
