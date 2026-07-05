'use strict';

// ===== STATE =====
const state = {
  currentUser: { id: 1, username: 'book_lover', initial: 'B' },
  currentTab: 'all',
  likes: new Set([]),
  comments: {
    1: [
      { id: 1, userId: 2, username: 'yuki_reads', initial: 'Y', body: '私もこの本大好きです！哲学的な視点が面白いですよね。' },
      { id: 2, userId: 3, username: 'taro_books', initial: 'T', body: '積読リストに追加しました。レビューありがとうございます！' },
    ],
    2: [
      { id: 1, userId: 1, username: 'book_lover', initial: 'B', body: 'この作品はシリーズで読むとより楽しめますよ。' },
    ],
    3: [],
    4: [],
    5: [],
  },
  selectedRating: 0,
  newCommentText: '',
};

// ===== DUMMY DATA =====
const reviews = [
  {
    id: 1,
    userId: 2,
    username: 'yuki_reads',
    initial: 'Y',
    date: '2026-06-30',
    bookTitle: '夜と霧',
    body: 'ヴィクトール・フランクルによる強制収容所での体験記。人間が極限状態でも意味を見出せることを教えてくれる一冊。読んで人生観が変わりました。心の底から震える体験でした。',
    rating: 5,
    status: 'completed',
    likeCount: 23,
    commentCount: 2,
    hasImages: true,
  },
  {
    id: 2,
    userId: 3,
    username: 'taro_books',
    initial: 'T',
    date: '2026-06-29',
    bookTitle: '舟を編む',
    body: '辞書編纂に人生をかける人々の物語。言葉の重さと人との繋がりが丁寧に描かれていて、読後感が素晴らしかったです。',
    rating: 4,
    status: 'completed',
    likeCount: 15,
    commentCount: 1,
    hasImages: false,
  },
  {
    id: 3,
    userId: 1,
    username: 'book_lover',
    initial: 'B',
    date: '2026-06-28',
    bookTitle: 'プロジェクト・ヘイル・メアリー',
    body: '一人で宇宙に取り残された科学者の物語。ハードSFでありながら読みやすく、展開が面白すぎて一気読みしました。',
    rating: 5,
    status: 'reading',
    likeCount: 31,
    commentCount: 0,
    hasImages: true,
  },
  {
    id: 4,
    userId: 2,
    username: 'yuki_reads',
    initial: 'Y',
    date: '2026-06-27',
    bookTitle: '嫌われる勇気',
    body: 'アドラー心理学をわかりやすく解説した対話形式の本。「他者の課題を切り離す」という考え方が実践的で役立っています。',
    rating: 4,
    status: 'completed',
    likeCount: 18,
    commentCount: 0,
    hasImages: false,
  },
  {
    id: 5,
    userId: 3,
    username: 'taro_books',
    initial: 'T',
    date: '2026-06-26',
    bookTitle: '羊と鋼の森',
    body: 'ピアノ調律師の青年の成長物語。静謐な文章が心地よく、音楽と言葉の美しさを感じさせてくれる作品です。',
    rating: 4,
    status: 'completed',
    likeCount: 9,
    commentCount: 0,
    hasImages: false,
  },
];

const followingUsers = [
  { id: 2, username: 'yuki_reads', initial: 'Y', bio: '読書が趣味のエンジニア。月20冊を目標に読んでいます。', isFollowing: true },
  { id: 3, username: 'taro_books', initial: 'T', bio: '小説と歴史本が好きです。本屋巡りも趣味。', isFollowing: true },
];

const followerUsers = [
  { id: 2, username: 'yuki_reads', initial: 'Y', bio: '読書が趣味のエンジニア。月20冊を目標に読んでいます。', isFollowing: true },
  { id: 4, username: 'hana_novel', initial: 'H', bio: 'ミステリー小説専門。おすすめあればぜひ！', isFollowing: false },
];

// ===== NAVIGATION =====
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }
}

// ===== RENDER HELPERS =====
function renderStars(rating, size = '') {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < rating ? 'filled' : ''} ${size}">${i < rating ? '★' : '☆'}</span>`
  ).join('');
}

function renderBadge(status) {
  const label = status === 'completed' ? '読了' : '読書中';
  return `<span class="badge badge-${status}">${label}</span>`;
}

