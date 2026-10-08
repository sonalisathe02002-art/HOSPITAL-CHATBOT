import httpx
import re
from functools import lru_cache
from pathlib import Path
from typing import Dict, Any, List, Optional

from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Department, Doctor, HospitalService

KB_DIR = Path(__file__).resolve().parents[2] / "knowledge_base"
VECTORSTORE_DIR = Path(__file__).resolve().parents[2] / ".rag_storage"

EMERGENCY_DISCLAIMER = (
    "⚠️ Medical Disclaimer: AuraCare AI Concierge provides hospital information and guidance only. "
    "We cannot provide medical diagnosis, treatment plans, or emergency triage. "
    "If you are experiencing severe chest pain, difficulty breathing, sudden numbness, or a life-threatening medical emergency, "
    "please call 911 or visit our 24/7 Emergency Room immediately."
)

DEFAULT_SUGGESTIONS = [
    "Book an appointment",
    "List of departments & doctors",
    "Visiting hours & location",
    "What insurance do you accept?",
    "24/7 Emergency & Ambulance services"
]


def resolve_gemini_model_name(model_name: str) -> str:
    """Preserve the configured env value while mapping legacy names to working Gemini API models."""
    aliases = {
        "gemini-1.5-flash": "gemini-3.5-flash-lite",
        "gemini-1.5-pro": "gemini-3.5-flash-lite",
        "gemini-2.0-flash": "gemini-3.5-flash-lite",
        "gemini-2.5-flash": "gemini-3.5-flash-lite",
    }
    return aliases.get(model_name, model_name)


def load_knowledge_documents() -> List[Document]:
    """Load AuraCare healthcare support docs for retrieval-augmented generation."""
    if not KB_DIR.exists():
        return []

    documents: List[Document] = []
    for file_path in sorted(KB_DIR.glob("*.md")) + sorted(KB_DIR.glob("*.txt")):
        try:
            contents = file_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            contents = file_path.read_text(encoding="utf-8", errors="ignore")

        if contents.strip():
            documents.append(
                Document(
                    page_content=contents,
                    metadata={"source": str(file_path.name)}
                )
            )
    return documents


@lru_cache(maxsize=1)
def get_rag_retriever():
    """Initialize a Gemini-backed vector store for AuraCare support documents."""
    if settings.AI_PROVIDER != "gemini" or not settings.AI_API_KEY:
        return None

    documents = load_knowledge_documents()
    if not documents:
        return None

    splitter = RecursiveCharacterTextSplitter(chunk_size=900, chunk_overlap=150)
    chunks = splitter.split_documents(documents)
    if not chunks:
        return None

    try:
        embeddings = GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-001",
            google_api_key=settings.AI_API_KEY,
        )
        vector_store = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=str(VECTORSTORE_DIR),
            collection_name="aura_care_support",
        )
        return vector_store.as_retriever(search_kwargs={"k": 4})
    except Exception as exc:
        print(f"RAG retriever initialization failed: {exc}")
        return None


async def query_rag_answer(query: str) -> Optional[str]:
    """Retrieve relevant healthcare context and generate an answer grounded in the docs."""
    retriever = get_rag_retriever()
    if retriever is None:
        return None

    try:
        relevant_docs = retriever.invoke(query)
        if not relevant_docs:
            return None

        context = "\n\n".join(doc.page_content.strip() for doc in relevant_docs if doc.page_content.strip())
        if not context:
            return None

        prompt = ChatPromptTemplate.from_template(
            """
            You are AuraCare's hospital concierge AI.
            Use only the context below to answer the user's question.
            If the information is missing from the context, reply with:
            "I could not find this information in the provided AuraCare healthcare documents."
            Do not invent, guess, or provide medical advice beyond the provided support docs.

            Context:
            {context}

            User question:
            {question}
            """
        )

        llm = ChatGoogleGenerativeAI(
            model=resolve_gemini_model_name(settings.AI_MODEL),
            google_api_key=settings.AI_API_KEY,
            temperature=0.2,
            max_output_tokens=600,
        )
        answer = llm.invoke(prompt.invoke({"context": context, "question": query}))
        content = getattr(answer, "content", str(answer))
        if isinstance(content, list):
            text_parts = []
            for item in content:
                if isinstance(item, dict):
                    text = item.get("text")
                    if isinstance(text, str):
                        text_parts.append(text)
                elif isinstance(item, str):
                    text_parts.append(item)
            content = "\n".join(text_parts)
        return str(content).strip()
    except Exception as exc:
        print(f"RAG query failed: {exc}")
        return None


