require 'rails_helper'

RSpec.describe "Api::V1::Auth::Sessions", type: :request do
  let!(:user) { create(:user, email: "test@example.com", password: "password123") }

  describe "POST /api/v1/auth/login" do
    context "正常系" do
      it "200を返し、Authorizationヘッダーにトークンが含まれる" do
        post "/api/v1/auth/login",
             params: { user: { email: "test@example.com", password: "password123" } },
             as: :json

        expect(response).to have_http_status(:ok)
        expect(response.headers["Authorization"]).to be_present
        expect(JSON.parse(response.body)["user"]["email"]).to eq("test@example.com")
      end
    end

    context "異常系" do
      it "パスワードが誤っている場合は401を返す" do
        post "/api/v1/auth/login",
             params: { user: { email: "test@example.com", password: "wrong" } },
             as: :json

        expect(response).to have_http_status(:unauthorized)
      end

      it "存在しないメールアドレスの場合は401を返す" do
        post "/api/v1/auth/login",
             params: { user: { email: "notfound@example.com", password: "password123" } },
             as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/auth/logout" do
    context "正常系" do
      it "ログイン済みの場合は200を返す" do
        post "/api/v1/auth/login",
             params: { user: { email: "test@example.com", password: "password123" } },
             as: :json

        token = response.headers["Authorization"]

        delete "/api/v1/auth/logout",
               headers: { "Authorization" => token },
               as: :json

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)["message"]).to eq("ログアウトしました")
      end
    end

    context "異常系" do
      it "未認証の場合は401を返す" do
        delete "/api/v1/auth/logout", as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
