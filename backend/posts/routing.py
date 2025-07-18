from django.urls import re_path
from .consumers import ArtPostConsumer, ChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/artposts/$', ArtPostConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<conversation_id>\w+)/$', ChatConsumer.as_asgi()),
]