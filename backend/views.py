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
from backend.models import XAICache, Issue


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

def randomIssueWithoutLabelingSet(request):
    random_object = XAICache.objects.first()
    #random_object = Issue.objects.order_by('?')[0]
    random_object = Issue.objects.filter(id=random_object.issue_id).first()
    lime = LIMEEvaluation()
    result1 = lime.get_lime(random_object)
    shap = SHAPEvaluation()
    result2 = shap.get_shap(random_object)

    if result1 is None or result2 is None:
        jsonResult = {
            "error": True,
        }
        return HttpResponse(json.dumps(jsonResult), content_type="application/json")

    jsonResult = {
        "error": False,
        "issue1" : {
            "class_names": result1[2],
            "xai_toolkit_response": result1[0],
            "predict_proba": [0, 2],
            "sample": result1[1],
            "clueMode": False,
        },
        "issue2": {
            "class_names": result2[2],
            "xai_toolkit_response": result2[0],
            "predict_proba": [0, 2],
            "sample": result2[1],
            "clueMode": True
        }
    }
    return HttpResponse(json.dumps(jsonResult), content_type="application/json")