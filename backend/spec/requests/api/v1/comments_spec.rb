require 'rails_helper'

RSpec.describe "Api::V1::Comments", type: :request do
  let(:user)    { create(:user) }
  let(:other)   { create(:user) }
  let!(:review) { create(:review, user: other) }

  def auth_headers(u)
    post "/api/v1/auth/login",
         params: { user: { email: u.email, password: "password123" } },
         as: :json
    { "Authorization" => response.headers["Authorization"] }
  end

  describe "GET /api/v1/reviews/:review_id/comments" do
    before { create_list(:comment, 3, review: review, user: user) }

    it "200とコメント一覧を返す" do
      get "/api/v1/reviews/#{review.id}/comments",
          headers: auth_headers(user), as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(3)
    end

    it "未認証の場合は401を返す" do
      get "/api/v1/reviews/#{review.id}/comments", as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/v1/reviews/:review_id/comments" do
    context "正常系" do
      it "201とコメントを返す" do
        post "/api/v1/reviews/#{review.id}/comments",
             params: { comment: { body: "参考になりました" } },
             headers: auth_headers(user), as: :json

        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)["body"]).to eq("参考になりました")
      end

      it "commentsテーブルにレコードが1件増える" do
        headers = auth_headers(user)
        expect {
          post "/api/v1/reviews/#{review.id}/comments",
               params: { comment: { body: "参考になりました" } },
               headers: headers, as: :json
        }.to change(Comment, :count).by(1)
      end
    end

    context "異常系" do
      it "bodyが空の場合は422を返す" do
        post "/api/v1/reviews/#{review.id}/comments",
             params: { comment: { body: "" } },
             headers: auth_headers(user), as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "未認証の場合は401を返す" do
        post "/api/v1/reviews/#{review.id}/comments",
             params: { comment: { body: "コメント" } }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/reviews/:review_id/comments/:id" do
    let!(:comment) { create(:comment, user: user, review: review) }

    context "本人の場合" do
      it "204を返しレコードが削除される" do
        headers = auth_headers(user)
        expect {
          delete "/api/v1/reviews/#{review.id}/comments/#{comment.id}",
                 headers: headers, as: :json
        }.to change(Comment, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context "他人のコメントの場合" do
      it "403を返す" do
        delete "/api/v1/reviews/#{review.id}/comments/#{comment.id}",
               headers: auth_headers(other), as: :json
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
