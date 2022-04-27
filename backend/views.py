import json

from django.http import HttpResponse
from django.http import JsonResponse
from django.core.serializers import serialize

from backend.lib.IssueRepository import IssueRepository
from backend.lib.LIMEEvaluation import LIMEEvaluation
from backend.lib.SHAPEvaluation import SHAPEvaluation


def index(request):
    return HttpResponse("Hello, world. I´m the backend.")


def me(request):
    current_user = request.user
    print(current_user.id)
    return HttpResponse("test")

def randomIssueWithoutLabeling(request):
    issueRepository = IssueRepository('data/test_data_all.p')
    issue = issueRepository.getRandomIssue().to_json(default_handler=str)
    return HttpResponse(issue, content_type="application/json")

def randomIssueLIME(request):
    lime = LIMEEvaluation()
    result = lime.get_example_lime(
    request.GET.get("bug_type",""))

    jsonResult = {
        "class_names" : result[0].class_names,
        "lime" : result[0].as_list(),
        "predict_proba" : result[0].predict_proba.astype(float).tolist(),
        "sample" : json.loads(result[1].iloc[0].to_json(default_handler=str))
    }
    return HttpResponse(json.dumps(jsonResult), content_type="application/json")

def randomIssueSHAP(request):
    lime = SHAPEvaluation()
    result = lime.get_example_shap(
    request.GET.get("bug_type",""))

    jsonResult = {
        "lime" : result,
        "sample" : json.loads(result[1].iloc[0].to_json(default_handler=str))
    }
    return HttpResponse(json.dumps(jsonResult), content_type="application/json")