def build_hospital_context(db: Session) -> str:
    departments = db.query(Department).all()
    doctors = db.query(Doctor).all()
    services = db.query(HospitalService).all()

    dept_summary = "\n".join([
        f"- {d.name}: {d.description} (Floor: {d.location_floor}, Head: {d.head_doctor or 'N/A'}, Phone: {d.phone or 'Ext 101'})"
        for d in departments
    ])

    doctor_summary = "\n".join([
        f"- Dr. {doc.name} ({doc.specialization} - {doc.department.name if doc.department else 'General'}): "
        f"Experience: {doc.experience_years} yrs, Fee: ₹{doc.consultation_fee:g}, "
        f"Available Days: {doc.available_days}, Slots: {doc.time_slots}"
        for doc in doctors
    ])

    service_summary = "\n".join([
        f"- {s.name} ({s.category}): {s.description} [Availability: {s.availability}, Fee: {s.price_range}]"
        for s in services
    ])

    return f"""
HOSPITAL NAME: AuraCare Medical & Surgical Center
CAMPUS LOCATION: 100 Medical Center Blvd, Metro Health District
24/7 EMERGENCY HOTLINE: 1-800-AURACARE / 911
GENERAL ENQUIRIES: +1 (555) 019-2834
VISITING HOURS:
- General Inpatient Wards: 10:00 AM – 12:00 PM and 04:00 PM – 07:00 PM daily (Max 2 visitors per patient).
- Intensive Care Unit (ICU): 04:30 PM – 05:30 PM daily (Immediate family only, 1 visitor at a time).
PARKING:
- Multi-level parking garage (P1-P3). Free for patients during the first 2 hours. Complimentary valet at Main Entrance.
ACCEPTED HEALTH INSURANCE:
- Blue Cross Blue Shield, Medicare, Medicaid, Aetna, Cigna, UnitedHealthcare, Humana, Kaiser Permanente.
APPOINTMENT BOOKING:
- Patients can book appointments online directly via the Patient Portal under 'Book Appointment'.
- They select Department -> Doctor -> Preferred Date -> Available Time Slot -> Confirm.

DEPARTMENTS:
{dept_summary}

SPECIALIST DOCTORS:
{doctor_summary}

KEY HOSPITAL SERVICES:
{service_summary}
"""

