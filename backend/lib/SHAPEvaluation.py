import random
import numpy as np
import torch

import transformers
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
        seed = 42

        random.seed(seed)
        np.random.seed(seed)
        torch.manual_seed(seed)
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        transformers.set_seed(seed)

        MODEL_PATH = 'models/seBERT/'

        model = transformers.BertForSequenceClassification.from_pretrained(MODEL_PATH, num_labels=3)
        tokenizer = transformers.BertTokenizer.from_pretrained(MODEL_PATH, truncation=True, max_length=128, paddding=True)

        # load a transformers pipeline model
        pipe = transformers.pipeline('sentiment-analysis',
                                     return_all_scores=True, model=model, tokenizer=tokenizer)
        sample = "Does this library support for tagged union?"
        explainer = shap.Explainer(pipe)
        shap_values = explainer([sample])

        return shap_values, sample
