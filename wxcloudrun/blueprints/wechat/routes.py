from flask import Blueprint, request
from flask_login import login_required
import requests
from wxcloudrun.response import make_succ_response, make_err_response

# 创建蓝图
wechat_bp = Blueprint('wechat', __name__)

@wechat_bp.route('/wx/info/gettoken', methods=['GET'])
@login_required
def api_get_wechat_token():
    """
    获取微信接口调用凭证
    """
    try:
        appid = request.args.get('appid')
        secret = request.args.get('secret')
        
        if not appid or not secret:
            return make_err_response('缺少appid或secret参数')
        
        # 调用微信API
        response = requests.get(
            f'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={appid}&secret={secret}'
        )
        data = response.json()
        
        return make_succ_response(data)
    except Exception as e:
        return make_err_response(str(e))

@wechat_bp.route('/wx/info/getopenid', methods=['GET'])
@login_required
def api_get_openid():
    """
    获取用户的OpenID
    """
    try:
        js_code = request.args.get('js_code')
        appid = request.args.get('appid')
        secret = request.args.get('secret')
        
        if not js_code or not appid or not secret:
            return make_err_response('缺少必要参数')
        
        # 调用微信API
        response = requests.get(
            f'https://api.weixin.qq.com/sns/jscode2session?appid={appid}&secret={secret}&js_code={js_code}&grant_type=authorization_code'
        )
        data = response.json()
        
        return make_succ_response(data)
    except Exception as e:
        return make_err_response(str(e))

@wechat_bp.route('/wx/info/getuserinfo', methods=['GET'])
@login_required
def api_get_user_info():
    """
    获取用户信息
    """
    try:
        access_token = request.args.get('access_token')
        openid = request.args.get('openid')
        
        if not access_token or not openid:
            return make_err_response('缺少必要参数')
        
        # 调用微信API
        response = requests.get(
            f'https://api.weixin.qq.com/sns/userinfo?access_token={access_token}&openid={openid}&lang=zh_CN'
        )
        data = response.json()
        
        return make_succ_response(data)
    except Exception as e:
        return make_err_response(str(e))

@wechat_bp.route('/wx/act/sendmessage', methods=['POST'])
@login_required
def api_send_message():
    """
    发送模板消息
    """
    try:
        # 获取请求数据
        request_data = request.get_json()
        
        # 验证必填字段
        access_token = request_data.get('access_token')
        if not access_token:
            return make_err_response('缺少access_token参数')
        
        # 转发请求到微信API
        response = requests.post(
            f'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={access_token}',
            json={
                'touser': request_data.get('touser'),
                'template_id': request_data.get('template_id'),
                'url': request_data.get('url'),
                'miniprogram': request_data.get('miniprogram'),
                'data': request_data.get('data')
            }
        )
        
        data = response.json()
        
        # 检查微信API响应
        if data.get('errcode') != 0:
            return make_err_response(f"微信API错误: {data.get('errmsg')}")
        
        return make_succ_response(data)
    except Exception as e:
        return make_err_response(str(e)) 