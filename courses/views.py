from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from .models import Course, Enrollment, SavedCourse,Module,Lesson,LessonComplete,CourseCompletion
from .forms import CoursePostingForm,ModuleForm,LessonForm
from django.db.models import Count,Q
from django.template.loader import render_to_string
from django.http import HttpResponse
from io import BytesIO
from xhtml2pdf import pisa


def is_instructor(user):
    return user.is_authenticated and user.user_type == 'I'

def is_student(user):
    return user.is_authenticated and user.user_type == 'S'

@login_required
def course_create(request):
    if not is_instructor(request.user):
        messages.error(request, "Only instructors can create courses.")
        return redirect('home')
    
    if request.method == 'POST':
        form = CoursePostingForm(request.POST, request.FILES)
        if form.is_valid():
            course = form.save(commit=False)
            course.instructor = request.user
            course.save()
            messages.success(request, "Course created successfully!")
            return redirect('my_courses')
    else:
        form = CoursePostingForm()
    return render(request, 'courses/course_create.html', {'form': form})


@login_required
def my_courses(request):
    if not is_instructor(request.user):
        messages.error(request, "Only instructors can view their courses.")
        return redirect('home')
    
    courses = Course.objects.filter(instructor=request.user).annotate(
        enrollment_count=Count('enrollments', filter=Q(enrollments__status='enrolled'))
    )
    
    context = {
        'courses': courses
    }
    return render(request, 'courses/my_courses.html', context)

@login_required
def view_enrollments(request, course_id):
    if not is_instructor(request.user):
        messages.error(request, "Only instructors can view enrollments.")
        return redirect('home')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    enrollments = Enrollment.objects.filter(course=course)
    
    context = {
        'course': course,
        'enrollments': enrollments
    }
    return render(request, 'courses/view_enrollments.html', context)

@login_required
def enrollment_details(request, enrollment_id):
    if not is_instructor(request.user):
        messages.error(request, "Only instructors can view enrollment details.")
        return redirect('home')
    
    enrollment = get_object_or_404(Enrollment, id=enrollment_id)
    if enrollment.course.instructor != request.user:
        messages.error(request, "You can only view enrollments for your own courses.")
        return redirect('my_courses')
    
    context = {
        'enrollment': enrollment
    }
    return render(request, 'courses/enrollment_details.html', context)


def course_list(request):
    courses = Course.objects.all().filter(end_date__gte=timezone.now().date())
    enrollment = Enrollment.objects.all().filter(status= 'enrolled')
    context = {
        'courses': courses,
        'enrollment': enrollment
    }
    return render(request, 'courses/course_list.html', context)

@login_required
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    is_saved = False
    enrollment_status = None

    today = timezone.now().date()
    if course.end_date < today:
        course_status = 'ended'
    elif course.start_date > today:
        course_status = 'not_started'
    else:
        course_status = 'ongoing'

    course_completed = CourseCompletion.objects.filter(student = request.user, course = course).exists()

    if request.user.is_authenticated and request.user.user_type == 'S':
        is_saved = SavedCourse.objects.filter(student=request.user, course=course).exists()
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()

        if enrollment:
            enrollment_status = 'enrolled'
        else:
            enrollment_status = 'not_enrolled'

    context = {
        'course': course,
        'is_saved': is_saved,
        'enrollment_status': enrollment_status,
        'course_status': course_status,
        'course_completed': course_completed
    }
    return render(request, 'courses/course_detail.html', context)

@login_required
def enroll_course(request, course_id):
    if not is_student(request.user):
        messages.error(request, "Only students can enroll in courses.")
        return redirect('home')
    
    course = get_object_or_404(Course, id=course_id)
    enrollment, created = Enrollment.objects.get_or_create(student=request.user, course=course)

    if not created:
        if enrollment.status == 'enrolled':
            messages.info(request, "You are already enrolled in this course!")
            return redirect('course_detail', course_id=course_id)

        elif enrollment.status == 'pending':
            messages.warning(request, "You have already applied for this course!")
            return redirect('course_detail', course_id=course_id)

    return redirect('course_detail',course_id = course.id)

@login_required
def my_enrolled_courses(request):
    if not is_student(request.user):
        messages.error(request, "Only students can view enrolled courses.")
        return redirect('home')
    
    enrolled_courses = Enrollment.objects.filter(student=request.user)
    return render(request, 'courses/my_enrolled_courses.html', {'enrolled_courses': enrolled_courses})

@login_required
def saved_courses(request):
    if not is_student(request.user):
        messages.error(request, "Only students can view saved courses.")
        return redirect('home')
    
    saved_courses = SavedCourse.objects.filter(student=request.user)
    return render(request, 'courses/saved_courses.html', {'saved_courses': saved_courses})

@login_required
def toggle_save_course(request, course_id):
    if request.user.user_type != 'S':
        messages.error(request, "Only students can save courses.")
        return redirect('home')
    
    course = get_object_or_404(Course, id=course_id)
    saved_course, created = SavedCourse.objects.get_or_create(
        student=request.user,
        course=course
    )
    
    if not created:
        saved_course.delete()
        messages.info(request, "Course removed from saved list.")
    else:
        messages.success(request, "Course saved successfully!")
    
    return redirect('course_detail', course_id=course_id)


