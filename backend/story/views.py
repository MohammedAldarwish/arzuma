from rest_framework import generics , permissions
from .models import Story
from .serializers import  StorySerializer
from django.utils import timezone
from django.db.models import Q

class ActiveStoryListView(generics.ListAPIView):
    serializer_class = StorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        time_limit = timezone.now() - timezone.timedelta(hours=24)
        return Story.objects.filter(created_at__gte=time_limit).order_by('-created_at')


class StoryCreateView(generics.CreateAPIView):
    serializer_class = StorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



class StoryDeleteView(generics.DestroyAPIView):
    queryset = Story.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # المستخدم يقدر يحذف ستوريه بس
        return super().get_queryset().filter(user=self.request.user)