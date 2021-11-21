import os
import pickle
from django.conf import settings
import random


class IssueRepository:

    def __init__(self, path):
        if os.path.exists(os.path.join(settings.BASE_DIR, path)):
            self.data = pickle.load(open(os.path.join(settings.BASE_DIR, path), "rb"))
        else:
          raise Exception("file not found")

    def getRandomIssue(self):
        return self.data[random.choice(list(self.data))].sample().iloc[0]

    def getData(self):
        return self.data
