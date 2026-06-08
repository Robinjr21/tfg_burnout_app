# 🧠 Burnout Journal — Diario Emocional con IA

Aplicación multiplataforma (web y móvil) que funciona como diario emocional interactivo. 
Integra un modelo de PLN basado en BETO para detectar signos tempranos de estrés, 
fatiga cognitiva y cinismo, emitiendo alertas preventivas para prevenir el síndrome 
de desgaste profesional.

Desarrollado como Trabajo de Fin de Grado en Ingeniería Informática.

---

## 🏗️ Arquitectura

- **Frontend**: React Native + Expo (web y móvil desde una sola base de código)
- **Backend**: FastAPI (Python) + PostgreSQL
- **Modelo IA**: BETO fine-tuned exportado a ONNX (F1-macro: 0.945)
- **Seguridad**: AES-256-GCM para cifrado de entradas, JWT para autenticación

---

## ⚙️ Requisitos previos

- Python 3.11+
- Node.js 18+
- Docker Desktop
- Expo Go (opcional, para pruebas en móvil)

---

## 🚀 Instalación y arranque

### 1. Clonar el repositorio

```bash
git clone https://github.com/Robinjr21/tfg_burnout_app.git
cd tfg_burnout_app
```

### 2. Arrancar la base de datos

```bash
docker-compose up -d
```

### 3. Configurar el backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env      # Edita .env con tus valores
uvicorn app.main:app --reload
```

### 4. Arrancar el frontend

```bash
cd frontend
npm install
npx expo start
```

Pulsa `w` para abrir en navegador o escanea el QR con Expo Go.

---

## 🔑 Variables de entorno

Copia `backend/.env.example` a `backend/.env` y configura:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `SECRET_KEY` | Clave secreta para JWT (mín. 32 chars) |
| `ENTRY_ENCRYPTION_KEY` | Clave AES-256 para cifrar entradas |
| `ALGORITHM` | Algoritmo JWT (HS256) |

---

## 🧪 Ejecutar tests

```bash
cd backend
pytest tests/ -v
```

---

## 📁 Estructura del proyecto

tfg_burnout_app/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuración, BD, seguridad
│   │   ├── models/        # ORM (User, Entry, Alert)
│   │   ├── routers/       # Endpoints API
│   │   ├── schemas/       # Pydantic schemas
│   │   └── ml/            # Modelo ONNX + predictor
│   └── tests/             # Pruebas unitarias
├── frontend/
│   ├── app/
│   │   ├── (auth)/        # Login, Registro
│   │   └── (app)/         # Dashboard, Diario, Historial, Perfil
│   ├── components/        # Componentes reutilizables
│   ├── services/          # Cliente API
│   └── store/             # Estado global (Zustand)
└── ml/                    # Notebooks de entrenamiento (Google Colab)


---

## 📊 Resultados del modelo

| Modelo | F1-macro | Accuracy |
|---|---|---|
| Baseline léxico (EN) | 0.321 | — |
| Baseline léxico (ES) | 0.478 | 47.4% |
| BETO v1 | 0.945 | 94.4% |
| BETO v2 (dataset ampliado) | 0.945 | 94.8% |

---

## 🔒 Privacidad

- Las entradas del diario se cifran con **AES-256-GCM** antes de guardarse
- Las contraseñas se almacenan con **bcrypt**
- UUID como claves primarias (no enteros secuenciales)
- Derecho al olvido: endpoint de eliminación de cuenta

---

## 📄 Licencia

Proyecto académico — TFG Ingeniería Informática.
