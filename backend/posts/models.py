from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=40)

    def __str__(self):
        return self.name


class ArtPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='art_posts')
    description = models.TextField()
    categories = models.ManyToManyField(Category)
    posted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.description
    
class ArtImage(models.Model):
    art = models.ForeignKey(ArtPost, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='art_images/')

    def __str__(self):
        return f"image for {self.art.user.username}" 
    
class ArtLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    art_post = models.ForeignKey(ArtPost, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'art_post']
    
    def __str__(self):
        return f"{self.user.username} liked {self.art_post.user}"
    
class ArtComment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    art_post = models.ForeignKey(ArtPost, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} on {self.art_post.user}"