async def query_ai_model(prompt: str, context: str) -> Optional[str]:
    """Call Google Gemini or OpenAI if API key is configured."""
    if not settings.AI_API_KEY:
        return None

    system_instruction = (
        "You are Aura, the premier AI Hospital Customer Support Specialist at AuraCare Health. "
        "Your role is to assist patients and visitors with accurate hospital information, departments, doctors, "
        "services, visiting hours, parking, insurance, and appointment booking guidance.\n\n"
        "STRICT RULES:\n"
        "1. NEVER provide a medical diagnosis or prescribe medicine.\n"
        "2. For medical symptoms, advise the patient to consult the appropriate hospital specialist and mention our emergency room if urgent.\n"
        "3. Always be warm, professional, concise, empathetic, and reassuring.\n"
        "4. Use clear formatting with bullet points and bold headers when helpful.\n"
        f"Context about AuraCare:\n{context}"
    )

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            if settings.AI_PROVIDER == "gemini":
                # Google Gemini API
                runtime_model = resolve_gemini_model_name(settings.AI_MODEL)
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{runtime_model}:generateContent?key={settings.AI_API_KEY}"
                payload = {
                    "contents": [
                        {
                            "role": "user",
                            "parts": [
                                {"text": f"{system_instruction}\n\nPatient Query: {prompt}"}
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.4,
                        "maxOutputTokens": 600
                    }
                }
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()

            elif settings.AI_PROVIDER == "openai":
                # OpenAI or compatible API
                url = "https://api.openai.com/v1/chat/completions"
                headers = {"Authorization": f"Bearer {settings.AI_API_KEY}"}
                payload = {
                    "model": settings.AI_MODEL if settings.AI_MODEL.startswith("gpt") else "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.4,
                    "max_tokens": 600
                }
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"External AI query failed: {e}. Switching to local knowledge engine.")

    return None

def local_fallback_engine(query: str, db: Session) -> Dict[str, Any]:
    """Smart localized rule & FAQ engine when AI API key is not present or offline."""
    q = query.lower().strip()
    departments = db.query(Department).all()
    doctors = db.query(Doctor).all()
    services = db.query(HospitalService).all()

    # 1. Emergency intent
    if any(k in q for k in ["emergency", "ambulance", "heart attack", "stroke", "bleeding", "severe", "unconscious", "poison"]):
        return {
            "response": (
                "🚨 **URGENT MEDICAL NOTICE**\n\n"
                "If you or someone nearby is experiencing a life-threatening medical emergency:\n"
                "- **Call our 24/7 Emergency Dispatch immediately: 1-800-AURACARE (Ext. 911)**\n"
                "- Our Trauma & Emergency Center is located on the **Ground Floor, Wing A** with dedicated ambulance bays.\n"
                "- No appointment or prior referral is needed for emergency care. Board-certified emergency physicians are on duty 24/7."
            ),
            "suggested_actions": ["Emergency contact number", "Find Emergency Department", "Ambulance pickup", "Book routine checkup"]
        }

    # 2. Greeting / Help
    if any(k in q for k in ["hello", "hi", "hey", "good morning", "good evening", "greetings", "who are you"]):
        return {
            "response": (
                "👋 **Welcome to AuraCare Health Virtual Concierge!**\n\n"
                "I am your dedicated digital healthcare assistant. I can assist you with:\n"
                "• **Booking, rescheduling, or checking appointments**\n"
                "• **Information on medical departments and specialist doctors**\n"
                "• **Hospital visiting hours, parking, and campus locations**\n"
                "• **Accepted insurance providers and diagnostic services**\n\n"
                "How may I assist you with your healthcare journey today?"
            ),
            "suggested_actions": ["Book an appointment", "View our doctors", "Visiting hours & location", "Accepted insurance"]
        }

    # 3. Appointment booking intent
    if any(k in q for k in ["book", "appointment", "schedule", "reschedule", "cancel appointment", "slot"]):
        return {
            "response": (
                "📅 **How to Book an Appointment at AuraCare:**\n\n"
                "Booking an appointment is fast and straightforward:\n"
                "1. Click the **'Book Appointment'** button in the patient navigation or your dashboard.\n"
                "2. Choose your desired **Medical Department**.\n"
                "3. Select a **Specialist Doctor** from our accredited roster.\n"
                "4. Pick a convenient **Date & Available Time Slot**.\n"
                "5. Provide a brief reason for your consultation and confirm!\n\n"
                "You will receive an instant appointment code with calendar tracking in your portal."
            ),
            "suggested_actions": ["Book an appointment now", "View Doctor Directory", "Check my appointments", "Consultation fees"]
        }

    # 4. Visiting Hours
    if any(k in q for k in ["visiting", "visit hour", "timing", "open", "visitor", "visitation"]):
        return {
            "response": (
                "🕒 **AuraCare Visiting Hours & Guidelines:**\n\n"
                "• **General Inpatient Wards:**\n"
                "  - Morning: **10:00 AM – 12:00 PM**\n"
                "  - Evening: **04:00 PM – 07:00 PM**\n"
                "  - Limit of 2 visitors per patient at any time.\n\n"
                "• **Intensive Care Unit (ICU):**\n"
                "  - Daily: **04:30 PM – 05:30 PM** (Immediate family only, 1 visitor at bedside).\n\n"
                "• **Emergency Room:** Open 24/7, 365 days a year.\n"
                "• **Outpatient Clinics:** Monday – Saturday, 8:00 AM – 6:00 PM."
            ),
            "suggested_actions": ["Hospital location & parking", "Book an appointment", "Department directory", "Contact support"]
        }

    # 5. Location, Parking, Directions
    if any(k in q for k in ["location", "address", "where is", "floor", "parking", "directions", "map"]):
        return {
            "response": (
                "📍 **Campus Location & Parking Facilities:**\n\n"
                "• **Address:** 100 Medical Center Blvd, Metro Health District.\n"
                "• **Main Entrance & Reception:** Ground Floor, Central Atrium.\n"
                "• **Emergency & Trauma:** Ground Floor, Wing A (Follow red exterior signage).\n"
                "• **Diagnostic Imaging & Labs:** 1st Floor, Wing B.\n"
                "• **Inpatient Rooms & Surgical Suites:** Floors 2 through 4.\n"
                "• **Parking:** On-site multi-level parking garage (Levels P1–P3). "
                "Complimentary parking for the first 2 hours for patients and visitors. Valet parking is available at the Main Entrance."
            ),
            "suggested_actions": ["Emergency department", "Visiting hours", "Book an appointment", "Doctor directory"]
        }

    # 6. Insurance & Payment
    if any(k in q for k in ["insurance", "cost", "fee", "payment", "bill", "medicare", "price"]):
        return {
            "response": (
                "💳 **Insurance & Billing Information:**\n\n"
                "AuraCare Health accepts most major commercial and government health insurance plans, including:\n"
                "• **Blue Cross Blue Shield, Medicare, Medicaid, Aetna, Cigna, UnitedHealthcare, Humana**\n\n"
                "• **Doctor Consultation Fees:** Specialist consultations range from **₹100 – ₹500** depending on the department.\n"
                "• **Payment Methods:** Major credit/debit cards, HSA/FSA cards, bank transfers, and flexible interest-free EMI plans.\n"
                "• For specific insurance pre-authorizations, please visit the Billing Desk on the Ground Floor or call Ext. 204."
            ),
            "suggested_actions": ["View Doctor Directory", "Book an appointment", "Contact billing desk", "List of services"]
        }

    # 7. Doctor query matching
    for doc in doctors:
        doc_last_name = doc.name.split()[-1].lower()
        if doc_last_name in q or doc.name.lower() in q:
            return {
                "response": (
                    f"👨‍⚕️ **Doctor Profile: Dr. {doc.name}**\n\n"
                    f"• **Specialization:** {doc.specialization} ({doc.department.name if doc.department else 'Specialist'})\n"
                    f"• **Qualifications:** {doc.qualification}\n"
                    f"• **Clinical Experience:** {doc.experience_years}+ years\n"
                    f"• **Consultation Fee:** ₹{doc.consultation_fee:g}\n"
                    f"• **Available Days:** {doc.available_days}\n"
                    f"• **Standard Consultation Slots:** {doc.time_slots}\n"
                    f"• **Overview:** {doc.bio or 'Dedicated specialist committed to evidence-based compassionate patient care.'}"
                ),
                "suggested_actions": [f"Book Dr. {doc.name}", "View all doctors", "Department details", "Consultation fees"]
            }

    # 8. Department query matching
    for dept in departments:
        dept_keywords = dept.name.lower().split()
        if any(kw in q for kw in dept_keywords) or dept.name.lower() in q:
            dept_docs = [d for d in doctors if d.department_id == dept.id]
            doc_list = ", ".join([f"Dr. {d.name} ({d.specialization})" for d in dept_docs]) if dept_docs else "Specialists on call"
            return {
                "response": (
                    f"🏥 **Department of {dept.name}**\n\n"
                    f"• **Overview:** {dept.description}\n"
                    f"• **Location:** {dept.location_floor}\n"
                    f"• **Department Head:** {dept.head_doctor or 'Senior Faculty Board'}\n"
                    f"• **Direct Extension:** {dept.phone or 'Ext. 300'}\n"
                    f"• **Specialists in this Department:** {doc_list}\n\n"
                    f"Would you like to book a consultation in {dept.name}?"
                ),
                "suggested_actions": [f"Book appointment in {dept.name}", "View all doctors", "Visiting hours", "All departments"]
            }

    # 9. Services / Facilities
    if any(k in q for k in ["service", "icu", "surgery", "lab", "xray", "mri", "pharmacy", "radiology", "diagnostics"]):
        srv_list = "\n".join([f"• **{s.name}** ({s.category}): {s.description} — *{s.availability}*" for s in services[:5]])
        return {
            "response": (
                "🏥 **AuraCare Hospital Services & Facilities:**\n\n"
                f"{srv_list}\n\n"
                "• **24/7 In-House Pharmacy:** Open all hours located next to the main lobby.\n"
                "• **Advanced Diagnostics:** Fully accredited high-resolution MRI, CT, Ultrasound, and Pathology labs."
            ),
            "suggested_actions": ["Book a diagnostic test", "Find doctor", "Visiting hours", "Emergency care"]
        }

    # 10. Symptoms / Medical inquiry disclaimer
    if any(k in q for k in ["pain", "fever", "cough", "headache", "chest", "stomach", "symptom", "medicine", "pill", "tablet", "sick"]):
        return {
            "response": (
                "🩺 **Medical Evaluation Notice:**\n\n"
                "As an AI digital concierge, I cannot diagnose medical conditions or recommend medications. "
                "Your symptoms should be evaluated in person by a qualified healthcare professional.\n\n"
                "• For **acute symptoms or sudden chest discomfort**, visit our Emergency Room immediately.\n"
                "• For ongoing symptoms, we strongly recommend scheduling a consultation with one of our specialized departments:\n"
                "  - **General Medicine:** For fevers, fatigue, general illness, and preventive checkups\n"
                "  - **Cardiology:** For heart health, chest palpitations, or blood pressure concerns\n"
                "  - **Neurology:** For migraines, nerve concerns, or persistent headaches\n"
                "  - **Orthopedics:** For joint, back, or musculoskeletal pain"
            ),
            "suggested_actions": ["Book General Medicine", "View Doctor Directory", "Emergency services", "Visiting hours"]
        }

    # 11. Generic helpful fallback
    return {
        "response": (
            "Thank you for contacting AuraCare Medical Center Virtual Concierge!\n\n"
            "I can assist you with:\n"
            "• **Doctors & Specialties:** Inquire about our physicians, qualifications, or consultation fees.\n"
            "• **Departments:** Information regarding Cardiology, Neurology, Orthopedics, Pediatrics, and more.\n"
            "• **Appointments:** Guidance on scheduling, rescheduling, or viewing appointments.\n"
            "• **Hospital Info:** Visiting hours (10 AM–12 PM & 4 PM–7 PM), parking, location, and billing.\n\n"
            "Please select an option below or type your specific question!"
        ),
        "suggested_actions": DEFAULT_SUGGESTIONS
    }

async def generate_chat_response(query: str, db: Session) -> Dict[str, Any]:
    context = build_hospital_context(db)

    rag_answer = await query_rag_answer(query)
    if rag_answer:
        return {
            "response": rag_answer,
            "suggested_actions": DEFAULT_SUGGESTIONS,
            "is_fallback": False,
            "disclaimer": EMERGENCY_DISCLAIMER
        }

    if not settings.AI_API_KEY:
        fallback_res = local_fallback_engine(query, db)
        return {
            "response": fallback_res["response"],
            "suggested_actions": fallback_res.get("suggested_actions", DEFAULT_SUGGESTIONS),
            "is_fallback": True,
            "disclaimer": EMERGENCY_DISCLAIMER
        }

    # If no relevant retrieval match is found, inform the user that the docs do not contain that information.
    not_found_response = (
        "I could not find this information in the provided AuraCare healthcare documents. "
        "Please contact our hospital support desk or check the official patient information portal for the most current details."
    )
    return {
        "response": not_found_response,
        "suggested_actions": DEFAULT_SUGGESTIONS,
        "is_fallback": True,
        "disclaimer": EMERGENCY_DISCLAIMER
    }
