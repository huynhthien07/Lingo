# Speaking & Writing Implementation + Question Display Fix

## ✅ Hoàn Thành

### 1. **Sửa Hiển Thị Câu Hỏi** ✅

**Vấn đề**: Phần bài tập chỉ hiện đáp án mà không hiện câu hỏi rõ ràng.

**Giải pháp**: Phân biệt rõ 2 phần:

- `challenge.question` = **Đề bài** (Exercise Instructions)
- `question.text` = **Câu hỏi** (Individual Question)

**Thay đổi trong `components/student/practice-quiz.tsx`**:

```tsx
{
  /* Exercise Instructions - NEW */
}
{
  currentChallenge.question && (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-3">
      <h3 className="font-semibold text-base mb-2 text-blue-900">📋 Đề bài</h3>
      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
        {currentChallenge.question}
      </p>
    </div>
  );
}

{
  /* Question - UPDATED */
}
<div className="bg-white rounded-lg border p-4 mb-3">
  <div className="flex items-start justify-between mb-3">
    <div className="flex-1">
      <h3 className="text-sm font-medium text-gray-500 mb-1">
        Câu hỏi {currentQuestionIndex + 1}:
      </h3>
      <h2 className="text-lg font-semibold text-gray-900">
        {currentQuestion.text}
      </h2>
    </div>
  </div>
  {/* Options... */}
</div>;
```

---

### 2. **Speaking Exercise Component** ✅

**File**: `components/student/practice-speaking.tsx`

**Tính năng**:

- ✅ Hiển thị đề bài (`challenge.question`)
- ✅ Giao diện ghi âm với microphone access
- ✅ Timer hiển thị thời gian ghi âm
- ✅ Nút điều khiển:
  - "Bắt đầu ghi âm" (màu đỏ)
  - "Dừng ghi âm"
  - "Nghe lại" / "Tạm dừng"
  - "Ghi lại" (để ghi đè)
- ✅ Validation: Tối thiểu 10 giây
- ✅ Lưu file audio vào `/public/uploads/speaking/`
- ✅ Tạo submission trong database
- ✅ Hiển thị trạng thái "Đã nộp" với thời gian nộp
- ✅ Không cho phép nộp lại nếu đã nộp

**Luồng hoạt động**:

1. Student click "Bắt đầu ghi âm" → Request microphone permission
2. Ghi âm với timer đếm giây
3. Click "Dừng ghi âm" → Lưu audio blob
4. Click "Nghe lại" để kiểm tra
5. Click "Nộp bài" → Upload audio + tạo submission
6. Gửi đến giáo viên để chấm

**Database**: `speakingSubmissions` table

- `userId`, `challengeId`, `audioUrl`, `duration`, `submittedAt`
- Chờ giáo viên chấm: `overallBandScore`, `teacherFeedback`, `teacherId`

---

### 3. **Writing Exercise Component** ✅

**File**: `components/student/practice-writing.tsx`

**Tính năng**:

- ✅ Hiển thị đề bài (`challenge.question`)
- ✅ Textarea lớn (min-height: 400px) để viết bài
- ✅ Word count tự động (hiển thị số từ)
- ✅ Validation: Tối thiểu 10 từ
- ✅ Lưu nội dung vào database
- ✅ Tạo submission
- ✅ Hiển thị trạng thái "Đã nộp" với thời gian nộp
- ✅ Không cho phép chỉnh sửa sau khi nộp

**Luồng hoạt động**:

1. Student nhập bài viết vào textarea
2. Word count tự động cập nhật
3. Click "Nộp bài" → Lưu content + wordCount
4. Tạo submission trong database
5. Gửi đến giáo viên để chấm

**Database**: `writingSubmissions` table

- `userId`, `challengeId`, `content`, `wordCount`, `submittedAt`
- Chờ giáo viên chấm: `overallBandScore`, `teacherFeedback`, `teacherId`

---

### 4. **API Endpoints** ✅

#### **Writing API**: `/api/student/submissions/writing/route.ts`

**GET**: Check if student has submitted

```typescript
GET /api/student/submissions/writing?challengeId=123
Response: { submission: {...} | null }
```

**POST**: Submit writing

```typescript
POST /api/student/submissions/writing
Body: { challengeId, content, wordCount }
Response: { success: true, submission: {...} }
```

**Validation**:

- ✅ Check authentication
- ✅ Check required fields
- ✅ Prevent duplicate submission
- ✅ Save to database

---

#### **Speaking API**: `/api/student/submissions/speaking/route.ts`

**GET**: Check if student has submitted

```typescript
GET /api/student/submissions/speaking?challengeId=123
Response: { submission: {...} | null }
```

**POST**: Submit speaking (with file upload)

```typescript
POST /api/student/submissions/speaking
FormData: { audio: File, challengeId, duration }
Response: { success: true, submission: {...} }
```

