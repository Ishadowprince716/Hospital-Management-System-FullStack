# ⚡ QUICK TEST GUIDE - 5 Minutes

## 🎬 Start Testing Now

**Open:** http://127.0.0.1:5501/hospital-management-frontend/patient-dashboard.html

---

## Test #1: Dark Mode (30 seconds)
```
1. Look for MOON icon in top-right header ↗️
2. Click it
   → Should turn DARK (dark background, light text)
3. Click AGAIN
   → Should return to LIGHT mode
4. Refresh page (F5)
   → Should stay in same mode
✅ PASS if all 3 work
```

---

## Test #2: Notifications (1 minute)
```
1. Look for BELL icon in header (next to moon) 🔔
2. See RED BADGE showing "2"
3. Click BELL
   → Dropdown appears with 2 notifications
   → Shows appointment + prescription
4. Click "Clear All"
   → Notifications disappear
   → Badge shows "0"
5. Click outside panel
   → Panel closes
✅ PASS if all work
```

---

## Test #3: Breadcrumb (1 minute)
```
1. Should show "Home / Overview" below header
2. Click "Appointments" in sidebar
   → Breadcrumb changes to "Home / Appointments"
3. Click "Home" in breadcrumb
   → Goes back to Overview
   → Breadcrumb shows "Home / Overview"
✅ PASS if breadcrumb updates
```

---

## Test #4: Appointment Search (1.5 minutes)
```
1. Click "Appointments" in sidebar
2. See FILTER BAR with:
   - Search box
   - Status dropdown
   - Sort dropdown
3. Type doctor name in search
   → Results filter in real-time
4. Select Status = "Upcoming"
   → Shows only future appointments
5. Try Sort = "Oldest First"
   → Appointments reorder
✅ PASS if filters work
```

---

## Test #5: Prescription Filter (1.5 minutes)
```
1. Click "Prescriptions" in sidebar
2. See FILTER BAR above cards
3. Type medicine name (e.g., "Blood")
   → Cards filter to match
4. Select Status = "Active"
   → Shows only green-badge prescriptions
5. Try Sort
   → Prescriptions reorder
✅ PASS if filters work
```

---

## Test #6: Console Check (1 minute)
```
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for RED ERROR messages
   → Should be NONE
4. Type: typeof window.toggleTheme
   → Should say "function"
✅ PASS if no errors
```

---

## 📊 Quick Result Summary

| Feature | Working? | Notes |
|---------|----------|-------|
| Dark Mode | [ ] YES [ ] NO | Moon/Sun icon works |
| Notifications | [ ] YES [ ] NO | Bell shows 2 items |
| Breadcrumb | [ ] YES [ ] NO | Updates on navigate |
| Apt Filter | [ ] YES [ ] NO | Search/filter works |
| Rx Filter | [ ] YES [ ] NO | Search/filter works |
| Console | [ ] YES [ ] NO | No errors |

---

## 🎯 Overall: [ ] ALL PASS [ ] SOME FAIL

**If ALL PASS:** ✅ Ready for Phase 2

**If SOME FAIL:** ⚠️ Check browser console for errors

---

**Total Test Time:** ~5 minutes  
**Start Time:** _______  
**End Time:** _______  
**Result:** PASS / FAIL
