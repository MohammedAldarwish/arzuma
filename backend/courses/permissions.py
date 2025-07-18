from rest_framework import permissions
from .models import Course, Lesson

class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow instructors to edit their courses.
    """
    
    def has_permission(self, request, view):
        # Allow read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to authenticated users
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the instructor of the course
        return obj.instructor == request.user

class IsLessonInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow course instructors to edit lessons.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if the user is the instructor of the course that contains this lesson
        return obj.course.instructor == request.user

class IsEnrolledOrInstructor(permissions.BasePermission):
    """
    Custom permission to only allow enrolled students or course instructor to view course content.
    """
    
    def has_object_permission(self, request, view, obj):
        # Course instructor can always access
        if obj.instructor == request.user:
            return True
        
        # Check if user is enrolled in the course
        if request.user.is_authenticated:
            return obj.enrollments.filter(student=request.user).exists()
        
        return False

class CanReviewCourse(permissions.BasePermission):
    """
    Custom permission to only allow enrolled students to review courses.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only authenticated users can create reviews
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only enrolled students can review courses
        course_id = view.kwargs.get('course_id')
        if course_id:
            try:
                course = Course.objects.get(id=course_id) # type: ignore
                return course.enrollments.filter(student=request.user).exists()
            except Course.DoesNotExist: # type: ignore
                return False
        
        return False 