from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    stripe_account_id = models.CharField(max_length=255, blank=True, null=True)  # حساب Stripe للمدرس

    def __str__(self):
        return self.username
    


class Follower(models.Model):
    user = models.ForeignKey(CustomUser, related_name='following', on_delete=models.CASCADE)
    followed_user = models.ForeignKey(CustomUser, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'followed_user']
        
    def __str__(self):
        return f"{self.user} follows {self.followed_user}"
    
 


class MyProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    follow = models.ForeignKey(Follower, on_delete=models.CASCADE, null=True, blank=True)
    avatar = models.ImageField(
        upload_to='avatar/',
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)