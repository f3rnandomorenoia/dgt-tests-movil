# Tests DGT móvil

Web estática móvil para practicar tests tipo examen.

Tests publicados: **Marzo 2026** y todos los tests localizados de **2025**, **2024**, **2023**, **2022**, **2021** y **2020**, procedentes de la sección de tests de la Revista DGT.

Estado de tests importados y pendientes: [PENDING-EXAMS.md](PENDING-EXAMS.md).

## Vigencia normativa

Las preguntas publicadas se revisan contra cambios normativos posteriores. Cuando una respuesta oficial antigua contradice la normativa vigente, la pregunta queda marcada como `No usar para examen actual`, se deshabilita y no cuenta en la puntuación. La ficha muestra la regla actual y la fuente normativa que la bloquea.

Revisión actual: **3 preguntas bloqueadas** sobre **369** publicadas.

## Fuente y derechos

- Fuente textual: Revista “Tráfico y Seguridad Vial” de la DGT.
- La propia revista permite reproducir total o parcialmente sus textos citando la fuente.
- El aviso legal prohíbe reproducir dibujos, gráficos, infografías, esquemas o fotografías sin autorización escrita, así que esta app no re-aloja imágenes: las referencia desde sus URLs oficiales.
- Esta web no es un producto oficial de la DGT.

## Desarrollo local

```bash
python3 scripts/import_revistadgt_test.py \
  --url https://revista.dgt.es/es/test/index.shtml \
  --id revista-dgt-2026-03 \
  --title "Marzo 2026" \
  --out data/tests.json

python3 -m http.server 4173
```

Abrir `http://127.0.0.1:4173/`.
