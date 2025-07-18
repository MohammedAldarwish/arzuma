# دليل قص الفيديو إلى 60 ثانية

## نظرة عامة

هذا النظام يسمح للمستخدمين برفع فيديوهات ستوري، ويقوم تلقائياً بقص الفيديو إلى أول 60 ثانية فقط، مما يوفر مساحة تخزين ويحافظ على تجربة مستخدم متناسقة.

## المميزات

- ✅ قص تلقائي للفيديو إلى 60 ثانية
- ✅ دعم صيغ فيديو متعددة (MP4, AVI, MOV, WMV, FLV, WebM, MKV)
- ✅ معالجة ذكية للأخطاء
- ✅ تنظيف تلقائي للملفات المؤقتة
- ✅ تحسين الأداء باستخدام copy codecs
- ✅ fallback إلى re-encoding إذا فشل copy

## المتطلبات

### 1. تثبيت FFmpeg

#### على Ubuntu/Debian:

```bash
sudo apt update
sudo apt install ffmpeg
```

#### على CentOS/RHEL:

```bash
sudo yum install epel-release
sudo yum install ffmpeg
```

#### على macOS:

```bash
brew install ffmpeg
```

#### على Windows:

1. تحميل FFmpeg من [الموقع الرسمي](https://ffmpeg.org/download.html)
2. إضافته إلى PATH

### 2. التحقق من التثبيت:

```bash
ffmpeg -version
ffprobe -version
```

## كيفية الاستخدام

### 1. رفع فيديو من خلال API

```python
import requests

# رفع فيديو
url = "http://localhost:8000/api/stories/create/"
files = {'file': open('video.mp4', 'rb')}
data = {'media_type': 'video'}

response = requests.post(url, files=files, data=data)
print(response.json())
```

### 2. استخدام النظام برمجياً

```python
from story.video_processor import trim_video_to_60_seconds, is_video_file
from django.core.files import File

# فتح ملف الفيديو
with open('video.mp4', 'rb') as video_file:
    django_file = File(video_file, name='video.mp4')

    # التحقق من نوع الملف
    if is_video_file(django_file):
        # قص الفيديو
        trimmed_file = trim_video_to_60_seconds(django_file)

        # حفظ الفيديو المقطوع
        story = Story.objects.create(
            user=user,
            file=trimmed_file,
            media_type='video',
            duration=60,
            is_trimmed=True
        )
```

### 3. اختبار النظام

```bash
cd backend/story
python test_video_trimming.py
```

## البنية التقنية

### الملفات الرئيسية:

1. **`video_processor.py`** - معالجة الفيديو

   - `trim_video_to_60_seconds()` - قص الفيديو
   - `is_video_file()` - التحقق من نوع الملف
   - `should_trim_video()` - التحقق من الحاجة للقص
   - `get_video_duration()` - الحصول على مدة الفيديو

2. **`views.py`** - معالجة الطلبات

   - `StoryCreateView` - رفع الستوري
   - معالجة تلقائية للفيديو

3. **`models.py`** - نموذج البيانات
   - `Story` - نموذج الستوري
   - `is_trimmed` - علامة القص
   - `duration` - مدة الفيديو

## خوارزمية القص

### الخطوات:

1. **التحقق من نوع الملف**

   ```python
   if is_video_file(file):
       # معالجة الفيديو
   ```

2. **التحقق من الحاجة للقص**

   ```python
   if should_trim_video(file):
       # قص الفيديو
   ```

3. **قص الفيديو باستخدام FFmpeg**

   ```bash
   # الطريقة الأولى: copy codecs (أسرع)
   ffmpeg -i input.mp4 -t 60 -c copy -y output.mp4

   # الطريقة الثانية: re-encoding (إذا فشلت الأولى)
   ffmpeg -i input.mp4 -t 60 -c:v libx264 -c:a aac -y output.mp4
   ```

4. **حفظ الفيديو المقطوع**
   ```python
   serializer.save(
       user=user,
       file=trimmed_file,
       media_type='video',
       duration=60,
       is_trimmed=True
   )
   ```

## معالجة الأخطاء

### الأخطاء المحتملة وحلولها:

1. **FFmpeg غير مثبت**

   ```
   Error: [Errno 2] No such file or directory: 'ffmpeg'
   ```

   **الحل:** تثبيت FFmpeg

2. **فشل copy codecs**

   ```
   Error: Copy codecs failed
   ```

   **الحل:** النظام ينتقل تلقائياً إلى re-encoding

3. **ملف الفيديو تالف**

   ```
   Error: Invalid data found when processing input
   ```

   **الحل:** النظام يحفظ الملف الأصلي

4. **عدم وجود مساحة كافية**
   ```
   Error: No space left on device
   ```
   **الحل:** تنظيف الملفات المؤقتة

## إعدادات Django

### إضافة إلى settings.py:

```python
# إعدادات الوسائط
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# إعدادات التسجيل
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'video_processing.log',
        },
    },
    'loggers': {
        'story.video_processor': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## مراقبة الأداء

### سجلات النظام:

```bash
# مراقبة سجلات معالجة الفيديو
tail -f video_processing.log
```

### مؤشرات الأداء:

- **وقت المعالجة:** عادة 1-5 ثواني للفيديو
- **حجم الملف:** تقليل بنسبة 60-80%
- **جودة الفيديو:** محفوظة عند استخدام copy codecs

## الأمان

### إجراءات الأمان:

1. **التحقق من نوع الملف**

   ```python
   if not is_video_file(file):
       raise ValidationError("الملف ليس فيديو")
   ```

2. **حدود حجم الملف**

   ```python
   if file.size > 100 * 1024 * 1024:  # 100MB
       raise ValidationError("الملف كبير جداً")
   ```

3. **تنظيف الملفات المؤقتة**
   ```python
   finally:
       if temp_file and os.path.exists(temp_file):
           os.unlink(temp_file)
   ```

## استكشاف الأخطاء

### مشاكل شائعة:

1. **الفيديو لا يتم قصه**

   - تحقق من تثبيت FFmpeg
   - تحقق من صلاحيات الملفات
   - راجع سجلات الأخطاء

2. **جودة الفيديو منخفضة**

   - استخدم re-encoding بدلاً من copy
   - اضبط إعدادات الجودة

3. **بطء المعالجة**
   - استخدم copy codecs
   - قلل دقة الفيديو
   - استخدم خادم أقوى

## الدعم

للمساعدة أو الإبلاغ عن مشاكل:

- راجع سجلات الأخطاء
- تحقق من إعدادات FFmpeg
- تأكد من صلاحيات الملفات
