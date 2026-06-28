# CI

El workflow de CI está en `ci.yml.disabled`. No se pudo subir como
`.github/workflows/ci.yml` en el primer push porque el token usado no tenía el
scope `workflow`.

Para activarlo, con un token con scope `workflow` (o desde la UI de GitHub):

```bash
git mv .github/ci.yml.disabled .github/workflows/ci.yml
git commit -m "ci: activar workflow"
git push
```
