import datetime
import os
import pickle
import random
import time

import pandas as pd
from django.conf import settings
from lime.lime_text import LimeTextExplainer

from backend.icb.approaches.herbold_modified import Herbold2020_FastText_Modified
from backend.lib.IssueRepository import IssueRepository

import sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
import numpy as np
import shap




class SHAPEvaluation:

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

    def get_example_shap(self, bug_type):

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

        SHAP_explainer = shap.KernelExplainer(approach.predict_proba_plain, da)

        shap_vals = SHAP_explainer.shap_values(sampleFiltered)

        return shap_vals, sample
