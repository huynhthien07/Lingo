# Exercise System Guide - Hướng Dẫn Hệ Thống Bài Tập

## Tổng Quan

Hệ thống bài tập đã được cấu hình lại để hỗ trợ 2 dạng chính:

### 1. **Multiple Choice (Chọn đáp án)**
- Mỗi bài tập có nhiều câu hỏi
- Mỗi câu hỏi có nhiều đáp án (options)
- Đánh dấu đáp án đúng/sai
- Hỗ trợ hình ảnh cho đáp án (Multiple Choice)
- Hỗ trợ audio cho đáp án (Listening exercises)

### 2. **Fill in the Blank (Điền vào chỗ trống)**
- Mỗi bài tập có nhiều câu hỏi
- Mỗi câu hỏi có text với `___` (ba dấu gạch dưới) để đánh dấu chỗ trống
- Mỗi câu hỏi có nhiều đáp án đúng (answers)

## Cấu Trúc Database

```
Exercise (challenges)
  ├── Question 1 (questions)
  │   ├── Option 1 (challenge_options)
  │   ├── Option 2
  │   └── Option 3
  ├── Question 2
  │   ├── Option 1
  │   └── Option 2
  └── Question 3
      └── Option 1
```

### Bảng `questions`
- `id`: ID câu hỏi
- `challenge_id`: ID bài tập
- `text`: Nội dung câu hỏi (HTML từ Rich Text Editor)
- `order`: Thứ tự câu hỏi

### Bảng `challenge_options`
- `id`: ID đáp án
- `question_id`: ID câu hỏi (mới)
- `challenge_id`: ID bài tập (giữ lại cho backward compatibility)
- `text`: Nội dung đáp án (HTML từ Rich Text Editor)
- `correct`: Đáp án đúng (true) hay sai (false)
- `image_src`: URL hình ảnh (optional)
- `audio_src`: URL audio (optional)
- `order`: Thứ tự đáp án

## Cách Sử Dụng

### 1. Tạo Exercise
1. Vào lesson detail page
2. Click "Add Exercise"
3. Chọn skill category (LISTENING/READING/WRITING/SPEAKING)
4. Chọn exercise type (Multiple Choice, Form Completion, etc.)
5. Điền thông tin exercise (question, passage, audio, image)
6. Click "Create Exercise"

### 2. Thêm Questions
1. Vào exercise detail page
2. Click "Add Question"
3. Nhập nội dung câu hỏi (sử dụng Rich Text Editor)
   - Với Fill in the Blank: Sử dụng `___` để đánh dấu chỗ trống
   - Ví dụ: "The capital of France is ___"
4. Click "Save Question"

### 3. Thêm Options/Answers
1. Trong mỗi question card, click "Add Option" hoặc "Add Answer"
2. Nhập nội dung đáp án (sử dụng Rich Text Editor)
3. Upload hình ảnh (nếu là Multiple Choice)
4. Upload audio (nếu là Listening exercise)
5. Đánh dấu "This is the correct answer" nếu là đáp án đúng
6. Click "Save"

### 4. Quản Lý Questions
- **Move Up/Down**: Sắp xếp thứ tự câu hỏi
- **Delete**: Xóa câu hỏi (sẽ xóa tất cả options của câu hỏi đó)
- **Show/Hide Options**: Ẩn/hiện danh sách đáp án

### 5. Quản Lý Options
- **Delete**: Xóa đáp án
- **Correct/Incorrect Badge**: Hiển thị đáp án đúng (màu xanh) hoặc sai (màu xám)

## API Routes

### Questions
- `POST /api/teacher/exercises/[id]/questions` - Tạo question mới
- `GET /api/teacher/exercises/[id]/questions` - Lấy danh sách questions
- `PUT /api/teacher/exercises/[id]/questions/[questionId]` - Cập nhật question
- `DELETE /api/teacher/exercises/[id]/questions/[questionId]` - Xóa question
- `PUT /api/teacher/exercises/[id]/questions/[questionId]/reorder` - Sắp xếp thứ tự

### Options
- `POST /api/teacher/questions/[questionId]/options` - Tạo option mới
- `GET /api/teacher/questions/[questionId]/options` - Lấy danh sách options
- `PUT /api/teacher/questions/[questionId]/options/[optionId]` - Cập nhật option
- `DELETE /api/teacher/questions/[questionId]/options/[optionId]` - Xóa option

## Components

### ExerciseQuestionsManager
- Component chính quản lý danh sách questions
- Props:
  - `exerciseId`: ID bài tập
  - `exerciseType`: Loại bài tập (LISTENING_MULTIPLE_CHOICE, etc.)
  - `questions`: Danh sách questions
  - `onUpdate`: Callback khi có thay đổi

### QuestionCard
- Hiển thị từng question với options
- Hỗ trợ Move Up/Down, Delete
- Hiển thị số lượng options

### OptionsManager (question-options-manager.tsx)
- Quản lý options cho mỗi question
- Hỗ trợ Add/Delete options
- Hiển thị Correct/Incorrect badge
- Hỗ trợ Image/Audio upload

### AddQuestionForm
- Form modal để thêm question mới
- Rich Text Editor cho question text
- Hướng dẫn sử dụng `___` cho Fill in the Blank

## Rich Text Editor

Hỗ trợ các tính năng:
- **Bold** (Ctrl+B)
- **Italic** (Ctrl+I)
- **Underline** (Ctrl+U)
- **Highlight** (màu vàng)
- **Text Color** (đen, đỏ, xanh dương, xanh lá)
- **Font Size** (12px - 24px)
- **Clear Formatting**

## Lưu Ý

1. **Backward Compatibility**: Hệ thống vẫn giữ `challengeOptions.challengeId` để tương thích với exercises cũ
2. **Cascade Delete**: Khi xóa question, tất cả options của question đó sẽ bị xóa
3. **Order Management**: Thứ tự questions và options được quản lý tự động
4. **Teacher Access**: Chỉ teachers được assign vào course mới có quyền chỉnh sửa

## Testing Flow

1. ✅ Tạo exercise mới
2. ✅ Thêm questions vào exercise
3. ✅ Thêm options vào mỗi question
4. ✅ Sắp xếp thứ tự questions
5. ✅ Xóa options
6. ✅ Xóa questions
7. ✅ Upload images/audio cho options
8. ✅ Đánh dấu correct/incorrect answers

