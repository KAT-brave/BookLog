import { useNavigate } from "react-router-dom";
import ReviewForm from "../components/ReviewForm";
import api from "../lib/api";

export default function ReviewNewPage() {
  const navigate = useNavigate();

  const handleSubmit = async (formData: FormData) => {
    await api.post("/api/v1/reviews", formData);
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>← 戻る</button>
      <h1 style={styles.title}>レビューを投稿</h1>
      <ReviewForm onSubmit={handleSubmit} submitLabel="投稿する" />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 560, margin: "48px auto", padding: "0 24px", fontFamily: "sans-serif" },
  backBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6b7280", padding: 0, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
};
