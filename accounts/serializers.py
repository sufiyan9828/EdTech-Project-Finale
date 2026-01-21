from rest_framework import serializers
from .models import User

class UserProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False) # Handle image specifically

    class Meta:
        model = User
        # Adjust these fields to match EXACTLY what is in your accounts/models.py
        fields = ['id', 'username', 'email', 'bio', 'profile_image', 'git_link', 'x_link', 'instagram_link']
        read_only_fields = ['email', 'username'] # We won't allow changing email/username here for safety