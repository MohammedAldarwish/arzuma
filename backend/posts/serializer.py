from rest_framework import serializers 
from .models import ArtPost, ArtImage, ArtComment, ArtLike, Category
from accounts.models import MyProfile

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ArtImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtImage
        fields = ['id', 'image']

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ArtComment
        fields = ['id', 'user', 'content', 'created_at']
        
        
class LikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ArtLike
        fields = ['id', 'user', 'created_at']

class UserInfoSerializer(serializers.Serializer):
    username = serializers.CharField()
    avatar = serializers.SerializerMethodField()
    
    def get_avatar(self, obj):
        try:
            profile = MyProfile.objects.get(user=obj)
            if profile.avatar:
                return profile.avatar.url
        except MyProfile.DoesNotExist:
            pass
        return None

class ArtSerializer(serializers.ModelSerializer):
    images = ArtImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=True  # الآن الصور مطلوبة
    )
    comments = CommentSerializer(many=True, read_only=True)
    likes = LikeSerializer(many=True, read_only=True)
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    user = UserInfoSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    
    def get_like_count(self, obj):
        return obj.likes.count()
    
    def get_comment_count(self, obj):
        return obj.comments.count()
    
    class Meta:
        model = ArtPost
        fields = [
            'id', 'user', 'description',
            'categories', 'posted_at', 'updated_at', 'images',
            'comments', 'likes',
            'like_count', 'comment_count', 'uploaded_images'
        ]
        read_only_fields = ['user', 'posted_at', 'updated_at', 'like_count', 'comment_count']

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        if not uploaded_images:
            raise serializers.ValidationError({'uploaded_images': 'This field is required and must not be empty.'})
        art_post = ArtPost.objects.create(**validated_data)
        for image in uploaded_images:
            ArtImage.objects.create(art=art_post, image=image)
        return art_post


class CreateCommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ArtComment
        fields = ['user', 'art_post', 'content']


class CreateLikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ArtLike
        fields = ['user', 'art_post', 'created_at']