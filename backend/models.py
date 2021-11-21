import copy
from django.db import models, transaction


class Issue(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
