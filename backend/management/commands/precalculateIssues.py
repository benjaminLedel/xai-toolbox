from django.core.management.base import BaseCommand, CommandError

from backend.lib.IssueRepository import IssueRepository
from backend.lib.LIMEEvaluation import LIMEEvaluation
from backend.lib.SHAPEvaluation import SHAPEvaluation
from backend.models import XAICache, Issue


class Command(BaseCommand):
    help = 'Precalculates the data for shap, lime and all other xai tools'

    def handle(self, *args, **options):
        Issue.objects.all().delete()

        testIssueRepo = IssueRepository('data/test_data_all.p')
        testIssueRepo.transferData("test")

        self.stdout.write(self.style.SUCCESS('Successfully calculated'))
