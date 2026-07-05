Rails.application.routes.draw do
  devise_for :users,
             path: "",
             path_names: {
               sign_in: "api/v1/auth/login",
               sign_out: "api/v1/auth/logout",
               registration: "api/v1/auth/signup"
             },
             controllers: {
               sessions: "api/v1/auth/sessions",
               registrations: "api/v1/auth/registrations"
             }

  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"
      resources :reviews, only: [ :index, :show, :create, :update, :destroy ] do
        resource :like, only: [ :create, :destroy ], controller: "likes"
        resources :comments, only: [ :index, :create, :destroy ], controller: "comments"
      end
      get "users/me",        to: "users#me"
      patch "users/me",       to: "users#update_me"
      get  "users/:id",       to: "users#show",    as: :user
      post "users/:id/follow",   to: "users#follow",   as: :follow_user
      delete "users/:id/follow", to: "users#unfollow", as: :unfollow_user
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
