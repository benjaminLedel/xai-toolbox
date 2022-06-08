import copy
from django.db import models, transaction


class XAICache(models.Model):
    issue_id = models.CharField(max_length=255)
    project = models.CharField(max_length=255)
    algorithm = models.CharField(max_length=255)
    xai_algorithm = models.CharField(max_length=255)
    viewData = models.JSONField()


class Issue(models.Model):
    issue_id = models.CharField(max_length=255, null=True)
    project = models.CharField(max_length=255, null=True)
    dataset = models.CharField(max_length=255, default="test")
    title = models.TextField()
    description = models.TextField()
