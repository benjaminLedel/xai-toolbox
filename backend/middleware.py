import rest_framework_simplejwt
from rest_framework_simplejwt import authentication


class JWTMiddleware():
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        try:
            request.user = authentication.JWTAuthentication().authenticate(request)[0]  # Manually authenticate the token
            print(request.user)
        except rest_framework_simplejwt.exceptions.InvalidToken:
            request.user = None
