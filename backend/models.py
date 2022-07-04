import copy
from django.db import models, transaction
from django.conf import settings


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


class Rating(models.Model):
    issue_id = models.CharField(max_length=255)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    algorithm = models.CharField(max_length=255)
    rating1 = models.IntegerField()
    rating2 = models.IntegerField()
    rating3 = models.IntegerField()
    rating4 = models.IntegerField()
    order = models.IntegerField()  # number of elements seen before
