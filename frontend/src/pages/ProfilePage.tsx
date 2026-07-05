import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

interface UserProfile {
  id: number;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  reviews_count: number;
  following_count: number;
  followers_count: number;
  following: boolean;
  reviews: { id: number; book_title: string; rating: number; status: string; created_at: string }[];
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const url = id ? `/api/v1/users/${id}` : "/api/v1/users/me";
    api.get<UserProfile>(url).then((res) => setProfile(res.data));
  }, [id]);

  const handleFollow = async () => {
    if (!profile) return;
    const res = profile.following
      ? await api.delete(`/api/v1/users/${profile.id}/follow`)
      : await api.post(`/api/v1/users/${profile.id}/follow`);
    setProfile({
      ...profile,
      following: res.data.following,
      followers_count: res.data.followers_count,
    });
  };

  if (!profile) return <p style={{ textAlign: "center", marginTop: 64 }}>読み込み中...</p>;

  const isMe = me?.id === profile.id;

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.back}>← 一覧へ戻る</Link>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.avatar}>{profile.username[0].toUpperCase()}</div>
          <div style={styles.info}>
            <h1 style={styles.username}>{profile.username}</h1>
            {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
            <div style={styles.stats}>
              <span>レビュー <strong>{profile.reviews_count}</strong></span>
              <span>フォロー中 <strong>{profile.following_count}</strong></span>
              <span>フォロワー <strong>{profile.followers_count}</strong></span>
            </div>
          </div>
          {!isMe && (
            <button style={styles.followBtn(profile.following)} onClick={handleFollow}>
              {profile.following ? "フォロー中" : "フォロー"}
            </button>
          )}
          {isMe && (
            <Link to="/profile/edit" style={styles.editBtn}>プロフィール編集</Link>
          )}
        </div>
      </div>

      <h2 style={styles.reviewsTitle}>レビュー一覧</h2>
      {profile.reviews.length === 0 ? (
        <p style={styles.empty}>まだレビューがありません</p>
      ) : (
        <div style={styles.reviewList}>
          {profile.reviews.map((r) => (
            <Link key={r.id} to={`/reviews/${r.id}`} style={styles.reviewCard}>
              <span style={styles.reviewRating}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
              <span style={styles.reviewTitle}>{r.book_title}</span>
              <span style={styles.reviewStatus(r.status)}>
                {r.status === "finished" ? "読了" : "読書中"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> & {
  followBtn: (f: boolean) => React.CSSProperties;
  reviewStatus: (s: string) => React.CSSProperties;
} = {
  container: { maxWidth: 640, margin: "32px auto", padding: "0 24px", fontFamily: "sans-serif" },
  back: { display: "inline-block", marginBottom: 16, color: "#6b7280", textDecoration: "none", fontSize: 14 },
  card: { background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e5e7eb", marginBottom: 24 },
  header: { display: "flex", alignItems: "flex-start", gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: "50%", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, flexShrink: 0 },
  info: { flex: 1 },
  username: { fontSize: 22, fontWeight: 700, margin: "0 0 6px" },
  bio: { fontSize: 14, color: "#6b7280", margin: "0 0 12px" },
  stats: { display: "flex", gap: 20, fontSize: 13, color: "#6b7280" },
  followBtn: (f: boolean) => ({
    padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, border: "none", flexShrink: 0,
    background: f ? "#f3f4f6" : "#000",
    color: f ? "#374151" : "#fff",
  }),
  editBtn: { padding: "8px 20px", background: "none", border: "1px solid #d1d5db", borderRadius: 8, textDecoration: "none", fontSize: 14, color: "#374151", flexShrink: 0 },
  reviewsTitle: { fontSize: 18, fontWeight: 600, marginBottom: 12 },
  empty: { color: "#9ca3af", textAlign: "center" },
  reviewList: { display: "flex", flexDirection: "column", gap: 10 },
  reviewCard: { display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 8, padding: "12px 16px", border: "1px solid #e5e7eb", textDecoration: "none", color: "inherit" },
  reviewRating: { color: "#f59e0b", fontSize: 14, flexShrink: 0 },
  reviewTitle: { flex: 1, fontSize: 15, fontWeight: 500 },
  reviewStatus: (s: string) => ({
    fontSize: 11, padding: "2px 8px", borderRadius: 99, flexShrink: 0,
    background: s === "finished" ? "#d1fae5" : "#dbeafe",
    color: s === "finished" ? "#065f46" : "#1e40af",
  }),
};
