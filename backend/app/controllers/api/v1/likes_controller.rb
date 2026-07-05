module Api
  module V1
    class LikesController < ApplicationController
      before_action :authenticate_user!
      before_action :set_review

      def create
        like = current_user.likes.build(review: @review)
        if like.save
          render json: like_stats, status: :created
        else
          render json: { errors: like.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        like = current_user.likes.find_by(review: @review)
        if like
          like.destroy
          render json: like_stats, status: :ok
        else
          render json: { error: "いいねが見つかりません" }, status: :not_found
        end
      end

      private

      def set_review
        @review = Review.find(params[:review_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "レビューが見つかりません" }, status: :not_found
      end

      def like_stats
        {
          likes_count: @review.likes.count,
          liked: current_user.likes.exists?(review: @review)
        }
      end
    end
  end
end
