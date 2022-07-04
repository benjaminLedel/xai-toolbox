import json
import random

from django.http import HttpResponse
from django.http import JsonResponse
from django.core.serializers import serialize
from django.utils.decorators import decorator_from_middleware
from django.views.decorators.csrf import csrf_exempt

from backend.lib.IssueRepository import IssueRepository
from backend.lib.LIMEEvaluation import LIMEEvaluation
from backend.lib.SHAPEvaluation import SHAPEvaluation

from rest_framework_simplejwt import authentication

from backend.middleware import JWTMiddleware
from backend.models import XAICache, Issue, Rating


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
    issue_id = random_object.issue_id
    random_object = Issue.objects.filter(id=issue_id).first()
    lime = LIMEEvaluation()
    result_lime = lime.get_lime(random_object)
    shap = SHAPEvaluation()
    result_shap = shap.get_shap(random_object)

    leftIsLime = random.choice([True, False])

    if leftIsLime:
        left = "lime"
        right = "shap"
        result1 = result_lime
        result2 = result_shap
    else:
        left = "shap"
        right = "lime"
        result1 = result_lime
        result2 = result_shap

    if result1 is None or result2 is None:
        jsonResult = {
            "error": True,
        }
        return HttpResponse(json.dumps(jsonResult), content_type="application/json")

    jsonResult = {
        "error": False,
        "left": left,
        "right": right,
        "issue_id": issue_id,
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

@decorator_from_middleware(JWTMiddleware)
@csrf_exempt
def create_rating(request):
    current_user = request.user
    if not current_user:
        return HttpResponse(json.dumps({}))

    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)
    issue = body["issue"]
    rating = body["rating"]

    rating1 = Rating.objects.create(issue_id=issue,
                                    user=current_user,
                                    algorithm="shap",
                                    rating1=rating["related-shap"],
                                    rating2=rating["unambigiuous-shap"],
                                    rating3=rating["contextual-shap"],
                                    rating4=rating["insightful-shap"],
                                    order=0 )

    rating2 = Rating.objects.create(issue_id=issue,
                                    user=current_user,
                                    algorithm="lime",
                                    rating1=rating["related-lime"],
                                    rating2=rating["unambigiuous-lime"],
                                    rating3=rating["contextual-lime"],
                                    rating4=rating["insightful-lime"],
                                    order=0 )

    jsonResult = {
        "status": "Created rating"
    }
    return HttpResponse(json.dumps(jsonResult), content_type="application/json")