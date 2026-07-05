FactoryBot.define do
  factory :comment do
    association :user
    association :review
    body { "とても参考になりました。" }
  end
end
