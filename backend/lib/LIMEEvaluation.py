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
from backend.models import XAICache


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

    def get_example_lime(self, bug_type):

        issueRepo = IssueRepository('data/train_data_all.p')
        train_data = issueRepo.getData()

        testIssueRepo = IssueRepository('data/test_data_all.p')
        test_data = testIssueRepo.getData()

        approach = Herbold2020_FastText_Modified()
        completed_projects = []

        if hasattr(approach, 'clf'):
            approach_name = '%s_%s' % (approach.__class__.__name__, approach.clf.__class__.__name__)
        else:
            approach_name = '%s' % approach.__class__.__name__

        for project in set(self.train_projects) - set(completed_projects):
            training_dfs = pd.concat([dataframe for project_name, dataframe in train_data.items()
                                      if project_name != project]).reset_index(drop=True)
            test_df = train_data[project]

            start_time = time.time()
            print("(%s) Using approach %s and leave project %s out..." %
                  (datetime.datetime.now(), approach_name, project))

            da = approach.filter(training_dfs)
            approach.fit(da, training_dfs.classification)

            predictions = approach.predict(approach.filter(test_df))
            print("Needed %s seconds..." % (time.time() - start_time))

        project = random.choice(self.test_projects)
        sample = test_data[project].sample()

        if bug_type == "bug":
            sample = test_data[project][test_data[project]["classification"] == 1].sample()
        if bug_type == "no_bug":
            sample = test_data[project][test_data[project]["classification"] == 0].sample()

        sampleFiltered = approach.filter(sample.copy())
        description = sampleFiltered.iloc[0,0]

        explainer = LimeTextExplainer(class_names=self.class_names)

        exp = explainer.explain_instance(description, approach.predict_proba_plain, num_features=10)
        return exp, sample


    def calculate_lime(self):
        testIssueRepo = IssueRepository('data/test_data_all.p')
        test_data = testIssueRepo.getData()

        seed = 42

        random.seed(seed)
        np.random.seed(seed)
        torch.manual_seed(seed)
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        transformers.set_seed(seed)

        MODEL_PATH = 'backend/models/seBERT/'

        model = transformers.BertForSequenceClassification.from_pretrained(MODEL_PATH, num_labels=3)
        tokenizer = transformers.BertTokenizer.from_pretrained(MODEL_PATH, truncation=True, max_length=128,
                                                               paddding=True)

        # load a transformers pipeline model
        pipe = transformers.pipeline('sentiment-analysis',
                                     return_all_scores=True, model=model, tokenizer=tokenizer)

        for project in self.test_projects:
            print("Project " + project)
            for index, issue in test_data[project].iterrows():
                print("(" + str(index) + "/" + str(test_data[project].size) + ")")
                explainer = LimeTextExplainer(class_names=self.class_names)
                exp = explainer.explain_instance(issue["title"] + " " + issue["description"], pipe, num_features=10)

                cache = XAICache.objects.create(issue_id=index,
                                                project=project,
                                                xai_algorithm="lime",
                                                algorithm="seBERT",
                                                viewData=json.dumps(exp,
                                                                    cls=NumpyEncoder))
                cache.save()
                print(exp)