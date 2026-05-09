# 🏥 Hospital Management System - Test Credentials

## 📋 Quick Reference Guide

### 🔗 Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Test Page**: http://localhost:3000/api-test.html
- **Sample Data Generator**: http://localhost:3000/register-sample-data.html

---

## 👥 Sample Users (After Registration)

### 👨‍⚕️ DOCTORS (Password: `doctor123`)

| Username | Full Name | Specialization | Fee | Department |
|----------|-----------|----------------|-----|------------|
| `doctor1` | Dr. Rahul Singh Kushwaha | General Physician | ₹500 | General Medicine |
| `dr.priya` | Dr. Priya Sharma | Cardiology | ₹1200 | Heart & Vascular |
| `dr.amit` | Dr. Amit Kumar | Dermatology | ₹800 | Skin & Cosmetic |
| `dr.sneha` | Dr. Sneha Reddy | Pediatrics | ₹900 | Child Health |
| `dr.rajesh` | Dr. Rajesh Verma | Orthopedics | ₹1500 | Bone & Joint |
| `dr.ananya` | Dr. Ananya Gupta | Gynecology | ₹1000 | Women's Health |
| `dr.vikram` | Dr. Vikram Singh | Neurology | ₹1800 | Brain & Nervous System |
| `dr.meera` | Dr. Meera Patel | ENT | ₹700 | Ear, Nose & Throat |

### 👤 PATIENTS (Password: `patient123`)

| Username | Full Name | Blood Group | Gender | City |
|----------|-----------|-------------|--------|------|
| `patient1` | Rahul Kushwah | A+ | Male | Bangalore |
| `patient2` | Arjun Mehta | O+ | Male | Bangalore |
| `patient3` | Kavya Nair | A+ | Female | Mumbai |
| `patient4` | Rohan Desai | B+ | Male | Kolkata |
| `patient5` | Ishita Joshi | AB+ | Female | Chennai |
| `patient6` | Aditya Rao | O- | Male | Hyderabad |
| `patient7` | Pooja Iyer | A- | Female | Bangalore |
| `patient8` | Nikhil Shah | B- | Male | Pune |
| `patient9` | Riya Chopra | AB- | Female | Gurgaon |
| `patient10` | Varun Malhotra | O+ | Male | Delhi |

### 👨‍💼 ADMIN (Password: `admin123`)

| Username | Full Name | Role |
|----------|-----------|------|
| `admin` | System Administrator | ADMIN |

---

## 🚀 Quick Start Guide

### 1. Register Sample Data
1. Open: http://localhost:3000/register-sample-data.html
2. Click "🚀 Register All Sample Users"
3. Wait for completion (creates 7 doctors + 9 patients)

### 2. Login as Patient
1. Go to: http://localhost:3000
2. Username: `patient1` or any patient username
3. Password: `patient123`
4. Role: **PATIENT**
5. Click Login

### 3. Book an Appointment
1. After login, click "Book Appointment"
2. Select a doctor from the dropdown (you'll see all 8 doctors!)
3. Choose date and time
4. Enter reason
5. Submit

### 4. Login as Doctor
1. Go to: http://localhost:3000
2. Username: `dr.priya` or any doctor username
3. Password: `doctor123`
4. Role: **DOCTOR**
5. View and manage appointments

---

## 🧪 API Testing

### Test Endpoints
Use the API test page: http://localhost:3000/api-test.html

**Available Tests:**
1. ✅ Fetch all doctors
2. 🔐 Login as patient
3. 📅 Book appointment
4. 📋 View my appointments

---

## 📊 Available Specializations

1. 🫀 **Cardiology** - Heart & vascular care
2. 🩺 **General Medicine** - Primary healthcare
3. 👶 **Pediatrics** - Children's health
4. 🦴 **Orthopedics** - Bones & joints
5. 👩‍⚕️ **Gynecology** - Women's health
6. 🧠 **Neurology** - Brain & nervous system
7. 🎭 **Dermatology** - Skin care
8. 👂 **ENT** - Ear, nose & throat

---

## 🎯 Features to Test

- ✅ User registration and login
- ✅ Book appointments with multiple doctors
- ✅ View upcoming appointments
- ✅ Cancel appointments
- ✅ View medical records
- ✅ View billing information
- ✅ Doctor availability scheduling
- ✅ Patient dashboard
- ✅ Doctor dashboard
- ✅ Admin panel

---

## 🔧 Troubleshooting

### Doctors not showing in dropdown?
1. Make sure backend is running on port 8080
2. Open http://localhost:3000/register-sample-data.html
3. Register sample data
4. Refresh the booking page

### Login not working?
- Check you're using the correct password
- `patient123` for patients
- `doctor123` for doctors
- `admin123` for admin

### Can't access frontend?
- Make sure `npx serve` is running on port 3000
- Access via `http://localhost:3000` NOT `file://`

---

**Need Help?** Check the console (F12) for any errors or use the API test page to debug!
