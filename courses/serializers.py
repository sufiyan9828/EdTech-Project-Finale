from rest_framework import serializers
from .models import Course, Enrollment, Module, Lesson

# 1. The Bottom Layer
class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content_type', 'video_url', 'assessment_url', 'document']

# 2. The Middle Layer (Includes Lessons)
class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True) # Nested magic

    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'lessons']

# 3. The Top Layer (Includes Modules)
class CourseDetailSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source='instructor.username')
    modules = ModuleSerializer(many=True, read_only=True) # Nested magic

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'category', 'price', 
            'image', 'instructor_name', 'start_date', 'modules'
        ]

# 4. The List Layer (Lightweight - No Modules)
class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source='instructor.username')

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'price', 'image', 'instructor_name']

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'