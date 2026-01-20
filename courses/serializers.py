from rest_framework import serializers
from .models import Course, Enrollment, Module, Lesson, LessonComplete # <--- Ensure imports

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

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'price', 'image', 'instructor_name']

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