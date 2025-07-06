from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserLoginView, UserRegisterView, MyProfileView, UsernameSearchView, OtherProfileView, FollowUserView

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    path('register/', UserRegisterView.as_view(), name='register'),
    path('my-profile/', MyProfileView.as_view(), name='my-profile'),
    path('users/search/', UsernameSearchView.as_view(), name='username-search'),
    path('profile/<str:username>/', OtherProfileView.as_view(), name='profile'),
    path("follow/", FollowUserView.as_view() , name="follow"),
    
    # JWT Token endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
