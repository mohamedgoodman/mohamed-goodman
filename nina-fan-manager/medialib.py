"""
The photo library: plain folders on disk, one per category.

There is deliberately no database of photos. Drop files into
`media/<category>/` and they are available immediately; delete them and they
are gone. What the database *does* remember is Telegram's `file_id` for each
file, so the second send of a photo costs no upload.
"""

from __future__ import annotations

from pathlib import Path
import random

#: Extensions Telegram accepts as a photo.
IMAGE_SUFFIXES = frozenset({".jpg", ".jpeg", ".png", ".webp"})


def _is_image(path: Path) -> bool:
    return path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES


def categories(root: Path) -> list[str]:
    """Every subfolder of the media root that holds at least one image."""
    if not root.is_dir():
        return []
    found = [
        entry.name
        for entry in root.iterdir()
        if entry.is_dir()
        and not entry.name.startswith(".")
        and any(_is_image(f) for f in entry.iterdir())
    ]
    return sorted(found)


def photos(root: Path, category: str) -> list[Path]:
    """
    Images in a category, sorted by name.

    Sorting matters: the browse buttons address photos by position, so the
    order has to be the same on the click as it was on the render.
    """
    folder = root / category
    if not folder.is_dir():
        return []
    return sorted((f for f in folder.iterdir() if _is_image(f)), key=lambda p: p.name)


def pick(root: Path, category: str, index: int | None = None) -> Path | None:
    """One photo from a category — a given position, or a random one."""
    available = photos(root, category)
    if not available:
        return None
    if index is None:
        return random.choice(available)
    if 0 <= index < len(available):
        return available[index]
    return None


def resolve_category(root: Path, name: str) -> str | None:
    """
    Match a category the way a person would type it: any case, and a unique
    prefix is enough (`/send bou` finds `boudoir`).
    """
    wanted = name.strip().lower()
    available = categories(root)
    for category in available:
        if category.lower() == wanted:
            return category
    matches = [c for c in available if c.lower().startswith(wanted)]
    return matches[0] if len(matches) == 1 else None


def summary(root: Path) -> list[tuple[str, int]]:
    """Category names with how many photos each holds."""
    return [(c, len(photos(root, c))) for c in categories(root)]
