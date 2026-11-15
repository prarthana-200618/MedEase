import re
from typing import List, Dict, Any, Tuple
from app.models.models import MedicationStatus, FlagSeverity

# Standard Medical Terminology & Shorthand Dictionary for Kerala Patients
FREQUENCY_MAP = [
    (r"\b1-1-1\b", "1-1-1", "രാവിലെ, ഉച്ചയ്ക്ക്, രാത്രി (Morning, Noon & Night)"),
    (r"\b1-0-1\b", "1-0-1", "രാവിലെയും രാത്രിയും (Morning & Night)"),
    (r"\b1-0-0\b", "1-0-0", "രാവിലെ മാത്രം (Morning only)"),
    (r"\b0-0-1\b", "0-0-1", "രാത്രി മാത്രം (Night only)"),
    (r"\b0-1-0\b", "0-1-0", "ഉച്ചയ്ക്ക് മാത്രം (Noon only)"),
    (r"\bt\.?d\.?s\.?\b|\bt\.?i\.?d\.?\b", "TDS", "ദിവസത്തിൽ 3 തവണ (3 times daily)"),
    (r"\bb\.?d\.?\b|\bb\.?i\.?d\.?\b", "BD", "ദിവസത്തിൽ 2 തവണ (2 times daily)"),
    (r"\bo\.?d\.?\b", "OD", "ദിവസത്തിൽ 1 തവണ (Once daily)"),
    (r"\bq\.?i\.?d\.?\b", "QID", "ദിവസത്തിൽ 4 തവണ (4 times daily)"),
    (r"\bh\.?s\.?\b", "HS", "രാത്രി ഉറങ്ങാൻ കിടക്കുന്നതിന് മുൻപ് (At bedtime)"),
    (r"\bs\.?o\.?s\.?\b", "SOS", "ആവശ്യാനുസരണം മാത്രം (As needed)"),
]

TIMING_MAP = [
    (r"\ba\.?c\.?\b|before\s+meals?|before\s+food", "ഭക്ഷണത്തിന് മുൻപ് (Before food)"),
    (r"\bp\.?c\.?\b|after\s+meals?|after\s+food", "ഭക്ഷണത്തിന് ശേഷം (After food)"),
    (r"with\s+meals?|with\s+food", "ഭക്ഷണത്തോടൊപ്പം (With food)"),
    (r"empty\s+stomach", "വെറും വയറ്റിൽ (Empty stomach)"),
]

DOSAGE_PATTERN = re.compile(
    r"\b(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|tablet|tab|cap|capsule|puff|drops?))\b",
    re.IGNORECASE
)

DURATION_PATTERN = re.compile(
    r"(?:x\s*(\d+)\s*(days?|weeks?|months?)|for\s*(\d+)\s*(days?|weeks?|months?))",
    re.IGNORECASE
)