function renderAvatar(initial, size = '') {
  return `<div class="avatar ${size}">${initial}</div>`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

// ===== HOME SCREEN =====
function renderHome() {
  const filtered = state.currentTab === 'following'
    ? reviews.filter(r => followingUsers.some(u => u.id === r.userId))
    : reviews;

  const list = document.getElementById('review-list');
  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <p>まだレビューがありません。<br>ユーザーをフォローしてみましょう！</p>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(r => renderReviewCard(r)).join('');

  list.querySelectorAll('.review-card').forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.like-btn') || e.target.closest('.card-username')) return;
      openReviewDetail(filtered[idx].id);
    });
  });

  list.querySelectorAll('.like-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      toggleLike(id, btn);
    });
  });

  list.querySelectorAll('.card-username').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openProfile(parseInt(el.dataset.userid));
    });
  });
}

function renderReviewCard(r) {
  const liked = state.likes.has(r.id);
  const likeCnt = liked ? r.likeCount + 1 : r.likeCount;
  const commentCnt = (state.comments[r.id] || []).length;

  return `
    <div class="review-card">
      <div class="card-header">
        ${renderAvatar(r.initial, 'avatar-sm')}
        <div class="card-user-info">
          <div class="card-username" data-userid="${r.userId}">${r.username}</div>
          <div class="card-date">${formatDate(r.date)}</div>
        </div>
      </div>
      <div class="card-book">
        <span class="book-icon">📚</span>
        <span class="book-title">${r.bookTitle}</span>
      </div>
      <div class="card-meta">
        <div class="stars">${renderStars(r.rating)}</div>
        ${renderBadge(r.status)}
      </div>
      <div class="card-body">${r.body}</div>
      ${r.hasImages ? `
        <div class="card-images">
          <div class="card-image-placeholder">📖</div>
          <div class="card-image-placeholder">🌟</div>
        </div>` : ''}
      <div class="card-footer">
        <button class="like-btn ${liked ? 'liked' : ''}" data-id="${r.id}">
          ${liked ? '♥' : '♡'} ${likeCnt}
        </button>
        <button class="comment-count">💬 ${commentCnt}</button>
      </div>
    </div>`;
}

function toggleLike(reviewId, btn) {
  const review = reviews.find(r => r.id === reviewId);
  if (!review) return;

  if (state.likes.has(reviewId)) {
    state.likes.delete(reviewId);
    showToast('いいねを取り消しました');
  } else {
    state.likes.add(reviewId);
    showToast('いいねしました ♥');
  }
  renderHome();
  if (document.getElementById('screen-detail').classList.contains('active')) {
    openReviewDetail(reviewId);
  }
}

function switchTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  renderHome();
}

