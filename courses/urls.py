from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.course_create, name='course_create'),
    path('my-courses/', views.my_courses, name='my_courses'),
    path('<int:course_id>/enrollments/', views.view_enrollments, name='view_enrollments'),
    path('enrollments/<int:enrollment_id>/', views.enrollment_details, name='enrollment_details'),
    path('', views.course_list, name='course_list'),
    path('<int:course_id>/enroll/', views.enroll_course, name='enroll_course'),
    path('my-enrollments/', views.my_enrolled_courses, name='my_enrolled_courses'),
    path('saved/', views.saved_courses, name='saved_courses'),
    path('<int:course_id>/toggle-save/', views.toggle_save_course, name='toggle_save_course'),
    path('module-content/<int:course_id>/', views.module_content, name='module_content'),   
    path('add-module/<int:course_id>/', views.add_module, name='add_module'),
    path('add-lesson/<int:module_id>/', views.add_lesson, name='add_lesson'),
    path('lesson/<int:lesson_id>/complete/', views.mark_lesson_completed, name='mark_lesson_completed'),
    path('edit-module/<int:module_id>/', views.edit_module, name='edit_module'),
    path('edit-lesson/<int:lesson_id>/', views.edit_lesson, name='edit_lesson'),
    path("course/<int:course_id>/complete/", views.mark_course_completed, name="mark_course_completed"),
    path('course/<int:course_id>/certificate/', views.generate_certificate, name='generate_certificate'),
    path('<int:course_id>/', views.course_detail, name='course_detail'),
]