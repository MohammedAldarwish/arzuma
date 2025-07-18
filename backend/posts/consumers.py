# consumers.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer # type: ignore
from channels.db import database_sync_to_async # type: ignore
from .models import ArtLike, ArtComment, ArtPost
from django.contrib.auth import get_user_model
import json

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
            await self.create_like(user_id, art_post_id) # type: ignore
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
        art_post = ArtPost.objects.get(id=art_post_id) # type: ignore
        if not ArtLike.objects.filter(user=user, art_post=art_post).exists(): # type: ignore
            ArtLike.objects.create(user=user, art_post=art_post) # type: ignore

    @database_sync_to_async
    def create_comment(self, user_id, art_post_id, content):
        user = User.objects.get(id=user_id)
        art_post = ArtPost.objects.get(id=art_post_id) # type: ignore
        return ArtComment.objects.create(user=user, art_post=art_post, content=content) # type: ignore


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        message_type = content.get('type')
        
        if message_type == 'message':
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'content': content.get('content'),
                    'sender_username': content.get('sender_username', 'Unknown'),
                    'timestamp': content.get('timestamp'),
                }
            )
        elif message_type == 'typing':
            # Send typing indicator to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'username': content.get('username', 'Unknown'),
                    'is_typing': content.get('is_typing', False),
                }
            )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send_json({
            'type': 'message',
            'content': event['content'],
            'sender_username': event['sender_username'],
            'timestamp': event['timestamp'],
        })

    async def typing_indicator(self, event):
        # Send typing indicator to WebSocket
        await self.send_json({
            'type': 'typing',
            'username': event['username'],
            'is_typing': event['is_typing'],
        })