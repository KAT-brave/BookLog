# ER 図

## テーブル一覧

### users

| カラム名 | 型 | NOT NULL | 説明 |
|---------|-----|---------|------|
| id | bigint | ✓ | 主キー |
| username | string | ✓ | ユーザー名（一意） |
| email | string | ✓ | メールアドレス（一意） |
| encrypted_password | string | ✓ | 暗号化パスワード（devise） |
| jti | string | ✓ | JWT トークン識別子（devise-jwt） |
| bio | text | — | 自己紹介文 |
| avatar_url | string | — | アバター画像 URL |
| reset_password_token | string | — | パスワードリセットトークン |
| reset_password_sent_at | datetime | — | パスワードリセット送信日時 |
| remember_created_at | datetime | — | ログイン記憶日時 |
| created_at | datetime | ✓ | 作成日時 |
| updated_at | datetime | ✓ | 更新日時 |

---

### reviews

| カラム名 | 型 | NOT NULL | 説明 |
|---------|-----|---------|------|
| id | bigint | ✓ | 主キー |
| user_id | bigint | ✓ | 投稿者（users.id） |
| book_title | string | ✓ | 書籍タイトル |
| body | text | — | 感想・レビュー本文 |
| rating | integer | ✓ | 評価（1〜5） |
| status | integer | ✓ | 読書ステータス（0: 読書中 / 1: 読了） |
| created_at | datetime | ✓ | 作成日時 |
| updated_at | datetime | ✓ | 更新日時 |

---

### likes

| カラム名 | 型 | NOT NULL | 説明 |
|---------|-----|---------|------|
| id | bigint | ✓ | 主キー |
| user_id | bigint | ✓ | いいねしたユーザー（users.id） |
| review_id | bigint | ✓ | いいね対象レビュー（reviews.id） |
| created_at | datetime | ✓ | 作成日時 |
| updated_at | datetime | ✓ | 更新日時 |

ユニーク制約: `(user_id, review_id)`

---

### comments

| カラム名 | 型 | NOT NULL | 説明 |
|---------|-----|---------|------|
| id | bigint | ✓ | 主キー |
| user_id | bigint | ✓ | コメントしたユーザー（users.id） |
| review_id | bigint | ✓ | コメント対象レビュー（reviews.id） |
| body | text | ✓ | コメント本文 |
| created_at | datetime | ✓ | 作成日時 |
| updated_at | datetime | ✓ | 更新日時 |

---

### follows

| カラム名 | 型 | NOT NULL | 説明 |
|---------|-----|---------|------|
| id | bigint | ✓ | 主キー |
| follower_id | integer | ✓ | フォローするユーザー（users.id） |
| following_id | integer | ✓ | フォローされるユーザー（users.id） |
| created_at | datetime | ✓ | 作成日時 |
| updated_at | datetime | ✓ | 更新日時 |

ユニーク制約: `(follower_id, following_id)`

---

### active_storage_attachments / active_storage_blobs

Active Storage が管理する書籍表紙画像の添付ファイルテーブル。`reviews` の `cover_image` として `has_one_attached` で関連付けられます。本番環境では S3 に保存されます。

---

## リレーション図

```
users ─────────────────────────────< reviews
  │                                      │
  │                                      ├──< likes >──── users
  │                                      │
  │                                      └──< comments >── users
  │
  └──< follows (follower_id) ──> users (following_id)

reviews ──< active_storage_attachments >── active_storage_blobs
```

## モデルのアソシエーション

```ruby
# User
has_many :reviews, dependent: :destroy
has_many :likes, dependent: :destroy
has_many :comments, dependent: :destroy
has_many :active_relationships,  class_name: "Follow", foreign_key: :follower_id
has_many :passive_relationships, class_name: "Follow", foreign_key: :following_id
has_many :following, through: :active_relationships,  source: :following
has_many :followers, through: :passive_relationships, source: :follower

# Review
belongs_to :user
has_many :likes, dependent: :destroy
has_many :comments, dependent: :destroy
has_one_attached :cover_image

# Like / Comment
belongs_to :user
belongs_to :review

# Follow
belongs_to :follower,  class_name: "User"
belongs_to :following, class_name: "User"
```
