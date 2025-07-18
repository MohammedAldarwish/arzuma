from django.db import models
from django.conf import settings
from django.utils import timezone

class Story(models.Model):
    MEDIA_TYPE_CHOICES = (
        ('image', 'Image'),
        ('video', 'Video'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='stories')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, blank=True, null=True)
    duration = models.IntegerField(default=60, help_text='Duration in seconds (for videos)') # type: ignore
    is_trimmed = models.BooleanField(default=False, help_text='Whether video was trimmed in frontend') # type: ignore
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        expiry_time = self.created_at + timezone.timedelta(hours=24) # type: ignore
        return timezone.now() > expiry_time

    def file_exists(self):
        """Check if the file actually exists on disk"""
        if self.file:
            import os
            return os.path.exists(self.file.path) # type: ignore
        return False

    def save(self, *args, **kwargs):
        if self.file and self.file.name:
            if self.file.name.endswith(('.jpg', '.jpeg', '.png')):
                self.media_type = 'image'
                self.duration = 60  # Images show for 60 seconds
            elif self.file.name.endswith(('.mp4', '.mov', '.avi')):
                self.media_type = 'video'
                # Duration will be set by the view during processing
        super().save(*args, **kwargs)
