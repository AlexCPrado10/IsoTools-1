# Despliegue de las tres tools

Cada servicio Railway usa el contexto de build de la raíz y su propio Dockerfile:

| Tool | `RAILWAY_DOCKERFILE_PATH` | Servicio |
| --- | --- | --- |
| `calculate_control_charts` | `tools/calculate_control_charts/Docker/Dockerfile` | `calculate-control-charts` |
| `detect_business_anomalies` | `tools/detect_business_anomalies/Docker/Dockerfile` | `detect-business-anomalies` |
| `generate_kpis` | `tools/generate_kpis/Docker/Dockerfile` | `generate-kpis` |

Cada Dockerfile empaqueta el backend Node compartido y la UI de su tool en una
sola imagen y escucha `process.env.PORT` (8101 solo es el valor local por defecto).
El endpoint abierto de liveness es `/health`; las rutas de eventos y artefactos
siguen protegidas por `x-api-key`.

## GitHub Actions

El workflow `.github/workflows/deploy-railway.yml` usa un único secreto de
repositorio llamado `RAILWAY_TOKEN`. No se escribe el token en el código.
El servicio de Railway debe existir previamente y el responsable de plataforma
debe asociar cada nombre de servicio al proyecto correspondiente.

En Railway, configure por servicio:

```text
RAILWAY_DOCKERFILE_PATH=<valor de la tabla>
```

Variables de runtime habituales: `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`, `DB_NAME`, `LOG_LEVEL` y las variables de bootstrap/API key
definidas por plataforma. Nunca las pongas en HTML, Dockerfile ni commits.

## Primer despliegue

1. El administrador crea los tres Services en Railway y entrega el token del equipo.
2. Añadir `RAILWAY_TOKEN` en GitHub → Settings → Secrets and variables → Actions.
3. Configurar `RAILWAY_DOCKERFILE_PATH` en cada Service con la ruta de la tabla.
4. Hacer push a `main` o ejecutar el workflow manualmente con `deploy_all`.
5. Revisar GitHub Actions y comprobar `GET /health` en cada dominio.

No modificar Secrets, Services ni configuración de Railway cuando falle un
deployment; conservar los logs del workflow y escalar el fallo al administrador.
