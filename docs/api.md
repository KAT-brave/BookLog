# API ドキュメント

## 共通仕様

- Base URL: `http://localhost:3000`（開発）/ `https://<ALB-DNS>`（本番）
- Content-Type: `application/json`（ファイルアップロード時のみ `multipart/form-data`）
- 認証: `Authorization: Bearer <JWT>` ヘッダーを付与
- レスポンスはすべて JSON 形式

---

## 認証

### 新規登録

```
POST /api/v1/auth/signup
```

**リクエストボディ**

```json
{
  "user": {
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123"
  }
}
```

**レスポンス** `201 Created`

```json
{
  "id": 1,
  "username": "test_user",
  "email": "test@example.com"
}
```

レスポンスヘッダーに `Authorization: Bearer <JWT>` が付与されます。

---

### ログイン

```
POST /api/v1/auth/login
```

**リクエストボディ**

```json
{
  "user": {
    "email": "test@example.com",
    "password": "password123"
  }
}
```

**レスポンス** `200 OK`

```json
{
  "id": 1,
  "username": "test_user",
  "email": "test@example.com"
}
```

レスポンスヘッダーに `Authorization: Bearer <JWT>` が付与されます。

---

### ログアウト

```
DELETE /api/v1/auth/logout
```

認証必須。JWT を無効化します。

**レスポンス** `200 OK`

---

## レビュー

### 一覧取得

```
GET /api/v1/reviews
```

**クエリパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| feed | string | `following` を指定するとフォロー中ユーザーのレビューのみ返す |

**レスポンス** `200 OK`

```json
[
  {
    "id": 1,
    "book_title": "リーダブルコード",
    "body": "読みやすいコードの書き方が学べる名著です。",
    "rating": 5,
    "status": "read",
    "likes_count": 3,
    "liked_by_current_user": false,
    "cover_image_url": "https://s3.ap-northeast-1.amazonaws.com/...",
    "user": {
      "id": 1,
      "username": "test_user"
    },
    "created_at": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### 詳細取得

```
GET /api/v1/reviews/:id
```

**レスポンス** `200 OK`

```json
{
  "id": 1,
  "book_title": "リーダブルコード",
  "body": "読みやすいコードの書き方が学べる名著です。",
  "rating": 5,
  "status": "read",
  "likes_count": 3,
  "liked_by_current_user": false,
  "cover_image_url": null,
  "user": {
    "id": 1,
    "username": "test_user"
  },
  "comments": [
    {
      "id": 1,
      "body": "参考になりました！",
      "user": { "id": 2, "username": "other_user" },
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-01-01T00:00:00.000Z"
}
```

---

### 投稿

```
POST /api/v1/reviews
```

認証必須。`Content-Type: multipart/form-data`

**リクエストボディ**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| review[book_title] | string | ✓ | 書籍タイトル |
| review[body] | string | — | 感想本文 |
| review[rating] | integer | ✓ | 評価（1〜5） |
| review[status] | string | ✓ | `reading` または `read` |
| review[cover_image] | file | — | 書籍表紙画像 |

**レスポンス** `201 Created`（レビュー詳細と同じ形式）

---

### 更新

```
PATCH /api/v1/reviews/:id
```

認証必須・投稿者本人のみ。`Content-Type: multipart/form-data`

リクエストボディは投稿と同形式（変更するフィールドのみ送信可）。

**レスポンス** `200 OK`（レビュー詳細と同じ形式）

---

### 削除

```
DELETE /api/v1/reviews/:id
```

認証必須・投稿者本人のみ。

**レスポンス** `204 No Content`

---

## いいね

### いいね

```
POST /api/v1/reviews/:review_id/like
```

認証必須。

**レスポンス** `201 Created`

```json
{ "liked": true, "likes_count": 4 }
```

---

### いいね取り消し

```
DELETE /api/v1/reviews/:review_id/like
```

認証必須。

**レスポンス** `200 OK`

```json
{ "liked": false, "likes_count": 3 }
```

---

## コメント

### 一覧取得

```
GET /api/v1/reviews/:review_id/comments
```

**レスポンス** `200 OK`

```json
[
  {
    "id": 1,
    "body": "参考になりました！",
    "user": { "id": 2, "username": "other_user" },
    "created_at": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### 投稿

```
POST /api/v1/reviews/:review_id/comments
```

認証必須。

**リクエストボディ**

```json
{ "comment": { "body": "参考になりました！" } }
```

**レスポンス** `201 Created`（コメント詳細と同じ形式）

---

### 削除

```
DELETE /api/v1/reviews/:review_id/comments/:id
```

認証必須・投稿者本人のみ。

**レスポンス** `204 No Content`

---

## ユーザー

### 自分の情報取得

```
GET /api/v1/users/me
```

認証必須。

**レスポンス** `200 OK`

```json
{
  "id": 1,
  "username": "test_user",
  "email": "test@example.com",
  "bio": "読書が好きです。",
  "avatar_url": null,
  "followers_count": 2,
  "following_count": 5
}
```

---

### 自分の情報更新

```
PATCH /api/v1/users/me
```

認証必須。

**リクエストボディ**

```json
{
  "user": {
    "username": "new_name",
    "bio": "更新した自己紹介"
  }
}
```

**レスポンス** `200 OK`（ユーザー情報と同じ形式）

---

### ユーザー詳細取得

```
GET /api/v1/users/:id
```

**レスポンス** `200 OK`

```json
{
  "id": 2,
  "username": "other_user",
  "bio": "よろしくお願いします。",
  "avatar_url": null,
  "followers_count": 1,
  "following_count": 3,
  "is_following": false
}
```

---

### フォロー

```
POST /api/v1/users/:id/follow
```

認証必須。

**レスポンス** `200 OK`

```json
{ "following": true }
```

---

### アンフォロー

```
DELETE /api/v1/users/:id/follow
```

認証必須。

**レスポンス** `200 OK`

```json
{ "following": false }
```

---

## ヘルスチェック

```
GET /api/v1/health
GET /up
```

**レスポンス** `200 OK`

```json
{ "status": "ok" }
```
