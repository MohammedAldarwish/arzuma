from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .serializer import ArtSerializer, CreateCommentSerializer, CreateLikeSerializer
from .models import ArtPost, ArtComment, ArtLike
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from .permissions import CanDelete
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from django.core.cache import cache
from accounts.models import CustomUser

class ArtViewSet(ModelViewSet):
    queryset = ArtPost.objects.all().order_by('-posted_at')
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = ArtPost.objects.all().order_by('-posted_at')
        
        # Filter by user if username is provided
        username = self.request.query_params.get('user')
        if username:
            try:
                user = CustomUser.objects.get(username=username)
                queryset = queryset.filter(user=user)
            except CustomUser.DoesNotExist:
                return ArtPost.objects.none()
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CommentViewSet(ModelViewSet):
    serializer_class = CreateCommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, CanDelete]

    def get_queryset(self):
        post_id = self.request.query_params.get('art_post')
        if not post_id:
            return ArtComment.objects.none()
        return ArtComment.objects.filter(art_post=post_id)

    def list(self, request, *args, **kwargs):
        post_id = request.query_params.get('art_post')
        if not post_id:
            return Response([])

        cache_key = f'comments_{post_id}'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        cache.set(cache_key, serializer.data, timeout=60*5)
        return Response(serializer.data)

    def perform_create(self, serializer):
        art_post_id = self.request.data.get('art_post')
        art_post = get_object_or_404(ArtPost, id=art_post_id)
        serializer.save(user=self.request.user, art_post=art_post)
        # Clear cache when new comment is added
        cache.delete(f'comments_{art_post_id}')


class LikeViewSet(ModelViewSet):
    serializer_class = CreateLikeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, CanDelete]

    def get_queryset(self):
        post_id = self.request.query_params.get('art_post')
        if not post_id:
            return ArtLike.objects.none()
        return ArtLike.objects.filter(art_post=post_id)

    def list(self, request, *args, **kwargs):
        post_id = request.query_params.get('art_post')
        if not post_id:
            return Response([])

        cache_key = f'likes_{post_id}'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        cache.set(cache_key, serializer.data, timeout=60*5)
        return Response(serializer.data)

    def perform_create(self, serializer):
        art_post_id = self.request.data.get('art_post')
        art_post = get_object_or_404(ArtPost, id=art_post_id)
        like_qs = ArtLike.objects.filter(user=self.request.user, art_post=art_post)
        if like_qs.exists():
            # إذا كان معجب بالفعل، احذف اللايك (toggle off)
            like_qs.delete()
            cache.delete(f'likes_{art_post_id}')
            # احسب العدد الجديد مباشرة
            new_count = ArtLike.objects.filter(art_post=art_post).count()
            return Response({'detail': 'Like removed', 'liked': False, 'like_count': new_count}, status=status.HTTP_200_OK)
        else:
            # إذا لم يكن معجب، أضف لايك (toggle on)
            serializer.save(user=self.request.user, art_post=art_post)
            cache.delete(f'likes_{art_post_id}')
            # احسب العدد الجديد مباشرة
            new_count = ArtLike.objects.filter(art_post=art_post).count()
            return Response({'detail': 'Like added', 'liked': True, 'like_count': new_count}, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        art_post_id = instance.art_post.id
        self.perform_destroy(instance)
        # Clear cache when like is removed
        cache.delete(f'likes_{art_post_id}')
        return Response(status=status.HTTP_204_NO_CONTENT)