// ===== REVIEW DETAIL =====
function openReviewDetail(reviewId) {
  const r = reviews.find(rv => rv.id === reviewId);
  if (!r) return;

  const liked = state.likes.has(r.id);
  const likeCnt = liked ? r.likeCount + 1 : r.likeCount;
  const comments = state.comments[r.id] || [];
  const isOwner = r.userId === state.currentUser.id;

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-author" onclick="openProfile(${r.userId})">
      ${renderAvatar(r.initial)}
      <div>
        <div style="font-weight:700;font-size:15px">${r.username}</div>
        <div style="font-size:12px;color:var(--text-muted)">${formatDate(r.date)}</div>
      </div>
    </div>
    <div class="detail-book">📚 ${r.bookTitle}</div>
    <div class="detail-meta">
      <div class="stars">${renderStars(r.rating)}</div>
      ${renderBadge(r.status)}
    </div>
    <div class="detail-body">${r.body}</div>
    ${r.hasImages ? `
      <div class="detail-images">
        <div class="detail-image-placeholder">📖</div>
        <div class="detail-image-placeholder">🌟</div>
      </div>` : ''}
    <div class="detail-actions">
      <button class="like-btn ${liked ? 'liked' : ''}" id="detail-like-btn" onclick="toggleLike(${r.id}, this)">
        ${liked ? '♥' : '♡'} ${likeCnt} いいね
      </button>
      <span class="comment-count">💬 ${comments.length} コメント</span>
      ${isOwner ? `
        <div class="detail-action-right">
          <button class="btn btn-outline" style="padding:6px 14px;font-size:13px" onclick="openEditReview(${r.id})">編集</button>
          <button class="btn btn-danger" style="padding:6px 14px;font-size:13px" onclick="deleteReview(${r.id})">削除</button>
        </div>` : ''}
    </div>
    <div class="comments-section">
      <h3>コメント（${comments.length}件）</h3>
      ${comments.length === 0 ? '<p style="font-size:14px;color:var(--text-muted)">まだコメントはありません。</p>' : ''}
      ${comments.map(c => `
        <div class="comment-item">
          ${renderAvatar(c.initial, 'avatar-sm')}
          <div class="comment-content">
            <div class="comment-user" onclick="openProfile(${c.userId})">${c.username}</div>
            <div class="comment-body">${c.body}</div>
          </div>
        </div>`).join('')}
      <div class="comment-input-area">
        ${renderAvatar(state.currentUser.initial, 'avatar-sm')}
        <input type="text" id="comment-input" placeholder="コメントを入力..." />
        <button class="btn btn-primary" style="padding:9px 16px" onclick="submitComment(${r.id})">送信</button>
      </div>
    </div>`;

  showScreen('screen-detail');
}

function submitComment(reviewId) {
  const input = document.getElementById('comment-input');
  const text = input.value.trim();
  if (!text) {
    showToast('コメントを入力してください');
    return;
  }

  if (!state.comments[reviewId]) state.comments[reviewId] = [];
  state.comments[reviewId].push({
    id: Date.now(),
    userId: state.currentUser.id,
    username: state.currentUser.username,
    initial: state.currentUser.initial,
    body: text,
  });

  showToast('コメントを投稿しました');
  openReviewDetail(reviewId);
}

function deleteReview(reviewId) {
  showToast('レビューを削除しました');
  showScreen('screen-home');
  renderHome();
}

// ===== CREATE / EDIT REVIEW =====
function openCreateReview() {
  state.selectedRating = 0;
  document.getElementById('form-screen-title').textContent = 'レビューを書く';
  document.getElementById('form-book-title').value = '';
  document.getElementById('form-body').value = '';
  document.getElementById('form-status-reading').checked = true;
  renderStarInput(0);
  showScreen('screen-form');
}

function openEditReview(reviewId) {
  const r = reviews.find(rv => rv.id === reviewId);
  if (!r) return;

  state.selectedRating = r.rating;
  document.getElementById('form-screen-title').textContent = 'レビューを編集';
  document.getElementById('form-book-title').value = r.bookTitle;
  document.getElementById('form-body').value = r.body;
  document.getElementById(r.status === 'completed' ? 'form-status-completed' : 'form-status-reading').checked = true;
  renderStarInput(r.rating);
  showScreen('screen-form');
}

function renderStarInput(selected) {
  const container = document.getElementById('star-input');
  container.innerHTML = Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < selected ? 'filled' : ''}" data-val="${i + 1}" onclick="selectStar(${i + 1})">
      ${i < selected ? '★' : '☆'}
    </span>`
  ).join('');
}

function selectStar(val) {
  state.selectedRating = val;
  renderStarInput(val);
}

function submitReview() {
  const bookTitle = document.getElementById('form-book-title').value.trim();
  const body = document.getElementById('form-body').value.trim();

  if (!bookTitle) { showToast('書籍名を入力してください'); return; }
  if (!body) { showToast('感想を入力してください'); return; }
  if (state.selectedRating === 0) { showToast('星評価を選択してください'); return; }

  showToast('レビューを投稿しました 📚');
  showScreen('screen-home');
  renderHome();
}

