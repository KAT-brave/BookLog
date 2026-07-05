FactoryBot.define do
  factory :review do
    association :user
    sequence(:book_title) { |n| "テスト書籍#{n}" }
    body { "とても良い本でした。" }
    rating { 4 }
    status { :finished }
  end
end
