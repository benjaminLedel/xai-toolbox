import os
import pickle
from django.conf import settings
import random
from backend.models import Issue


class IssueRepository:
    test_projects = [
        'lucene-solr',
        'jackrabbit',
        'httpcomponents-client',
        'tomcat',
        'rhino',
    ]

    def __init__(self, path):
        if os.path.exists(os.path.join(settings.BASE_DIR, path)):
            self.data = pickle.load(open(os.path.join(settings.BASE_DIR, path), "rb"))
        else:
            raise Exception("file not found")

    def getRandomIssue(self):
        return self.data[random.choice(list(self.data))].sample().iloc[0]

    def getData(self):
        return self.data

    def transferData(self, dataset="test"):
        test_data = self.getData()

        for project in self.test_projects:
            print("Project " + project)
            for index, issue in test_data[project].iterrows():
                issue = Issue.objects.create(issue_id=index,
                                             project=project,
                                             dataset=dataset,
                                             title=issue["title"],
                                             description=issue["description"])
                issue.save()
