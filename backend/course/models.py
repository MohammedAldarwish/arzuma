from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid 


class Course(models.Model):
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    is_free = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    course_image = models.ImageField(upload_to='course_image/')
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"The Course is for {self.instructor}"
    
class CourseRating(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_ratings')
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta: 
        unique_together = ['course', 'user']

    def __str__(self):
        return f"{self.user} rated {self.course} - {self.rating}"

class Lesseon(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField(default=1)
    video_file = models.FileField(upload_to='course_lesseons/')
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        ordering = ['order']

   
    def __str__(self):
        return f"{self.course.title} - {self.title}"    



class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')        
    course = models.ForeignKey(Course , on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('student', 'course')
        
    def __str__(self):
        return f"{self.student} enrolled in {self.course}"
    
    
class Payment(models.Model):
    order_id = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    payment_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    
    def platform_fee(self):
        return (self.amount * Decimal('0.10')).quantize(Decimal('0.01'))
    
    def instructor_share(self):
        return (self.amount * Decimal('0.90')).quantize(Decimal('0.01'))
    
    def __str__(self):
        return f"{self.enrollment.student} bought a course {self.enrollment.course} price {self.amount}"
