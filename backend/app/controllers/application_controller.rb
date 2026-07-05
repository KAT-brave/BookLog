class ApplicationController < ActionController::API
  include Rails.application.routes.url_helpers
  before_action :set_skip_session_storage

  private

  def set_skip_session_storage
    request.env["devise.skip_storage"] = true
  end
end
