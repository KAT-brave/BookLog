import { useEffect, useState, FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import type { Review } from "../lib/api";

interface Comment {
  id: number;
  body: string;
  created_at: string;
  user: { id: number; username: string };
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");

  useEffect(() => {
    api.get<Review>(`/api/v1/reviews/${id}`).then((res) => setReview(res.data));
    api.get<Comment[]>(`/api/v1/reviews/${id}/comments`).then((res) => setComments(res.data));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("このレビューを削除しますか？")) return;
    await api.delete(`/api/v1/reviews/${id}`);
    navigate("/");
  };

  const handleLike = async () => {
    if (!review) return;
    const res = review.liked
      ? await api.delete(`/api/v1/reviews/${id}/like`)
      : await api.post(`/api/v1/reviews/${id}/like`);
    setReview({ ...review, liked: res.data.liked, likes_count: res.data.likes_count });
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    const res = await api.post<Comment>(`/api/v1/reviews/${id}/comments`, {
      comment: { body: commentBody },
    });
    setComments([...comments, res.data]);
    setCommentBody("");
  };

  const handleCommentDelete = async (commentId: number) => {
    await api.delete(`/api/v1/reviews/${id}/comments/${commentId}`);
    setComments(comments.filter((c) => c.id !== commentId));
  };

  if (!review) return <p style={{ textAlign: "center", marginTop: 64 }}>読み込み中...</p>;

  const isOwner = user?.id === review.user.id;

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.back}>← 一覧へ戻る</Link>
      <div style={styles.card}>
        <div style={styles.cardTop}>
          <span style={styles.rating}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
          <span style={styles.statusBadge(review.status)}>
            {review.status === "finished" ? "読了" : "読書中"}
          </span>
        </div>
        <h1 style={styles.title}>{review.book_title}</h1>
        <p style={styles.meta}>by {review.user.username}</p>
        {review.cover_image_url && (
          <img src={review.cover_image_url} alt="表紙" style={styles.coverImage} />
        )}
        {review.body && <p style={styles.body}>{review.body}</p>}

        <div style={styles.likeRow}>
          <button style={styles.likeBtn(review.liked)} onClick={handleLike}>
            ♥ {review.likes_count}
          </button>
        </div>

        {isOwner && (
          <div style={styles.actions}>
            <Link to={`/reviews/${id}/edit`} style={styles.editBtn}>編集</Link>
            <button style={styles.deleteBtn} onClick={handleDelete}>削除</button>
          </div>
        )}
      </div>

      {/* コメントセクション */}
      <div style={styles.commentSection}>
        <h2 style={styles.commentTitle}>コメント（{comments.length}）</h2>
        {comments.map((c) => (
          <div key={c.id} style={styles.commentItem}>
            <div style={styles.commentHeader}>
              <span style={styles.commentUser}>{c.user.username}</span>
              {user?.id === c.user.id && (
                <button style={styles.commentDeleteBtn} onClick={() => handleCommentDelete(c.id)}>
                  削除
                </button>
              )}
            </div>
            <p style={styles.commentBody}>{c.body}</p>
          </div>
        ))}
        <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
          <textarea
            style={styles.commentInput}
            placeholder="コメントを入力..."
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            rows={3}
          />
          <button style={styles.commentSubmitBtn} type="submit">投稿</button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> & {
  statusBadge: (s: string) => React.CSSProperties;
  likeBtn: (liked: boolean) => React.CSSProperties;
} = {
  container: { maxWidth: 640, margin: "32px auto", padding: "0 24px", fontFamily: "sans-serif" },
  back: { display: "inline-block", marginBottom: 16, color: "#6b7280", textDecoration: "none", fontSize: 14 },
  card: { background: "#fff", borderRadius: 12, padding: 32, border: "1px solid #e5e7eb" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  rating: { color: "#f59e0b", fontSize: 20 },
  statusBadge: (s: string) => ({
    fontSize: 12, padding: "2px 10px", borderRadius: 99,
    background: s === "finished" ? "#d1fae5" : "#dbeafe",
    color: s === "finished" ? "#065f46" : "#1e40af",
  }),
  title: { fontSize: 24, fontWeight: 700, margin: "0 0 8px" },
  meta: { fontSize: 13, color: "#9ca3af", margin: "0 0 20px" },
  coverImage: { width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 8, margin: "12px 0" },
  body: { fontSize: 16, lineHeight: 1.7, color: "#374151", whiteSpace: "pre-wrap" },
  likeRow: { marginTop: 20, marginBottom: 8 },
  likeBtn: (liked: boolean) => ({
    padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 15, border: "none",
    background: liked ? "#fee2e2" : "#f3f4f6",
    color: liked ? "#dc2626" : "#6b7280",
  }),
  actions: { display: "flex", gap: 12, marginTop: 16 },
  editBtn: { padding: "8px 20px", background: "#000", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14 },
  deleteBtn: { padding: "8px 20px", background: "none", border: "1px solid #dc2626", color: "#dc2626", borderRadius: 8, cursor: "pointer", fontSize: 14 },
  commentSection: { marginTop: 24 },
  commentTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16 },
  commentItem: { background: "#fff", borderRadius: 8, padding: 16, marginBottom: 12, border: "1px solid #e5e7eb" },
  commentHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  commentUser: { fontSize: 13, fontWeight: 600, color: "#374151" },
  commentDeleteBtn: { background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 12 },
  commentBody: { fontSize: 14, color: "#6b7280", margin: 0 },
  commentForm: { display: "flex", flexDirection: "column", gap: 8, marginTop: 16 },
  commentInput: { padding: 12, fontSize: 14, border: "1px solid #d1d5db", borderRadius: 8, resize: "vertical", outline: "none" },
  commentSubmitBtn: { alignSelf: "flex-end", padding: "8px 24px", background: "#000", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 },
};
