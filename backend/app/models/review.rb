class Review < ApplicationRecord
  belongs_to :user
  has_many :likes, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_one_attached :cover_image

  enum :status, { reading: 0, finished: 1 }

  validates :book_title, presence: true, length: { maximum: 255 }
  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :status, presence: true
end
