from rest_framework import status
from rest_framework.views import APIView
from .serializers import UserRegisterSerializer, MyTokenObtainPairSerializer, MyProfileSerializer, UsernameSearchSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import CustomUser, MyProfile, Follower
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.filters import SearchFilter
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.authentication import JWTAuthentication


class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if not isinstance(user, CustomUser):
                raise TypeError("serializer.save() did not return a CustomUser instance")
            refresh = RefreshToken.for_user(user)
            return Response ({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserRegisterSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserLoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class MyProfileView(RetrieveUpdateAPIView):
    serializer_class = MyProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Get or create profile for the current user
        profile, created = MyProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request, *args, **kwargs):
        """Get current user's profile"""
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        """Update current user's profile"""
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class UsernameSearchView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UsernameSearchSerializer
    filter_backends = [SearchFilter]
    search_fields = ['username', 'first_name', 'last_name']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(is_active=True)  # بدون slice



class OtherProfileView(generics.RetrieveAPIView):
    serializer_class = MyProfileSerializer

    def get_object(self):
        username = self.kwargs['username']
        # First get the user
        user = get_object_or_404(CustomUser, username=username)
        # Then get or create the profile
        profile, created = MyProfile.objects.get_or_create(user=user)
        return profile
    

@method_decorator(csrf_exempt, name='dispatch')
class FollowUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
  
           
    
    def post(self, request):
        followed_id = request.data.get('followed_user')
        followed_user = get_object_or_404(CustomUser, id=followed_id)
        
        if followed_user == request.user:
            return Response({'detail': 'You cannot follow yourself!'}, status=400)
        
        if Follower.objects.filter(user=request.user, followed_user=followed_user).exists():
            return Response({'detail': 'Already following'}, status=400)
         
        Follower.objects.create(user=request.user, followed_user=followed_user)
        return Response({'detail': 'Followed'})
    
    def delete(self, request, *args, **kwargs):
        followed_id = request.data.get('followed_user')
        followed_user = get_object_or_404(CustomUser, id=followed_id)
        
        follow = Follower.objects.filter(user=request.user, followed_user=followed_user).first()
        if follow:
            follow.delete()
            return Response({'detail': 'Unfollowed'})
        return Response({'detail': 'Not following'}, status=400)
    
    
    def get(self, request):
        user_id = request.query_params.get('user_id')
        mode = request.query_params.get('mode')  # 'followers' or 'following'

        if not user_id or mode not in ['followers', 'following']:
            return Response({'detail': 'Please provide user_id and mode (followers or following)'}, status=400)

        if mode == 'followers':
            followers = Follower.objects.filter(followed_user_id=user_id)
            data = [{'id': f.user.id, 'username': f.user.username} for f in followers]
        else:
            following = Follower.objects.filter(user_id=user_id)
            data = [{'id': f.followed_user.id, 'username': f.followed_user.username} for f in following]

        return Response(data)
    