class MedicalExtractor:
    """
    Extracts structured medication information and flags uncertain data
    using rule-based parsing and medical terminology dictionaries.
    """

    @classmethod
    def extract_medications_and_flags(cls, raw_text: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        lines = raw_text.splitlines()
        medications: List[Dict[str, Any]] = []
        flags: List[Dict[str, Any]] = []

        is_rx_section = False

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            if re.search(r"\b(Rx|Medications?|Medicines?|Prescription)\b", line_str, re.IGNORECASE):
                is_rx_section = True
                continue

            has_med_prefix = bool(re.search(r"^(?:\d+[\.\)]\s*)?(?:Tab|Cap|Syr|Inj|Oint|Tablet|Capsule)\b", line_str, re.IGNORECASE))
            has_dosage = bool(DOSAGE_PATTERN.search(line_str))
            has_freq = any(re.search(pat, line_str, re.IGNORECASE) for pat, _, _ in FREQUENCY_MAP)

            if has_med_prefix or (is_rx_section and (has_dosage or has_freq)):
                # 1. Extract Dosage
                dosage_match = DOSAGE_PATTERN.search(line_str)
                dosage = dosage_match.group(1) if dosage_match else None

                # 2. Extract Frequency (Check for multiple / conflicting frequencies)
                matched_freqs = []
                for pat, code, desc in FREQUENCY_MAP:
                    if re.search(pat, line_str, re.IGNORECASE):
                        matched_freqs.append((code, desc))

                frequency = None
                freq_label = None
                has_conflicting_freq = False

                if matched_freqs:
                    frequency = matched_freqs[0][0]
                    freq_label = matched_freqs[0][1]

                    # If both numerical (e.g. 1-0-1) and abbreviation (e.g. TDS) appear
                    codes = {mf[0] for mf in matched_freqs}
                    if len(codes) > 1:
                        has_conflicting_freq = True
                        freq_label = " / ".join([mf[1] for mf in matched_freqs])

                # 3. Extract Timing (AC / PC)
                timing = None
                for pat, desc in TIMING_MAP:
                    if re.search(pat, line_str, re.IGNORECASE):
                        timing = desc
                        break

                # 4. Extract Duration (x 5 days)
                dur_match = DURATION_PATTERN.search(line_str)
                duration = None
                if dur_match:
                    num = dur_match.group(1) or dur_match.group(3)
                    unit = dur_match.group(2) or dur_match.group(4)
                    duration = f"{num} {unit}"

                # 5. Extract Medicine Name
                clean_name = line_str
                clean_name = re.sub(r"^(?:\d+[\.\)]\s*)?(?:Tab\.?|Cap\.?|Syr\.?|Inj\.?|Oint\.?|Tablet|Capsule|Syrup)?\s*", "", clean_name, flags=re.IGNORECASE)
                if dosage:
                    parts = clean_name.split(dosage)
                    clean_name = parts[0].strip()
                elif "-" in clean_name:
                    clean_name = clean_name.split("-")[0].strip()

                clean_name = clean_name.strip(" ,.-")
                if not clean_name:
                    clean_name = line_str[:30]

                confidence = 0.9 if (dosage and frequency and not has_conflicting_freq) else 0.65

                med_record = {
                    "name": clean_name,
                    "dosage": dosage,
                    "frequency": freq_label or frequency or "പരിശോധിക്കുക (Needs review)",
                    "timing": timing or "ഭക്ഷണത്തിന് ശേഷം (സാധാരണയായി)",
                    "duration": duration,
                    "raw_line": line_str,
                    "confidence_score": confidence,
                    "status": MedicationStatus.NEEDS_REVIEW,
                    "user_notes": None
                }
                medications.append(med_record)

                # Safety Flags
                if has_conflicting_freq:
                    flags.append({
                        "flag_type": "abbreviation_ambiguous",
                        "description": f"'{clean_name}' എന്ന മരുന്നിൽ ഒന്നിൽ കൂടുതൽ സമയക്രമങ്ങൾ ({', '.join(codes)}) കാണുന്നു. കൃത്യമായ സമയം ഡോക്ടറോട് ചോദിക്കുക.",
                        "severity": FlagSeverity.HIGH
                    })

                if not dosage:
                    flags.append({
                        "flag_type": "dosage_unclear",
                        "description": f"'{clean_name}' എന്ന മരുന്നിന്റെ അളവ് (Dosage) കൃത്യമായി രേഖപ്പെടുത്തിയിട്ടില്ല.",
                        "severity": FlagSeverity.WARNING
                    })

                if not frequency:
                    flags.append({
                        "flag_type": "frequency_unclear",
                        "description": f"'{clean_name}' എത്ര തവണ കഴിക്കണമെന്ന് വ്യക്തമല്ല. കുറിപ്പടി പരിശോധിക്കുക.",
                        "severity": FlagSeverity.HIGH
                    })

                if confidence < 0.7 and not has_conflicting_freq:
                    flags.append({
                        "flag_type": "low_confidence",
                        "description": f"'{clean_name}' രേഖയിൽ വ്യക്തത കുറവാണ്. ഡോക്ടറുടെ നിർദ്ദേശം ഉറപ്പുവരുത്തുക.",
                        "severity": FlagSeverity.WARNING
                    })

        if len(medications) == 0 and len(raw_text.strip()) > 30:
            flags.append({
                "flag_type": "uncertain_handwriting",
                "description": "കുറിപ്പടിയിലെ കൈയക്ഷരം വ്യക്തമായി വായിക്കാൻ സാധിച്ചിട്ടില്ല. രോഗി സ്വയം പരിശോധിച്ച് ഉറപ്പുവരുത്തേണ്ടതാണ്.",
                "severity": FlagSeverity.HIGH
            })

        return medications, flags
