class MarkersController < ApplicationController
  before_action :authorize_web
  authorize_resource 

  def index
    markers = current_user ? current_user.markers : []
    render json: markers
  end

  def create
    if current_user
      marker = current_user.markers.create(marker_params)
      render json: marker
    else
      render json: { error: "Not logged in" }, status: :unauthorized
    end
  end

  def destroy
    marker = current_user.markers.find_by(id: params[:id])
    if marker
      marker.destroy
      head :no_content
    else
      render json: { error: "Marker not found" }, status: :not_found
    end
  end

  private
    def marker_params
      params.require(:marker).permit(:lat, :lng, :name)
    end
end