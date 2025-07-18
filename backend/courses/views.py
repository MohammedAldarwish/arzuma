from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.conf import settings
from .models import Course, Lesson, Enrollment, CourseReview
from .serializers import (
    CourseSerializer, CourseCreateSerializer, LessonSerializer,
    EnrollmentSerializer, CourseReviewSerializer, CourseReviewCreateSerializer
)
from .permissions import (
    IsInstructorOrReadOnly, IsLessonInstructorOrReadOnly,
    IsEnrolledOrInstructor, CanReviewCourse
)
from django.contrib.auth import get_user_model

User = get_user_model()

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    permission_classes = [IsInstructorOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CourseCreateSerializer
        return CourseSerializer
    
    def get_queryset(self):
        queryset = Course.objects.all()
        
        # Filter by instructor
        instructor_id = self.request.query_params.get('instructor', None)
        if instructor_id:
            queryset = queryset.filter(instructor_id=instructor_id)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(instructor__username__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=user, course=course).exists():
            return Response(
                {'error': 'Already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Enroll immediately (all courses are free now)
        enrollment = Enrollment.objects.create(
            student=user,
            course=course
        )
        return Response(
            {'message': 'Successfully enrolled in course'},
            status=status.HTTP_201_CREATED
        )

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsLessonInstructorOrReadOnly]
    
    def get_queryset(self):
        queryset = Lesson.objects.all()
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset.order_by('order')
    
    def perform_create(self, serializer):
        course_id = self.request.data.get('course')
        course = get_object_or_404(Course, id=course_id)
        serializer.save(course=course)

class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)

class CourseReviewViewSet(viewsets.ModelViewSet):
    queryset = CourseReview.objects.all()
    permission_classes = [CanReviewCourse]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CourseReviewCreateSerializer
        return CourseReviewSerializer
    
    def get_queryset(self):
        return CourseReview.objects.filter(course_id=self.kwargs.get('course_id'))
    
    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        serializer.save(course_id=course_id, student=self.request.user)
