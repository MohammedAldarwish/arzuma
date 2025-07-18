#!/usr/bin/env python3
"""
اختبار مستقل لنظام قص الفيديو بدون Django
"""

import os
import tempfile
import subprocess
import sys

def test_ffmpeg_installation():
    """اختبار تثبيت FFmpeg"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ FFmpeg مثبت ويعمل بشكل صحيح")
            return True
        else:
            print("❌ FFmpeg مثبت لكن لا يعمل")
            return False
    except FileNotFoundError:
        print("❌ FFmpeg غير مثبت")
        return False

def create_test_video():
    """إنشاء فيديو تجريبي"""
    try:
        print("🎬 إنشاء فيديو تجريبي...")
        cmd = [
            'ffmpeg', '-f', 'lavfi', '-i', 'testsrc=duration=90:size=640x480:rate=30',
            '-f', 'lavfi', '-i', 'sine=frequency=1000:duration=90',
            '-c:v', 'libx264', '-c:a', 'aac', '-y', 'test_video.mp4'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ تم إنشاء فيديو تجريبي بنجاح")
            return True
        else:
            print("❌ فشل في إنشاء الفيديو التجريبي")
            print(f"الخطأ: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ خطأ في إنشاء الفيديو التجريبي: {e}")
        return False

def trim_video_standalone(input_path, output_path):
    """قص الفيديو باستخدام FFmpeg مباشرة"""
    try:
        print(f"✂️  قص الفيديو: {input_path} -> {output_path}")
        
        # الطريقة الأولى: copy codecs
        cmd = [
            'ffmpeg', '-i', input_path,
            '-t', '60',  # Duration limit
            '-c', 'copy',  # Copy codecs
            '-avoid_negative_ts', 'make_zero',
            '-y',  # Overwrite output
            output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ تم قص الفيديو بنجاح باستخدام copy codecs")
            return True
        else:
            print("⚠️  فشل copy codecs، جاري المحاولة بـ re-encoding...")
            
            # الطريقة الثانية: re-encoding
            cmd = [
                'ffmpeg', '-i', input_path,
                '-t', '60',  # Duration limit
                '-c:v', 'libx264',  # Video codec
                '-c:a', 'aac',  # Audio codec
                '-preset', 'fast',  # Faster encoding
                '-crf', '23',  # Good quality
                '-avoid_negative_ts', 'make_zero',
                '-y',  # Overwrite output
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ تم قص الفيديو بنجاح باستخدام re-encoding")
                return True
            else:
                print("❌ فشل في قص الفيديو")
                print(f"الخطأ: {result.stderr}")
                return False
                
    except Exception as e:
        print(f"❌ خطأ في قص الفيديو: {e}")
        return False

def verify_video_file(file_path):
    """التحقق من صحة ملف الفيديو"""
    try:
        cmd = [
            'ffprobe', '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            file_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("✅ ملف الفيديو صالح")
        return True
        
    except subprocess.CalledProcessError as e:
        print("❌ ملف الفيديو تالف")
        print(f"الخطأ: {e.stderr}")
        return False
    except Exception as e:
        print(f"❌ خطأ في التحقق من الفيديو: {e}")
        return False

def get_video_info(file_path):
    """الحصول على معلومات الفيديو"""
    try:
        cmd = [
            'ffprobe', '-v', 'quiet',
            '-show_entries', 'format=duration,size',
            '-of', 'csv=p=0',
            file_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        info = result.stdout.strip().split(',')
        
        if len(info) >= 2:
            duration = float(info[0])
            size = int(info[1])
            return duration, size
        else:
            return 0, 0
            
    except Exception as e:
        print(f"❌ خطأ في الحصول على معلومات الفيديو: {e}")
        return 0, 0

def main():
    """الدالة الرئيسية"""
    print("🎬 اختبار مستقل لنظام قص الفيديو")
    print("=" * 50)
    
    # اختبار تثبيت FFmpeg
    if not test_ffmpeg_installation():
        print("❌ يرجى تثبيت FFmpeg أولاً")
        return
    
    # البحث عن ملفات فيديو موجودة
    video_files = []
    for file in os.listdir('.'):
        if file.lower().endswith(('.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv')):
            video_files.append(file)
    
    if not video_files:
        print("📹 لا توجد ملفات فيديو، جاري إنشاء فيديو تجريبي...")
        if create_test_video():
            video_files = ['test_video.mp4']
        else:
            print("❌ فشل في إنشاء فيديو تجريبي")
            return
    
    # اختيار أول ملف فيديو
    input_video = video_files[0]
    output_video = f"trimmed_{input_video}"
    
    print(f"📹 معالجة الفيديو: {input_video}")
    
    # الحصول على معلومات الفيديو الأصلي
    original_duration, original_size = get_video_info(input_video)
    print(f"📏 المدة الأصلية: {original_duration:.2f} ثانية")
    print(f"📏 الحجم الأصلي: {original_size / 1024 / 1024:.2f} MB")
    
    # التحقق من صحة الفيديو الأصلي
    if not verify_video_file(input_video):
        print("❌ الفيديو الأصلي تالف")
        return
    
    # قص الفيديو
    if trim_video_standalone(input_video, output_video):
        # التحقق من صحة الفيديو المقطوع
        if verify_video_file(output_video):
            # الحصول على معلومات الفيديو المقطوع
            trimmed_duration, trimmed_size = get_video_info(output_video)
            print(f"📏 المدة المقطوعة: {trimmed_duration:.2f} ثانية")
            print(f"📏 الحجم المقطوع: {trimmed_size / 1024 / 1024:.2f} MB")
            
            # حساب نسبة التخفيض
            if original_size > 0:
                reduction = ((original_size - trimmed_size) / original_size) * 100
                print(f"📉 نسبة التخفيض: {reduction:.1f}%")
            
            print("✅ تم قص الفيديو بنجاح!")
        else:
            print("❌ الفيديو المقطوع تالف")
    else:
        print("❌ فشل في قص الفيديو")

if __name__ == "__main__":
    main() 