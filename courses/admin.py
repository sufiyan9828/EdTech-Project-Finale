from django.contrib import admin
from .models import Course, Enrollment, SavedCourse, Module, Lesson, LessonComplete, CourseCompletion

admin.site.register(Course)
admin.site.register(Enrollment)
admin.site.register(SavedCourse)
admin.site.register(Module)
admin.site.register(Lesson)
admin.site.register(LessonComplete)
admin.site.register(CourseCompletion)