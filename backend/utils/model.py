"""
ONNX Runtime inference engine for NeuralScan.

Model:
    ResNet50_best.onnx

Class mapping:
    fake = 0
    real = 1
"""

import os
import io
import logging

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

IMAGE_SIZE = (224, 224)

IMAGENET_MEAN = np.array(
    [0.485, 0.456, 0.406],
    dtype=np.float32
)

IMAGENET_STD = np.array(
    [0.229, 0.224, 0.225],
    dtype=np.float32
)

FAKE_IDX = 0
REAL_IDX = 1

_session = None


def _load_model():
    global _session

    if _session is not None:
        return _session

    import onnxruntime as ort

    root_dir = os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )

    default_model_path = os.path.join(
        root_dir,
        "model",
        "ResNet50_best.onnx"
    )

    model_path = os.environ.get(
        "MODEL_PATH",
        default_model_path
    )

    if not os.path.isabs(model_path):
        model_path = os.path.join(
            root_dir,
            model_path
        )

    if not os.path.exists(model_path):
        logger.warning(
            "ONNX model not found at '%s'. MOCK mode.",
            model_path
        )
        return None

    try:
        providers = ort.get_available_providers()

        if "CoreMLExecutionProvider" in providers:
            selected_providers = [
                "CoreMLExecutionProvider"
            ]
        else:
            selected_providers = [
                "CPUExecutionProvider"
            ]

        session = ort.InferenceSession(
            model_path,
            providers=selected_providers
        )

        logger.info(
            "ONNX model loaded | path=%s | device=%s | providers=%s",
            model_path,
            selected_providers[0],
            session.get_providers()
        )

        _session = session

        return _session

    except Exception as e:
        logger.error(
            "Failed to load ONNX model: %s",
            e
        )
        return None


def preprocess(image_bytes: bytes):
    img = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    img = img.resize(
        IMAGE_SIZE,
        Image.LANCZOS
    )

    arr = np.asarray(
        img,
        dtype=np.float32
    ) / 255.0

    arr = (
        arr - IMAGENET_MEAN
    ) / IMAGENET_STD

    # HWC -> CHW
    arr = np.transpose(
        arr,
        (2, 0, 1)
    )

    # Add batch dimension
    arr = np.expand_dims(
        arr,
        axis=0
    )

    return arr.astype(np.float32)


def run_inference(image_bytes: bytes) -> dict:
    session = _load_model()

    if session is None:
        return _mock_inference()

    tensor = preprocess(image_bytes)

    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name

    outputs = session.run(
        [output_name],
        {
            input_name: tensor
        }
    )

    logits = outputs[0][0]

    # Softmax
    logits = logits - np.max(logits)

    exp_logits = np.exp(logits)

    probs = exp_logits / np.sum(exp_logits)

    p_fake = float(probs[FAKE_IDX])
    p_real = float(probs[REAL_IDX])

    is_ai = p_fake >= p_real

    raw_score = (
        p_fake
        if is_ai
        else p_real
    )

    return {
        "label": "AI" if is_ai else "Real",
        "confidence": int(round(raw_score * 100)),
        "raw_score": raw_score,
    }


def _mock_inference() -> dict:
    import random

    is_ai = random.random() > 0.5
    conf = random.randint(73, 97)

    return {
        "label": "AI" if is_ai else "Real",
        "confidence": conf,
        "raw_score": conf / 100,
    }


def make_thumbnail(
    image_bytes: bytes,
    width: int = 240
) -> bytes:

    img = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    h = max(
        1,
        int(img.height * width / img.width)
    )

    img = img.resize(
        (width, h),
        Image.LANCZOS
    )

    buf = io.BytesIO()

    img.save(
        buf,
        format="JPEG",
        quality=72
    )

    return buf.getvalue()


def get_image_dimensions(
    image_bytes: bytes
) -> tuple:

    return Image.open(
        io.BytesIO(image_bytes)
    ).size
