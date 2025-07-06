import os
import django
import logging

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()  # هنا تهيئة Django لازم تكون قبل أي استيراد من مشاريعك

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from posts.routing import websocket_urlpatterns

logger = logging.getLogger(__name__)

django_asgi_app = get_asgi_application()

logger.info("Setting up ASGI application")
logger.info(f"WebSocket patterns: {websocket_urlpatterns}")

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': URLRouter(
        websocket_urlpatterns
    ),
})

logger.info("ASGI application configured successfully")
