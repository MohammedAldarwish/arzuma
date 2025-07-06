from django.contrib import admin
from .models import ArtPost, ArtImage, ArtLike, ArtComment

admin.site.register(ArtPost)
admin.site.register(ArtImage)
admin.site.register(ArtLike)
admin.site.register(ArtComment)

