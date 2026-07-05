class CreateReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :reviews do |t|
      t.references :user, null: false, foreign_key: true
      t.string :book_title, null: false
      t.text :body
      t.integer :rating, null: false
      t.integer :status, null: false, default: 0

      t.timestamps
    end
  end
end
