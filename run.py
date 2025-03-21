import os

from wxcloudrun import create_app

# 创建应用实例
app = create_app()

# 启动Flask Web服务
if __name__ == '__main__':
    # app.run(host=sys.argv[1], port=sys.argv[2])
    app.run(host='127.0.0.1', port=8090)