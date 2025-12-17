# Student Test Feature Documentation

## Tổng quan

Tính năng bài test cho phép học sinh làm các bài kiểm tra với giao diện chuyên nghiệp, bao gồm:
- Danh sách bài test có sẵn trong hệ thống
- Giao diện làm bài với layout 3 cột
- Đồng hồ đếm ngược thời gian
- Tự động lưu câu trả lời
- Hiển thị kết quả chi tiết

## Cấu trúc Database

### Tests Table
- `id`: ID bài test
- `title`: Tiêu đề bài test
- `description`: Mô tả
- `testType`: Loại test (PRACTICE, MOCK_TEST, FULL_TEST, ADMISSION_TEST, SPEAKING_TEST, WRITING_TEST)
- `examType`: Loại kỳ thi (IELTS, TOEFL, TOEIC, GENERAL)
- `duration`: Thời gian làm bài (phút)

### Test Sections Table
- `id`: ID phần thi
- `testId`: ID bài test
- `title`: Tiêu đề phần
- `skillType`: Kỹ năng (LISTENING, READING, WRITING, SPEAKING, VOCABULARY, GRAMMAR)
- `order`: Thứ tự
- `passage`: Đoạn văn (cho Reading)
- `audioSrc`: File audio (cho Listening)

### Test Questions Table
- `id`: ID câu hỏi
- `sectionId`: ID phần thi
- `questionText`: Nội dung câu hỏi
- `order`: Thứ tự
- `points`: Điểm số

### Test Question Options Table
- `id`: ID đáp án
- `questionId`: ID câu hỏi
- `optionText`: Nội dung đáp án
- `isCorrect`: Đáp án đúng hay không
- `order`: Thứ tự

### Test Attempts Table
- `id`: ID lần làm bài
- `userId`: ID học sinh
- `testId`: ID bài test
- `status`: Trạng thái (IN_PROGRESS, COMPLETED, ABANDONED)
- `score`: Điểm số
- `totalPoints`: Tổng điểm
- `bandScore`: Band score IELTS
- `startedAt`: Thời gian bắt đầu
- `completedAt`: Thời gian hoàn thành

### Test Answers Table
- `id`: ID câu trả lời
- `attemptId`: ID lần làm bài
- `questionId`: ID câu hỏi
- `selectedOptionId`: ID đáp án được chọn
- `textAnswer`: Câu trả lời dạng text
- `isCorrect`: Đúng hay sai
- `pointsEarned`: Điểm đạt được

## API Routes

### GET /api/student/tests
Lấy danh sách tất cả bài test với lịch sử làm bài của học sinh

**Query Parameters:**
- `testType`: Lọc theo loại test
- `examType`: Lọc theo loại kỳ thi

**Response:**
```json
{
  "tests": [
    {
      "id": 1,
      "title": "IELTS Mock Test 1",
      "testType": "MOCK_TEST",
      "examType": "IELTS",
      "duration": 120,
      "totalQuestions": 40,
      "attemptCount": 2,
      "lastAttempt": {...},
      "sections": [...]
    }
  ],
  "total": 10
}
```

### GET /api/student/tests/[testId]
Lấy chi tiết bài test với tất cả sections và questions

### POST /api/student/tests/[testId]/start
Bắt đầu làm bài test mới

**Response:**
```json
{
  "id": 123,
  "userId": "user_xxx",
  "testId": 1,
  "status": "IN_PROGRESS",
  "totalPoints": 40,
  "startedAt": "2024-01-01T10:00:00Z"
}
```

### POST /api/student/tests/attempts/[attemptId]/answer
Lưu câu trả lời cho một câu hỏi

**Request Body:**
```json
{
  "questionId": 1,
  "selectedOptionId": 3,
  "textAnswer": null
}
```

### POST /api/student/tests/attempts/[attemptId]/complete
Hoàn thành và chấm điểm bài test

**Response:**
```json
{
  "attempt": {...},
  "totalScore": 35,
  "totalPoints": 40,
  "percentage": 88,
  "bandScore": 8.0
}
```

### GET /api/student/tests/attempts/[attemptId]
Lấy chi tiết lần làm bài với tất cả câu trả lời

## Components

### TestsListClient
Hiển thị danh sách bài test với:
- Tìm kiếm theo tên
- Lọc theo loại test và loại kỳ thi
- Hiển thị thông tin: thời gian, số câu hỏi, kỹ năng
- Hiển thị lịch sử làm bài

### TestTakingClient
Component chính cho việc làm bài test với layout 3 cột:

**Left Sidebar:**
- TestTimer: Đồng hồ đếm ngược
- TestInstructions: Lưu ý khi làm bài

**Center:**
- TestQuestionDisplay: Hiển thị câu hỏi và đáp án
- Navigation buttons (Previous/Next)

**Right Sidebar:**
- TestQuestionNavigation: Danh mục câu hỏi theo section
- Hiển thị trạng thái: đã trả lời, chưa trả lời, câu hiện tại

### TestResultClient
Hiển thị kết quả sau khi hoàn thành:
- Tổng quan: % đúng, band score, số câu đúng, điểm số
- Chi tiết theo từng section
- Nút làm lại hoặc về trang chủ

## Features

### 1. Danh sách bài test
- Hiển thị tất cả bài test trong hệ thống
- Lọc theo loại test và loại kỳ thi
- Tìm kiếm theo tên
- Hiển thị số lần đã làm và điểm gần nhất

### 2. Làm bài test
- Xác nhận trước khi bắt đầu
- Đồng hồ đếm ngược tự động
- Tự động lưu câu trả lời khi chọn
- Navigation giữa các câu hỏi
- Hiển thị progress (đã trả lời bao nhiêu câu)
- Tự động nộp bài khi hết giờ
- Xác nhận trước khi nộp bài

### 3. Kết quả
- Hiển thị điểm tổng quan
- Band score IELTS
- Chi tiết theo từng section
- Có thể làm lại

## Navigation

Đã thêm link "Tests" vào Student Sidebar với icon ClipboardList

## Notes

- Sidebar tự động ẩn khi bắt đầu làm bài test
- Câu trả lời được lưu tự động khi chọn
- Hỗ trợ nhiều loại test: Practice, Mock Test, Full Test, Admission Test, Speaking Test, Writing Test
- Band score được tính tự động dựa trên % đúng (có thể customize thuật toán)

