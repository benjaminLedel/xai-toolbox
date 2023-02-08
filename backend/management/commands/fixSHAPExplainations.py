from django.core.management.base import BaseCommand
from backend.lib.SHAPEvaluation import NumpyEncoder
from backend.models import XAICache
import json
from tqdm import tqdm


class Command(BaseCommand):
    help = 'Modifies SHAP explainer values to be stored in regard to the class bug. This initially did not match LIME... the core problem is also fixed now.'

    def handle(self, *args, **options):
        for item in tqdm(XAICache.objects.filter(xai_algorithm='shap')):
            data: list[list[str, float]] = json.loads(item.viewData)
            for explaination in data:
                explaination[1] = explaination[1] * -1

            item.viewData = json.dumps(data, cls=NumpyEncoder)

            item.save()
