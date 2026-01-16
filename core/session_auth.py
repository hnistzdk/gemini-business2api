"""
认证模块
支持 Session 认证（同源部署）和 Token 认证（跨域部署）
"""
import secrets
import time
import hashlib
from functools import wraps
from typing import Optional
from fastapi import HTTPException, Request, Response
from fastapi.responses import RedirectResponse

# Token 存储（简单实现，生产环境可用 Redis）
_active_tokens: dict[str, float] = {}  # token -> expire_time
TOKEN_EXPIRE_HOURS = 24


def generate_session_secret() -> str:
    """生成随机的session密钥"""
    return secrets.token_hex(32)


def generate_token() -> str:
    """生成认证 Token"""
    return secrets.token_hex(32)


def create_auth_token(expire_hours: int = TOKEN_EXPIRE_HOURS) -> str:
    """创建并存储认证 Token"""
    token = generate_token()
    expire_time = time.time() + expire_hours * 3600
    _active_tokens[token] = expire_time
    # 清理过期 token
    _cleanup_expired_tokens()
    return token


def verify_token(token: str) -> bool:
    """验证 Token 是否有效"""
    if not token:
        return False
    expire_time = _active_tokens.get(token)
    if not expire_time:
        return False
    if time.time() > expire_time:
        _active_tokens.pop(token, None)
        return False
    return True


def revoke_token(token: str):
    """撤销 Token"""
    _active_tokens.pop(token, None)


def _cleanup_expired_tokens():
    """清理过期的 Token"""
    now = time.time()
    expired = [t for t, exp in _active_tokens.items() if now > exp]
    for t in expired:
        _active_tokens.pop(t, None)


def get_token_from_request(request: Request) -> Optional[str]:
    """从请求中提取 Token（支持 Header 和 Query）"""
    # 优先从 Authorization header 获取
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]
    # 其次从 query 参数获取
    return request.query_params.get("token")


def is_logged_in(request: Request) -> bool:
    """检查用户是否已登录（支持 Session 和 Token）"""
    # 先检查 Token
    token = get_token_from_request(request)
    if token and verify_token(token):
        return True
    # 再检查 Session
    return request.session.get("authenticated", False)


def login_user(request: Request):
    """标记用户为已登录状态"""
    request.session["authenticated"] = True


def logout_user(request: Request):
    """清除用户登录状态"""
    # 清除 Session
    request.session.clear()
    # 清除 Token（如果有）
    token = get_token_from_request(request)
    if token:
        revoke_token(token)


def require_login(redirect_to_login: bool = True):
    """
    要求用户登录的装饰器

    Args:
        redirect_to_login: 未登录时是否重定向到登录页面（默认True）
                          False时返回404错误
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, request: Request, **kwargs):
            if not is_logged_in(request):
                if redirect_to_login:
                    accept_header = (request.headers.get("accept") or "").lower()
                    wants_html = "text/html" in accept_header or request.url.path.endswith("/html")

                    if wants_html:
                        # 清理掉 URL 中可能重复的 PATH_PREFIX
                        # 避免重定向路径出现多层前缀
                        path = request.url.path

                        # 兼容 main 中 PATH_PREFIX 为空的情况
                        import main
                        prefix = main.PATH_PREFIX

                        if prefix:
                            login_url = f"/{prefix}/login"
                        else:
                            login_url = "/login"

                        return RedirectResponse(url=login_url, status_code=302)

                raise HTTPException(401, "Unauthorized")

            return await func(*args, request=request, **kwargs)
        return wrapper
    return decorator
