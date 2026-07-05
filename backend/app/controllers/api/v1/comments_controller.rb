module Api
  module V1
    class CommentsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_review
      before_action :set_comment, only: [ :destroy ]
      before_action :authorize_comment!, only: [ :destroy ]

      def index
        comments = @review.comments.includes(:user).order(created_at: :asc)
        render json: comments.map { |c| comment_json(c) }
      end

      def create
        comment = @review.comments.build(body: params.dig(:comment, :body), user: current_user)
        if comment.save
          render json: comment_json(comment), status: :created
        else
          render json: { errors: comment.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        @comment.destroy
        head :no_content
      end

      private

      def set_review
        @review = Review.find(params[:review_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "レビューが見つかりません" }, status: :not_found
      end

      def set_comment
        @comment = @review.comments.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "コメントが見つかりません" }, status: :not_found
      end

      def authorize_comment!
        render json: { error: "権限がありません" }, status: :forbidden unless @comment.user == current_user
      end

      def comment_json(comment)
        {
          id: comment.id,
          body: comment.body,
          created_at: comment.created_at,
          user: { id: comment.user.id, username: comment.user.username }
        }
      end
    end
  end
end
