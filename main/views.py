from django.shortcuts import render , redirect
from django.contrib.auth import logout
from courses.models import Course
from django.utils import timezone


def home(request):
    if request.user.is_authenticated:
        courses = Course.objects.filter(end_date__gte=timezone.now().date())
        return render(request, 'main/dashboard.html', {'courses': courses})
    else:
        courses = Course.objects.all()[:3] 
        return render(request, 'main/home.html', {'courses': courses})
    
def about_us(request):
    return render(request, 'main/about_us.html')
