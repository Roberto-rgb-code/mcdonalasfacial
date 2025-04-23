

# Ordena & Disfruta

**Ordena & Disfruta** es una aplicación de quiosco para McDonald’s que utiliza reconocimiento facial y detección de emociones para ofrecer recomendaciones de menú personalizadas a los usuarios. Integra **DeepFace** para la detección de emociones en tiempo real (feliz, triste, frustrado) y **Google Vertex AI** para predecir las preferencias de los usuarios basadas en su historial de compras y emociones detectadas. La interfaz está construida con React y Vite, estilizada con Tailwind CSS, e incluye animaciones interactivas para una experiencia de usuario atractiva. El backend es una API Flask que maneja la detección de emociones y las predicciones de Vertex AI.

La aplicación captura un fotograma de video, lo envía al backend para detectar la emoción, y realiza un ciclo de tres detecciones de emociones, cada una con un mensaje único y personalizado. El frontend está desplegado y accesible en el siguiente enlace:

**[Demo en Vivo](https://mcdonalasfacial.vercel.app/)**

---

## Características
- **Reconocimiento Facial**: Identifica a los usuarios (simulado por ahora) y recupera su historial de compras para sugerir combos personalizados.
- **Detección de Emociones**: Detecta emociones (feliz, triste, frustrado) usando DeepFace, mostrando tres detecciones con mensajes únicos para cada emoción.
- **Predicciones con Vertex AI**: Utiliza Google Vertex AI para predecir las preferencias de los usuarios según su emoción y historial de compras.
- **Interfaz Interactiva**: Incluye animaciones CSS (rebote, deslizamiento, sacudida, aparición) para hacer los mensajes más atractivos.
- **Compatibilidad Móvil**: Funciona en dispositivos móviles con acceso a la cámara (requiere HTTPS para WebRTC).
- **Recomendaciones Personalizadas**: Sugiere combos adaptados (por ejemplo, "Happy Boost", "Comfort Meal") con botones interactivos para añadir los elementos al carrito.

---

## Stack Tecnológico
- **Frontend**:
  - React (con Vite): Framework para construir la interfaz de usuario.
  - Tailwind CSS: Framework CSS para estilización.
  - Axios: Para realizar solicitudes HTTP al backend.
- **Backend**:
  - Flask (Python): Framework para crear la API.
  - DeepFace: Biblioteca para detección de emociones y reconocimiento facial.
  - Google Vertex AI: Para predicciones de preferencias de usuarios.
  - OpenCV: Para procesamiento de imágenes.
- **Despliegue**:
  - Frontend: Vercel (https://mcdonalasfacial.vercel.app/)
  - Backend: Requiere despliegue en una plataforma como Google Cloud Run o Heroku (pendiente).

---

## Instalación

### Prerrequisitos
- Node.js (versión 18 o superior)
- Python (versión 3.8 o superior)
- Git
- Cuenta en Google Cloud (para Vertex AI)
- Acceso a Vercel (para el despliegue del frontend)

### Configuración del Frontend
1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd ordena-disfruta
   ```

2. Instala las dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Inicia el servidor de desarrollo del frontend:
   ```bash
   npm run dev
   ```
   El frontend se ejecutará en `http://localhost:5173`.

### Configuración del Backend
1. Configura un entorno virtual para Python y actívalo:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

2. Instala las dependencias del backend:
   ```bash
   pip install flask deepface opencv-python numpy google-cloud-aiplatform
   ```

3. Configura las credenciales de Google Cloud para Vertex AI:
   - Descarga tu clave de cuenta de servicio desde Google Cloud Console.
   - Configura la variable de entorno:
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"
     ```
   - Asegúrate de reemplazar `'your-project-id'` y `'your-endpoint-id'` en `server.py` con tu ID de proyecto y endpoint de Vertex AI.

4. Inicia el servidor Flask:
   ```bash
   python server.py
   ```
   El backend se ejecutará en `http://localhost:5000`.

### Configuración del Proyecto
- Asegúrate de que el frontend esté configurado para hacer solicitudes al backend. Actualiza la URL de las solicitudes `axios` en `App.jsx` si el backend no está en `http://localhost:5000`.

---

## Despliegue

### Frontend (Desplegado en Vercel)
El frontend está desplegado en Vercel y accesible en:

**[Demo en Vivo](https://mcdonalasfacial.vercel.app/)**

Para desplegar tu propia versión:
1. Crea un repositorio en GitHub y sube el proyecto.
2. Importa el repositorio en Vercel.
3. Vercel detectará automáticamente el proyecto Vite y lo desplegará con HTTPS.

### Backend (Pendiente de Despliegue)
El backend debe desplegarse en una plataforma que soporte HTTPS, como Google Cloud Run o Heroku:
1. **Google Cloud Run**:
   - Crea un archivo `Dockerfile` para el backend:
     ```dockerfile
     FROM python:3.8-slim
     WORKDIR /app
     COPY . .
     RUN pip install -r requirements.txt
     CMD ["python", "server.py"]
     ```
   - Despliega con:
     ```bash
     gcloud run deploy --source . --region us-central1
     ```
2. Actualiza la URL de la API en `App.jsx` con la URL del backend desplegado.

---

## Uso
1. Abre la aplicación en un navegador (preferiblemente Chrome o Safari en móviles).
2. Haz clic en "Start Facial Recognition" para iniciar el reconocimiento facial.
3. Otorga permiso de acceso a la cámara cuando se te solicite.
4. La aplicación detectará la primera emoción y mostrará un mensaje personalizado.
5. Haz clic en "Detectar Siguiente Emoción" para ver hasta tres detecciones de emociones (feliz, triste, frustrado), cada una con un mensaje único.
6. Usa los botones para añadir combos personalizados al carrito.
7. Haz clic en "Reiniciar Escaneo" para comenzar de nuevo.

---

## Notas
- **Reconocimiento Facial Real**: La aplicación usa DeepFace para detectar emociones en tiempo real, pero el reconocimiento de usuarios es simulado. Para implementar reconocimiento facial real, necesitarías entrenar un modelo con imágenes de usuarios y usar DeepFace para identificarlos.
- **Vertex AI**: Asegúrate de tener un modelo desplegado en Vertex AI y actualiza las credenciales en el backend.
- **HTTPS**: Para que el acceso a la cámara funcione en móviles, el frontend y el backend deben estar desplegados con HTTPS.
- **Rendimiento**: En dispositivos móviles de gama baja, el procesamiento de DeepFace puede ser lento. Considera optimizar el backend o usar un servidor más potente.

---

## Contribuciones
Si deseas contribuir al proyecto:
1. Haz un fork del repositorio.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -m "Añade nueva funcionalidad"`).
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`).
5. Crea un pull request en GitHub.

---

## Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

**Desarrollado por:** Roberto Ruiz 
**Enlace al Proyecto Desplegado:** [https://mcdonalasfacial.vercel.app/](https://mcdonalasfacial.vercel.app/)  

