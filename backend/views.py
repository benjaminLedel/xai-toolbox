import json

from django.http import HttpResponse
from django.http import JsonResponse
from django.core.serializers import serialize

from backend.lib.IssueRepository import IssueRepository
from backend.lib.LIMEEvaluation import LIMEEvaluation


def index(request):
    return HttpResponse("Hello, world. I´m the backend.")

def randomIssueWithoutLabeling(request):
    issueRepository = IssueRepository('data/test_data_all.p')
    issue = issueRepository.getRandomIssue().to_json(default_handler=str)
    return HttpResponse(issue, content_type="application/json")

def randomIssue(request):
    lime = LIMEEvaluation()
    result = lime.get_example_lime()

    jsonResult = {
        "lime" : result[0].as_list(),
        "sample" : json.loads(result[1].to_json(default_handler=str))
    }
    return HttpResponse(json.dumps(jsonResult), content_type="application/json")