**File handling**:

- ✅ Accept audio file (webm format)
- ✅ Save to `/public/uploads/speaking/{userId}_{challengeId}_{timestamp}.webm`
- ✅ Store URL in database
- ✅ Create directory if not exists

**Validation**:

- ✅ Check authentication
- ✅ Check required fields
- ✅ Prevent duplicate submission
- ✅ Save file and database record

---

### 5. **Practice Page Routing** ✅

**File**: `app/student/courses/[courseId]/lessons/[lessonId]/practice/[challengeId]/page.tsx`

**Thay đổi**: Routing dựa trên `challenge.type`

```typescript
// Route to appropriate component based on challenge type
if (challenge.type === "WRITING") {
  return <WritingPractice challenge={challenge} courseId={courseIdNum} lessonId={lessonIdNum} />;
}

if (challenge.type === "SPEAKING") {
  return <SpeakingPractice challenge={challenge} courseId={courseIdNum} lessonId={lessonIdNum} />;
}

// Default: Multiple choice quiz
return <PracticeQuiz ... />;
```

---

## 📁 Files Created/Modified

### Created:

1. `components/student/practice-writing.tsx` - Writing component
2. `components/student/practice-speaking.tsx` - Speaking component
3. `app/api/student/submissions/writing/route.ts` - Writing API
4. `app/api/student/submissions/speaking/route.ts` - Speaking API

### Modified:

1. `components/student/practice-quiz.tsx` - Fixed question display
2. `app/student/courses/[courseId]/lessons/[lessonId]/practice/[challengeId]/page.tsx` - Added routing

---

## 🎯 Next Steps (Teacher Grading)

### Cần làm tiếp:

1. **Teacher Grading Interface** - Trang giáo viên chấm bài

   - Xem danh sách submissions chưa chấm
   - Nghe/đọc bài làm của học viên
   - Nhập điểm IELTS band scores (0-9)
   - Nhập feedback (tối thiểu 20 ký tự)
   - Lưu kết quả

2. **Learning History Page** - Trang lịch sử học tập

   - Hiển thị tất cả submissions đã chấm
   - Xem bài làm + điểm + feedback
   - Filter theo skill type (Speaking/Writing)
   - Sort theo ngày nộp

3. **Notification System** - Thông báo khi giáo viên chấm xong
   - Email notification
   - In-app notification
   - Badge count

---

## 🚀 Test Flow

### Speaking:

1. Vào bài tập Speaking
2. Click "Bắt đầu ghi âm" → Cho phép microphone
3. Nói trong 10+ giây
4. Click "Dừng ghi âm"
5. Click "Nghe lại" để kiểm tra
6. Click "Nộp bài"
7. Xem trạng thái "Đã nộp"

### Writing:

1. Vào bài tập Writing
2. Nhập bài viết (10+ từ)
3. Xem word count tự động cập nhật
4. Click "Nộp bài"
5. Xem trạng thái "Đã nộp"

---

## ✅ Summary

- ✅ Fixed question display (đề bài vs câu hỏi)
- ✅ Speaking component with audio recording
- ✅ Writing component with word count
- ✅ API endpoints for submissions
- ✅ File upload handling for audio
- ✅ Routing based on challenge type
- ✅ Prevent duplicate submissions
- ✅ **Same UI layout as PracticeQuiz** (header, sidebar, progress bar)
- ✅ **Hide student sidebar** when in practice mode
- ✅ **Auto-update progress** when submission is created
- ✅ **Submissions saved to database** and visible to teachers
- ✅ Ready for teacher grading integration

---

## 🔄 Latest Updates (Fixed Issues)

### Issue 1: Missing Sidebar Hide ✅

**Problem**: Student sidebar was still visible in Writing/Speaking practice.
**Solution**: Added `useEffect` to hide sidebar on mount and restore on unmount.

### Issue 2: Submit Button Not Working ✅

**Problem**: Submissions were not updating progress or being saved properly.
**Solution**:

- Updated API to create/update `challengeProgress` when submission is created
- Set `completed: true` to mark challenge as done
- Added `router.refresh()` after successful submission to update UI
- Submissions are now visible in teacher's submission list

---

## 📊 Database Flow

### When Student Submits Writing:

1. Create record in `writingSubmissions` table
2. Create/update `challengeProgress` with `completed: true`
3. Submission appears in teacher's grading queue
4. Teacher can view content, grade, and provide feedback
5. After grading, student sees results in learning history

### When Student Submits Speaking:

1. Save audio file to `/public/uploads/speaking/`
2. Create record in `speakingSubmissions` table with `audioUrl`
3. Create/update `challengeProgress` with `completed: true`
4. Submission appears in teacher's grading queue
5. Teacher can listen to audio, grade, and provide feedback
6. After grading, student sees results in learning history

**Tất cả đã hoạt động!** 🎉
