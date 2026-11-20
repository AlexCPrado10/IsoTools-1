# detect_business_anomalies

- Backend: `src/tools/detect_business_anomalies.js`
- Frontend: `frontend/index.html`
- Dockerfile: `Docker/Dockerfile`
- Railway: `RAILWAY_DOCKERFILE_PATH=tools/detect_business_anomalies/Docker/Dockerfile`

En `/` se selecciona una métrica, desviación, sensibilidad y periodo. El panel
muestra valores esperados/observados, Z-score, severidad y cadena causal. Las
ejecuciones manuales generan eventos sintéticos `ENS-*` en el Core; consulta
`DEPLOYMENT.md` para requisitos de sesión y API key.
