from django.db import models
from accounts.models import User 

class Course(models.Model):
    instructor = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100) 
    price = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='course_images/', blank=True, null=True)
    
    def __str__(self):
        return self.title

class Enrollment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('enrolled', 'Enrolled'),
    )

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    enrollment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    notes = models.TextField(blank=True,null=True)

    class Meta:
        unique_together = ('course', 'student')

    def __str__(self):
        return f"{self.student.username} - {self.course.title} ({self.status})"

class SavedCourse(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    saved_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'student')
    
    def __str__(self):
        return f"{self.student.username} saved {self.course.title}"
    
class Module(models.Model):
    course = models.ForeignKey(Course,on_delete=models.CASCADE,related_name="modules")
    title = models.CharField(blank=True,null=True)
    description = models.TextField(blank=True,null=True)

    def __str__(self):
        return f"{self.course.title} - {self.title}"
    
class Lesson(models.Model):
    CONTENT_CHOICES = (
        ('A','Assessment_URL'),
        ('V','Video_URL'),
        ('D','Document'),
    )
    module = models.ForeignKey(Module,on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True,null=True)
    content_type = models.CharField(max_length=20,choices=CONTENT_CHOICES)

    assessment_url = models.URLField(blank=True,null=True)
    video_url = models.URLField(blank=True,null=True)
    document = models.FileField(upload_to="lesson_documents/",blank=True,null=True)        

    def __str__(self):
        return f"{self.module.title} - {self.title}"
    
class LessonComplete(models.Model):
    student = models.ForeignKey(User,on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson,on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student','lesson')

class CourseCompletion(models.Model):
    course = models.ForeignKey(Course,on_delete=models.CASCADE)
    student = models.ForeignKey(User,on_delete=models.CASCADE)
    completed_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course','student')

    def __str__(self):
        return f"{self.student.username} Completed - {self.course.title}"
        