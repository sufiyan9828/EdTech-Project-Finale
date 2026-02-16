from rest_framework import serializers
from .models import User

class UserProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False) 

    class Meta:
        model = User
        # ADD 'user_type' TO THIS LIST
        fields = ['id', 'username', 'email', 'user_type', 'bio', 'profile_image', 'git_link', 'x_link', 'instagram_link']
        read_only_fields = ['email', 'username', 'user_type'] # Read-only (users can't change their role)