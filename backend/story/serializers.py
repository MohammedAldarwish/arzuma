from rest_framework import serializers 
from .models import Story
from accounts.models import CustomUser

class SimpleUserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'avatar']
    def get_avatar(self, obj):
        # جلب صورة البروفايل إذا وجدت
        if hasattr(obj, 'myprofile') and obj.myprofile.avatar:
            return obj.myprofile.avatar.url
        return None

class StorySerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()
    user = SimpleUserSerializer(read_only=True)
    media = serializers.SerializerMethodField()
    
    class Meta:
        model = Story
        fields = ['id', 'user', 'file', 'media', 'media_type', 'duration', 'created_at', 'is_expired']

    def get_media(self, obj):
        # Return the file URL as media for frontend compatibility
        if obj.file:
            return obj.file.url
        return None

    def get_is_expired(self, obj):
        return obj.is_expired()
