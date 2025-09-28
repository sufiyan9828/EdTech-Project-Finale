from django.forms import ModelForm
from django import forms
from .models import Course, Enrollment, Module, Lesson

class CoursePostingForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['title', 'description', 'category', 'price', 'start_date', 'end_date','image']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
            'category': forms.TextInput(attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'image': forms.FileInput(attrs={'class': 'form-control', 'accept': 'image/*'}),
        }

class EnrollmentForm(ModelForm):
    class Meta:
        model = Enrollment
        fields = ['notes'] 

class ModuleForm(ModelForm):
    class Meta:
        model = Module
        fields = ['title', 'description']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

class LessonForm(ModelForm):
    class Meta:
        model = Lesson
        fields = ['title', 'content', 'content_type', 'video_url', 'assessment_url', 'document']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'content_type': forms.Select(attrs={'class': 'form-control'}),
            'video_url': forms.URLInput(attrs={'class': 'form-control'}),
            'assessment_url': forms.URLInput(attrs={'class': 'form-control'}),
            'document': forms.FileInput(attrs={'class': 'form-control'}),
        }
