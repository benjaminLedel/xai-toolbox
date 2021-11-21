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

        sample = approach.filter(test_data[random.choice(self.test_projects)]).sample()
        description = sample.iloc[0,0]

        explainer = LimeTextExplainer(class_names=self.class_names)

        exp = explainer.explain_instance(description, approach.predict_proba_plain, num_features=10)
        return exp, sample
