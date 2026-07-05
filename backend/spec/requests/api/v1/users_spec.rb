require 'rails_helper'

RSpec.describe "Api::V1::Users", type: :request do
  let(:user)  { create(:user) }
  let(:other) { create(:user) }

  def auth_headers(u)
    post "/api/v1/auth/login",
         params: { user: { email: u.email, password: "password123" } },
         as: :json
    { "Authorization" => response.headers["Authorization"] }
  end

  describe "GET /api/v1/users/me" do
    it "200と自分のプロフィールを返す" do
      get "/api/v1/users/me", headers: auth_headers(user), as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["username"]).to eq(user.username)
    end

    it "未認証の場合は401を返す" do
      get "/api/v1/users/me", as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/users/me" do
    it "200とプロフィールを更新して返す" do
      patch "/api/v1/users/me",
            params: { user: { bio: "読書が好きです" } },
            headers: auth_headers(user), as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["bio"]).to eq("読書が好きです")
    end
  end

  describe "GET /api/v1/users/:id" do
    it "200と対象ユーザーのプロフィールを返す" do
      get "/api/v1/users/#{other.id}", headers: auth_headers(user), as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["username"]).to eq(other.username)
      expect(body["following"]).to be false
    end

    it "存在しないIDの場合は404を返す" do
      get "/api/v1/users/0", headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/users/:id/follow" do
    it "201とフォロー情報を返す" do
      post "/api/v1/users/#{other.id}/follow",
           headers: auth_headers(user), as: :json

      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["following"]).to be true
      expect(body["followers_count"]).to eq(1)
    end

    it "自分自身はフォローできない" do
      post "/api/v1/users/#{user.id}/follow",
           headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "同じユーザーを2回フォローすると422を返す" do
      headers = auth_headers(user)
      post "/api/v1/users/#{other.id}/follow", headers: headers, as: :json
      post "/api/v1/users/#{other.id}/follow", headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "DELETE /api/v1/users/:id/follow" do
    before { create(:follow, follower: user, following: other) }

    it "200とアンフォロー後の情報を返す" do
      delete "/api/v1/users/#{other.id}/follow",
             headers: auth_headers(user), as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["following"]).to be false
    end

    it "フォローしていない場合は404を返す" do
      delete "/api/v1/users/#{user.id}/follow",
             headers: auth_headers(other), as: :json
      expect(response).to have_http_status(:not_found)
    end
  end
end
