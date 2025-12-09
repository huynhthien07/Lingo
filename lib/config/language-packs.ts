/**
 * Language Packs Configuration
 * 
 * This file contains all UI translations for the application.
 * Instead of managing translations through admin panel, they are defined here as code.
 * 
 * Structure:
 * - locale: Language code (en, vi, fr, es, etc.)
 * - namespace: Feature/module name (common, auth, course, etc.)
 * - key: Translation key (button.submit, label.email, etc.)
 * - value: Translated text
 */

export interface LanguagePack {
  locale: string;
  namespace: string;
  key: string;
  value: string;
}

export const LANGUAGE_PACKS: LanguagePack[] = [
  // ============================================================================
  // ENGLISH (en) - Common
  // ============================================================================
  {
    locale: "en",
    namespace: "common",
    key: "button.submit",
    value: "Submit",
  },
  {
    locale: "en",
    namespace: "common",
    key: "button.cancel",
    value: "Cancel",
  },
  {
    locale: "en",
    namespace: "common",
    key: "button.save",
    value: "Save",
  },
  {
    locale: "en",
    namespace: "common",
    key: "button.delete",
    value: "Delete",
  },
  {
    locale: "en",
    namespace: "common",
    key: "button.edit",
    value: "Edit",
  },
  {
    locale: "en",
    namespace: "common",
    key: "button.create",
    value: "Create",
  },
  {
    locale: "en",
    namespace: "common",
    key: "label.email",
    value: "Email",
  },
  {
    locale: "en",
    namespace: "common",
    key: "label.password",
    value: "Password",
  },
  {
    locale: "en",
    namespace: "common",
    key: "label.name",
    value: "Name",
  },

  // ============================================================================
  // ENGLISH (en) - Authentication
  // ============================================================================
  {
    locale: "en",
    namespace: "auth",
    key: "login.title",
    value: "Sign In",
  },
  {
    locale: "en",
    namespace: "auth",
    key: "login.button",
    value: "Sign In",
  },
  {
    locale: "en",
    namespace: "auth",
    key: "signup.title",
    value: "Sign Up",
  },
  {
    locale: "en",
    namespace: "auth",
    key: "signup.button",
    value: "Sign Up",
  },
  {
    locale: "en",
    namespace: "auth",
    key: "logout.button",
    value: "Sign Out",
  },

  // ============================================================================
  // ENGLISH (en) - Course
  // ============================================================================
  {
    locale: "en",
    namespace: "course",
    key: "list.title",
    value: "Courses",
  },
  {
    locale: "en",
    namespace: "course",
    key: "create.title",
    value: "Create Course",
  },
  {
    locale: "en",
    namespace: "course",
    key: "edit.title",
    value: "Edit Course",
  },
  {
    locale: "en",
    namespace: "course",
    key: "detail.title",
    value: "Course Details",
  },

  // ============================================================================
  // VIETNAMESE (vi) - Common
  // ============================================================================
  {
    locale: "vi",
    namespace: "common",
    key: "button.submit",
    value: "Gửi",
  },
  {
    locale: "vi",
    namespace: "common",
    key: "button.cancel",
    value: "Hủy",
  },
  {
    locale: "vi",
    namespace: "common",
    key: "button.save",
    value: "Lưu",
  },
  {
    locale: "vi",
    namespace: "common",
    key: "button.delete",
    value: "Xóa",
  },
  {
    locale: "vi",
    namespace: "common",
    key: "button.edit",
    value: "Sửa",
  },
  {
    locale: "vi",
    namespace: "common",
    key: "button.create",
    value: "Tạo mới",
  },
  {
    locale: "vi",
    namespace: "common",
    key: "label.email",
    value: "Email",
  },
  {
    locale: "vi",
    namespace: "common",
    key: "label.password",
    value: "Mật khẩu",
  },
  {
    locale: "vi",
    namespace: "common",
    key: "label.name",
    value: "Tên",
  },

  // ============================================================================
  // VIETNAMESE (vi) - Authentication
  // ============================================================================
  {
    locale: "vi",
    namespace: "auth",
    key: "login.title",
    value: "Đăng nhập",
  },
  {
    locale: "vi",
    namespace: "auth",
    key: "login.button",
    value: "Đăng nhập",
  },
  {
    locale: "vi",
    namespace: "auth",
    key: "signup.title",
    value: "Đăng ký",
  },
  {
    locale: "vi",
    namespace: "auth",
    key: "signup.button",
    value: "Đăng ký",
  },
  {
    locale: "vi",
    namespace: "auth",
    key: "logout.button",
    value: "Đăng xuất",
  },

  // ============================================================================
  // VIETNAMESE (vi) - Course
  // ============================================================================
  {
    locale: "vi",
    namespace: "course",
    key: "list.title",
    value: "Khóa học",
  },
  {
    locale: "vi",
    namespace: "course",
    key: "create.title",
    value: "Tạo khóa học",
  },
  {
    locale: "vi",
    namespace: "course",
    key: "edit.title",
    value: "Chỉnh sửa khóa học",
  },
  {
    locale: "vi",
    namespace: "course",
    key: "detail.title",
    value: "Chi tiết khóa học",
  },

  // ============================================================================
  // ENGLISH (en) - User Management
  // ============================================================================
  {
    locale: "en",
    namespace: "user",
    key: "list.title",
    value: "Users",
  },
  {
    locale: "en",
    namespace: "user",
    key: "create.title",
    value: "Create User",
  },
  {
    locale: "en",
    namespace: "user",
    key: "edit.title",
    value: "Edit User",
  },
  {
    locale: "en",
    namespace: "user",
    key: "detail.title",
    value: "User Details",
  },
  {
    locale: "en",
    namespace: "user",
    key: "field.username",
    value: "Username",
  },
  {
    locale: "en",
    namespace: "user",
    key: "field.role",
    value: "Role",
  },
  {
    locale: "en",
    namespace: "user",
    key: "field.status",
    value: "Status",
  },
  {
    locale: "en",
    namespace: "user",
    key: "status.active",
    value: "Active",
  },
  {
    locale: "en",
    namespace: "user",
    key: "status.blocked",
    value: "Blocked",
  },

  // ============================================================================
  // VIETNAMESE (vi) - User Management
  // ============================================================================
  {
    locale: "vi",
    namespace: "user",
    key: "list.title",
    value: "Người dùng",
  },
  {
    locale: "vi",
    namespace: "user",
    key: "create.title",
    value: "Tạo người dùng",
  },
  {
    locale: "vi",
    namespace: "user",
    key: "edit.title",
    value: "Chỉnh sửa người dùng",
  },
  {
    locale: "vi",
    namespace: "user",
    key: "detail.title",
    value: "Chi tiết người dùng",
  },
  {
    locale: "vi",
    namespace: "user",
    key: "field.username",
    value: "Tên đăng nhập",
  },
  {
    locale: "vi",
    namespace: "user",
    key: "field.role",
    value: "Vai trò",
  },
  {
    locale: "vi",
    namespace: "user",
    key: "field.status",
    value: "Trạng thái",
  },
  {
    locale: "vi",
    namespace: "user",
    key: "status.active",
    value: "Hoạt động",
  },
  {
    locale: "vi",
    namespace: "user",
    key: "status.blocked",
    value: "Bị khóa",
  },

  // ============================================================================
  // ENGLISH (en) - Dashboard
  // ============================================================================
  {
    locale: "en",
    namespace: "dashboard",
    key: "title",
    value: "Dashboard",
  },
  {
    locale: "en",
    namespace: "dashboard",
    key: "welcome",
    value: "Welcome back",
  },
  {
    locale: "en",
    namespace: "dashboard",
    key: "stats.users",
    value: "Total Users",
  },
  {
    locale: "en",
    namespace: "dashboard",
    key: "stats.courses",
    value: "Total Courses",
  },
  {
    locale: "en",
    namespace: "dashboard",
    key: "stats.lessons",
    value: "Total Lessons",
  },

  // ============================================================================
  // VIETNAMESE (vi) - Dashboard
  // ============================================================================
  {
    locale: "vi",
    namespace: "dashboard",
    key: "title",
    value: "Bảng điều khiển",
  },
  {
    locale: "vi",
    namespace: "dashboard",
    key: "welcome",
    value: "Chào mừng trở lại",
  },
  {
    locale: "vi",
    namespace: "dashboard",
    key: "stats.users",
    value: "Tổng người dùng",
  },
  {
    locale: "vi",
    namespace: "dashboard",
    key: "stats.courses",
    value: "Tổng khóa học",
  },
  {
    locale: "vi",
    namespace: "dashboard",
    key: "stats.lessons",
    value: "Tổng bài học",
  },

  // ============================================================================
  // ENGLISH (en) - Lesson
  // ============================================================================
  {
    locale: "en",
    namespace: "lesson",
    key: "list.title",
    value: "Lessons",
  },
  {
    locale: "en",
    namespace: "lesson",
    key: "create.title",
    value: "Create Lesson",
  },
  {
    locale: "en",
    namespace: "lesson",
    key: "edit.title",
    value: "Edit Lesson",
  },
  {
    locale: "en",
    namespace: "lesson",
    key: "start.button",
    value: "Start Lesson",
  },
  {
    locale: "en",
    namespace: "lesson",
    key: "complete.button",
    value: "Complete Lesson",
  },

  // ============================================================================
  // VIETNAMESE (vi) - Lesson
  // ============================================================================
  {
    locale: "vi",
    namespace: "lesson",
    key: "list.title",
    value: "Bài học",
  },
  {
    locale: "vi",
    namespace: "lesson",
    key: "create.title",
    value: "Tạo bài học",
  },
  {
    locale: "vi",
    namespace: "lesson",
    key: "edit.title",
    value: "Chỉnh sửa bài học",
  },
  {
    locale: "vi",
    namespace: "lesson",
    key: "start.button",
    value: "Bắt đầu bài học",
  },
  {
    locale: "vi",
    namespace: "lesson",
    key: "complete.button",
    value: "Hoàn thành bài học",
  },

  // ============================================================================
  // ENGLISH (en) - Exercise/Challenge
  // ============================================================================
  {
    locale: "en",
    namespace: "exercise",
    key: "type.select",
    value: "Select the correct answer",
  },
  {
    locale: "en",
    namespace: "exercise",
    key: "type.assist",
    value: "Fill in the blank",
  },
  {
    locale: "en",
    namespace: "exercise",
    key: "check.button",
    value: "Check",
  },
  {
    locale: "en",
    namespace: "exercise",
    key: "continue.button",
    value: "Continue",
  },
  {
    locale: "en",
    namespace: "exercise",
    key: "correct",
    value: "Correct!",
  },
  {
    locale: "en",
    namespace: "exercise",
    key: "incorrect",
    value: "Incorrect. Try again!",
  },

  // ============================================================================
  // VIETNAMESE (vi) - Exercise/Challenge
  // ============================================================================
  {
    locale: "vi",
    namespace: "exercise",
    key: "type.select",
    value: "Chọn đáp án đúng",
  },
  {
    locale: "vi",
    namespace: "exercise",
    key: "type.assist",
    value: "Điền vào chỗ trống",
  },
  {
    locale: "vi",
    namespace: "exercise",
    key: "check.button",
    value: "Kiểm tra",
  },
  {
    locale: "vi",
    namespace: "exercise",
    key: "continue.button",
    value: "Tiếp tục",
  },
  {
    locale: "vi",
    namespace: "exercise",
    key: "correct",
    value: "Chính xác!",
  },
  {
    locale: "vi",
    namespace: "exercise",
    key: "incorrect",
    value: "Sai rồi. Thử lại nhé!",
  },

  // ============================================================================
  // ENGLISH (en) - Navigation
  // ============================================================================
  {
    locale: "en",
    namespace: "nav",
    key: "home",
    value: "Home",
  },
  {
    locale: "en",
    namespace: "nav",
    key: "courses",
    value: "Courses",
  },
  {
    locale: "en",
    namespace: "nav",
    key: "learn",
    value: "Learn",
  },
  {
    locale: "en",
    namespace: "nav",
    key: "practice",
    value: "Practice",
  },
  {
    locale: "en",
    namespace: "nav",
    key: "leaderboard",
    value: "Leaderboard",
  },
  {
    locale: "en",
    namespace: "nav",
    key: "shop",
    value: "Shop",
  },
  {
    locale: "en",
    namespace: "nav",
    key: "settings",
    value: "Settings",
  },

  // ============================================================================
  // VIETNAMESE (vi) - Navigation
  // ============================================================================
  {
    locale: "vi",
    namespace: "nav",
    key: "home",
    value: "Trang chủ",
  },
  {
    locale: "vi",
    namespace: "nav",
    key: "courses",
    value: "Khóa học",
  },
  {
    locale: "vi",
    namespace: "nav",
    key: "learn",
    value: "Học",
  },
  {
    locale: "vi",
    namespace: "nav",
    key: "practice",
    value: "Luyện tập",
  },
  {
    locale: "vi",
    namespace: "nav",
    key: "leaderboard",
    value: "Bảng xếp hạng",
  },
  {
    locale: "vi",
    namespace: "nav",
    key: "shop",
    value: "Cửa hàng",
  },
  {
    locale: "vi",
    namespace: "nav",
    key: "settings",
    value: "Cài đặt",
  },

  // ============================================================================
  // ENGLISH (en) - Errors & Messages
  // ============================================================================
  {
    locale: "en",
    namespace: "message",
    key: "error.generic",
    value: "Something went wrong. Please try again.",
  },
  {
    locale: "en",
    namespace: "message",
    key: "error.network",
    value: "Network error. Please check your connection.",
  },
  {
    locale: "en",
    namespace: "message",
    key: "success.saved",
    value: "Saved successfully!",
  },
  {
    locale: "en",
    namespace: "message",
    key: "success.deleted",
    value: "Deleted successfully!",
  },
  {
    locale: "en",
    namespace: "message",
    key: "success.created",
    value: "Created successfully!",
  },
  {
    locale: "en",
    namespace: "message",
    key: "confirm.delete",
    value: "Are you sure you want to delete this?",
  },

  // ============================================================================
  // VIETNAMESE (vi) - Errors & Messages
  // ============================================================================
  {
    locale: "vi",
    namespace: "message",
    key: "error.generic",
    value: "Đã có lỗi xảy ra. Vui lòng thử lại.",
  },
  {
    locale: "vi",
    namespace: "message",
    key: "error.network",
    value: "Lỗi mạng. Vui lòng kiểm tra kết nối.",
  },
  {
    locale: "vi",
    namespace: "message",
    key: "success.saved",
    value: "Lưu thành công!",
  },
  {
    locale: "vi",
    namespace: "message",
    key: "success.deleted",
    value: "Xóa thành công!",
  },
  {
    locale: "vi",
    namespace: "message",
    key: "success.created",
    value: "Tạo thành công!",
  },
  {
    locale: "vi",
    namespace: "message",
    key: "confirm.delete",
    value: "Bạn có chắc chắn muốn xóa?",
  },
];

/**
 * Get translation by locale, namespace, and key
 */
export function getTranslation(
  locale: string,
  namespace: string,
  key: string
): string {
  const pack = LANGUAGE_PACKS.find(
    (p) => p.locale === locale && p.namespace === namespace && p.key === key
  );
  return pack?.value || key;
}

/**
 * Get all translations for a specific locale
 */
export function getTranslationsByLocale(locale: string): LanguagePack[] {
  return LANGUAGE_PACKS.filter((p) => p.locale === locale);
}

/**
 * Get all translations for a specific namespace
 */
export function getTranslationsByNamespace(
  locale: string,
  namespace: string
): Record<string, string> {
  const packs = LANGUAGE_PACKS.filter(
    (p) => p.locale === locale && p.namespace === namespace
  );
  return packs.reduce((acc, pack) => {
    acc[pack.key] = pack.value;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): string[] {
  return Array.from(new Set(LANGUAGE_PACKS.map((p) => p.locale)));
}

