from django.core.management.base import BaseCommand, CommandError
import pickle
from tqdm import tqdm
import pandas as pd

from backend.models import Issue


class Command(BaseCommand):
    help = 'Applies stratified sampling of issues from each project'

    def handle(self, *args, **options):
        dataset = 'smartshark_2_2'
        issues = pickle.load(open('data/train_data_all.p', 'rb'))

        samples = []
        for key in issues.keys():
            df = issues[key]
            sample_bugs = df[df.classification == 1].sample(n = len(df) / 2)
            sample_bugs['project'] = key
            samples.append(sample_bugs)
            sample_non_bugs = df[df.classification == 0].sample(n = len(df) / 2)
            sample_non_bugs['project'] = key
            samples.append(sample_non_bugs)

        samples_df = pd.concat(samples)

        for index, sample in tqdm(samples_df.iterrows()):
            issue = Issue.objects.create(issue_id=index,
                                             project=sample['project'],
                                             dataset=dataset,
                                             title=sample["title"],
                                             description=sample["description"])
            issue.save()
