"""
Predictor de burnout basado en modelo BETO fine-tuned exportado a ONNX.
Reemplaza el baseline léxico con inferencia real.
"""
import os
from typing import TypedDict
from pathlib import Path

import numpy as np
from transformers import AutoTokenizer
from optimum.onnxruntime import ORTModelForSequenceClassification

from app.ml.preprocess import preprocess

# Ruta al modelo
MODEL_PATH = Path(__file__).parent / "models" / "burnout_model_onnx"

# Etiquetas (orden debe coincidir con el entrenamiento)
LABELS = ["sin_burnout", "estres_cinismo", "fatiga"]

# Cargar modelo y tokenizador una sola vez al arrancar
_tokenizer = None
_model = None


def _load_model():
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        _tokenizer = AutoTokenizer.from_pretrained(str(MODEL_PATH))
        _model = ORTModelForSequenceClassification.from_pretrained(str(MODEL_PATH))


class PredictionResult(TypedDict):
    stress: float
    fatigue: float
    cynicism: float


def predict(text: str) -> PredictionResult:
    """
    Clasifica una entrada de diario en dimensiones de burnout.

    Args:
        text: Texto libre de la entrada del diario

    Returns:
        Scores de estrés, fatiga y cinismo (0.0 - 1.0)
    """
    _load_model()

    # Preprocesar
    clean_text = preprocess(text)
    if not clean_text:
        return PredictionResult(stress=0.0, fatigue=0.0, cynicism=0.0)

    # Tokenizar
    inputs = _tokenizer(
        clean_text,
        max_length=256,
        padding="max_length",
        truncation=True,
        return_tensors="np"
    )

    # Inferencia
    outputs = _model(**inputs)
    logits = outputs.logits[0]

    # Softmax para obtener probabilidades
    exp_logits = np.exp(logits - np.max(logits))
    probs = exp_logits / exp_logits.sum()

    # probs[0]=sin_burnout, probs[1]=estres_cinismo, probs[2]=fatiga
    no_burnout_prob = float(probs[0])

    # Si el modelo está seguro de que no hay burnout, devolver ceros
    if no_burnout_prob > 0.5:
        return PredictionResult(stress=0.0, fatigue=0.0, cynicism=0.0)

    return PredictionResult(
        stress=float(probs[1]),
        fatigue=float(probs[2]),
        cynicism=float(probs[1]),
    )


# --- Test rápido ---
if __name__ == "__main__":
    examples = [
        "Hoy ha sido un día tranquilo y me siento bien con mi trabajo.",
        "Estoy agobiado, no llego a los plazos y estoy totalmente saturado.",
        "Estoy agotado, llevo semanas sin dormir bien y sin energía.",
    ]
    for text in examples:
        result = predict(text)
        print(f"Texto: {text[:50]}...")
        print(f"  Estrés:  {result['stress']:.3f}")
        print(f"  Fatiga:  {result['fatigue']:.3f}")
        print(f"  Cinismo: {result['cynicism']:.3f}")
        print()