import json

from django.http import HttpResponse
from django.http import JsonResponse
from django.core.serializers import serialize
from django.utils.decorators import decorator_from_middleware

from backend.lib.IssueRepository import IssueRepository
from backend.lib.LIMEEvaluation import LIMEEvaluation
from backend.lib.SHAPEvaluation import SHAPEvaluation

from rest_framework_simplejwt import authentication

from backend.middleware import JWTMiddleware


def index(request):
    return HttpResponse("Hello, world. I´m the backend.")

@decorator_from_middleware(JWTMiddleware)
def me(request):
    current_user = request.user
    if not current_user:
        return HttpResponse(json.dumps({}))
    return HttpResponse(json.dumps({"email": current_user.email, "id": current_user.id}))

def randomIssueWithoutLabeling(request):
    issueRepository = IssueRepository('data/test_data_all.p')
    issue = issueRepository.getRandomIssue().to_json(default_handler=str)
    return HttpResponse(issue, content_type="application/json")

def randomIssueLIME(request):
    lime = LIMEEvaluation()
    result = lime.get_example_lime(
    request.GET.get("bug_type",""))

    jsonResult = {
        "class_names" : result[2],
        "xai_toolkit_response" : result[0],
        "predict_proba" : [0,2],
        "sample" : result[1]
    }
    return HttpResponse(json.dumps(jsonResult), content_type="application/json")

def randomIssueSHAP(request):
    shap = SHAPEvaluation()
    result = shap.get_example_shap(
    request.GET.get("bug_type",""))

    jsonResult = {
        "class_names": result[2],
        "xai_toolkit_response": result[0],
        "predict_proba": [0, 2],
        "sample": result[1]
    }
    return HttpResponse(json.dumps(jsonResult), content_type="application/json")
