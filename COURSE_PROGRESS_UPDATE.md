# Course Progress & Lesson Unlock System

## ✅ Hoàn Thành Tất Cả Yêu Cầu

### 1. **Đánh Dấu Bài Học Hoàn Thành** ✅

- ✅ Bài học hoàn thành được tô màu xanh lá (green-50 background)
- ✅ Icon checkmark (✓) màu trắng trên nền xanh
- ✅ Badge "Hoàn thành" màu xanh
- ✅ Text màu xanh đậm (green-900)
- ✅ Nút "Xem lại" thay vì "Bắt đầu"

### 2. **Mở Khóa Bài Học Tiếp Theo** ✅

- ✅ Bài học đầu tiên luôn mở khóa
- ✅ Bài học tiếp theo tự động mở khóa khi hoàn thành bài học trước
- ✅ Logic mở khóa:
  - Nếu là bài học đầu tiên → Mở khóa
  - Nếu bài học đã hoàn thành → Mở khóa (để xem lại)
  - Nếu bài học trước đã hoàn thành → Mở khóa
  - Ngược lại → Khóa

### 3. **Cập Nhật Tiến Độ Khóa Học** ✅

- ✅ Tự động tính tiến độ: `(số bài học hoàn thành / tổng số bài học) × 100%`
- ✅ Cập nhật vào `course_enrollments.progress` qua API
- ✅ Hiển thị progress bar trong trang khóa học với số liệu real-time
- ✅ Format hiển thị: "X/Y bài học (Z%)"
- ✅ Đánh dấu `completedAt` khi tiến độ = 100%
- ✅ Tính toán lại mỗi lần load trang để đảm bảo chính xác

## 📊 Cách Hoạt Động

### Flow Hoàn Thành Bài Học:

1. **Học viên làm bài tập** → Hoàn thành tất cả challenges
2. **API cập nhật** → `POST /api/student/progress`
3. **Đánh dấu lesson completed** → `lesson_progress.completed = true`
4. **Tính tiến độ khóa học:**
   ```
   Số bài học hoàn thành = COUNT(lesson_progress WHERE completed = true)
   Tổng số bài học = COUNT(lessons in course)
   Tiến độ = (Số hoàn thành / Tổng số) × 100%
   ```
5. **Cập nhật enrollment** → `course_enrollments.progress = X%`
6. **Mở khóa bài học tiếp theo** → Tự động khi load trang

### Logic Mở Khóa:

```typescript
isLessonUnlocked(unitIndex, lessonIndex, lessonId) {
  // Bài học đầu tiên luôn mở
  if (unitIndex === 0 && lessonIndex === 0) return true;

  // Bài học đã hoàn thành luôn mở (để xem lại)
  if (isCompleted(lessonId)) return true;

  // Tìm bài học trước
  let previousLesson = null;
  if (lessonIndex > 0) {
    // Bài trước trong cùng unit
    previousLesson = units[unitIndex].lessons[lessonIndex - 1];
  } else if (unitIndex > 0) {
    // Bài cuối của unit trước
    previousLesson = units[unitIndex - 1].lessons[last];
  }

  // Kiểm tra bài trước đã hoàn thành chưa
  return isCompleted(previousLesson.id);
}
```

## 🎨 UI/UX Changes

### Trạng Thái Bài Học:

1. **Hoàn thành (Completed):**

   - 🟢 Background: `bg-green-50 border-green-200`
   - ✅ Icon: `CheckCircle2` màu trắng trên nền xanh
   - 🏷️ Badge: "Hoàn thành" màu xanh
   - 📝 Text: `text-green-900`
   - 🔘 Button: "Xem lại" (secondaryOutline)

2. **Đang mở (Unlocked):**

   - ⚪ Background: `bg-white border-gray-200`
   - 📖 Icon: `BookOpen` màu xanh dương
   - 📝 Text: `text-gray-900`
   - 🔘 Button: "Bắt đầu" (default)

3. **Đã khóa (Locked):**
   - 🔒 Background: `bg-gray-50 border-gray-200`
   - 🔐 Icon: `Lock` màu xám
   - 📝 Text: `text-gray-400`
   - 🔘 Button: "Đã khóa" (disabled)

### Progress Bar:

- Hiển thị ở header trang khóa học
- Màu xanh dương (blue-600)
- Cập nhật real-time sau khi hoàn thành bài học
- Format: "X/Y bài học (Z%)" bên cạnh progress bar
- Tính toán từ `lessonProgress` thực tế, không dùng `enrollment.progress`
- Đảm bảo luôn chính xác khi load trang

## 📁 Files Đã Thay Đổi

### 1. **API Route**

- `app/api/student/progress/route.ts`:
  - Thêm logic tính tiến độ khóa học
  - Cập nhật `course_enrollments.progress`
  - Đánh dấu `completedAt` khi 100%

### 2. **Course Detail Page**

- `app/student/courses/[courseId]/page.tsx`:
  - Fetch `lessonProgress` cho user
  - Helper function `isLessonUnlocked()`
  - Helper function `isLessonCompleted()`
  - UI conditional rendering dựa trên trạng thái
  - Màu sắc và icon khác nhau cho mỗi trạng thái

## 🔄 Database Updates

### Tables Involved:

1. **lesson_progress:**

   - `userId` - ID học viên
   - `lessonId` - ID bài học
   - `completed` - Đã hoàn thành (boolean)
   - `completedAt` - Thời gian hoàn thành

2. **course_enrollments:**

   - `progress` - Tiến độ khóa học (0-100)
   - `completedAt` - Thời gian hoàn thành khóa học

3. **challenge_progress:**
   - Tracking từng bài tập
   - Dùng để tính lesson completion

## 🚀 Testing Flow

1. **Vào trang khóa học:** `/student/courses/{courseId}`
2. **Kiểm tra trạng thái:**
   - Bài học đầu tiên: Mở khóa
   - Các bài khác: Đã khóa
3. **Làm bài học đầu tiên:**
   - Click "Bắt đầu"
   - Hoàn thành tất cả bài tập
   - Xem celebration modal
4. **Quay lại trang khóa học:**
   - Bài học 1: Màu xanh + "Hoàn thành" + "Xem lại"
   - Bài học 2: Tự động mở khóa + "Bắt đầu"
   - Progress bar: Cập nhật (ví dụ: 10% nếu có 10 bài)
5. **Tiếp tục làm bài học 2:**
   - Hoàn thành → Bài học 3 mở khóa
   - Progress bar: Cập nhật (20%)

## 📝 Notes

- Tiến độ được tính dựa trên **số bài học hoàn thành**, không phải số bài tập
- Mỗi bài học có thể có nhiều bài tập (challenges)
- Bài học chỉ được đánh dấu hoàn thành khi **tất cả bài tập** trong bài học đã hoàn thành
- Học viên có thể xem lại bài học đã hoàn thành bất cứ lúc nào
- Không thể skip bài học - phải làm tuần tự từ đầu đến cuối
- Progress bar cập nhật ngay sau khi hoàn thành bài học (không cần refresh)

## 🎯 Benefits

1. **Gamification:** Học viên thấy tiến độ rõ ràng
2. **Motivation:** Mở khóa bài mới tạo động lực học tiếp
3. **Structure:** Học theo trình tự logic, không bị lạc
4. **Achievement:** Màu xanh và checkmark tạo cảm giác hoàn thành
5. **Flexibility:** Có thể xem lại bài cũ bất cứ lúc nào
