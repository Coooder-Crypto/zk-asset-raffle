from flask import Flask

def add_cors_headers(response):
    """添加CORS头部到所有响应"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def handle_options_request(response):
    """处理OPTIONS预检请求"""
    if response.status_code == 200:
        return response
    return response

def setup_cors(app: Flask):
    """设置CORS中间件"""
    app.after_request(add_cors_headers)
    app.after_request(handle_options_request)
