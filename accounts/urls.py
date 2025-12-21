from django.urls import path
from .views import *
from . import views
urlpatterns = [
    path('register/',Register.as_view(),name="register"),
    path('login/',Login.as_view(),name="login"),
    path('logout/',Logout.as_view(),name="logout"),
    path('profile/',views.profile_details,name='profile_details'), 
    path('profile/update/',views.profile_update,name='profile_update'),
    path('user/<int:user_id>/', views.user_profile_view, name='user_profile'),
    path('instructor/<int:user_id>/', views.instructor_profile_view, name='instructor_profile'),
]