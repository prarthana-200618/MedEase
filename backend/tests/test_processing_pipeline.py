import numpy as np
from app.services.image_preprocessor import ImagePreprocessor
from app.services.medical_extractor import MedicalExtractor
from app.services.explanation_engine import get_explanation_provider
from app.models.models import MedicationStatus

def test_image_preprocessor_functions():
    synthetic_img = np.ones((100, 200, 3), dtype=np.uint8) * 255
    synthetic_img[30:70, 40:160] = 0

    # 1. Grayscale
    gray = ImagePreprocessor.convert_to_grayscale(synthetic_img)
    assert len(gray.shape) == 2

    # 2. Noise reduction
    denoised = ImagePreprocessor.remove_noise(gray)
    assert denoised.shape == gray.shape

    # 3. Contrast enhancement
    enhanced = ImagePreprocessor.enhance_contrast(denoised)
    assert enhanced.shape == gray.shape

    # 4. Deskew
    rotated, angle = ImagePreprocessor.deskew(enhanced)
    assert rotated.shape == gray.shape

    # 5. Adaptive Threshold
    thresh = ImagePreprocessor.adaptive_threshold(rotated)
    assert thresh.shape == gray.shape

def test_medical_extractor_rules_and_flags():
    sample_prescription = (
        "Rx:\n"
        "1. Tab. Paracetamol 650mg - 1-0-1 TDS x 3 days PC\n"
        "2. Tab. Pantoprazole 40mg - 1-0-0 OD x 7 days AC\n"
        "3. Tab. MysteryPill - BD\n"
    )

    medications, flags = MedicalExtractor.extract_medications_and_flags(sample_prescription)
    assert len(medications) == 3

    # Check Paracetamol
    pcm = medications[0]
    assert "Paracetamol" in pcm["name"]
    assert "650mg" in pcm["dosage"]
    assert "ശേഷം" in pcm["timing"]
    assert "3 days" in pcm["duration"]
    assert pcm["status"] == MedicationStatus.NEEDS_REVIEW

    # Check that ambiguous frequency (1-0-1 vs TDS) flagged
    ambig_flag = next((f for f in flags if f["flag_type"] == "abbreviation_ambiguous"), None)
    assert ambig_flag is not None

    # Check Pantoprazole
    panto = medications[1]
    assert "Pantoprazole" in panto["name"]
    assert "40mg" in panto["dosage"]
    assert "മുൻപ്" in panto["timing"]

    # Check MysteryPill has dosage_unclear flag
    mystery_flag = next((f for f in flags if f["flag_type"] == "dosage_unclear"), None)
    assert mystery_flag is not None
    assert "MysteryPill" in mystery_flag["description"]

def test_malayalam_explanation_engine():
    medications = [
        {
            "name": "Paracetamol",
            "dosage": "650mg",
            "frequency": "ദിവസത്തിൽ 3 തവണ (TDS)",
            "timing": "ഭക്ഷണത്തിന് ശേഷം (After food)",
            "duration": "3 days"
        }
    ]
    flags = [
        {
            "flag_type": "dosage_unclear",
            "description": "ഡോസേജ് വ്യക്തമല്ല",
            "severity": "warning"
        }
    ]

    provider = get_explanation_provider()
    res = provider.generate_explanation(medications, flags, "Raw text")

    assert "malayalam_summary" in res
    summary = res["malayalam_summary"]
    assert "Paracetamol" in summary
    assert "650mg" in summary
    assert "കഴിക്കേണ്ട മരുന്നുകൾ" in summary

    assert "english_summary" in res
    en_summary = res["english_summary"]
    assert "Prescription Summary" in en_summary
    assert "Paracetamol" in en_summary
    assert "650mg" in en_summary

    assert len(res["terminology_breakdown"]) > 0
