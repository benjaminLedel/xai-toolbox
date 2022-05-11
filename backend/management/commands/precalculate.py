from django.core.management.base import BaseCommand, CommandError

from backend.lib.LIMEEvaluation import LIMEEvaluation
from backend.lib.SHAPEvaluation import SHAPEvaluation


class Command(BaseCommand):
    help = 'Precalculates the data for shap, lime and all other xai tools'

    def handle(self, *args, **options):

        lime = LIMEEvaluation()
        lime.calculate_lime()

        shap = SHAPEvaluation()
        shap.calculate_shap()

        self.stdout.write(self.style.SUCCESS('Successfully calculated'))
