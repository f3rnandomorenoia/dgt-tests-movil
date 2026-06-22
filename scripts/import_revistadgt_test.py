#!/usr/bin/env python3
"""Import one Revista DGT test page into the static app data file."""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, Tag


DEFAULT_SOURCE_NAME = "Revista Tráfico y Seguridad Vial - DGT"
LEGAL_NOTICE_URL = "https://revista.dgt.es/es/aviso-legal.shtml"


def clean_text(value: str) -> str:
    return " ".join(value.replace("\xa0", " ").split())


def question_title_parts(raw: str) -> tuple[int, str]:
    match = re.match(r"^\s*(\d+)\.\s*(.+)$", raw, flags=re.S)
    if not match:
        raise ValueError(f"Question title does not start with a number: {raw!r}")
    return int(match.group(1)), clean_text(match.group(2))


def text_without_child_text(node: Tag, child_selector: str) -> str:
    clone = BeautifulSoup(str(node), "html.parser")
    for child in clone.select(child_selector):
        child.extract()
    return clean_text(clone.get_text(" ", strip=True))


def extract_test(url: str, test_id: str | None, title: str | None) -> dict:
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    page_title = title
    if not page_title:
        candidates = [
            clean_text(h.get_text(" ", strip=True))
            for h in soup.find_all("h3")
            if "Test Anteriores" not in h.get_text(" ", strip=True)
        ]
        page_title = candidates[0] if candidates else clean_text(soup.title.get_text(" ", strip=True))

    generated_id = test_id or re.sub(r"[^a-z0-9]+", "-", page_title.lower()).strip("-")
    questions = []

    for h4 in soup.find_all("h4"):
        try:
            number, prompt = question_title_parts(h4.get_text(" ", strip=True))
        except ValueError:
            continue

        ul = h4.find_next_sibling("ul")
        answer_box = h4.find_next_sibling("div", class_="content_respuesta")
        if not ul or not answer_box:
            continue

        options = []
        for li in ul.find_all("li", recursive=False):
            key_node = li.find(class_="opcion")
            if not key_node:
                continue
            key = clean_text(key_node.get_text(" ", strip=True)).replace(".", "").upper()
            options.append(
                {
                    "key": key,
                    "text": text_without_child_text(li, ".opcion"),
                }
            )

        answer_node = answer_box.find(class_="opcion")
        if not options or not answer_node:
            continue

        image_node = h4.find_previous("img")
        image = None
        if image_node and image_node.get("src"):
            image_url = urljoin(url, image_node["src"])
            alt = clean_text(image_node.get("alt") or "")
            if not alt or alt == image_node["src"]:
                alt = f"Imagen de apoyo de la pregunta {number}"
            image = {
                "url": image_url,
                "alt": alt,
                "sourceUrl": image_url,
            }

        questions.append(
            {
                "id": f"q{number:02d}",
                "number": number,
                "prompt": prompt,
                "image": image,
                "options": options,
                "answer": clean_text(answer_node.get_text(" ", strip=True)).replace(".", "").upper(),
            }
        )

    if not questions:
        raise ValueError(f"No questions found in {url}")

    return {
        "id": generated_id,
        "title": page_title,
        "source": {
            "name": DEFAULT_SOURCE_NAME,
            "url": url,
            "legalNoticeUrl": LEGAL_NOTICE_URL,
        },
        "questionCount": len(questions),
        "questions": questions,
    }


def load_database(path: Path) -> dict:
    if not path.exists():
        return {
            "version": 1,
            "updatedAt": date.today().isoformat(),
            "sourceNote": (
                "Textos procedentes de la Revista DGT con cita de fuente. "
                "Las imágenes se referencian desde sus URLs oficiales y no se re-alojan."
            ),
            "tests": [],
        }
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True, help="Revista DGT test page URL")
    parser.add_argument("--id", required=True, help="Stable app id, e.g. revista-dgt-2026-03")
    parser.add_argument("--title", help="Visible test title")
    parser.add_argument("--out", default="data/tests.json", help="Output JSON file")
    args = parser.parse_args()

    out = Path(args.out)
    data = load_database(out)
    imported = extract_test(args.url, args.id, args.title)
    data["updatedAt"] = date.today().isoformat()
    data["tests"] = [test for test in data.get("tests", []) if test.get("id") != imported["id"]]
    data["tests"].append(imported)
    data["tests"].sort(key=lambda test: test["id"], reverse=True)

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported {imported['questionCount']} questions into {out}")


if __name__ == "__main__":
    main()
