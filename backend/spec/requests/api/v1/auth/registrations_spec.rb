require 'rails_helper'

RSpec.describe "Api::V1::Auth::Registrations", type: :request do
  describe "POST /api/v1/auth/signup" do
    let(:valid_params) do
      {
        user: {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end

    context "正常系" do
      it "201を返し、Authorizationヘッダーにトークンが含まれる" do
        post "/api/v1/auth/signup", params: valid_params, as: :json

        expect(response).to have_http_status(:created)
        expect(response.headers["Authorization"]).to be_present
        expect(JSON.parse(response.body)["user"]["username"]).to eq("testuser")
      end

      it "usersテーブルにレコードが1件増える" do
        expect {
          post "/api/v1/auth/signup", params: valid_params, as: :json
        }.to change(User, :count).by(1)
      end
    end

    context "異常系" do
      it "メールアドレスが重複している場合は422を返す" do
        create(:user, email: "test@example.com")
        post "/api/v1/auth/signup", params: valid_params, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to be_present
      end

      it "ユーザー名が空の場合は422を返す" do
        params = valid_params.deep_merge(user: { username: "" })
        post "/api/v1/auth/signup", params: params, as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "パスワードが一致しない場合は422を返す" do
        params = valid_params.deep_merge(user: { password_confirmation: "wrong" })
        post "/api/v1/auth/signup", params: params, as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
