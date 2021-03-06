import datetime
import os
import pickle
import random
import time

import pandas as pd
from django.conf import settings
from lime.lime_text import LimeTextExplainer
import json
import random
import numpy as np
import torch

import transformers
from transformers import InputExample

from backend.icb.approaches.herbold_modified import Herbold2020_FastText_Modified
from backend.lib.IssueRepository import IssueRepository
from backend.lib.SHAPEvaluation import NumpyEncoder
from backend.models import XAICache, Issue


class LIMEEvaluation:
    train_projects = [
        'commons-configuration'
    ]

    test_projects = [
        'lucene-solr',
        'jackrabbit',
        'httpcomponents-client',
        'tomcat',
        'rhino',
    ]

    class_names = ['no bug', 'bug']

    def get_example_lime(self):
        random_object = XAICache.objects.order_by('?')[0]
        issue = Issue.objects.filter(id=random_object.issue_id).first()
        return json.loads(random_object.viewData), issue.title + " " + issue.description, self.class_names

    def get_lime(self, issue):
        random_object = XAICache.objects.filter(issue_id=issue.id,xai_algorithm="lime").first()
        if random_object is None:
            return None
        return json.loads(random_object.viewData), issue.title + " " + issue.description, self.class_names

    def calculate_lime(self):
        seed = 42

        random.seed(seed)
        np.random.seed(seed)
        torch.manual_seed(seed)
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        transformers.set_seed(seed)

        MODEL_PATH = 'backend/models/seBERT/'

        model = transformers.BertForSequenceClassification.from_pretrained(MODEL_PATH, num_labels=2)
        tokenizer = transformers.BertTokenizer.from_pretrained(MODEL_PATH, truncation=True, max_length=128,
                                                               paddding=True)

        # load a transformers pipeline model
        pipe = transformers.pipeline('sentiment-analysis',
                                     return_all_scores=True, model=model, tokenizer=tokenizer, truncation=True,
                                     max_length=128)

        def pred(x):
            output = pipe(x)
            outputFinal = []
            for d in output:
                outputFinal.append([d[0]["score"], d[1]["score"]])
            return np.array(outputFinal)

        count = Issue.objects.count()
        index = 0
        for issue in Issue.objects.all():
            index = index + 1
            if XAICache.objects.filter(issue_id=issue.id,xai_algorithm="lime").exists():
                continue
            print("(" + str(index) + "/" + str(count) + ")")
            explainer = LimeTextExplainer(class_names=self.class_names)
            text = issue.title + " " + issue.description
            exp = explainer.explain_instance(" ".join(text.split()[:400]), pred, num_features=10,
                                             num_samples=400)

            cache = XAICache.objects.create(issue_id=issue.id,
                                            project=issue.project,
                                            xai_algorithm="lime",
                                            algorithm="seBERT",
                                            viewData=json.dumps(exp.as_list(),
                                                                cls=NumpyEncoder))
            cache.save()
