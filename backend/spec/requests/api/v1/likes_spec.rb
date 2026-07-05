require 'rails_helper'

RSpec.describe "Api::V1::Likes", type: :request do
  let(:user)   { create(:user) }
  let(:other)  { create(:user) }
  let!(:review) { create(:review, user: other) }

  def auth_headers(u)
    post "/api/v1/auth/login",
         params: { user: { email: u.email, password: "password123" } },
         as: :json
    { "Authorization" => response.headers["Authorization"] }
  end

  describe "POST /api/v1/reviews/:review_id/like" do
    context "認証済みの場合" do
      it "201といいね情報を返す" do
        post "/api/v1/reviews/#{review.id}/like",
             headers: auth_headers(user), as: :json

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body["likes_count"]).to eq(1)
        expect(body["liked"]).to be true
      end

      it "likesテーブルにレコードが1件増える" do
        headers = auth_headers(user)
        expect {
          post "/api/v1/reviews/#{review.id}/like", headers: headers, as: :json
        }.to change(Like, :count).by(1)
      end

      it "同じレビューに2回いいねすると422を返す" do
        headers = auth_headers(user)
        post "/api/v1/reviews/#{review.id}/like", headers: headers, as: :json
        post "/api/v1/reviews/#{review.id}/like", headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "未認証の場合" do
      it "401を返す" do
        post "/api/v1/reviews/#{review.id}/like", as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/reviews/:review_id/like" do
    before { create(:like, user: user, review: review) }

    context "いいね済みの場合" do
      it "200といいね情報を返す" do
        delete "/api/v1/reviews/#{review.id}/like",
               headers: auth_headers(user), as: :json

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["likes_count"]).to eq(0)
        expect(body["liked"]).to be false
      end

      it "likesテーブルのレコードが1件減る" do
        headers = auth_headers(user)
        expect {
          delete "/api/v1/reviews/#{review.id}/like", headers: headers, as: :json
        }.to change(Like, :count).by(-1)
      end
    end

    context "いいねしていない場合" do
      it "404を返す" do
        delete "/api/v1/reviews/#{review.id}/like",
               headers: auth_headers(other), as: :json

        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
