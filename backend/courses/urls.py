from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, LessonViewSet, EnrollmentViewSet, CourseReviewViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    path('courses/<int:course_id>/reviews/', CourseReviewViewSet.as_view({'get': 'list', 'post': 'create'}), name='course-reviews'),
    path('courses/<int:course_id>/reviews/<int:pk>/', CourseReviewViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='course-review-detail'),
] 