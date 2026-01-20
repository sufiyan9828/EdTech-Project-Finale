from django.shortcuts import render , redirect
from django.contrib.auth import logout
from courses.models import Course
from django.utils import timezone

# Add these imports at the very top
from rest_framework.decorators import api_view
from rest_framework.response import Response

# ... existing views ...

# Add this at the bottom
@api_view(['GET'])
def api_test(request):
    return Response({"message": "Hello from Django!"})


def home(request):
    if request.user.is_authenticated:
        courses = Course.objects.filter(end_date__gte=timezone.now().date())
        return render(request, 'main/dashboard.html', {'courses': courses})
    else:
        courses = Course.objects.all()[:3] 
        return render(request, 'main/home.html', {'courses': courses})
    
def about_us(request):
    return render(request, 'main/about_us.html')
