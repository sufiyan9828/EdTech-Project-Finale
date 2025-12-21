from django.db import models
from django.contrib.auth.models import AbstractUser
import os


def get_profile_photo_path(instance, filename):
    return f'profile_photos/user_{instance.user.id}/{filename}'


class User(AbstractUser):
    name = models.CharField(max_length=70, default='name')
    contact = models.CharField(max_length=13)
    user_type = models.CharField(
        max_length=1,
        choices=(
            ('I', "Instructor"),
            ('S', "Student"),
        ),
    )

    def get_profile_photo_url(self):
        if (
            self.user_type == 'S'
            and hasattr(self, 'studentprofile')
            and self.studentprofile.profile_photo
        ):
            return self.studentprofile.profile_photo.url
        elif (
            self.user_type == 'I'
            and hasattr(self, 'instructorprofile')
            and self.instructorprofile.profile_photo
        ):
            return self.instructorprofile.profile_photo.url
        return '/static/images/default_pfp.png'


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    educations = models.CharField(max_length=200, blank=True)
    institution_name = models.CharField(max_length=200, blank=True) 
    current_year = models.CharField(max_length=200, blank=True) 
    student_id = models.CharField(max_length=50, blank=True, null=True) 
    profile_photo = models.ImageField(
        upload_to=get_profile_photo_path,
        blank=True,
        null=True,
    )


class InstructorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization_name = models.CharField(max_length=100)
    contact = models.CharField(max_length=13)
    profile_photo = models.ImageField(
        upload_to=get_profile_photo_path,
        blank=True,
        null=True,
    )
