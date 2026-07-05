module Api
  module V1
    module Auth
      class RegistrationsController < Devise::RegistrationsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          if resource.persisted?
            render json: {
              message: "アカウントを作成しました",
              user: user_json(resource)
            }, status: :created
          else
            render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def sign_up_params
          params.require(:user).permit(:username, :email, :password, :password_confirmation)
        end

        def user_json(user)
          { id: user.id, username: user.username, email: user.email }
        end
      end
    end
  end
end
