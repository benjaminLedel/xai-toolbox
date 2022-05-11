import json
import random
import numpy as np
import torch

import transformers
import shap

from backend.lib.IssueRepository import IssueRepository
from backend.models import XAICache


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

    def calculate_shap(self):

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
                explainer = shap.Explainer(pipe)
                shap_values = explainer([issue["title"] + " " + issue["description"]])
                cache = XAICache.objects.create(issue_id=index,
                                                project=project,
                                                xai_algorithm="shap",
                                                algorithm="seBERT",
                                                viewData=json.dumps(shap_values[0, :, 'LABEL_0'].values,
                                                                    cls=NumpyEncoder))
                cache.save()
                print(shap_values)


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)
