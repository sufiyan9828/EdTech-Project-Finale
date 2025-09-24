from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views import View
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from .forms import RegisterForm, LoginForm, InstructorProfileForm, StudentProfileForm
from .models import StudentProfile, InstructorProfile, User  
from courses.models import Course, Enrollment  


class Register(View):
    def get(self, request):
        form = RegisterForm()
        context = {'form': form}
        return render(request, 'accounts/register.html', context)

    def post(self, request):
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.save() 
            if user.user_type == 'S':  
                StudentProfile.objects.create(user=user)
            elif user.user_type == 'I':  
                InstructorProfile.objects.create(user=user)
            messages.success(request, f"Account created successfully. Now login, {user.username}")
            return redirect('login')
        else:
            messages.error(request, "Form is not valid")
            context = {'form': form}
            return render(request, 'accounts/register.html', context)


class Login(View):
    def get(self, request):
        form = LoginForm()
        context = {'form': form}
        return render(request, 'accounts/login.html', context)

    def post(self, request):
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                messages.success(request, "Login successful")
                return redirect('home')
            else:
                messages.error(request, "Invalid credentials")
                context = {'form': form}
                return render(request, 'accounts/login.html', context)
        else:
            messages.error(request, "Form is not valid")
            context = {'form': form}
            return render(request, 'accounts/login.html', context)


# def home(request):
#     return redirect('course_list')


class Logout(View):
    def get(self, request):
        logout(request)
        return redirect('/')

    def post(self, request):
        logout(request)
        return redirect('/')


def profile_details(request):
    user = request.user
    profile = None
    if request.user.user_type == 'I':  
        profile = get_object_or_404(InstructorProfile, user=user)
    elif request.user.user_type == 'S': 
        profile = get_object_or_404(StudentProfile, user=user)

    context = {
        'profile': profile,
        'user_obj': user
    }
    return render(request, 'accounts/profile.html', context)


@login_required
def profile_update(request):
    user = request.user
    if user.user_type == 'S': 
        profile = get_object_or_404(StudentProfile, user=user)
        if request.method == "POST":
            form = StudentProfileForm(request.POST, request.FILES, instance=profile)
            if form.is_valid():
                form.save()
                messages.success(request, "Student profile updated successfully!")
                return redirect('profile_details')
            else:
                context = {'form': form}
                return render(request, 'accounts/profile_update.html', context)
        else:
            form = StudentProfileForm(instance=profile)
            context = {'form': form}
            return render(request, 'accounts/profile_update.html', context)

    elif user.user_type == 'I': 
        profile = get_object_or_404(InstructorProfile, user=user)
        if request.method == "POST":
            form = InstructorProfileForm(request.POST, request.FILES, instance=profile)
            if form.is_valid():
                form.save()
                messages.success(request, "Instructor profile updated successfully!")
                return redirect('profile_details')
            else:
                context = {'form': form}
                return render(request, 'accounts/profile_update.html', context)
        else:
            form = InstructorProfileForm(instance=profile)
            context = {'form': form}
            return render(request, 'accounts/profile_update.html', context)


def user_profile_view(request, user_id):
    user_obj = get_object_or_404(User, id=user_id)
    profile = None
    
    if user_obj.user_type == 'S':
        profile = StudentProfile.objects.filter(user=user_obj).first()
    elif user_obj.user_type == 'I':
        profile = InstructorProfile.objects.filter(user=user_obj).first()

    user_courses = None
    if user_obj.user_type == 'I':
        user_courses = Course.objects.filter(instructor=user_obj)
    elif user_obj.user_type == 'S':
        user_courses = Enrollment.objects.filter(student=user_obj)

    context = {
        'user_obj': user_obj,
        'profile': profile,
        'user_courses': user_courses,
    }
    return render(request, 'accounts/user_profile.html', context)


def instructor_profile_view(request, user_id):
    instructor = get_object_or_404(User, id=user_id, user_type='I')
    courses = Course.objects.filter(instructor=instructor)
    instructor_profile = InstructorProfile.objects.filter(user=instructor).first()

    context = {
        'instructor': instructor,
        'courses': courses,
        'instructor_profile': instructor_profile,
    }
    return render(request, 'accounts/instructor_profile.html', context)
