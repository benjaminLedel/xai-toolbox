from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Precalculates the data for shap, lime and all other xai tools'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Successfully closed pol'))
