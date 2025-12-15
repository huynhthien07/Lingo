# Changelog - Student UI Improvements & Bug Fixes

## 🐛 Bug Fixes

### 1. Video Upload Not Persisting ⚠️ CRITICAL FIX

**Problem**: Khi thêm video trong bài học và nhấn lưu thì thành công nhưng khi refresh trang thì mất và chưa cập nhật data.

**Root Cause**: Database schema **THIẾU COLUMN** `video_url` trong table `lessons`!

**Solution**:

1. **Thêm column vào schema** - File: `db/schema.ts`

```typescript
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  unitId: integer("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
  skillType: skillTypeEnum("skill_type").notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  videoUrl: text("video_url"), // ✅ ADDED - URL to lesson video
});
```

2. **Tạo migration** - File: `drizzle/0001_add_video_url_to_lessons.sql`

```sql
ALTER TABLE "lessons" ADD COLUMN "video_url" text;
```

3. **Chạy migration**:

```bash
npx drizzle-kit push
```

4. **Xử lý empty string** - File: `lib/controllers/teacher/lesson.controller.ts`

```typescript
// Prepare update data - handle empty strings
const updateData: any = { ...data };

// Convert empty strings to null for optional fields
if (updateData.videoUrl === "") {
  updateData.videoUrl = null;
}
if (updateData.description === "") {
  updateData.description = null;
}
```

## 🎨 UI/UX Improvements

### 2. Phóng To Giao Diện & Giảm Padding

**Changes**:

- Tăng `max-width` từ `5xl` (1024px) lên `1400-1600px`
- Giảm padding từ `p-6` xuống `p-4`, `py-8` xuống `py-4`
- Giảm spacing từ `space-y-6` xuống `space-y-3`
- Tăng kích thước font cho nội dung để dễ đọc hơn

**Files Modified**:

- `components/student/lesson-view-client.tsx`
- `components/student/practice-quiz.tsx`

### 3. Ẩn Menu Hệ Thống

**Implementation**:

- Thêm `data-student-sidebar` attribute vào sidebar component
- Sử dụng `useEffect` để ẩn sidebar khi mount và hiện lại khi unmount
- Áp dụng cho cả lesson view và practice quiz

**Files Modified**:

- `components/student/student-sidebar.tsx` - Thêm data attribute
- `components/student/lesson-view-client.tsx` - Hide/show logic
- `components/student/practice-quiz.tsx` - Hide/show logic

### 4. Sửa Đường Dẫn Âm Thanh

**Changes**:

- Đổi từ `/sounds/success.mp3` sang `/sound/success.mp3`
- Đổi tên thư mục `public/sounds/` thành `public/sound/`
- Cập nhật README với hướng dẫn rõ ràng

**Files Modified**:

- `components/student/practice-quiz.tsx`
- `public/sounds/` → `public/sound/`

## 📊 Progress Tracking Fixes

### 5. Sửa Logic Tiến Độ

**Problem**: Thanh tiến độ không chính xác, hiển thị theo câu hỏi hiện tại thay vì số câu đã hoàn thành.

**Solution**:

- **Practice Quiz**: Tính progress dựa trên số câu đã nộp (submitted), không phải câu hiện tại

```typescript
const submittedCount = Object.keys(submitted).filter(
  (key) => submitted[parseInt(key)]
).length;
const progressPercentage =
  totalQuestions > 0 ? (submittedCount / totalQuestions) * 100 : 0;
```

- **Lesson View**: Sửa query để fetch đúng challenge progress

```typescript
// Fetch all challenge progress for this user
const allChallengesProgress = await db.query.challengeProgress.findMany({
  where: eq(challengeProgress.userId, userId),
});

// Filter to only challenges in this lesson that are completed
const completedChallenges = allChallengesProgress.filter(
  (cp) => challengeIds.includes(cp.challengeId) && cp.completed
).length;
```

**Files Modified**:

- `components/student/practice-quiz.tsx`
- `app/student/courses/[courseId]/lessons/[lessonId]/page.tsx`

### 6. Hiển Thị Bài Tập Đúng

**Problem**: Hiển thị danh sách câu hỏi (questions) thay vì bài tập (challenges).

**Solution**:

- Sidebar hiển thị `lesson.challenges` (bài tập)
- Mỗi challenge có nhiều questions bên trong
- Footer trong practice quiz hiển thị questions của challenge hiện tại

**Clarification**:

- **Lesson View Sidebar**: Danh sách challenges (bài tập) - VD: "Reading Exercise", "Listening Exercise"
- **Practice Quiz Footer**: Danh sách questions (câu hỏi) trong challenge hiện tại - VD: 1, 2, 3, 4, 5

## 🎯 Visual Improvements

### Button Sizes & Colors

- Question navigation buttons: `w-11 h-11` (tăng từ `w-10 h-10`)
- Thêm shadow cho buttons đã submit
- Thêm tooltip với title attribute
- Ring effect rõ ràng hơn cho câu hiện tại

### Typography

- Tăng font size cho nội dung: `text-base` thay vì `text-sm`
- Giảm heading sizes để cân đối: `text-2xl` thay vì `text-3xl`

### Spacing

- Giảm gaps: `gap-6` → `gap-4` → `gap-3`
- Giảm margins: `mb-6` → `mb-4` → `mb-3`
- Tối ưu sticky positions: `top-20` → `top-16`

## 📁 Files Changed Summary

### Modified:

1. `db/schema.ts` - ✅ **ADDED** `videoUrl` field to lessons table
2. `lib/controllers/teacher/lesson.controller.ts` - Video upload fix
3. `components/student/lesson-view-client.tsx` - UI improvements, hide sidebar
4. `components/student/practice-quiz.tsx` - UI improvements, progress fix, hide sidebar, sound path
5. `components/student/student-sidebar.tsx` - Add data attribute
6. `app/student/courses/[courseId]/lessons/[lessonId]/page.tsx` - Progress tracking fix
7. `public/sounds/README.md` - Update instructions

### Created:

- `drizzle/0001_add_video_url_to_lessons.sql` - Migration to add video_url column
- `CHANGELOG_STUDENT_UI_FIXES.md` - This changelog

### Renamed:

- `public/sounds/` → `public/sound/`

## 🧪 Testing Checklist

- [ ] Upload video trong lesson và verify sau khi refresh
- [ ] Kiểm tra sidebar tự động ẩn khi vào lesson/practice
- [ ] Kiểm tra thanh tiến độ cập nhật đúng khi nộp câu trả lời
- [ ] Kiểm tra danh sách bài tập hiển thị challenges, không phải questions
- [ ] Kiểm tra UI responsive trên màn hình lớn
- [ ] Kiểm tra âm thanh chúc mừng (cần thêm file success.mp3)
- [ ] Kiểm tra navigation giữa các câu hỏi
- [ ] Kiểm tra màu sắc buttons (xanh/đỏ/xám) theo trạng thái

## 📝 Notes

- Cần thêm file `public/sound/success.mp3` để có âm thanh chúc mừng
- UI đã được tối ưu cho màn hình lớn (1400-1600px)
- Sidebar tự động ẩn/hiện khi vào/ra lesson/practice pages
- Progress tracking bây giờ chính xác dựa trên số câu đã nộp
