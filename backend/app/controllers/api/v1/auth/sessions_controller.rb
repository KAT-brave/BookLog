module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          render json: {
            message: "ログインしました",
            user: { id: resource.id, username: resource.username, email: resource.email }
          }, status: :ok
        end

        def respond_to_on_destroy(resource_or_scope = nil)
          render json: { message: "ログアウトしました" }, status: :ok
        end

        def verify_signed_out_user
          if all_signed_out? && request.headers["Authorization"].blank?
            render json: { error: "認証が必要です" }, status: :unauthorized
          end
        end
      end
    end
  end
end
