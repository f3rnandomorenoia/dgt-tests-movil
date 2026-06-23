# Tests DGT pendientes

Estado actualizado: 2026-06-23.

Fuente oficial revisada: Revista DGT, sección `Test`, más URLs históricas `Test-num-253` a `Test-num-277`.

## Hecho

| Estado | Test | Revista | URL |
| --- | --- | ---: | --- |
| Hecho | Marzo 2026 | 277 | https://revista.dgt.es/es/test/index.shtml |
| Hecho | Diciembre 2025 | 276 | https://revista.dgt.es/es/test/Test-num-276.shtml |
| Hecho | Octubre 2025 | 275 | https://revista.dgt.es/es/test/Test-num-275.shtml |
| Hecho | Junio 2025 | 274 | https://revista.dgt.es/es/test/Test-num-274.shtml |
| Hecho | Abril 2025 | 273 | https://revista.dgt.es/es/test/Test-num-273.shtml |
| Hecho | Diciembre 2024 | 272 | https://revista.dgt.es/es/test/Test-num-272.shtml |
| Hecho | Octubre 2024 | 271 | https://revista.dgt.es/es/test/Test-num-271.shtml |
| Hecho | Junio 2024 | 270 | https://revista.dgt.es/es/test/Test-num-270.shtml |
| Hecho | Marzo 2024 | 269 | https://revista.dgt.es/es/test/Test-num-269.shtml |
| Hecho | Diciembre 2023 | 268 | https://revista.dgt.es/es/test/Test-num-268.shtml |
| Hecho | Octubre 2023 | 267 | https://revista.dgt.es/es/test/Test-num-267.shtml |
| Hecho | Junio 2023 | 266 | https://revista.dgt.es/es/test/Test-num-266.shtml |
| Hecho | Marzo 2023 | 265 | https://revista.dgt.es/es/test/Test-num-265.shtml |
| Hecho | Diciembre 2022 | 264 | https://revista.dgt.es/es/test/Test-num-264.shtml |
| Hecho | Octubre 2022 | 263 | https://revista.dgt.es/es/test/Test-num-263.shtml |
| Hecho | Junio 2022 | 262 | https://revista.dgt.es/es/test/Test-num-262.shtml |
| Hecho | Marzo 2022 | 261 | https://revista.dgt.es/es/test/Test-num-261.shtml |
| Hecho | Diciembre 2021 | 260 | https://revista.dgt.es/es/test/Test-num-260.shtml |
| Hecho | Octubre 2021 | 259 | https://revista.dgt.es/es/test/Test-num-259.shtml |
| Hecho | Junio 2021 | 258 | https://revista.dgt.es/es/test/Test-num-258.shtml |
| Hecho | Marzo 2021 | 257 | https://revista.dgt.es/es/test/Test-num-257.shtml |
| Hecho | Diciembre 2020 | 256 | https://revista.dgt.es/es/test/Test-num-256.shtml |
| Hecho | Octubre 2020 | 255 | https://revista.dgt.es/es/test/Test-num-255.shtml |
| Hecho | Julio 2020 | 254 | https://revista.dgt.es/es/test/Test-num-254.shtml |
| Hecho | Junio 2020 | 253 | https://revista.dgt.es/es/test/Test-num-253.shtml |

## Pendientes

No quedan tests pendientes dentro del alcance revisado, desde Junio 2020 hasta Marzo 2026.

## Comando para importar uno

```bash
python3 scripts/import_revistadgt_test.py \
  --url https://revista.dgt.es/es/test/index.shtml \
  --id revista-dgt-YYYY-MM \
  --title "Mes YYYY" \
  --out data/tests.json
```

Despues de importar:

```bash
npm run check
python3 -m py_compile scripts/import_revistadgt_test.py
python3 -m http.server 4173
```

Verificar en movil o Chrome headless que el test aparece en el selector, que las imagenes cargan desde DGT, que no hay desbordamiento horizontal y que el flujo responder/avanzar/finalizar funciona.

## Nota legal

El repo no debe re-alojar imagenes de DGT. La app debe seguir referenciando las imagenes por URL oficial, porque el aviso legal de Revista DGT permite reproducir textos citando fuente pero restringe la reproduccion de dibujos, graficos, infografias, esquemas o fotografias sin autorizacion escrita.
