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
      <h1 style={styles.title}>レビューを投稿</h1>
      <ReviewForm onSubmit={handleSubmit} submitLabel="投稿する" />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 560, margin: "48px auto", padding: "0 24px", fontFamily: "sans-serif" },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
};
