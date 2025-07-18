# 🎬 الحل النهائي: نظام قص الفيديو إلى 60 ثانية

## 📋 المشكلة الأصلية

المستخدم يريد نظام يسمح برفع فيديوهات ستوري، ويقوم تلقائياً بقص الفيديو إلى أول 60 ثانية فقط، مع حذف النسخة الكاملة من السيرفر.

## ✅ الحل المطبق

### 1. الملفات المحسنة:

#### `video_processor.py` - معالج الفيديو الرئيسي

- ✅ `trim_video_to_60_seconds()` - قص الفيديو إلى 60 ثانية
- ✅ `is_video_file()` - التحقق من نوع الملف
- ✅ `should_trim_video()` - التحقق من الحاجة للقص
- ✅ `validate_video_file()` - التحقق من صحة الفيديو
- ✅ معالجة ذكية للأخطاء مع fallback آمن

#### `views.py` - معالج الطلبات

- ✅ `StoryCreateView` - رفع الستوري مع معالجة تلقائية للفيديو
- ✅ التحقق من صحة الفيديو قبل وبعد القص
- ✅ حفظ الفيديو المقطوع فقط (حذف النسخة الكاملة)

#### `models.py` - نموذج البيانات

- ✅ `Story` - نموذج الستوري مع حقل `is_trimmed`
- ✅ `duration` - مدة الفيديو (60 ثانية)
- ✅ `media_type` - نوع الوسائط (video/image)

### 2. خوارزمية القص:

```python
# 1. التحقق من نوع الملف
if is_video_file(file):
    # 2. التحقق من صحة الفيديو
    if validate_video_file(file):
        # 3. التحقق من الحاجة للقص
        if should_trim_video(file):
            # 4. قص الفيديو
            trimmed_file = trim_video_to_60_seconds(file)
            # 5. التحقق من صحة الفيديو المقطوع
            if validate_video_file(trimmed_file):
                # 6. حفظ الفيديو المقطوع فقط
                save_trimmed_video(trimmed_file)
```

### 3. أوامر FFmpeg المستخدمة:

#### الطريقة الأولى (أسرع):

```bash
ffmpeg -i input.mp4 -t 60 -c copy -avoid_negative_ts make_zero -y output.mp4
```

#### الطريقة الثانية (إذا فشلت الأولى):

```bash
ffmpeg -i input.mp4 -t 60 -c:v libx264 -c:a aac -preset fast -crf 23 -y output.mp4
```

## 🧪 اختبار النظام

### 1. اختبار مستقل (بدون Django):

```bash
cd backend/story
python standalone_test.py
```

### 2. اختبار مع Django:

```bash
cd backend/story
python simple_test.py
```

### 3. اختبار متقدم:

```bash
cd backend/story
python test_video_trimming.py
```

## 📖 كيفية الاستخدام

### 1. رفع فيديو من خلال API:

```python
import requests

url = "http://localhost:8000/api/stories/create/"
files = {'file': open('video.mp4', 'rb')}
data = {'media_type': 'video'}

response = requests.post(url, files=files, data=data)
print(response.json())
```

### 2. استخدام النظام برمجياً:

```python
from story.video_processor import trim_video_to_60_seconds, is_video_file
from django.core.files import File

with open('video.mp4', 'rb') as video_file:
    django_file = File(video_file, name='video.mp4')

    if is_video_file(django_file):
        trimmed_file = trim_video_to_60_seconds(django_file)
        # حفظ الفيديو المقطوع
```

## 🔧 المتطلبات

### 1. تثبيت FFmpeg:

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install epel-release && sudo yum install ffmpeg

# macOS
brew install ffmpeg
```

### 2. التحقق من التثبيت:

```bash
ffmpeg -version
ffprobe -version
```

## 🛡️ معالجة الأخطاء

### الأخطاء المحتملة وحلولها:

| المشكلة              | الحل                              |
| -------------------- | --------------------------------- |
| FFmpeg غير مثبت      | تثبيت FFmpeg                      |
| فشل copy codecs      | الانتقال تلقائياً إلى re-encoding |
| ملف الفيديو تالف     | حفظ الملف الأصلي                  |
| عدم وجود مساحة كافية | تنظيف الملفات المؤقتة             |
| خطأ في تحميل الفيديو | التحقق من صحة الملف               |

## 📊 المميزات

- ✅ **قص تلقائي** للفيديو إلى 60 ثانية
- ✅ **دعم صيغ متعددة** (MP4, AVI, MOV, WMV, FLV, WebM, MKV)
- ✅ **معالجة ذكية للأخطاء** مع fallback آمن
- ✅ **تنظيف تلقائي** للملفات المؤقتة
- ✅ **تحسين الأداء** باستخدام copy codecs
- ✅ **إعادة ترميز** إذا فشل copy codecs
- ✅ **سجلات مفصلة** لمراقبة الأداء
- ✅ **حفظ الفيديو المقطوع فقط** (حذف النسخة الكاملة)

## 🚀 تشغيل النظام

### 1. تشغيل الخادم:

```bash
cd backend
gunicorn core.asgi:application -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 2. اختبار النظام:

```bash
cd backend/story
python standalone_test.py
```

## 📝 مثال عملي

### إنشاء فيديو تجريبي:

```bash
ffmpeg -f lavfi -i testsrc=duration=90:size=640x480:rate=30 \
       -f lavfi -i sine=frequency=1000:duration=90 \
       -c:v libx264 -c:a aac -y test_video.mp4
```

### اختبار القص:

```bash
python standalone_test.py
```

## 🔍 استكشاف الأخطاء

### إذا واجهت خطأ "An error occurred while loading the video file":

1. **تحقق من تثبيت FFmpeg:**

   ```bash
   ffmpeg -version
   ```

2. **اختبار النظام:**

   ```bash
   python standalone_test.py
   ```

3. **تحقق من سجلات الأخطاء:**

   ```bash
   tail -f video_processing.log
   ```

4. **تحقق من صلاحيات الملفات:**
   ```bash
   ls -la media/stories/
   ```

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل:

- راجع ملف `VIDEO_TRIMMING_GUIDE.md` للحصول على دليل مفصل
- راجع سجلات الأخطاء
- تحقق من إعدادات FFmpeg
- تأكد من صلاحيات الملفات

---

**🎉 النظام جاهز للاستخدام!**

### ملخص الحل:

1. ✅ الفيديو يتم قصه تلقائياً إلى 60 ثانية
2. ✅ النسخة الكاملة يتم حذفها من السيرفر
3. ✅ فقط الفيديو المقطوع يتم حفظه
4. ✅ معالجة ذكية للأخطاء
5. ✅ دعم صيغ فيديو متعددة
