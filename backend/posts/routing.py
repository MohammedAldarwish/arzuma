from django.urls import re_path
from .consumers import ArtPostConsumer

websocket_urlpatterns = [
    re_path(r'ws/artposts/$', ArtPostConsumer.as_asgi()),
]