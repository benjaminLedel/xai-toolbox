import json
import random
import numpy as np
import torch

import transformers
import shap

from backend.lib.IssueRepository import IssueRepository
from backend.models import XAICache, Issue


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

    class_names = ['bug', 'no bug']
    class_names2 = ['no bug', 'bug']

    def calculate_shap(self, grouping_threshold=0.01, separator=''):
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

        count = Issue.objects.count()
        index = 0
        for issue in Issue.objects.all():
            index = index + 1
            if XAICache.objects.filter(issue_id=issue.id,xai_algorithm="shap").exists():
                continue
            print("(" + str(index) + "/" + str(count) + ")")
            explainer = shap.Explainer(pipe)
            text = issue.title + " " + issue.description
            shap_values = explainer([text])[0]
            values, clustering = self.unpack_shap_explanation_contents(shap_values[:, 0])
            tokens, values, group_sizes = self.process_shap_values(shap_values[:, 0].data, values, grouping_threshold,
                                                                   separator, clustering)
            result_array = []
            for i, token in enumerate(tokens):
                result_array.append([token, values[i]])

            cache = XAICache.objects.create(issue_id=issue.id,
                                            project=issue.project,
                                            xai_algorithm="shap",
                                            algorithm="seBERT",
                                            viewData=json.dumps(result_array,
                                                                cls=NumpyEncoder))
            cache.save()

    def unpack_shap_explanation_contents(self, shap_values):
        values = getattr(shap_values, "hierarchical_values", None)
        if values is None:
            values = shap_values.values
        clustering = getattr(shap_values, "clustering", None)

        return np.array(values), clustering

    def process_shap_values(self, tokens, values, grouping_threshold, separator, clustering=None,
                            return_meta_data=False):

        # See if we got hierarchical input data. If we did then we need to reprocess the
        # shap_values and tokens to get the groups we want to display
        M = len(tokens)
        if len(values) != M:

            # make sure we were given a partition tree
            if clustering is None:
                raise ValueError("The length of the attribution values must match the number of " + \
                                 "tokens if shap_values.clustering is None! When passing hierarchical " + \
                                 "attributions the clustering is also required.")

            # compute the groups, lower_values, and max_values
            groups = [[i] for i in range(M)]
            lower_values = np.zeros(len(values))
            lower_values[:M] = values[:M]
            max_values = np.zeros(len(values))
            max_values[:M] = np.abs(values[:M])
            for i in range(clustering.shape[0]):
                li = int(clustering[i, 0])
                ri = int(clustering[i, 1])
                groups.append(groups[li] + groups[ri])
                lower_values[M + i] = lower_values[li] + lower_values[ri] + values[M + i]
                max_values[i + M] = max(abs(values[M + i]) / len(groups[M + i]), max_values[li], max_values[ri])

            # compute the upper_values
            upper_values = np.zeros(len(values))

            def lower_credit(upper_values, clustering, i, value=0):
                if i < M:
                    upper_values[i] = value
                    return
                li = int(clustering[i - M, 0])
                ri = int(clustering[i - M, 1])
                upper_values[i] = value
                value += values[i]
                #             lower_credit(upper_values, clustering, li, value * len(groups[li]) / (len(groups[li]) + len(groups[ri])))
                #             lower_credit(upper_values, clustering, ri, value * len(groups[ri]) / (len(groups[li]) + len(groups[ri])))
                lower_credit(upper_values, clustering, li, value * 0.5)
                lower_credit(upper_values, clustering, ri, value * 0.5)

            lower_credit(upper_values, clustering, len(values) - 1)

            # the group_values comes from the dividends above them and below them
            group_values = lower_values + upper_values

            # merge all the tokens in groups dominated by interaction effects (since we don't want to hide those)
            new_tokens = []
            new_values = []
            group_sizes = []

            # meta data
            token_id_to_node_id_mapping = np.zeros((M,))
            collapsed_node_ids = []

            def merge_tokens(new_tokens, new_values, group_sizes, i):

                # return at the leaves
                if i < M and i >= 0:
                    new_tokens.append(tokens[i])
                    new_values.append(group_values[i])
                    group_sizes.append(1)

                    # meta data
                    collapsed_node_ids.append(i)
                    token_id_to_node_id_mapping[i] = i

                else:

                    # compute the dividend at internal nodes
                    li = int(clustering[i - M, 0])
                    ri = int(clustering[i - M, 1])
                    dv = abs(values[i]) / len(groups[i])

                    # if the interaction level is too high then just treat this whole group as one token
                    if max(max_values[li], max_values[ri]) < dv * grouping_threshold:
                        new_tokens.append(separator.join([tokens[g] for g in groups[li]]) + separator + separator.join(
                            [tokens[g] for g in groups[ri]]))
                        new_values.append(group_values[i])
                        group_sizes.append(len(groups[i]))

                        # setting collapsed node ids and token id to current node id mapping metadata

                        collapsed_node_ids.append(i)
                        for g in groups[li]:
                            token_id_to_node_id_mapping[g] = i

                        for g in groups[ri]:
                            token_id_to_node_id_mapping[g] = i

                    # if interaction level is not too high we recurse
                    else:
                        merge_tokens(new_tokens, new_values, group_sizes, li)
                        merge_tokens(new_tokens, new_values, group_sizes, ri)

            merge_tokens(new_tokens, new_values, group_sizes, len(group_values) - 1)

            # replance the incoming parameters with the grouped versions
            tokens = np.array(new_tokens)
            values = np.array(new_values)
            group_sizes = np.array(group_sizes)

            # meta data
            token_id_to_node_id_mapping = np.array(token_id_to_node_id_mapping)
            collapsed_node_ids = np.array(collapsed_node_ids)

            M = len(tokens)
        else:
            group_sizes = np.ones(M)
            token_id_to_node_id_mapping = np.arange(M)
            collapsed_node_ids = np.arange(M)

        if return_meta_data:
            return tokens, values, group_sizes, token_id_to_node_id_mapping, collapsed_node_ids
        else:
            return tokens, values, group_sizes

    def get_example_shap(self):
        random_object = XAICache.objects.order_by('?')[0]
        issue = Issue.objects.filter(id=random_object.issue_id).first()
        return json.loads(random_object.viewData), issue.title + " " + issue.description, self.class_names

    def get_shap(self, issue):
        random_object = XAICache.objects.filter(issue_id=issue.id, xai_algorithm="shap").first()
        if random_object is None:
            return None
        return json.loads(random_object.viewData), issue.title + " " + issue.description, self.class_names


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)
