from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth Endpoints
    path('auth/', include('djoser.urls')),       # access: /auth/users/ (register)
    path('auth/', include('djoser.urls.jwt')),   # access: /auth/jwt/create/ (login)
    # App Endpoints
    path('accounts/', include('accounts.urls')),
    path('courses/', include('courses.urls')), 
    path('', include('main.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

