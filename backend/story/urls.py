from django.urls import path
from .views import ActiveStoryListView, StoryCreateView, StoryDeleteView

urlpatterns = [
    path('', ActiveStoryListView.as_view(), name='active-stories'),
    path('create/', StoryCreateView.as_view(), name='create-story'),
    path('<int:pk>/delete/', StoryDeleteView.as_view(), name='delete-story'),
]
