# Migration Checklist

## 📋 API Routes Migration Progress

Track your progress as you migrate each API route to use controllers.

---

## ✅ Completed

### **Course Management Routes** ✅

- [x] `app/api/courses/route.ts` - GET, POST
- [x] `app/api/courses/[courseId]/route.ts` - GET, PUT, DELETE
- [x] `app/api/courses/bulk-delete/route.ts` - DELETE

### **Unit Routes** ✅

- [x] `app/api/units/route.ts` - GET, POST
- [x] `app/api/units/[unitId]/route.ts` - GET, PUT, DELETE
- [x] `app/api/units/bulk-delete/route.ts` - DELETE

### **Lesson Routes** ✅

- [x] `app/api/lessons/route.ts` - GET, POST
- [x] `app/api/lessons/[lessonId]/route.ts` - GET, PUT, DELETE
- [x] `app/api/lessons/bulk-update/route.ts` - PUT
- [x] `app/api/lessons/bulk-delete/route.ts` - DELETE

### **Challenge Routes** ✅

- [x] `app/api/challenges/route.ts` - GET, POST
- [x] `app/api/challenges/[challengeId]/route.ts` - GET, PUT, DELETE
- [x] `app/api/challenges/bulk-delete/route.ts` - DELETE

### **Auth & Admin Routes** ✅

- [x] `app/api/auth/login/route.ts` - GET, POST
- [x] `app/api/admin/status/route.ts` - GET

---

### **User Routes** ✅

- [x] `app/api/users/route.ts` - GET, POST
- [x] `app/api/users/[userId]/route.ts` - GET, PUT
- [x] `app/api/users/bulk-delete/route.ts` - DELETE
- [x] `app/api/users/bulk-update/route.ts` - PUT

### **Admin User Routes** ✅

- [x] `app/api/admin-users/route.ts` - GET, POST
- [x] `app/api/admin-users/[id]/route.ts` - GET, PUT, DELETE
- [x] `app/api/admin-users/bulk-delete/route.ts` - DELETE
- [x] `app/api/admin-users/bulk-update/route.ts` - PUT

---

## 🔄 In Progress

Currently no routes in progress.

---

### **Challenge Options Routes** ✅

- [x] `app/api/challengeOptions/route.ts` - GET, POST
- [x] `app/api/challengeOptions/[challengeOptionId]/route.ts` - GET, PUT, DELETE
- [x] `app/api/challengeOptions/bulk-delete/route.ts` - DELETE

### **Test Routes** ✅

- [x] `app/api/test/[testId]/route.ts` - GET

---

## 📚 Remaining Routes (Priority: MEDIUM)

---

## 🎨 Other Routes (Priority: LOW)

### **Role Routes**

- [ ] `app/api/roles/route.ts` - GET, POST
- [ ] `app/api/roles/[roleId]/route.ts` - GET, PUT, DELETE

### **Settings Routes**

- [ ] `app/api/settings/route.ts` - GET, POST
- [ ] `app/api/settings/[settingId]/route.ts` - GET, PUT, DELETE

### **Language Pack Routes**

- [ ] `app/api/language-packs/route.ts` - GET, POST
- [ ] `app/api/language-packs/[packId]/route.ts` - GET, PUT, DELETE

### **Chat Routes**

- [ ] `app/api/chat/route.ts` - POST

### **Webhook Routes**

- [ ] `app/api/webhooks/stripe/route.ts` - POST

### **Analytics Routes**

- [ ] `app/api/analytics/overview/route.ts` - GET
- [ ] `app/api/analytics/users/route.ts` - GET
- [ ] `app/api/analytics/content/route.ts` - GET
- [ ] `app/api/analytics/lessons/route.ts` - GET
- [ ] `app/api/analytics/points/route.ts` - GET
- [ ] `app/api/analytics/visits/route.ts` - GET
- [ ] `app/api/analytics/track-visit/route.ts` - POST
- [ ] `app/api/analytics/track-duration/route.ts` - POST

---

## 📊 Progress Summary

| Category            | Total  | Completed | Remaining |
| ------------------- | ------ | --------- | --------- |
| Course Management   | 18     | 18        | 0         |
| User Routes         | 8      | 8         | 0         |
| Auth & Admin        | 2      | 2         | 0         |
| Challenge Options   | 3      | 3         | 0         |
| Test Routes         | 1      | 1         | 0         |
| Other Routes (Mock) | 17     | 0         | 17        |
| **TOTAL**           | **49** | **32**    | **17**    |

**Progress: 65% Complete** 🎉🎉🎉

---

## 🎯 Recommended Order

1. **Start with simple routes** (GET only)

   - `app/api/admin/status/route.ts`
   - `app/api/roles/route.ts`

2. **Then CRUD routes** (GET, POST, PUT, DELETE)

   - `app/api/courses/route.ts`
   - `app/api/units/route.ts`

3. **Complex routes with relations**

   - `app/api/users/route.ts`
   - `app/api/lessons/route.ts`

4. **Special routes**
   - `app/api/chat/route.ts`
   - `app/api/webhooks/stripe/route.ts`

---

## ✅ How to Mark as Complete

When you finish migrating a route:

1. Test the route works correctly
2. Check all HTTP methods (GET, POST, PUT, DELETE)
3. Verify error handling
4. Mark the checkbox with `[x]`
5. Update the Progress Summary table

---

**Good luck with the migration!** 🚀

Refer to [MVC_MIGRATION_GUIDE.md](MVC_MIGRATION_GUIDE.md) for step-by-step instructions.
