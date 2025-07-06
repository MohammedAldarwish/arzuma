from django.contrib import admin
from .models import CustomUser, MyProfile, Follower

admin.site.register(CustomUser)
admin.site.register(MyProfile)
admin.site.register(Follower)