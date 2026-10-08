from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from app.models import User, Department, Doctor, HospitalService, Appointment, Notification
from app.auth import get_password_hash

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).filter(User.email == "admin@hospital.com").first():
        print("Database already seeded.")
        return

    print("Seeding database with premium hospital data...")

    # 1. Users
    admin_user = User(
        name="Chief Medical Administrator",
        email="admin@hospital.com",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        phone="+1 (555) 900-1122",
        blood_group="O+",
        emergency_contact="Hospital Security - Ext 901",
        address="AuraCare Executive Medical Suites, Tower A"
    )
    
    patient_user = User(
        name="Alexander Wright",
        email="patient@hospital.com",
        hashed_password=get_password_hash("patient123"),
        role="patient",
        phone="+1 (555) 321-7890",
        blood_group="A+",
        emergency_contact="Elena Wright (Spouse) - +1 (555) 321-7891",
        address="452 Lexington Avenue, Apt 8B, Metro City"
    )

    db.add_all([admin_user, patient_user])
    db.commit()
    db.refresh(patient_user)

    # 2. Departments
    departments_data = [
        Department(
            name="Cardiology & Vascular",
            description="Comprehensive cardiovascular diagnostics, interventional catheterization, heart failure management, and preventive cardiac wellness.",
            icon="HeartPulse",
            head_doctor="Dr. Julian Sterling, MD, FACC",
            location_floor="Level 2, Heart Center",
            phone="+1 (555) 401-2001",
            is_emergency=True
        ),
        Department(
            name="Neurology & Spine",
            description="State-of-the-art neurological therapeutics, stroke care, brain wellness, epilepsy monitoring, and minimally invasive spine interventions.",
            icon="Brain",
            head_doctor="Dr. Eleanor Vance, MD, PhD",
            location_floor="Level 3, Neuro Pavilion",
            phone="+1 (555) 401-2002",
            is_emergency=True
        ),
        Department(
            name="Orthopedics & Sports Medicine",
            description="Sub-specialized joint preservation, robotic knee and hip arthroplasty, complex trauma, and rapid-recovery sports physical medicine.",
            icon="Bone",
            head_doctor="Dr. Marcus Thorne, MD, FAAOS",
            location_floor="Level 1, Orthopedic Wing",
            phone="+1 (555) 401-2003",
            is_emergency=False
        ),
        Department(
            name="Pediatrics & Child Health",
            description="Compassionate pediatric healthcare from neonatal intensive care to adolescent medicine with child-friendly therapeutic suites.",
            icon="Baby",
            head_doctor="Dr. Sophia Chen, MD, FAAP",
            location_floor="Level 2, Children's Pavilion",
            phone="+1 (555) 401-2004",
            is_emergency=False
        ),
        Department(
            name="Dermatology & Aesthetic Medicine",
            description="Medical dermatology, early skin cancer screening with digital dermoscopy, phototherapy, and advanced laser dermatologic care.",
            icon="Sparkles",
            head_doctor="Dr. Priya Patel, MD, FAAD",
            location_floor="Level 4, Wellness Plaza",
            phone="+1 (555) 401-2005",
            is_emergency=False
        ),
        Department(
            name="Oncology & Precision Therapy",
            description="Multidisciplinary cancer care with precision molecular targeted therapies, immunotherapy, and dedicated compassionate infusion suites.",
            icon="ShieldAlert",
            head_doctor="Dr. Arthur Davies, MD, FASCO",
            location_floor="Level 3, Oncology Wing",
            phone="+1 (555) 401-2006",
            is_emergency=False
        ),
        Department(
            name="Internal & Preventive Medicine",
            description="Holistic primary care, comprehensive executive health checkups, chronic disease optimization, and metabolic management.",
            icon="Stethoscope",
            head_doctor="Dr. Evelyn Ross, MD, FACP",
            location_floor="Ground Floor, Outpatient Atrium",
            phone="+1 (555) 401-2007",
            is_emergency=False
        ),
        Department(
            name="Emergency & Critical Care",
            description="Level-1 equivalent acute trauma and critical care center with 24/7 dedicated resuscitation bays, rapid CT access, and helicopter pad.",
            icon="AlertCircle",
            head_doctor="Dr. Nathan Vance, MD, FACEP",
            location_floor="Ground Floor, Emergency Wing A",
            phone="+1 (555) 401-9911",
            is_emergency=True
        )
    ]

    db.add_all(departments_data)
    db.commit()

    dept_map = {d.name: d.id for d in db.query(Department).all()}

    # 3. Doctors
    doctors_data = [
        Doctor(
            name="Julian Sterling",
            email="j.sterling@auracare.com",
            phone="+1 (555) 801-1001",
            department_id=dept_map["Cardiology & Vascular"],
            specialization="Interventional Cardiologist",
            qualification="MD, Harvard Medical School; FACC, FSCAI",
            experience_years=18,
            consultation_fee=180.0,
            bio="Renowned interventional cardiologist specializing in complex coronary angioplasty, transcatheter aortic valve replacement (TAVR), and cardiovascular prevention.",
            available_days="Mon, Tue, Wed, Thu",
            time_slots="09:00 AM, 10:00 AM, 11:30 AM, 02:00 PM, 03:30 PM, 04:30 PM",
            image_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
            rating=4.95
        ),
        Doctor(
            name="Eleanor Vance",
            email="e.vance@auracare.com",
            phone="+1 (555) 801-1002",
            department_id=dept_map["Neurology & Spine"],
            specialization="Senior Neurologist & Neurophysiologist",
            qualification="MD, Johns Hopkins; PhD Neurobiology, Oxford",
            experience_years=15,
            consultation_fee=190.0,
            bio="Leading neurophysiologist focusing on headache medicine, migraine prevention, neurovascular conditions, multiple sclerosis, and nerve conduction studies.",
            available_days="Tue, Wed, Thu, Fri",
            time_slots="09:30 AM, 10:30 AM, 01:30 PM, 02:30 PM, 04:00 PM",
            image_url="https://images.unsplash.com/photo-1594824813633-4f9e1605ecbe?auto=format&fit=crop&q=80&w=600",
            rating=4.98
        ),
        Doctor(
            name="Marcus Thorne",
            email="m.thorne@auracare.com",
            phone="+1 (555) 801-1003",
            department_id=dept_map["Orthopedics & Sports Medicine"],
            specialization="Orthopedic Surgeon & Joint Reconstruction",
            qualification="MD, Columbia University; Fellowship Mayo Clinic",
            experience_years=14,
            consultation_fee=160.0,
            bio="Specialist in computer-navigated knee and hip arthroplasty, minimally invasive shoulder rotator cuff repair, and elite athletic performance rehabilitation.",
            available_days="Mon, Wed, Fri",
            time_slots="08:30 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM",
            image_url="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600",
            rating=4.92
        ),
        Doctor(
            name="Sophia Chen",
            email="s.chen@auracare.com",
            phone="+1 (555) 801-1004",
            department_id=dept_map["Pediatrics & Child Health"],
            specialization="Consultant Pediatrician",
            qualification="MD, Stanford University; FAAP",
            experience_years=12,
            consultation_fee=130.0,
            bio="Beloved pediatrician dedicated to developmental pediatrics, infant nutrition, childhood asthma, and gentle preventive care for growing youth.",
            available_days="Mon, Tue, Thu, Fri, Sat",
            time_slots="09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM, 04:00 PM",
            image_url="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
            rating=4.97
        ),
        Doctor(
            name="Priya Patel",
            email="p.patel@auracare.com",
            phone="+1 (555) 801-1005",
            department_id=dept_map["Dermatology & Aesthetic Medicine"],
            specialization="Board Certified Dermatologist",
            qualification="MD, Yale School of Medicine; FAAD",
            experience_years=10,
            consultation_fee=140.0,
            bio="Expert in clinical dermatology, inflammatory skin disorders, photodynamic therapy, scar revision, and aesthetic rejuvenation protocols.",
            available_days="Mon, Tue, Wed, Fri",
            time_slots="10:00 AM, 11:00 AM, 01:30 PM, 02:30 PM, 03:30 PM",
            image_url="https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=600",
            rating=4.89
        ),
        Doctor(
            name="Evelyn Ross",
            email="e.ross@auracare.com",
            phone="+1 (555) 801-1006",
            department_id=dept_map["Internal & Preventive Medicine"],
            specialization="Internal Medicine Specialist",
            qualification="MD, University of Pennsylvania; FACP",
            experience_years=16,
            consultation_fee=120.0,
            bio="Dedicated internal medicine physician focusing on hypertension, diabetes management, metabolic balance, and personalized executive health roadmaps.",
            available_days="Mon, Tue, Wed, Thu, Fri",
            time_slots="08:30 AM, 09:30 AM, 10:30 AM, 01:30 PM, 02:30 PM, 03:30 PM",
            image_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
            rating=4.94
        )
    ]

    db.add_all(doctors_data)
    db.commit()

    # 4. Hospital Services
    services_data = [
        HospitalService(
            name="24/7 Level-1 Emergency & Trauma",
            description="Immediate life-saving critical response equipped with advanced resuscitation bays, point-of-care ultrasound, and instant surgical standby.",
            category="Emergency",
            price_range="Insurance Covered / Urgent Care",
            availability="24 Hours / 7 Days",
            icon="Ambulance",
            is_featured=True
        ),
        HospitalService(
            name="Robotic Surgical Suites",
            description="Da Vinci Xi dual-console robotic surgery offering pinpoint surgical accuracy, microscopic incisions, minimal pain, and rapid hospital discharge.",
            category="Surgery",
            price_range="Comprehensive Surgical Package",
            availability="Mon - Sat, Scheduled",
            icon="Cpu",
            is_featured=True
        ),
        HospitalService(
            name="Precision Diagnostic & 3T MRI Imaging",
            description="Ultra-high definition 3-Tesla silent MRI, 128-slice dual-source cardiac CT, 4D Doppler ultrasound, and digital automated pathology.",
            category="Diagnostics",
            price_range="$150 - $650 (Co-pay applicable)",
            availability="24/7 Emergency / 7 AM - 9 PM Routine",
            icon="ScanLine",
            is_featured=True
        ),
        HospitalService(
            name="Intensive Care Unit (ICU, CCU & NICU)",
            description="Individual HEPA-filtered intensive monitoring rooms with 1:1 specialized nurse-to-patient ratio and continuous tele-monitoring.",
            category="Inpatient",
            price_range="Daily Critical Care Tier",
            availability="24/7 Continuous",
            icon="HeartPulse",
            is_featured=True
        ),
        HospitalService(
            name="Telehealth & Virtual Care Concierge",
            description="HD encrypted audio/video teleconsultations with top hospital specialists, digital prescription forwarding, and symptom monitoring.",
            category="Specialized",
            price_range="$50 - $90 per session",
            availability="8:00 AM - 10:00 PM Daily",
            icon="Video",
            is_featured=True
        ),
        HospitalService(
            name="24/7 In-House Smart Pharmacy",
            description="Fully stocked institutional pharmacy offering temperature-controlled bio-therapeutics, automated dispensing, and home delivery.",
            category="General",
            price_range="Prescription Retail",
            availability="24 Hours / 7 Days",
            icon="Pill",
            is_featured=False
        ),
        HospitalService(
            name="Cardiac Wellness & Rehabilitation",
            description="Supervised cardiovascular exercise therapy, nutritional cardiology coaching, and post-angioplasty recovery protocols.",
            category="Wellness",
            price_range="Structured 6-Week Program",
            availability="Mon - Fri, 8 AM - 5 PM",
            icon="Activity",
            is_featured=False
        ),
        HospitalService(
            name="Executive Health & Preventive Checkups",
            description="Full-day comprehensive health assessment covering full body biomarkers, coronary calcium scoring, and lifestyle genetics.",
            category="Wellness",
            price_range="$450 - $1,200 Package",
            availability="Mon - Sat, 7:30 AM Start",
            icon="CheckCircle",
            is_featured=False
        )
    ]

    db.add_all(services_data)
    db.commit()

    # 5. Demo Appointments for Patient
    doc_sterling = db.query(Doctor).filter(Doctor.name == "Julian Sterling").first()
    doc_vance = db.query(Doctor).filter(Doctor.name == "Eleanor Vance").first()
    doc_ross = db.query(Doctor).filter(Doctor.name == "Evelyn Ross").first()

    today = date.today()
    upcoming_date = (today + timedelta(days=3)).strftime("%Y-%m-%d")
    recent_date = (today - timedelta(days=12)).strftime("%Y-%m-%d")

    appointments_data = [
        Appointment(
            appointment_code="APT-2026-9812",
            patient_id=patient_user.id,
            doctor_id=doc_sterling.id,
            department_id=doc_sterling.department_id,
            appointment_date=upcoming_date,
            appointment_time="10:00 AM",
            status="confirmed",
            reason="Annual cardiovascular checkup and resting ECG assessment",
            notes="Patient requested morning slot. Fasting 4 hours prior recommended."
        ),
        Appointment(
            appointment_code="APT-2026-4421",
            patient_id=patient_user.id,
            doctor_id=doc_ross.id,
            department_id=doc_ross.department_id,
            appointment_date=recent_date,
            appointment_time="02:30 PM",
            status="completed",
            reason="Routine preventive blood pressure and metabolic panel review",
            notes="Blood pressure normalized at 122/80. Prescribed lifestyle modification."
        )
    ]

    db.add_all(appointments_data)
    db.commit()

    # 6. Notifications for Patient
    notifications_data = [
        Notification(
            user_id=patient_user.id,
            title="Appointment Confirmed",
            message=f"Your upcoming consultation with Dr. Julian Sterling is confirmed for {upcoming_date} at 10:00 AM. Appointment ID: APT-2026-9812.",
            type="success",
            is_read=False
        ),
        Notification(
            user_id=patient_user.id,
            title="Lab Results Ready",
            message="Your metabolic lab panel results from your recent visit are now archived and ready for viewing.",
            type="info",
            is_read=False
        ),
        Notification(
            user_id=patient_user.id,
            title="Preventive Wellness Reminder",
            message="Flu vaccination season is now active. Walk-in immunizations are available on Ground Floor Atrium.",
            type="info",
            is_read=True
        )
    ]

    db.add_all(notifications_data)
    db.commit()

    print("Database seeding completed successfully!")
