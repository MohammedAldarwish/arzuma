from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Course, Lesson, Enrollment, CourseReview
from decimal import Decimal

User = get_user_model()

class CourseModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testinstructor',
            email='instructor@test.com',
            password='testpass123'
        )
        
    def test_create_course(self):
        course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            instructor=self.user,
            is_free=True
        )
        self.assertEqual(course.title, 'Test Course')
        self.assertEqual(course.instructor, self.user)
        self.assertTrue(course.is_free)
        
    def test_create_paid_course(self):
        course = Course.objects.create(
            title='Paid Course',
            description='Paid Description',
            instructor=self.user,
            is_free=False,
            price=Decimal('99.99')
        )
        self.assertEqual(course.price, Decimal('99.99'))
        self.assertFalse(course.is_free)

class LessonModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testinstructor',
            email='instructor@test.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            instructor=self.user
        )
        
    def test_create_lesson(self):
        lesson = Lesson.objects.create(
            course=self.course,
            title='Test Lesson',
            content='Test Content',
            order=1
        )
        self.assertEqual(lesson.title, 'Test Lesson')
        self.assertEqual(lesson.course, self.course)
        self.assertEqual(lesson.order, 1)

class EnrollmentModelTest(TestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username='testinstructor',
            email='instructor@test.com',
            password='testpass123'
        )
        self.student = User.objects.create_user(
            username='teststudent',
            email='student@test.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            instructor=self.instructor
        )
        
    def test_create_enrollment(self):
        enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course,
            paid=True
        )
        self.assertEqual(enrollment.student, self.student)
        self.assertEqual(enrollment.course, self.course)
        self.assertTrue(enrollment.paid)

class CourseReviewModelTest(TestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username='testinstructor',
            email='instructor@test.com',
            password='testpass123'
        )
        self.student = User.objects.create_user(
            username='teststudent',
            email='student@test.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            instructor=self.instructor
        )
        
    def test_create_review(self):
        review = CourseReview.objects.create(
            course=self.course,
            student=self.student,
            rating=5,
            comment='Great course!'
        )
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.student, self.student)
        self.assertEqual(review.course, self.course)
