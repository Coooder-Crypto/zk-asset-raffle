from app import create_app
from cors_middleware import setup_cors

app = create_app()

# 使用自定义CORS中间件
setup_cors(app)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
