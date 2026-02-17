from rest_framework import serializers
from .models import Course, Enrollment, Module, Lesson, LessonComplete # <--- Ensure imports

from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        # We add 'user_type' so users can choose to be a Student or Instructor
        fields = ('id', 'email', 'username', 'password', 'user_type')

# 1. The Bottom Layer
# In courses/serializers.py

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        # Add 'video_file' to this list
        fields = ['id', 'module', 'title', 'content_type', 'video_url', 'video_file', 'assessment_url', 'document']

# 2. The Middle Layer (Includes Lessons)
# ... inside courses/serializers.py ...

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True) 

    class Meta:
        model = Module
        # CRITICAL FIX: Added 'course' here
        fields = ['id', 'course', 'title', 'description', 'lessons']

# 3. The Top Layer (Includes Modules)
class CourseDetailSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source='instructor.username')
    modules = ModuleSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField() # <--- NEW FIELD

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'category', 'price', 
            'image', 'instructor_name', 'start_date', 'modules', 'is_enrolled'
        ]

    def get_is_enrolled(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return Enrollment.objects.filter(student=user, course=obj).exists()
        return False

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # SECURITY LOGIC: If not enrolled, HIDE the content!
        if not data['is_enrolled']:
            data.pop('modules', None) 
        return data

# 4. The List Layer (Lightweight - No Modules)
class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source='instructor.username')
    students_count = serializers.SerializerMethodField() # <--- NEW FIELD

    class Meta:
        model = Course
        # Add 'students_count' to the list
        fields = ['id', 'title', 'description', 'category', 'price', 'image', 'instructor_name', 'students_count']

    def get_students_count(self, obj):
        # Count only valid enrollments (where status is 'enrolled' or just existence depending on your logic)
        # Using the reverse relationship name 'enrollments' from your models
        return obj.enrollments.count()

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'


# ... existing serializers ...

class MyCourseSerializer(serializers.ModelSerializer):
    """
    Custom serializer for 'My Learning' page.
    Calculates progress percentage for the specific student.
    """
    instructor_name = serializers.ReadOnlyField(source='instructor.username')
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'price', 'image', 'instructor_name', 'progress']

    def get_progress(self, obj):
        # 1. Get the student from the request context
        student = self.context['request'].user
        
        # 2. Count Total Lessons in the Course
        total_lessons = Lesson.objects.filter(module__course=obj).count()
        if total_lessons == 0:
            return 0
        
        # 3. Count Completed Lessons for this Student in this Course
        completed_lessons = LessonComplete.objects.filter(
            student=student,
            lesson__module__course=obj
        ).count()
        
        # 4. Calculate Percentage
        return int((completed_lessons / total_lessons) * 100)

class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title', 'description', 'category', 'price', 'image', 'start_date', 'end_date']
        # Note: We do NOT include 'instructor' here. 
        # The backend will automatically assign the logged-in user as the instructor.

class TeacherCourseSerializer(serializers.ModelSerializer):
    """
    VIP Serializer for Instructors.
    ALWAYS returns modules, even if not enrolled.
    """
    # FIX: Define the missing field
    instructor_name = serializers.ReadOnlyField(source='instructor.username') 
    
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'price', 'image', 'instructor_name', 'modules']