from datetime import datetime
from flask import render_template, request
import requests
from run import app
from wxcloudrun.dao import delete_counterbyid, query_counterbyid, insert_counter, update_counterbyid
from wxcloudrun.model import Counters
from wxcloudrun.response import make_succ_empty_response, make_succ_response, make_err_response


@app.route('/')
def index():
    """
    :return: 返回index页面
    """
    return render_template('index.html')


@app.route('/students')
def students():
    """
    :return: 返回index页面
    """
    return render_template('students.html')

@app.route('/wx/info/gettoken', methods=['GET'])
def get_token():
    """
    :return: 获取 token
    """
    appid = request.args.get('appid')
    appsecret = request.args.get('appsecret')
    url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={}&secret={}".format(appid, appsecret)
    response = requests.get(url)
    return make_succ_response(response.json()) 

@app.route('/wx/info/getopenid', methods=['GET'])
def get_openid():
    """
    :return: 获取 openid
    """
    token = request.args.get('token')
    url = "https://api.weixin.qq.com/cgi-bin/user/get?access_token={}".format(token)
    response = requests.get(url)
    return make_succ_response(response.json()) 

@app.route('/wx/info/getuserinfo', methods=['GET'])
def get_userinfo():
    """
    :return: 获取用户信息
    """
    token = request.args.get('token')
    openid = request.args.get('openid') 
    url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token={}&openid={}&lang=zh_CN".format(token, openid)
    response = requests.get(url)
    return make_succ_response(response.json()) 

@app.route('/wx/act/sendmessage', methods=['POST'])
def send_message():
    """
    :return: 发送消息的结果
    """
    # 获取请求体参数
    params = request.get_json()
    
    # 检查必要参数
    if 'token' not in params:
        return make_err_response('缺少token参数')
    if 'touser' not in params:
        return make_err_response('缺少touser参数')
    if 'template_id' not in params:
        return make_err_response('缺少template_id参数')
    if 'data' not in params:
        return make_err_response('缺少data参数')
    
    # 构建推送消息的JSON对象
    message_data = {
        "touser": params['touser'],
        "template_id": params['template_id'],
        "data": params['data']
    }
    
    # 如果有跳转URL，添加到消息数据中
    if 'url' in params:
        message_data["url"] = params['url']
    
    print(message_data)

    # 发送消息请求
    url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={}".format(params['token'])
    response = requests.post(url, json=message_data)
    
    return make_succ_response(response.json())

@app.route('/api/count', methods=['POST'])
def count():
    """
    :return:计数结果/清除结果
    """

    # 获取请求体参数
    params = request.get_json()

    # 检查action参数
    if 'action' not in params:
        return make_err_response('缺少action参数')

    # 按照不同的action的值，进行不同的操作
    action = params['action']

    # 执行自增操作
    if action == 'inc':
        counter = query_counterbyid(1)
        if counter is None:
            counter = Counters()
            counter.id = 1
            counter.count = 1
            counter.created_at = datetime.now()
            counter.updated_at = datetime.now()
            insert_counter(counter)
        else:
            counter.id = 1
            counter.count += 1
            counter.updated_at = datetime.now()
            update_counterbyid(counter)
        return make_succ_response(counter.count)

    # 执行清0操作
    elif action == 'clear':
        delete_counterbyid(1)
        return make_succ_empty_response()

    # action参数错误
    else:
        return make_err_response('action参数错误')


@app.route('/api/count', methods=['GET'])
def get_count():
    """
    :return: 计数的值
    """
    counter = Counters.query.filter(Counters.id == 1).first()
    return make_succ_response(0) if counter is None else make_succ_response(counter.count)

