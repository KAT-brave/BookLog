class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  has_many :reviews, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :follow_relationships, class_name: "Follow", foreign_key: :follower_id, dependent: :destroy
  has_many :following, through: :follow_relationships, source: :following
  has_many :follower_relationships, class_name: "Follow", foreign_key: :following_id, dependent: :destroy
  has_many :followers, through: :follower_relationships, source: :follower

  validates :username, presence: true, uniqueness: true, length: { maximum: 50 }
end
