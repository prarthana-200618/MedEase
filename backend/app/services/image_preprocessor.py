import cv2
import numpy as np
from pathlib import Path
from typing import Tuple, Optional

class ImagePreprocessor:
    """
    OpenCV-based image preprocessing pipeline specifically tuned
    for scanned medical documents, test reports, and doctor prescriptions.
    """

    @staticmethod
    def read_image(image_path: str) -> np.ndarray:
        image = cv2.imread(str(image_path))
        if image is None:
            raise ValueError(f"Could not read image from {image_path}")
        return image

    @staticmethod
    def resize_with_aspect_ratio(image: np.ndarray, width: Optional[int] = None, height: Optional[int] = None) -> np.ndarray:
        dim = None
        (h, w) = image.shape[:2]

        if width is None and height is None:
            return image

        if width is None and height is not None:
            r = height / float(h)
            dim = (int(w * r), height)
        elif height is None and width is not None:
            r = width / float(w)
            dim = (width, int(h * r))

        resized = cv2.resize(image, dim, interpolation=cv2.INTER_AREA)
        return resized

    @staticmethod
    def convert_to_grayscale(image: np.ndarray) -> np.ndarray:
        if len(image.shape) == 2:
            return image
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    @staticmethod
    def remove_noise(gray_image: np.ndarray) -> np.ndarray:
        # Bilateral filter removes noise while keeping edges sharp
        return cv2.bilateralFilter(gray_image, 9, 75, 75)

    @staticmethod
    def enhance_contrast(gray_image: np.ndarray) -> np.ndarray:
        # Contrast Limited Adaptive Histogram Equalization (CLAHE)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        return clahe.apply(gray_image)

    @staticmethod
    def deskew(gray_image: np.ndarray) -> Tuple[np.ndarray, float]:
        """
        Calculates skew angle using minAreaRect on foreground coordinates
        and corrects orientation.
        """
        # Invert to find foreground text pixels
        inv = cv2.bitwise_not(gray_image)
        thresh = cv2.threshold(inv, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

        coords = np.column_stack(np.where(thresh > 0))
        if len(coords) < 10:
            return gray_image, 0.0

        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        elif angle > 45:
            angle = 90 - angle
        else:
            angle = -angle

        # If angle is negligible, return original
        if abs(angle) < 0.5:
            return gray_image, 0.0

        (h, w) = gray_image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            gray_image, M, (w, h), 
            flags=cv2.INTER_CUBIC, 
            borderMode=cv2.BORDER_REPLICATE
        )
        return rotated, angle

    @staticmethod
    def adaptive_threshold(gray_image: np.ndarray) -> np.ndarray:
        """
        Binarizes image for clean OCR extraction.
        """
        return cv2.adaptiveThreshold(
            gray_image, 255, 
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )

    @classmethod
    def preprocess_pipeline(cls, image_path: str, save_preprocessed: bool = True) -> Tuple[np.ndarray, str]:
        """
        Executes full preprocessing pipeline and saves intermediate image.
        Returns (processed_image, output_path).
        """
        img = cls.read_image(image_path)
        gray = cls.convert_to_grayscale(img)
        denoised = cls.remove_noise(gray)
        enhanced = cls.enhance_contrast(denoised)
        deskewed, angle = cls.deskew(enhanced)
        binarized = cls.adaptive_threshold(deskewed)

        out_path = ""
        if save_preprocessed:
            path_obj = Path(image_path)
            out_path = str(path_obj.parent / f"prep_{path_obj.name}.png")
            cv2.imwrite(out_path, binarized)

        return binarized, out_path
