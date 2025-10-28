# == Schema Information
#
# Table name: markers
#
#  id         :bigint           not null, primary key
#  lat        :float
#  lng        :float
#  name       :string
#  user_id    :bigint           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_markers_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Marker < ApplicationRecord
  belongs_to :user

  validates :lat, :lng, presence: true
  validates :name, presence: true, length: { maximum: 255 }
end
