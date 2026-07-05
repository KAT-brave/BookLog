import { useState } from "react";
import type { FormEvent } from "react";
import type { ReviewFormData } from "../lib/api";

interface Props {
  initial?: Partial<ReviewFormData>;
  currentImageUrl?: string | null;
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel: string;
}

export default function ReviewForm({ initial = {}, currentImageUrl, onSubmit, submitLabel }: Props) {
  const [bookTitle, setBookTitle] = useState(initial.book_title ?? "");
  const [body, setBody] = useState(initial.body ?? "");
  const [rating, setRating] = useState(initial.rating ?? 3);
  const [status, setStatus] = useState<"reading" | "finished">(initial.status ?? "reading");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("review[book_title]", bookTitle);
      formData.append("review[body]", body);
      formData.append("review[rating]", String(rating));
      formData.append("review[status]", status);
      if (imageFile) formData.append("review[cover_image]", imageFile);
      await onSubmit(formData);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.join(", ") ??
        "送信に失敗しました";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <p style={styles.error}>{error}</p>}
      <label style={styles.label}>
        書籍名 *
        <input
          style={styles.input}
          type="text"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          required
        />
      </label>
      <label style={styles.label}>
        感想
        <textarea
          style={{ ...styles.input, height: 120, resize: "vertical" }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <label style={styles.label}>
        評価
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              style={{
                ...styles.starBtn,
                color: n <= rating ? "#f59e0b" : "#d1d5db",
              }}
            >
              ★
            </button>
          ))}
        </div>
      </label>
      <label style={styles.label}>
        ステータス
        <select
          style={styles.input}
          value={status}
          onChange={(e) => setStatus(e.target.value as "reading" | "finished")}
        >
          <option value="reading">読書中</option>
          <option value="finished">読了</option>
        </select>
      </label>
      <label style={styles.label}>
        表紙画像
        {previewUrl && (
          <img src={previewUrl} alt="表紙プレビュー" style={styles.preview} />
        )}
        <input
          style={{ marginTop: 6 }}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
      <button style={styles.button} type="submit" disabled={loading}>
        {loading ? "送信中..." : submitLabel}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 4, fontSize: 14, color: "#374151" },
  input: { padding: "10px 12px", fontSize: 15, border: "1px solid #d1d5db", borderRadius: 8, outline: "none", width: "100%", boxSizing: "border-box" },
  button: { padding: "12px", fontSize: 16, background: "#000", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
  error: { color: "#dc2626" },
  starBtn: { background: "none", border: "none", fontSize: 28, cursor: "pointer", padding: 0 },
  preview: { width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginTop: 8 },
};
