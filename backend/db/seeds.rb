# 冪等性を保つため find_or_create_by! を使用

# ユーザー作成
guest = User.find_or_create_by!(email: "guest@booklog.example.com") do |u|
  u.username = "guest"
  u.password = "guestpass123"
  u.bio = "ポートフォリオ確認用のゲストアカウントです。自由に操作してみてください。"
end

book_lover = User.find_or_create_by!(email: "booklover@booklog.example.com") do |u|
  u.username = "book_lover"
  u.password = "password123"
  u.bio = "技術書を中心に月10冊ペースで読んでいます。プログラミング・設計・アーキテクチャが好きです。"
end

reading_fan = User.find_or_create_by!(email: "readingfan@booklog.example.com") do |u|
  u.username = "reading_fan"
  u.password = "password123"
  u.bio = "ビジネス書・自己啓発・エッセイが好きです。読んだ本の感想を記録しています。"
end

# レビューデータ
reviews_data = [
  {
    user: book_lover,
    book_title: "リーダブルコード",
    body: "コードの読みやすさについて丁寧に解説された名著。変数名・関数名の付け方からコメントの書き方まで、すぐに実践できる知識が詰まっています。プログラミングを始めたばかりの人から経験者まで、全員に読んでほしい一冊です。",
    rating: 5,
    status: :finished
  },
  {
    user: book_lover,
    book_title: "Clean Code",
    body: "Robert C. Martin によるクリーンコードの教科書。関数は短く、名前は明確に、というシンプルな原則を実例とともに学べます。リーダブルコードと合わせて読むと理解が深まりました。",
    rating: 4,
    status: :finished
  },
  {
    user: book_lover,
    book_title: "ゼロから作るDeep Learning",
    body: "Pythonで実際にニューラルネットワークをゼロから実装しながら学ぶ本。難しい数式も丁寧に説明されており、機械学習の仕組みを本当に理解したい人に最適です。手を動かしながら読めるのが素晴らしい。",
    rating: 5,
    status: :finished
  },
  {
    user: book_lover,
    book_title: "達人プログラマー",
    body: "ソフトウェア開発のあらゆる側面をカバーした大作。キャリア・設計・ツール・チームワークまで幅広く扱っており、定期的に読み返したくなります。20年以上前の本ですが今でも色褪せない内容です。",
    rating: 5,
    status: :reading
  },
  {
    user: reading_fan,
    book_title: "FACTFULNESS",
    body: "私たちが世界について持っているイメージがいかに間違っているかを、データで示してくれる本。読み終わった後に世界の見え方が変わります。思い込みを排除して事実に基づいて物事を考える重要性を実感しました。",
    rating: 5,
    status: :finished
  },
  {
    user: reading_fan,
    book_title: "嫌われる勇気",
    body: "アドラー心理学を対話形式で解説した一冊。他者の評価を気にしすぎず、自分の人生を生きることの大切さを教えてくれます。読んで少し楽になれた気がします。何度も読み返している本です。",
    rating: 4,
    status: :finished
  },
  {
    user: reading_fan,
    book_title: "エッセンシャル思考",
    body: "より少なく、より良く。本当に重要なことだけに集中するための思考法を解説しています。仕事の優先順位を見直すきっかけになりました。断る勇気を持つことの大切さが心に刺さりました。",
    rating: 4,
    status: :finished
  },
  {
    user: reading_fan,
    book_title: "プログラマが知るべき97のこと",
    body: "世界中のエキスパートによる97のエッセイ集。一つひとつが短くまとまっているので、通勤時間などのスキマ時間に読めます。「DRY原則を守れ」「ボーイスカウトの規則」など、実践的な知見が多く参考になりました。",
    rating: 4,
    status: :finished
  },
  {
    user: guest,
    book_title: "人月の神話",
    body: "ソフトウェアプロジェクト管理の古典。人を追加すればプロジェクトが早く終わるわけではないという「ブルックスの法則」が有名です。50年前に書かれた本なのに現代でもそのまま通用するのが驚きでした。",
    rating: 5,
    status: :finished
  },
  {
    user: guest,
    book_title: "SQLアンチパターン",
    body: "データベース設計でやりがちな失敗パターンとその解決策をまとめた本。EAVや再帰クエリなど、実務でよく見かける問題が取り上げられています。設計フェーズで手元に置いておきたい一冊です。",
    rating: 4,
    status: :reading
  }
]

# レビュー作成（冪等）
reviews_data.each do |data|
  Review.find_or_create_by!(
    user: data[:user],
    book_title: data[:book_title]
  ) do |r|
    r.body   = data[:body]
    r.rating = data[:rating]
    r.status = data[:status]
  end
end

# フォロー関係（guest が book_lover と reading_fan をフォロー）
Follow.find_or_create_by!(follower: guest, following: book_lover)
Follow.find_or_create_by!(follower: guest, following: reading_fan)
Follow.find_or_create_by!(follower: book_lover, following: reading_fan)

# いいね
[
  { user: guest,       review: Review.find_by(book_title: "リーダブルコード") },
  { user: guest,       review: Review.find_by(book_title: "FACTFULNESS") },
  { user: guest,       review: Review.find_by(book_title: "嫌われる勇気") },
  { user: book_lover,  review: Review.find_by(book_title: "FACTFULNESS") },
  { user: book_lover,  review: Review.find_by(book_title: "エッセンシャル思考") },
  { user: reading_fan, review: Review.find_by(book_title: "リーダブルコード") },
  { user: reading_fan, review: Review.find_by(book_title: "ゼロから作るDeep Learning") }
].each do |data|
  Like.find_or_create_by!(user: data[:user], review: data[:review]) if data[:review]
end

# コメント
[
  {
    user: guest,
    review: Review.find_by(book_title: "リーダブルコード"),
    body: "変数名の付け方が特に参考になりました！"
  },
  {
    user: reading_fan,
    review: Review.find_by(book_title: "リーダブルコード"),
    body: "私も大好きな本です。チーム全員で読みました。"
  },
  {
    user: guest,
    review: Review.find_by(book_title: "FACTFULNESS"),
    body: "データで世界を見る大切さを学べましたよね。おすすめです！"
  },
  {
    user: book_lover,
    review: Review.find_by(book_title: "嫌われる勇気"),
    body: "アドラー心理学、興味あって気になっていました。読んでみます！"
  },
  {
    user: reading_fan,
    review: Review.find_by(book_title: "達人プログラマー"),
    body: "名著ですよね。私も積読になっているので読み返します。"
  }
].each do |data|
  next unless data[:review]
  Comment.find_or_create_by!(
    user: data[:user],
    review: data[:review],
    body: data[:body]
  )
end

puts "Seed 完了: ユーザー #{User.count} 件 / レビュー #{Review.count} 件 / いいね #{Like.count} 件 / コメント #{Comment.count} 件 / フォロー #{Follow.count} 件"
