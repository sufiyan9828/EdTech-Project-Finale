from rest_framework import serializers
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. Registration Serializer (Used by Djoser for Sign Up)
class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        # We add 'user_type' so users can choose to be a Student or Instructor
        fields = ('id', 'email', 'username', 'password', 'user_type')

# 2. Profile Serializer (Used for viewing/editing profile)
class UserProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False) 

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'bio', 'profile_image', 'git_link', 'x_link', 'instagram_link']
        read_only_fields = ['email', 'username', 'user_type']