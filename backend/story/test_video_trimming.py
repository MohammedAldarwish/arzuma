#!/usr/bin/env python3
"""
مثال عملي لاختبار نظام قص الفيديو
هذا الملف يوضح كيفية استخدام النظام لقص الفيديو إلى أول 60 ثانية
"""

import os
import sys
import django
from django.core.files import File
from django.conf import settings

# إضافة مسار المشروع إلى Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# إعداد Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from story.video_processor import trim_video_to_60_seconds, is_video_file, should_trim_video
from story.models import Story
from accounts.models import CustomUser

def test_video_trimming():
    """
    مثال عملي لاختبار قص الفيديو
    """
    print("=== اختبار نظام قص الفيديو ===")
    
    # مثال 1: إنشاء فيديو تجريبي (إذا لم يكن موجود)
    test_video_path = "test_video.mp4"
    
    if not os.path.exists(test_video_path):
        print("⚠️  ملف الفيديو التجريبي غير موجود")
        print("يرجى وضع ملف فيديو باسم 'test_video.mp4' في نفس المجلد")
        print("أو استخدم أي ملف فيديو آخر")
        return
    
    print(f"📹 معالجة الفيديو: {test_video_path}")
    
    try:
        # فتح ملف الفيديو
        with open(test_video_path, 'rb') as video_file:
            # إنشاء كائن File من Django
            django_file = File(video_file, name=test_video_path)
            
            # التحقق من نوع الملف
            if is_video_file(django_file):
                print("✅ الملف هو فيديو")
                
                # التحقق من الحاجة للقص
                if should_trim_video(django_file):
                    print("✂️  الفيديو أطول من 60 ثانية، سيتم قصه...")
                    
                    # قص الفيديو
                    trimmed_file = trim_video_to_60_seconds(django_file)
                    
                    print("✅ تم قص الفيديو بنجاح!")
                    print(f"📁 الملف المقطوع: {trimmed_file.name}")
                    
                    # حفظ الفيديو المقطوع (مثال)
                    save_trimmed_video(trimmed_file)
                    
                else:
                    print("ℹ️  الفيديو 60 ثانية أو أقل، لا حاجة للقص")
            else:
                print("❌ الملف ليس فيديو")
                
    except Exception as e:
        print(f"❌ خطأ في معالجة الفيديو: {e}")

def save_trimmed_video(trimmed_file):
    """
    مثال لحفظ الفيديو المقطوع في قاعدة البيانات
    """
    try:
        # الحصول على أول مستخدم (في البيئة الحقيقية، سيكون المستخدم الحالي)
        user = CustomUser.objects.first()
        
        if user:
            # إنشاء ستوري جديد مع الفيديو المقطوع
            story = Story.objects.create(
                user=user,
                file=trimmed_file,
                media_type='video',
                duration=60,
                is_trimmed=True
            )
            
            print(f"💾 تم حفظ الفيديو المقطوع في قاعدة البيانات")
            print(f"🆔 معرف الستوري: {story.id}")
            print(f"📅 تاريخ الإنشاء: {story.created_at}")
            
        else:
            print("⚠️  لا يوجد مستخدمين في قاعدة البيانات")
            
    except Exception as e:
        print(f"❌ خطأ في حفظ الفيديو: {e}")

def create_test_video():
    """
    إنشاء فيديو تجريبي باستخدام FFmpeg (اختياري)
    """
    try:
        import subprocess
        
        # إنشاء فيديو تجريبي مدته 90 ثانية
        cmd = [
            'ffmpeg', '-f', 'lavfi', '-i', 'testsrc=duration=90:size=640x480:rate=30',
            '-f', 'lavfi', '-i', 'sine=frequency=1000:duration=90',
            '-c:v', 'libx264', '-c:a', 'aac', '-y', 'test_video.mp4'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ تم إنشاء فيديو تجريبي بنجاح")
            print("📹 الملف: test_video.mp4 (90 ثانية)")
        else:
            print("❌ فشل في إنشاء الفيديو التجريبي")
            print(f"الخطأ: {result.stderr}")
            
    except Exception as e:
        print(f"❌ خطأ في إنشاء الفيديو التجريبي: {e}")

if __name__ == "__main__":
    print("🎬 نظام قص الفيديو - مثال عملي")
    print("=" * 50)
    
    # خيارات للمستخدم
    print("\nاختر خياراً:")
    print("1. إنشاء فيديو تجريبي (يتطلب FFmpeg)")
    print("2. اختبار قص الفيديو (يتطلب ملف test_video.mp4)")
    print("3. خروج")
    
    choice = input("\nأدخل رقم الخيار (1-3): ").strip()
    
    if choice == "1":
        create_test_video()
    elif choice == "2":
        test_video_trimming()
    elif choice == "3":
        print("👋 وداعاً!")
    else:
        print("❌ خيار غير صحيح") 