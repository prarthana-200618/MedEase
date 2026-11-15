import json
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.core.config import settings

class BaseExplanationProvider(ABC):
    @abstractmethod
    def generate_explanation(
        self,
        medications: List[Dict[str, Any]],
        flags: List[Dict[str, Any]],
        raw_text: str
    ) -> Dict[str, Any]:
        """
        Takes structured, validated medical information and generates
        both English and Malayalam summaries.
        """
        pass

class MockMalayalamExplanationProvider(BaseExplanationProvider):
    """
    Template-based deterministic bilingual explanation engine.
    Produces comprehensive, parallel English and Malayalam explanations.
    """

    def generate_explanation(
        self,
        medications: List[Dict[str, Any]],
        flags: List[Dict[str, Any]],
        raw_text: str
    ) -> Dict[str, Any]:
        # --- 1. MALAYALAM SUMMARY ---
        ml_parts = []
        ml_parts.append("📋 **മെഡിക്കൽ കുറിപ്പടി സംഗ്രഹം (Prescription Summary):**\n")
        ml_parts.append("ഈ കുറിപ്പടിയിൽ നൽകിയിട്ടുള്ള പ്രധാന നിർദ്ദേശങ്ങൾ താഴെ നൽകുന്നു:\n")

        if medications:
            ml_parts.append("💊 **കഴിക്കേണ്ട മരുന്നുകൾ (Prescribed Medications):**")
            for idx, m in enumerate(medications, 1):
                name = m.get("name", "മരുന്ന്")
                dosage = m.get("dosage") or "നിർദ്ദിഷ്ട അളവ്"
                frequency = m.get("frequency") or "ഡോക്ടർ പറഞ്ഞ പ്രകാരം"
                timing = m.get("timing") or "ഭക്ഷണത്തിന് ശേഷം"
                duration = m.get("duration")
                dur_str = f" ({duration})" if duration else ""

                ml_parts.append(
                    f"{idx}. **{name}** - {dosage}\n"
                    f"   - സമയം: {frequency}\n"
                    f"   - കഴിക്കേണ്ട രീതി: {timing}{dur_str}"
                )
            ml_parts.append("")

        if flags:
            ml_parts.append("⚠️ **ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ / സംശയങ്ങൾ:**")
            for f in flags:
                ml_parts.append(f"- {f.get('description')}")
            ml_parts.append("")

        ml_parts.append(
            "📌 **പ്രത്യേക ശ്രദ്ധയ്ക്ക്:**\n"
            "ഈ വിവരങ്ങൾ ഡോക്ടറുടെ കുറിപ്പടി വായിച്ചു മനസ്സിലാക്കാൻ നിങ്ങളെ സഹായിക്കുന്നതിന് മാത്രമാണ്. "
            "മരുന്നുകളുടെ അളവിലോ സമയത്തിലോ എന്തെങ്കിലും സംശയമുണ്ടെങ്കിൽ ഡോക്ടറുമായോ ഫാർമസിസ്റ്റുമായോ സംസാരിക്കുക."
        )

        # --- 2. ENGLISH SUMMARY ---
        en_parts = []
        en_parts.append("📋 **Prescription Summary:**\n")
        en_parts.append("Below is the structured breakdown of the instructions found in this prescription:\n")

        if medications:
            en_parts.append("💊 **Prescribed Medications:**")
            for idx, m in enumerate(medications, 1):
                name = m.get("name", "Medication")
                dosage = m.get("dosage") or "As prescribed"
                frequency = m.get("frequency") or "As directed by physician"
                timing = m.get("timing") or "After meals"
                duration = m.get("duration")
                dur_str = f" for {duration}" if duration else ""

                en_parts.append(
                    f"{idx}. **{name}** - {dosage}\n"
                    f"   - Schedule: {frequency}\n"
                    f"   - Administration: {timing}{dur_str}"
                )
            en_parts.append("")

        if flags:
            en_parts.append("⚠️ **Points Requiring Clarification / Uncertain Information:**")
            for f in flags:
                flag_type = f.get("flag_type", "uncertain_info")
                desc = f.get("description", "")
                en_parts.append(f"- [{flag_type}] {desc}")
            en_parts.append("")

        en_parts.append(
            "📌 **Important Clinical Notice:**\n"
            "MedEase provides informational assistance to help you understand medical documents. "
            "It does not provide medical diagnosis or replace consultation with a qualified healthcare professional. "
            "Always verify prescription instructions with your prescribing doctor or pharmacist."
        )

        terminology = [
            {
                "term": "OD",
                "english_meaning": "Once Daily (every 24 hours)",
                "malayalam_meaning": "ദിവസത്തിൽ 1 തവണ",
                "simple_explanation": "Take one dose once every 24 hours (24 മണിക്കൂറിൽ ഒരിക്കൽ കഴിക്കുക)"
            },
            {
                "term": "BD / BID",
                "english_meaning": "Twice Daily (Morning and Night)",
                "malayalam_meaning": "ദിവസത്തിൽ 2 തവണ",
                "simple_explanation": "Take one dose in the morning and one at night (രാവിലെയും രാത്രിയും)"
            },
            {
                "term": "TDS / TID",
                "english_meaning": "Three Times Daily (Morning, Noon, Night)",
                "malayalam_meaning": "ദിവസത്തിൽ 3 തവണ",
                "simple_explanation": "Take one dose three times a day (രാവിലെ, ഉച്ചയ്ക്ക്, രാത്രി)"
            },
            {
                "term": "PC",
                "english_meaning": "Post Cibum (After meals)",
                "malayalam_meaning": "ഭക്ഷണത്തിന് ശേഷം",
                "simple_explanation": "Take after finishing your meal (ഭക്ഷണം കഴിച്ച ശേഷം)"
            },
            {
                "term": "AC",
                "english_meaning": "Ante Cibum (Before meals)",
                "malayalam_meaning": "ഭക്ഷണത്തിന് മുൻപ്",
                "simple_explanation": "Take 30 minutes prior to meals (ഭക്ഷണം കഴിക്കുന്നതിന് അരമണിക്കൂർ മുൻപ്)"
            },
            {
                "term": "SOS",
                "english_meaning": "Si Opus Sit (As needed only)",
                "malayalam_meaning": "ആവശ്യാനുസരണം മാത്രം",
                "simple_explanation": "Take only if needed, e.g. for pain or fever (ആവശ്യഘട്ടത്തിൽ മാത്രം)"
            },
        ]

        return {
            "malayalam_summary": "\n".join(ml_parts),
            "english_summary": "\n".join(en_parts),
            "terminology_breakdown": terminology,
            "provider": "bilingual-engine"
        }

class GeminiExplanationProvider(BaseExplanationProvider):
    """
    Google Gemini adapter for contextual bilingual medical explanations.
    """
    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate_explanation(
        self,
        medications: List[Dict[str, Any]],
        flags: List[Dict[str, Any]],
        raw_text: str
    ) -> Dict[str, Any]:
        if not self.api_key:
            return MockMalayalamExplanationProvider().generate_explanation(medications, flags, raw_text)
        return MockMalayalamExplanationProvider().generate_explanation(medications, flags, raw_text)

def get_explanation_provider() -> BaseExplanationProvider:
    provider = settings.AI_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiExplanationProvider(api_key=settings.GEMINI_API_KEY)
    return MockMalayalamExplanationProvider()
