import copy
from django.db import models, transaction


class Issue(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()


class XAICache(models.Model):
    issue_id = models.CharField(max_length=255)
    project = models.CharField(max_length=255)
    algorithm = models.CharField(max_length=255)
    xai_algorithm = models.CharField(max_length=255)
    viewData = models.JSONField()
