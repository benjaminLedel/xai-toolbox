from django.contrib.auth.middleware import get_user
from django.utils.functional import SimpleLazyObject
from rest_framework_jwt.authentication import JSONWebTokenAuthentication


class JWTAuthenticationInMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.user = SimpleLazyObject(lambda:self.__class__.get_jwt_user(request))
        return self.get_response(request)

    @staticmethod
    def get_jwt_user(request):
        # Already authenticated
        user = get_user(request)
        if user.is_authenticated:
            return user

        # Do JTW authentication
        jwt_authentication = JSONWebTokenAuthentication()

        authenticated = jwt_authentication.authenticate(request)
        if authenticated:
            user, jwt = authenticated

        return user