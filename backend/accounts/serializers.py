from typing import Any, Dict
from rest_framework import serializers
from .models import CustomUser, MyProfile, Follower
from better_profanity import profanity
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer



profanity.load_censor_words()

class UserRegisterSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)
    
    # Additional reserved usernames that profanity_check might miss
    RESERVED_USERNAMES = {
        'admin', 'root', 'administrator', 'system', 'user', 'guest', 'test',
        'official', 'support', 'help', 'info', 'contact', 'team', 'moderator',
        'security', 'privacy', 'terms', 'policy', 'cookies', 'api'
    }
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'password', 'password_confirm']
        extra_kwargs = {
            'username': {'required': True},
            'password': {'write_only': True},
        }

    def validate_email(self, value): 
        # Normalize email (lowercase and strip whitespace)
        value = value.lower().strip()
        
        # Django already validates email format via EmailField
        # Just check for uniqueness
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value
    
    def validate_username(self, value):
        # Normalize username (strip whitespace)
        value = value.strip()
        
        # Check for reserved usernames first
        if value.lower() in self.RESERVED_USERNAMES:
            raise serializers.ValidationError('This username is reserved and cannot be used.')
        
        # Check for inappropriate content using ML
        try:      
            if profanity.contains_profanity(value):
                raise serializers.ValidationError("This username contains inappropriate content.")
        except Exception as e:
            # Fallback if profanity_check fails
            raise serializers.ValidationError('Unable to validate username. Please try a different one.')
        
        # Check for existing username
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        
        return value

    def validate(self, attrs):
        # Ensure passwords match
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError('Passwords do not match.')
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Django's create_user() already handles password hashing
        user = CustomUser.objects.create_user(**validated_data)
        
        # You might want to log successful registration
        # logger.info(f"New user registered: {user.username} ({user.email})")
        
        return user
    
    def to_representation(self, instance):
        """Customize the response after user creation"""
        return {
            'id': instance.id,
            'username': instance.username,
            'email': instance.email,
            'first_name': instance.first_name,   # <-- Add this line
            'message': 'User registered successfully!'
        }

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        if self.user is not None:
            user_data: Dict[str, Any] = {
                'email': self.user.email,
                'username': self.user.username,
                'id': self.user.id,
                'is_active': self.user.is_active,
                'date_joined': self.user.date_joined.isoformat(),
            }
        
        # Add any custom user fields if they exist
        if self.user is not None and hasattr(self.user, 'first_name'):
            user_data['first_name'] = self.user.first_name

        # Merge the data dictionaries
        data = {**data, **user_data}
        
        return data
    
    def to_representation(self, instance):
        return {
            'access': instance.get('access'),
            'refresh': instance.get('refresh'),
            'user': {
                'id': instance.get('id'),
                'username': instance.get('username'),
                'email': instance.get('email'),
                'is_active': instance.get('is_active'),
                'date_joined': instance.get('date_joined'),
                'first_name': instance.get('first_name', ''),
            }
        }


class FollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follower
        fields = ['user', 'followed_user']


class MyProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    is_followed_back = serializers.SerializerMethodField()


    # Include user information
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    
    class Meta:
        model = MyProfile
        fields = ['id', 'user', 'username', 'email', 'first_name', 'bio', 'avatar', 'created_at', 'followers_count', 'following_count', 'is_following', 'is_followed_back']
        read_only_fields = ['id', 'user', 'username', 'email', 'first_name', 'created_at']

        
    def get_followers_count(self, obj):
        return obj.user.followers.count()

    def get_following_count(self, obj):
        return obj.user.following.count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follower.objects.filter(user=request.user, followed_user=obj.user).exists()
        return False

    def get_is_followed_back(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follower.objects.filter(user=obj.user, followed_user=request.user).exists()
        return False
    
class UsernameSearchSerializer(serializers.ModelSerializer):
    # Include profile information for better search results
    bio = serializers.CharField(source='myprofile.bio', read_only=True)
    avatar = serializers.CharField(source='myprofile.avatar', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'bio', 'avatar']