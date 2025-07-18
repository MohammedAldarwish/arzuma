from rest_framework import serializers
from .models import Course, Lesson, Enrollment, CourseReview
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'is_published', 'order', 'created_at']
        read_only_fields = ['created_at']

class CourseReviewSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    
    class Meta:
        model = CourseReview
        fields = ['id', 'student', 'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']

class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    reviews = CourseReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'instructor', 'thumbnail',
            'created_at', 'updated_at', 'lessons', 'reviews',
            'average_rating', 'total_reviews', 'is_enrolled'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return sum(review.rating for review in reviews) / len(reviews)
        return 0
    
    def get_total_reviews(self, obj):
        return obj.reviews.count()
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(student=request.user).exists()
        return False

class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title', 'description', 'thumbnail']
    
    def create(self, validated_data):
        validated_data['instructor'] = self.context['request'].user
        return super().create(validated_data)

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'student', 'enrolled_at']
        read_only_fields = ['enrolled_at']

class CourseReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseReview
        fields = ['rating', 'comment']
    
    def create(self, validated_data):
        course_id = self.context['course_id']
        validated_data['course_id'] = course_id
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value 