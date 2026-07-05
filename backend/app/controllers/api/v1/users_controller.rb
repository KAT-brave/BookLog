module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!
      before_action :set_target_user, only: [ :show, :follow, :unfollow ]

      def me
        render json: user_json(current_user, current_user)
      end

      def update_me
        if current_user.update(profile_params)
          render json: user_json(current_user, current_user)
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_content
        end
      end

      def show
        render json: user_json(@target_user, current_user)
      end

      def follow
        if @target_user == current_user
          render json: { error: "自分自身はフォローできません" }, status: :unprocessable_content and return
        end
        follow = current_user.follow_relationships.build(following: @target_user)
        if follow.save
          render json: follow_stats(@target_user, current_user), status: :created
        else
          render json: { errors: follow.errors.full_messages }, status: :unprocessable_content
        end
      end

      def unfollow
        follow = current_user.follow_relationships.find_by(following: @target_user)
        if follow
          follow.destroy
          render json: follow_stats(@target_user, current_user), status: :ok
        else
          render json: { error: "フォローしていません" }, status: :not_found
        end
      end

      private

      def set_target_user
        @target_user = User.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "ユーザーが見つかりません" }, status: :not_found
      end

      def profile_params
        params.require(:user).permit(:username, :bio, :avatar_url)
      end

      def user_json(user, viewer)
        {
          id: user.id,
          username: user.username,
          bio: user.bio,
          avatar_url: user.avatar_url,
          reviews_count: user.reviews.count,
          following_count: user.following.count,
          followers_count: user.followers.count,
          following: viewer.following.exists?(user.id),
          reviews: user.reviews.order(created_at: :desc).limit(20).map do |r|
            { id: r.id, book_title: r.book_title, rating: r.rating, status: r.status, created_at: r.created_at }
          end
        }
      end

      def follow_stats(target, viewer)
        {
          followers_count: target.followers.count,
          following: viewer.following.exists?(target.id)
        }
      end
    end
  end
end
