import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import type { Review } from "../lib/api";

type FeedType = "all" | "following";

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [feed, setFeed] = useState<FeedType>("all");

  useEffect(() => {
    const url = feed === "following" ? "/api/v1/reviews?feed=following" : "/api/v1/reviews";
    api.get<Review[]>(url).then((res) => setReviews(res.data));
  }, [feed]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>BookLog</h1>
        <div style={styles.headerRight}>
          <Link to="/profile" style={styles.username}>{user?.username}</Link>
          <Link to="/reviews/new" style={styles.newBtn}>+ 投稿</Link>
          <button style={styles.logoutBtn} onClick={handleLogout}>ログアウト</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.tabs}>
          <button
            style={styles.tab(feed === "all")}
            onClick={() => setFeed("all")}
          >
            全体
          </button>
          <button
            style={styles.tab(feed === "following")}
            onClick={() => setFeed("following")}
          >
            フォロー中
          </button>
        </div>

        {reviews.length === 0 ? (
          <p style={styles.empty}>
            {feed === "following" ? "フォロー中のユーザーのレビューがありません。" : "まだレビューがありません。最初の投稿をしてみましょう！"}
          </p>
        ) : (
          <div style={styles.list}>
            {reviews.map((review) => (
              <Link key={review.id} to={`/reviews/${review.id}`} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.rating}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                  <span style={styles.statusBadge(review.status)}>
                    {review.status === "finished" ? "読了" : "読書中"}
                  </span>
                </div>
                {review.cover_image_url && (
                  <img src={review.cover_image_url} alt="表紙" style={styles.thumbnail} />
                )}
                <h2 style={styles.bookTitle}>{review.book_title}</h2>
                {review.body && <p style={styles.body}>{review.body.slice(0, 100)}{review.body.length > 100 ? "…" : ""}</p>}
                <p style={styles.meta}>
                  by <Link to={`/users/${review.user.id}`} style={{ color: "inherit" }} onClick={(e) => e.stopPropagation()}>{review.user.username}</Link> · ♥ {review.likes_count}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> & { statusBadge: (s: string) => React.CSSProperties; tab: (active: boolean) => React.CSSProperties } = {
  tabs: { display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #e5e7eb", paddingBottom: 0 },
  tab: (active: boolean) => ({
    padding: "8px 20px", fontSize: 14, fontWeight: active ? 600 : 400,
    background: "none", border: "none", cursor: "pointer",
    borderBottom: active ? "2px solid #000" : "2px solid transparent",
    color: active ? "#000" : "#6b7280",
    marginBottom: -1,
  }),
  container: { minHeight: "100vh", background: "#f9fafb", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", background: "#fff", borderBottom: "1px solid #e5e7eb" },
  logo: { fontSize: 22, fontWeight: 700, margin: 0 },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  username: { fontSize: 14, color: "#6b7280", textDecoration: "none" },
  newBtn: { padding: "8px 16px", background: "#000", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14 },
  logoutBtn: { padding: "8px 16px", background: "none", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 14 },
  main: { maxWidth: 720, margin: "32px auto", padding: "0 16px" },
  empty: { textAlign: "center", color: "#9ca3af", marginTop: 64, fontSize: 16 },
  list: { display: "flex", flexDirection: "column", gap: 16 },
  card: { display: "block", background: "#fff", borderRadius: 12, padding: 20, textDecoration: "none", color: "inherit", border: "1px solid #e5e7eb" },
  thumbnail: { width: "100%", height: 160, objectFit: "cover", borderRadius: 8, marginBottom: 8 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  rating: { color: "#f59e0b", fontSize: 16 },
  statusBadge: (s: string) => ({
    fontSize: 12, padding: "2px 10px", borderRadius: 99,
    background: s === "finished" ? "#d1fae5" : "#dbeafe",
    color: s === "finished" ? "#065f46" : "#1e40af",
  }),
  bookTitle: { fontSize: 18, fontWeight: 600, margin: "0 0 8px" },
  body: { color: "#6b7280", fontSize: 14, margin: "0 0 12px" },
  meta: { fontSize: 12, color: "#9ca3af", margin: 0 },
};
