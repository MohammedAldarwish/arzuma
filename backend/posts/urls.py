from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtViewSet, CommentViewSet, LikeViewSet

router = DefaultRouter()
router.register('art', ArtViewSet, basename='art')
router.register('comment', CommentViewSet, basename='comment')
router.register('like', LikeViewSet, basename='like')

urlpatterns = router.urls