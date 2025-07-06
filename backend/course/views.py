from django.forms import ValidationError
from rest_framework import viewsets , permissions
from .serializers import CourseSerializer, LessonSerializer, EnrollmentSerializer, PaymentSerializer, CourseRatingSerializer
from .models import Course, CourseRating, Enrollment, Payment, Lesseon
from .permission__ import IsInstructorOwner
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

import stripe
from rest_framework.views import APIView
from rest_framework.response import Response


from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

from rest_framework.exceptions import PermissionDenied

from django.shortcuts import get_object_or_404


from rest_framework.permissions import IsAuthenticatedOrReadOnly

import os
from dotenv import load_dotenv
load_dotenv()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')


class CourseView(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_approved=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsInstructorOwner]
        else:
            self.permission_classes = [IsAuthenticatedOrReadOnly]
        return super().get_permissions()           

                        
                                
class CourseRatingView(viewsets.ModelViewSet):
    queryset = CourseRating.objects.all()
    serializer_class = CourseRatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    

    def get_queryset(self):
        course_id = self.request.query_params.get('course')
        if course_id:
            return CourseRating.objects.filter(course_id=course_id)
        return CourseRating.objects.none()
    
    
    

class CreateCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, *args, **kwargs):
        course_id = request.data.get("course_id")
        course = Course.objects.get(id=course_id)
        instructor = course.instructor
        # تأكد أن للمدرس حساب Stripe متصل
        if not instructor.stripe_account_id:
            return Response({'detail': 'Instructor does not have a Stripe account connected.'}, status=400)
        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({'detail': 'You are registered in this course'}, status=400)
        amount = int(course.price * 100)  # المبلغ بالـ cents
        platform_fee = int(amount * 0.10)  # 10% للمنصة
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': amount,
                    'product_data': {
                        'name': course.title,
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='http://localhost:8000/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='http://localhost:8000/cancel',
            metadata={
                "course_id": str(course.id),
                "user_id": str(request.user.id),
            },
            payment_intent_data={
                'application_fee_amount': platform_fee,
                'transfer_data': {
                    'destination': instructor.stripe_account_id,
                },
            },
        )
        return Response({'checkout_url': session.url})
    
    

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        course_id = session['metadata']['course_id']
        user_id = session['metadata']['user_id']

        try:
            user = User.objects.get(id=user_id)
            course = Course.objects.get(id=course_id)
        except (User.DoesNotExist, Course.DoesNotExist):
            return HttpResponse(status=404)

        enrollment, created = Enrollment.objects.get_or_create(student=user, course=course)

        Payment.objects.create(
            enrollment=enrollment,
            amount=course.price,
            is_paid=True,
            payment_id=session['payment_intent'],
            
        )

    return HttpResponse(status=200)


class LessonView(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.request.query_params.get('course')
        if not course_id:
            return Lesseon.objects.none()

        course = get_object_or_404(Course, id=course_id)

        if course.instructor == self.request.user:
            return course.lessons.all()

        if course.is_free:
            return course.lessons.filter(is_published=True)
       
        enrollment = Enrollment.objects.filter(student=self.request.user, course=course).first()
        if enrollment and hasattr(enrollment, 'payment') and enrollment.payment.is_paid:
            return course.lessons.filter(is_published=True)


        return Lesseon.objects.none()
    
    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        if not course:
            raise ValidationError("Course is required.")

        if course.instructor != self.request.user:
            raise PermissionDenied("You are not the instructor of this course.")
        
        if not course.is_approved:
            raise PermissionDenied("Cannot add lessons to an unapproved course.")
        serializer.save()


class RequestInstructorView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Check if user already has instructor permissions
        if request.user.is_staff or request.user.is_superuser:
            return Response({'detail': 'You already have instructor access.'}, status=400)
        
        # Here you would typically:
        # 1. Create a request record in the database
        # 2. Send notification to admin
        # 3. Update user permissions
        
        # For now, we'll just return a success message
        # In a real implementation, you'd want to create a model for instructor requests
        return Response({
            'detail': 'Instructor access request submitted successfully. You will be notified once approved.',
            'status': 'pending'
        }, status=200)

