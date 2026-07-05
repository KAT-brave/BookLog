module Api
  module V1
    class ReviewsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_review, only: [ :show, :update, :destroy ]
      before_action :authorize_review!, only: [ :update, :destroy ]

      def index
        reviews = if params[:feed] == "following"
          Review.includes(:user, :likes)
                .where(user: current_user.following)
                .order(created_at: :desc)
        else
          Review.includes(:user, :likes).order(created_at: :desc)
        end
        reviews = reviews.where("book_title ILIKE ?", "%#{params[:q]}%") if params[:q].present?
        render json: reviews.map { |r| review_json(r) }
      end

      def show
        render json: review_json(@review)
      end

      def create
        review = current_user.reviews.build(review_params)
        if review.save
          render json: review_json(review), status: :created
        else
          render json: { errors: review.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        if @review.update(review_params)
          render json: review_json(@review)
        else
          render json: { errors: @review.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        @review.destroy
        head :no_content
      end

      private

      def set_review
        @review = Review.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "レビューが見つかりません" }, status: :not_found
      end

      def authorize_review!
        render json: { error: "権限がありません" }, status: :forbidden unless @review.user == current_user
      end

      def review_params
        params.require(:review).permit(:book_title, :body, :rating, :status, :cover_image)
      end

      def review_json(review)
        {
          id: review.id,
          book_title: review.book_title,
          body: review.body,
          rating: review.rating,
          status: review.status,
          likes_count: review.likes.size,
          liked: review.likes.any? { |l| l.user_id == current_user.id },
          cover_image_url: review.cover_image.attached? ? url_for(review.cover_image) : nil,
          created_at: review.created_at,
          updated_at: review.updated_at,
          user: {
            id: review.user.id,
            username: review.user.username
          }
        }
      end
    end
  end
end
