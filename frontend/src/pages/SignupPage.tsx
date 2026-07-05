import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signup(username, email, password, passwordConfirmation);
      navigate("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.join(", ") ??
        "登録に失敗しました";
      setError(msg);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>アカウント作成</h1>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="パスワード（確認）"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />
        <button style={styles.button} type="submit">
          登録
        </button>
      </form>
      <p style={styles.link}>
        すでにアカウントをお持ちですか？ <Link to="/login">ログイン</Link>
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 400, margin: "80px auto", padding: "0 24px", fontFamily: "sans-serif" },
  title: { fontSize: 28, fontWeight: 600, marginBottom: 24 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: "12px 16px", fontSize: 16, border: "1px solid #d1d5db", borderRadius: 8, outline: "none" },
  button: { padding: "12px", fontSize: 16, background: "#000", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
  error: { color: "#dc2626", marginBottom: 12 },
  link: { marginTop: 20, textAlign: "center" },
};