// ===== PROFILE =====
function openProfile(userId) {
  const isMe = userId === state.currentUser.id;
  const user = userId === state.currentUser.id
    ? { id: 1, username: 'book_lover', initial: 'B', bio: '読書と旅が好きです。特に小説とSFをよく読みます。月10冊を目標に。', isFollowing: false }
    : followingUsers.find(u => u.id === userId) || followerUsers.find(u => u.id === userId)
      || { id: userId, username: 'hana_novel', initial: 'H', bio: 'ミステリー小説専門。おすすめあればぜひ！', isFollowing: false };

  const userReviews = reviews.filter(r => r.userId === userId);

  document.getElementById('profile-content').innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        ${renderAvatar(user.initial, 'avatar-lg')}
        <div class="profile-info">
          <div class="profile-name">${user.username}</div>
          <div class="profile-bio">${user.bio}</div>
          <div class="profile-stats">
            <div class="stat-item" onclick="openFollowList('following')">
              <div class="stat-number">${isMe ? 2 : 5}</div>
              <div class="stat-label">フォロー中</div>
            </div>
            <div class="stat-item" onclick="openFollowList('followers')">
              <div class="stat-number">${isMe ? 4 : 12}</div>
              <div class="stat-label">フォロワー</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${userReviews.length}</div>
              <div class="stat-label">レビュー</div>
            </div>
          </div>
        </div>
      </div>
      <div class="profile-actions">
        ${isMe
          ? `<button class="btn btn-outline" onclick="showScreen('screen-edit-profile')">プロフィール編集</button>`
          : `<button class="btn ${user.isFollowing ? 'btn-ghost' : 'btn-primary'}" onclick="toggleFollow(this, ${user.id})">
              ${user.isFollowing ? 'フォロー解除' : 'フォローする'}
             </button>`
        }
      </div>
    </div>
    <div class="profile-reviews-title">投稿レビュー（${userReviews.length}件）</div>
    ${userReviews.length === 0
      ? `<div class="empty-state"><div class="empty-icon">📖</div><p>まだレビューはありません。</p></div>`
      : userReviews.map(r => renderReviewCard(r)).join('')
    }`;

  document.querySelectorAll('#profile-content .like-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLike(parseInt(btn.dataset.id), btn);
    });
  });

  document.querySelectorAll('#profile-content .review-card').forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.like-btn')) return;
      openReviewDetail(userReviews[idx].id);
    });
  });

  showScreen('screen-profile');
}

function toggleFollow(btn, userId) {
  const isNowFollowing = btn.textContent.trim() === 'フォロー解除';
  if (isNowFollowing) {
    btn.textContent = 'フォローする';
    btn.className = 'btn btn-primary';
    showToast('フォローを解除しました');
  } else {
    btn.textContent = 'フォロー解除';
    btn.className = 'btn btn-ghost';
    showToast('フォローしました！');
  }
}

// ===== FOLLOW LIST =====
function openFollowList(type) {
  const isFollowing = type === 'following';
  const users = isFollowing ? followingUsers : followerUsers;
  const title = isFollowing ? 'フォロー中' : 'フォロワー';

  document.getElementById('follow-list-title').textContent = title;
  document.getElementById('follow-list-content').innerHTML = users.map(u => `
    <div class="follow-item" style="border-bottom:1px solid var(--border)">
      ${renderAvatar(u.initial, 'avatar-sm')}
      <div class="follow-user-info" onclick="openProfile(${u.id})">
        <div class="follow-username">${u.username}</div>
        <div class="follow-bio">${u.bio}</div>
      </div>
      ${u.id !== state.currentUser.id ? `
        <button class="btn ${u.isFollowing ? 'btn-ghost' : 'btn-primary'}" style="padding:6px 14px;font-size:13px"
          onclick="toggleFollow(this, ${u.id})">
          ${u.isFollowing ? 'フォロー解除' : 'フォローする'}
        </button>` : ''}
    </div>`).join('');

  showScreen('screen-follow-list');
}

// ===== EDIT PROFILE =====
function saveProfile() {
  showToast('プロフィールを更新しました');
  openProfile(state.currentUser.id);
}

// ===== TOAST =====
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ===== AUTH =====
function login() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (!email || !password) {
    showToast('メールアドレスとパスワードを入力してください');
    return;
  }
  showScreen('screen-home');
  renderHome();
}

function signup() {
  const username = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const confirm = document.getElementById('signup-confirm').value.trim();

  if (!username || !email || !password || !confirm) {
    showToast('すべての項目を入力してください');
    return;
  }
  if (password !== confirm) {
    showToast('パスワードと確認用パスワードが一致しません');
    return;
  }
  showToast('アカウントを作成しました！');
  showScreen('screen-home');
  renderHome();
}

function logout() {
  showScreen('screen-login');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  showScreen('screen-login');
});
