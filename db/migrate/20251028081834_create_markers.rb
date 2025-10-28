class CreateMarkers < ActiveRecord::Migration[8.0]
  def change
    create_table :markers do |t|
      t.float :lat
      t.float :lng
      t.string :name
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
