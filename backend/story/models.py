from django.db import models
from django.utils import timezone
from django.conf import settings

class Story(models.Model):
    MEDIA_TYPE_CHOICES = (
        ('image', 'Image'),
        ('video', 'Video'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='stories')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, blank=True, null=True)    
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(hours=24)

    def save(self, *args, **kwargs):
        if self.file.name.endswith(('.jpg', '.jpeg', '.png')):
            self.media_type = 'image'
        elif self.file.name.endswith(('.mp4', '.mov', '.avi')):
            self.media_type = 'video'
        super().save(*args, **kwargs)
