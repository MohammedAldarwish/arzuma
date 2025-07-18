# نظام الدورات الأونلاين

هذا النظام يوفر منصة كاملة لإدارة الدورات الأونلاين مع دعم المدفوعات عبر Stripe.

## الميزات

### للمدرسين

- إنشاء دورات مجانية أو مدفوعة
- رفع الصور المصغرة للدورات
- إضافة دروس للدورات مع إمكانية نشر/إخفاء
- ربط حساب Stripe Connect لاستقبال المدفوعات
- تتبع التسجيلات والإيرادات

### للطلاب

- تصفح الدورات المتاحة
- التسجيل في الدورات المجانية مباشرة
- الدفع للدورات المدفوعة عبر Stripe Checkout
- تقييم الدورات بعد التسجيل
- الوصول للمحتوى بعد التسجيل

### للمنصة

- عمولة 10% من كل دورة مدفوعة
- إدارة المدفوعات والتحويلات
- نظام صلاحيات متقدم

## النماذج (Models)

### Course

- `title`: عنوان الدورة
- `description`: وصف الدورة
- `instructor`: المدرس (مرتبط بـ User)
- `is_free`: هل الدورة مجانية
- `price`: سعر الدورة (للدورات المدفوعة)
- `thumbnail`: صورة مصغرة للدورة
- `stripe_product_id`: معرف المنتج في Stripe
- `stripe_price_id`: معرف السعر في Stripe

### Lesson

- `course`: الدورة المرتبطة بها
- `title`: عنوان الدرس
- `content`: محتوى الدرس
- `is_published`: هل الدرس منشور
- `order`: ترتيب الدرس

### Enrollment

- `student`: الطالب
- `course`: الدورة
- `paid`: هل تم الدفع
- `stripe_payment_intent`: معرف الدفع في Stripe

### CourseReview

- `course`: الدورة
- `student`: الطالب
- `rating`: التقييم (1-5)
- `comment`: التعليق

## API Endpoints

### الدورات

- `GET /api/courses/courses/` - قائمة الدورات
- `POST /api/courses/courses/` - إنشاء دورة جديدة
- `GET /api/courses/courses/{id}/` - تفاصيل دورة
- `PUT /api/courses/courses/{id}/` - تحديث دورة
- `DELETE /api/courses/courses/{id}/` - حذف دورة
- `POST /api/courses/courses/{id}/enroll/` - التسجيل في دورة

### الدروس

- `GET /api/courses/lessons/` - قائمة الدروس
- `POST /api/courses/lessons/` - إنشاء درس جديد
- `GET /api/courses/lessons/{id}/` - تفاصيل درس
- `PUT /api/courses/lessons/{id}/` - تحديث درس
- `DELETE /api/courses/lessons/{id}/` - حذف درس

### التسجيل

- `GET /api/courses/enrollments/` - قائمة تسجيلات الطالب

### التقييمات

- `GET /api/courses/courses/{id}/reviews/` - تقييمات دورة
- `POST /api/courses/courses/{id}/reviews/` - إضافة تقييم

### Stripe Webhook

- `POST /api/courses/stripe/webhook/` - استقبال أحداث Stripe

## الصلاحيات

### IsInstructorOrReadOnly

- يسمح للجميع بقراءة الدورات
- يسمح فقط للمدرس بتعديل دوراته

### IsLessonInstructorOrReadOnly

- يسمح فقط لمدرس الدورة بتعديل دروسها

### IsEnrolledOrInstructor

- يسمح للطلاب المسجلين أو مدرس الدورة بالوصول للمحتوى

### CanReviewCourse

- يسمح فقط للطلاب المسجلين بتقييم الدورات

## إعداد Stripe

1. إنشاء حساب Stripe
2. الحصول على المفاتيح من لوحة التحكم
3. إعداد Webhook في Stripe
4. إضافة المفاتيح إلى متغيرات البيئة

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## الاستخدام

### إنشاء دورة جديدة

```javascript
const courseData = new FormData();
courseData.append("title", "دورة الرسم الرقمي");
courseData.append("description", "تعلم الرسم الرقمي من الصفر");
courseData.append("is_free", false);
courseData.append("price", "99.99");
courseData.append("thumbnail", file);

const course = await createCourse(courseData);
```

### التسجيل في دورة

```javascript
const enrollment = await enrollInCourse(courseId);
if (enrollment.checkout_url) {
  // دورة مدفوعة - توجيه لصفحة الدفع
  window.location.href = enrollment.checkout_url;
} else {
  // دورة مجانية - تم التسجيل مباشرة
  alert("تم التسجيل بنجاح!");
}
```

### إضافة تقييم

```javascript
const reviewData = {
  rating: 5,
  comment: "دورة ممتازة ومفيدة جداً",
};

const review = await createCourseReview(courseId, reviewData);
```
