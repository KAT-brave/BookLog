Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(
      Rails.env.production? ? ENV.fetch("FRONTEND_ORIGIN") : /\Ahttp:\/\/localhost(:\d+)?\z/
    )

    resource "*",
             headers: :any,
             methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
             expose: [ "Authorization" ],
             credentials: false
  end
end
