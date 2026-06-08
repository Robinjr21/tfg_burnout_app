"""
Pipeline de preprocesamiento de texto para el modelo de detección de burnout.
Aplica limpieza y normalización antes de la inferencia.
"""
import re
import unicodedata


def normalize_text(text: str) -> str:
    """Normaliza caracteres unicode — elimina acentos y caracteres especiales."""
    return unicodedata.normalize("NFKC", text)


def remove_urls(text: str) -> str:
    """Elimina URLs del texto."""
    return re.sub(r"https?://\S+|www\.\S+", "", text)


def remove_extra_whitespace(text: str) -> str:
    """Elimina espacios múltiples y saltos de línea."""
    return re.sub(r"\s+", " ", text).strip()


def remove_special_characters(text: str) -> str:
    """Elimina caracteres especiales manteniendo puntuación básica."""
    return re.sub(r"[^\w\s\.\,\!\?\-\'\"]", " ", text)


def truncate_text(text: str, max_words: int = 200) -> str:
    """Trunca el texto a un máximo de palabras."""
    words = text.split()
    if len(words) > max_words:
        return " ".join(words[:max_words])
    return text


def preprocess(text: str, max_words: int = 200) -> str:
    """
    Pipeline completo de preprocesamiento.
    Aplica todas las transformaciones en orden.

    Args:
        text: Texto de entrada (entrada del diario)
        max_words: Máximo de palabras a considerar

    Returns:
        Texto limpio y normalizado listo para tokenizar
    """
    if not text or not text.strip():
        return ""

    text = normalize_text(text)
    text = remove_urls(text)
    text = remove_special_characters(text)
    text = remove_extra_whitespace(text)
    text = truncate_text(text, max_words)

    return text


# --- Test rápido ---
if __name__ == "__main__":
    examples = [
        "Hoy estoy muy agobiado!!   Visita https://ayuda.com para más info.",
        "Me siento   vacío  y sin   energía...",
        "Todo   bien   por   aquí 😊🙌",
    ]
    for ex in examples:
        print(f"Original:  {ex}")
        print(f"Procesado: {preprocess(ex)}")
        print()