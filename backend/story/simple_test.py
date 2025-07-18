#!/usr/bin/env python3
"""
مثال بسيط لاختبار نظام قص الفيديو
"""

import os
import sys
import django
from django.core.files import File

# إضافة مسار المشروع إلى Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# إعداد Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from story.video_processor import trim_video_to_60_seconds, is_video_file

def simple_test():
    """
    اختبار بسيط لنظام قص الفيديو
    """
    print("🎬 اختبار بسيط لنظام قص الفيديو")
    print("=" * 40)
    
    # البحث عن ملف فيديو في المجلد الحالي
    video_files = []
    for file in os.listdir('.'):
        if file.lower().endswith(('.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv')):
            video_files.append(file)
    
    if not video_files:
        print("❌ لا توجد ملفات فيديو في المجلد الحالي")
        print("يرجى وضع ملف فيديو في هذا المجلد")
        return
    
    # اختيار أول ملف فيديو
    video_file_path = video_files[0]
    print(f"📹 تم العثور على ملف فيديو: {video_file_path}")
    
    try:
        # فتح ملف الفيديو
        with open(video_file_path, 'rb') as video_file:
            # إنشاء كائن File من Django
            django_file = File(video_file, name=video_file_path)
            
            print(f"🔍 التحقق من نوع الملف...")
            
            # التحقق من نوع الملف
            if is_video_file(django_file):
                print("✅ الملف هو فيديو")
                
                print("✂️  بدء قص الفيديو إلى 60 ثانية...")
                
                # قص الفيديو
                trimmed_file = trim_video_to_60_seconds(django_file)
                
                print("✅ تم قص الفيديو بنجاح!")
                print(f"📁 الملف المقطوع: {trimmed_file.name}")
                
                # حفظ الفيديو المقطوع
                output_path = f"trimmed_{video_file_path}"
                with open(output_path, 'wb') as output_file:
                    for chunk in trimmed_file.chunks():
                        output_file.write(chunk)
                
                print(f"💾 تم حفظ الفيديو المقطوع: {output_path}")
                
                # عرض معلومات الملفات
                original_size = os.path.getsize(video_file_path)
                trimmed_size = os.path.getsize(output_path)
                reduction = ((original_size - trimmed_size) / original_size) * 100
                
                print(f"\n📊 معلومات الملفات:")
                print(f"📁 الملف الأصلي: {video_file_path}")
                print(f"📏 الحجم الأصلي: {original_size / 1024 / 1024:.2f} MB")
                print(f"📁 الملف المقطوع: {output_path}")
                print(f"📏 الحجم المقطوع: {trimmed_size / 1024 / 1024:.2f} MB")
                print(f"📉 نسبة التخفيض: {reduction:.1f}%")
                
            else:
                print("❌ الملف ليس فيديو")
                
    except Exception as e:
        print(f"❌ خطأ في معالجة الفيديو: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    simple_test() 