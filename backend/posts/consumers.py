# consumers.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ArtLike, ArtComment, ArtPost
from django.contrib.auth import get_user_model

User = get_user_model()

class ArtPostConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.group_name = "artposts"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content):
        event_type = content.get('type')

        if event_type == 'like':
            art_post_id = content.get('art_post_id')
            user_id = content.get('user_id')
            await self.create_like(user_id, art_post_id)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "like_event",
                    "art_post_id": art_post_id,
                    "user_id": user_id,
                }
            )

        elif event_type == 'comment':
            art_post_id = content.get('art_post_id')
            user_id = content.get('user_id')
            comment_text = content.get('content')
            comment = await self.create_comment(user_id, art_post_id, comment_text)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "comment_event",
                    "art_post_id": art_post_id,
                    "user_id": user_id,
                    "content": comment_text,
                }
            )

    async def like_event(self, event):
        await self.send_json({
            "type": "like",
            "art_post_id": event['art_post_id'],
            "user_id": event['user_id'],
        })

    async def comment_event(self, event):
        await self.send_json({
            "type": "comment",
            "art_post_id": event['art_post_id'],
            "user_id": event['user_id'],
            "content": event['content'],
        })

    @database_sync_to_async
    def create_like(self, user_id, art_post_id):
        user = User.objects.get(id=user_id)
        art_post = ArtPost.objects.get(id=art_post_id)
        if not ArtLike.objects.filter(user=user, art_post=art_post).exists():
            ArtLike.objects.create(user=user, art_post=art_post)

    @database_sync_to_async
    def create_comment(self, user_id, art_post_id, content):
        user = User.objects.get(id=user_id)
        art_post = ArtPost.objects.get(id=art_post_id)
        return ArtComment.objects.create(user=user, art_post=art_post, content=content)