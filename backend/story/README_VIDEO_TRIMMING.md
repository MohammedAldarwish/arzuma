# 🎬 نظام قص الفيديو إلى 60 ثانية

## 📋 نظرة عامة

هذا النظام يسمح للمستخدمين برفع فيديوهات ستوري، ويقوم تلقائياً بقص الفيديو إلى أول 60 ثانية فقط، مما يوفر مساحة تخزين ويحافظ على تجربة مستخدم متناسقة.

## ✨ المميزات

- ✅ **قص تلقائي** للفيديو إلى 60 ثانية
- ✅ **دعم صيغ متعددة** (MP4, AVI, MOV, WMV, FLV, WebM, MKV)
- ✅ **معالجة ذكية للأخطاء** مع fallback آمن
- ✅ **تنظيف تلقائي** للملفات المؤقتة
- ✅ **تحسين الأداء** باستخدام copy codecs
- ✅ **إعادة ترميز** إذا فشل copy codecs
- ✅ **سجلات مفصلة** لمراقبة الأداء

## 🚀 التثبيت والإعداد

### 1. تثبيت FFmpeg

#### Ubuntu/Debian:

```bash
sudo apt update
sudo apt install ffmpeg
```

#### CentOS/RHEL:

```bash
sudo yum install epel-release
sudo yum install ffmpeg
```

#### macOS:

```bash
brew install ffmpeg
```

#### Windows:

1. تحميل FFmpeg من [الموقع الرسمي](https://ffmpeg.org/download.html)
2. إضافته إلى PATH

### 2. التحقق من التثبيت:

```bash
ffmpeg -version
ffprobe -version
```

### 3. تثبيت متطلبات Python:

```bash
pip install -r requirements.txt
```

## 🧪 اختبار النظام

### اختبار بسيط:

```bash
cd backend/story
python simple_test.py
```

### اختبار متقدم:

```bash
cd backend/story
python test_video_trimming.py
```

## 📖 كيفية الاستخدام

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

## 🔧 البنية التقنية

### الملفات الرئيسية:

1. **`video_processor.py`** - معالج الفيديو الرئيسي

   - `trim_video_to_60_seconds()` - قص الفيديو
   - `is_video_file()` - التحقق من نوع الملف
   - `should_trim_video()` - التحقق من الحاجة للقص
   - `get_video_duration()` - الحصول على مدة الفيديو

2. **`views.py`** - معالج الطلبات

   - `StoryCreateView` - رفع الستوري
   - معالجة تلقائية للفيديو

3. **`models.py`** - نموذج البيانات
   - `Story` - نموذج الستوري
   - `is_trimmed` - علامة القص
   - `duration` - مدة الفيديو

## ⚙️ خوارزمية القص

### الخطوات التفصيلية:

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
   ffmpeg -i input.mp4 -t 60 -c copy -avoid_negative_ts make_zero -y output.mp4

   # الطريقة الثانية: re-encoding (إذا فشلت الأولى)
   ffmpeg -i input.mp4 -t 60 -c:v libx264 -c:a aac -preset fast -crf 23 -y output.mp4
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

## 🛡️ معالجة الأخطاء

### الأخطاء المحتملة وحلولها:

| المشكلة              | الحل                              |
| -------------------- | --------------------------------- |
| FFmpeg غير مثبت      | تثبيت FFmpeg                      |
| فشل copy codecs      | الانتقال تلقائياً إلى re-encoding |
| ملف الفيديو تالف     | حفظ الملف الأصلي                  |
| عدم وجود مساحة كافية | تنظيف الملفات المؤقتة             |

## 📊 مراقبة الأداء

### سجلات النظام:

```bash
# مراقبة سجلات معالجة الفيديو
tail -f video_processing.log
```

### مؤشرات الأداء:

- **وقت المعالجة:** 1-5 ثواني للفيديو
- **حجم الملف:** تقليل بنسبة 60-80%
- **جودة الفيديو:** محفوظة عند استخدام copy codecs

## 🔒 الأمان

### إجراءات الأمان:

1. **التحقق من نوع الملف**
2. **حدود حجم الملف** (100MB)
3. **تنظيف الملفات المؤقتة**
4. **معالجة الأخطاء الآمنة**

## 🐛 استكشاف الأخطاء

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

## 📝 مثال عملي

### إنشاء فيديو تجريبي:

```bash
# إنشاء فيديو تجريبي مدته 90 ثانية
ffmpeg -f lavfi -i testsrc=duration=90:size=640x480:rate=30 \
       -f lavfi -i sine=frequency=1000:duration=90 \
       -c:v libx264 -c:a aac -y test_video.mp4
```

### اختبار القص:

```bash
cd backend/story
python simple_test.py
```

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل:

- راجع سجلات الأخطاء
- تحقق من إعدادات FFmpeg
- تأكد من صلاحيات الملفات
- راجع ملف `VIDEO_TRIMMING_GUIDE.md` للحصول على دليل مفصل

---

**🎉 النظام جاهز للاستخدام!**
