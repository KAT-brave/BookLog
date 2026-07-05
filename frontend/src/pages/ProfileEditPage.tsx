import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ username: string; bio: string | null }>("/api/v1/users/me").then((res) => {
      setUsername(res.data.username);
      setBio(res.data.bio ?? "");
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.patch("/api/v1/users/me", { user: { username, bio } });
      navigate("/profile");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.join(", ") ??
        "更新に失敗しました";
      setError(msg);
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate("/profile")}>← 戻る</button>
      <h1 style={styles.title}>プロフィール編集</h1>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          ユーザー名
          <input style={styles.input} type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label style={styles.label}>
          自己紹介
          <textarea style={{ ...styles.input, height: 100, resize: "vertical" }} value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <button style={styles.button} type="submit">更新する</button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 480, margin: "48px auto", padding: "0 24px", fontFamily: "sans-serif" },
  backBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6b7280", padding: 0, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 4, fontSize: 14, color: "#374151" },
  input: { padding: "10px 12px", fontSize: 15, border: "1px solid #d1d5db", borderRadius: 8, outline: "none", width: "100%", boxSizing: "border-box" },
  button: { padding: "12px", fontSize: 16, background: "#000", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
  error: { color: "#dc2626" },
};