def module_content(request,course_id):
    course = get_object_or_404(Course,id=course_id)
    
    completed_lessons = []
    total_lessons = Lesson.objects.filter(module__course=course).count()
    course_completed = CourseCompletion.objects.filter(student = request.user, course = course).exists()
    can_complete_course = False
    
    if is_student(request.user):
        completion = LessonComplete.objects.filter(student = request.user,lesson__module__course = course)
        for c in completion:
            completed_lessons.append(c.lesson.id)

        enrollment = Enrollment.objects.filter(course=course, student=request.user, status="enrolled").first()
        if not enrollment:
            messages.success(request,f"You are not enrolled in this course")
            return redirect('course_detail', course_id=course.id)
        
    
    if total_lessons > 0 and len(completed_lessons) == total_lessons:
        can_complete_course = True

    modules = course.modules.prefetch_related("lessons").all()
    context = {
        'course': course,
        'modules': modules,
        'completed_lessons': completed_lessons,
        'can_complete_course': can_complete_course,
        'total_lessons': total_lessons,
        'course_completed': course_completed
    }
    return render(request,"courses/module_content.html",context)
        
@login_required
def add_module(request,course_id):
    if not is_instructor(request.user):
        messages.error(request, "Only instructors can Create Module.")
        return redirect('home')
    
    course = get_object_or_404(Course,id=course_id,instructor=request.user)

    if request.method == 'POST':
        form = ModuleForm(request.POST)
        if form.is_valid():
            module = form.save(commit=False)
            module.course = course
            module.save()
            messages.success(request,f"Module added successfully")
            return redirect('module_content',course_id=course.id)
            
        else:
            messages.error(request,f"Module not added, Try Again")
    else:
        form = ModuleForm()

    context = {
        'form': form,
        'course': course
    }
    return render(request,'courses/add_module.html',context)

@login_required
def add_lesson(request,module_id):
    if not is_instructor(request.user):
        messages.error(request, "Only instructors can manage Module.")
        return redirect('home')
    
    module = get_object_or_404(Module, id=module_id, course__instructor=request.user)

    if request.method == "POST":
        form = LessonForm(request.POST,request.FILES)
        if form.is_valid():
            lesson = form.save(commit=False)
            lesson.module = module
            lesson.save()
            messages.success(request,f"Lesson Added Successfully")
            return redirect('module_content',course_id = module.course.id)
        else:
            messages.error(request,f"Lesson not added, Try Again")
    else:
        form = LessonForm()
        
    context = {
        'form': form,
        'module': module
    }
    return render(request,"courses/add_lesson.html",context)
    
@login_required
def mark_lesson_completed(request,lesson_id):
    if not is_student(request.user):
        messages.error(request,f"Only Students can Complete Course")
        return redirect('home')
    
    lesson = get_object_or_404(Lesson,id=lesson_id)

    LessonComplete.objects.get_or_create(student = request.user, lesson = lesson)
    messages.success(request,f"Marked {lesson.title}-Completed")
    return redirect('module_content',course_id = lesson.module.course.id)

@login_required
def mark_course_completed(request,course_id):
    course = get_object_or_404(Course,id=course_id)
    
    if not is_student(request.user):
        messages.error(request,f"Only Students can Complete Course")
        return redirect('home')
    
    lessons = Lesson.objects.filter(module__course = course)
    completed = LessonComplete.objects.filter(student=request.user,lesson__in = lessons).count()

    if completed < lessons.count():
        messages.error(request,"You Must Complete all Lessons to Finish Course")
        return redirect('module_content',course_id=course.id)
    else:
        CourseCompletion.objects.get_or_create(student = request.user,course=course)
        messages.success(request,f"Congratulation Course Finished")
        return redirect('course_detail',course_id=course.id)
    
@login_required
def edit_module(request, module_id):
    if not is_instructor(request.user):
        messages.error(request, "Only instructors can edit modules.")
        return redirect('home')
    module = get_object_or_404(Module, id=module_id, course__instructor=request.user)
    if request.method == 'POST':
        form = ModuleForm(request.POST, instance=module)
        if form.is_valid():
            form.save()
            messages.success(request, "Module updated successfully!")
            return redirect('module_content', course_id=module.course.id)
        else:
            messages.error(request, "Error updating module. Please check the form.")
    else:
        form = ModuleForm(instance=module)
    context = {
        'form': form,
        'module': module,
    }
    return render(request, 'courses/edit_module.html', context)

@login_required
def edit_lesson(request, lesson_id):
    if not is_instructor(request.user):
        messages.error(request, "Only instructors can edit lessons.")
        return redirect('home')

    lesson = get_object_or_404(Lesson, id=lesson_id, module__course__instructor=request.user)

    if request.method == 'POST':
        form = LessonForm(request.POST, request.FILES, instance=lesson)
        if form.is_valid():
            form.save()
            messages.success(request, "Lesson updated successfully!")
            return redirect('module_content', course_id=lesson.module.course.id)
        else:
            messages.error(request, "Error updating lesson. Please check the form.")
    else:
        form = LessonForm(instance=lesson)

    context = {
        'form': form,
        'lesson': lesson,
    }
    return render(request, 'courses/edit_lesson.html', context)

@login_required
def generate_certificate(request, course_id):
    if not is_student(request.user):
        messages.error(request, "Only students can generate certificates.")
        return redirect('home')

    course = get_object_or_404(Course, id=course_id)
    student = request.user

    course_completion = CourseCompletion.objects.filter(student=student, course=course).first()
    if not course_completion:
        messages.error(request, "You have not completed this course yet.")
        return redirect('course_detail', course_id=course.id)

    context = {
        'student_name': student.get_full_name() or student.username,
        'course_title': course.title,
        'completion_date': course_completion.completed_on.strftime("%B %d, %Y"),
    }

    html_string = render_to_string('courses/certificate_template.html', context)

    result = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html_string.encode("UTF-8")), result)
    if pdf.err:
        messages.error(request, "Error generating PDF")
        return redirect('course_detail', course_id=course.id)

    response = HttpResponse(result.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="certificate_{student.username}_{course.id}.pdf"'
    return response