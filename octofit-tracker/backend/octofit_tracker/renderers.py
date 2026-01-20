import json
from bson import ObjectId
from rest_framework.renderers import JSONRenderer


class ObjectIdJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)


class ObjectIdJSONRenderer(JSONRenderer):
    encoder_class = ObjectIdJSONEncoder
