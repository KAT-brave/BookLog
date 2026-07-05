import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewForm from "../components/ReviewForm";
import api from "../lib/api";
import type { Review } from "../lib/api";

export default function ReviewEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    api.get<Review>(`/api/v1/reviews/${id}`).then((res) => setReview(res.data));
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    await api.patch(`/api/v1/reviews/${id}`, formData);
    navigate(`/reviews/${id}`);
  };

  if (!review) return <p style={{ textAlign: "center", marginTop: 64 }}>読み込み中...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>レビューを編集</h1>
      <ReviewForm
        initial={{
          book_title: review.book_title,
          body: review.body ?? "",
          rating: review.rating,
          status: review.status,
        }}
        currentImageUrl={review.cover_image_url}
        onSubmit={handleSubmit}
        submitLabel="更新する"
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 560, margin: "48px auto", padding: "0 24px", fontFamily: "sans-serif" },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
};
