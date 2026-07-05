require 'rails_helper'

RSpec.describe "Api::V1::Reviews", type: :request do
  let(:user)  { create(:user) }
  let(:other) { create(:user) }

  def auth_headers(u)
    post "/api/v1/auth/login",
         params: { user: { email: u.email, password: "password123" } },
         as: :json
    { "Authorization" => response.headers["Authorization"] }
  end

  describe "GET /api/v1/reviews" do
    context "認証済みの場合" do
      it "200とレビュー一覧を返す" do
        create_list(:review, 3, user: user)
        get "/api/v1/reviews", headers: auth_headers(user), as: :json

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).length).to eq(3)
      end
    end

    context "フォローフィードの場合" do
      let(:third) { create(:user) }

      before do
        create(:review, user: other)
        create(:review, user: third)
        create(:follow, follower: user, following: other)
      end

      it "フォロー中ユーザーのレビューのみ返す" do
        get "/api/v1/reviews?feed=following",
            headers: auth_headers(user), as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body.length).to eq(1)
        expect(body.first["user"]["id"]).to eq(other.id)
      end

      it "フォロー中ユーザーがいない場合は空配列を返す" do
        get "/api/v1/reviews?feed=following",
            headers: auth_headers(third), as: :json

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to be_empty
      end
    end

    context "書籍タイトル検索（?q=）の場合" do
      before do
        create(:review, book_title: "リーダブルコード", user: user)
        create(:review, book_title: "Clean Code", user: user)
        create(:review, book_title: "プログラミング入門", user: user)
      end

      it "クエリに一致するレビューのみ返す" do
        get "/api/v1/reviews", params: { q: "コード" }, headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body.length).to eq(1)
        expect(body.first["book_title"]).to eq("リーダブルコード")
      end

      it "大文字小文字を区別しない" do
        get "/api/v1/reviews", params: { q: "clean" }, headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body.length).to eq(1)
        expect(body.first["book_title"]).to eq("Clean Code")
      end

      it "クエリが空の場合は全件返す" do
        get "/api/v1/reviews", params: { q: "" }, headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).length).to eq(3)
      end

      it "一致しない場合は空配列を返す" do
        get "/api/v1/reviews", params: { q: "xyz_not_exist" }, headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to be_empty
      end
    end

    context "未認証の場合" do
      it "401を返す" do
        get "/api/v1/reviews", as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/reviews/:id" do
    let!(:review) { create(:review, user: user) }

    context "認証済みの場合" do
      it "200とレビュー詳細を返す" do
        get "/api/v1/reviews/#{review.id}", headers: auth_headers(user), as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["book_title"]).to eq(review.book_title)
        expect(body["user"]["username"]).to eq(user.username)
      end
    end

    context "存在しないIDの場合" do
      it "404を返す" do
        get "/api/v1/reviews/0", headers: auth_headers(user), as: :json
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "POST /api/v1/reviews" do
    let(:valid_params) do
      { review: { book_title: "リファクタリング", body: "名著です", rating: 5, status: "finished" } }
    end

    context "正常系" do
      it "201とレビューを返す" do
        post "/api/v1/reviews", params: valid_params, headers: auth_headers(user), as: :json

        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)["book_title"]).to eq("リファクタリング")
      end

      it "reviewsテーブルにレコードが1件増える" do
        headers = auth_headers(user)
        expect {
          post "/api/v1/reviews", params: valid_params, headers: headers, as: :json
        }.to change(Review, :count).by(1)
      end
    end

    context "異常系" do
      it "book_titleが空の場合は422を返す" do
        params = { review: { book_title: "", rating: 3, status: "reading" } }
        post "/api/v1/reviews", params: params, headers: auth_headers(user), as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "ratingが範囲外の場合は422を返す" do
        params = { review: { book_title: "本", rating: 6, status: "reading" } }
        post "/api/v1/reviews", params: params, headers: auth_headers(user), as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "未認証の場合は401を返す" do
        post "/api/v1/reviews", params: valid_params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/reviews/:id" do
    let!(:review) { create(:review, user: user) }

    context "本人の場合" do
      it "200と更新後のレビューを返す" do
        patch "/api/v1/reviews/#{review.id}",
              params: { review: { book_title: "更新後タイトル" } },
              headers: auth_headers(user),
              as: :json

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)["book_title"]).to eq("更新後タイトル")
      end
    end

    context "他人のレビューの場合" do
      it "403を返す" do
        patch "/api/v1/reviews/#{review.id}",
              params: { review: { book_title: "改ざん" } },
              headers: auth_headers(other),
              as: :json

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "DELETE /api/v1/reviews/:id" do
    let!(:review) { create(:review, user: user) }

    context "本人の場合" do
      it "204を返しレコードが削除される" do
        headers = auth_headers(user)
        expect {
          delete "/api/v1/reviews/#{review.id}", headers: headers, as: :json
        }.to change(Review, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context "他人のレビューの場合" do
      it "403を返す" do
        delete "/api/v1/reviews/#{review.id}", headers: auth_headers(other), as: :json
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
