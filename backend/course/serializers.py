from rest_framework import serializers
from .models import Course, Lesseon, Enrollment, Payment, CourseRating



class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source='instructor.username', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'instructor', 'instructor_name', 'title', 'description', 'is_free', 'is_approved', 'course_image', 'created_at']
        read_only_fields = ['instructor', 'created_at']
        


class CourseRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseRating
        fields = ['id', 'course', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

    def validate(self, attrs):
        user = self.context['request'].user
        course = attrs.get('course')

        if not Enrollment.objects.filter(student=user, course=course).exists():
            raise serializers.ValidationError('You must be enrolled in the course to rate it.')

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        course = validated_data['course']
        validated_data['user'] = user

        existing_rating = CourseRating.objects.filter(course=course, user=user).first()
        if existing_rating:
            existing_rating.rating = validated_data.get('rating', existing_rating.rating)
            existing_rating.comment = validated_data.get('comment', existing_rating.comment)
            existing_rating.save()
            return existing_rating

        return super().create(validated_data)


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesseon
        fields = '__all__'
        read_only_fields = ['created_at']


        
        
class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['student', 'course', 'enrolled_at']
        read_only_fields = ['enrolled_at']
        
        
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order_id', 'enrollment', 'amount', 'is_paid', 'payment_id']
        read_only_fields = ['order_id', 'is_paid']
        

