from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Story
from .serializers import StorySerializer
from .video_processor import trim_video_to_60_seconds, is_video_file, should_trim_video, validate_video_file
from django.utils import timezone
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)

class ActiveStoryListView(generics.ListAPIView):
    serializer_class = StorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        time_limit = timezone.now() - timezone.timedelta(hours=24)
        stories = Story.objects.filter(created_at__gte=time_limit).order_by('-created_at')
        
        # Filter out stories with missing files
        valid_stories = []
        for story in stories:
            if story.file and story.file_exists():
                valid_stories.append(story)
            else:
                # Delete orphaned story entries
                story.delete()
        
        return Story.objects.filter(id__in=[s.id for s in valid_stories]).order_by('-created_at')


class StoryCreateView(generics.CreateAPIView):
    serializer_class = StorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        try:
            # Get the file from request
            file = self.request.FILES.get('media') or self.request.FILES.get('file')
            
            if not file:
                raise ValueError("No file provided")
            
            # Check if it's a video file
            if is_video_file(file):
                logger.info(f"Processing video file: {file.name}")
                
                # Validate video file first
                if not validate_video_file(file):
                    logger.error(f"Invalid video file: {file.name}")
                    raise ValueError("Invalid video file")
                
                # Check if video needs trimming
                if should_trim_video(file):
                    logger.info(f"Video {file.name} is longer than 60 seconds, trimming...")
                    
                    # Trim video to 60 seconds
                    trimmed_file = trim_video_to_60_seconds(file)
                    
                    # Validate trimmed file
                    if not validate_video_file(trimmed_file):
                        logger.error(f"Trimmed video file is invalid: {file.name}")
                        # Use original file if trimmed file is invalid
                        serializer.save(
                            user=self.request.user,
                            file=file,
                            media_type='video',
                            duration=60,
                            is_trimmed=False
                        )
                    else:
                        # Save with trimmed file
                        serializer.save(
                            user=self.request.user,
                            file=trimmed_file,
                            media_type='video',
                            duration=60,
                            is_trimmed=True
                        )
                        logger.info(f"Video {file.name} trimmed and saved successfully")
                    
                else:
                    logger.info(f"Video {file.name} is already 60 seconds or less, saving as-is")
                    # Video is already 60 seconds or less, save as-is
                    serializer.save(
                        user=self.request.user,
                        file=file,
                        media_type='video',
                        duration=60,
                        is_trimmed=False
                    )
            else:
                # For images, save as-is
                logger.info(f"Processing image file: {file.name}")
                serializer.save(
                    user=self.request.user,
                    file=file,
                    media_type='image',
                    duration=60,
                    is_trimmed=False
                )
                
        except Exception as e:
            logger.error(f"Error creating story: {e}")
            # If any error occurs, try to save with original file
            try:
                file = self.request.FILES.get('media') or self.request.FILES.get('file')
                if file:
                    serializer.save(
                        user=self.request.user,
                        file=file,
                        media_type='video' if is_video_file(file) else 'image',
                        duration=60,
                        is_trimmed=False
                    )
                else:
                    raise e
            except Exception as fallback_error:
                logger.error(f"Fallback save also failed: {fallback_error}")
                raise e


class StoryDeleteView(generics.DestroyAPIView):
    queryset = Story.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # المستخدم يقدر يحذف ستوريه بس
        return super().get_queryset().filter(user=self.request.user)