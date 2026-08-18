"""The filesystem side of the photo library."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import medialib


class MediaLibraryTest(unittest.TestCase):
    def setUp(self) -> None:
        self.root = Path(tempfile.mkdtemp())
        for category, names in {
            "boudoir": ["b2.jpg", "b1.jpg", "b3.JPEG"],
            "fullbody": ["f1.png", "notes.txt"],
            "documents": ["readme.md"],
        }.items():
            (self.root / category).mkdir()
            for name in names:
                (self.root / category / name).write_bytes(b"x")
        (self.root / ".hidden").mkdir()
        (self.root / ".hidden" / "h.jpg").write_bytes(b"x")

    def test_only_folders_holding_images_count_as_categories(self) -> None:
        self.assertEqual(medialib.categories(self.root), ["boudoir", "fullbody"])

    def test_hidden_folders_are_ignored(self) -> None:
        self.assertNotIn(".hidden", medialib.categories(self.root))

    def test_photos_are_sorted_so_button_positions_stay_put(self) -> None:
        self.assertEqual(
            [p.name for p in medialib.photos(self.root, "boudoir")],
            ["b1.jpg", "b2.jpg", "b3.JPEG"],
        )

    def test_non_images_are_left_out(self) -> None:
        self.assertEqual([p.name for p in medialib.photos(self.root, "fullbody")], ["f1.png"])

    def test_pick_by_position_and_out_of_range(self) -> None:
        self.assertEqual(medialib.pick(self.root, "boudoir", 0).name, "b1.jpg")
        self.assertIsNone(medialib.pick(self.root, "boudoir", 99))
        self.assertIsNone(medialib.pick(self.root, "boudoir", -1))

    def test_a_category_matches_by_case_and_unique_prefix(self) -> None:
        self.assertEqual(medialib.resolve_category(self.root, "BOUDOIR"), "boudoir")
        self.assertEqual(medialib.resolve_category(self.root, "bou"), "boudoir")

    def test_an_ambiguous_or_missing_name_resolves_to_nothing(self) -> None:
        self.assertIsNone(medialib.resolve_category(self.root, ""))
        self.assertIsNone(medialib.resolve_category(self.root, "zzz"))

    def test_a_missing_root_is_empty_rather_than_an_error(self) -> None:
        self.assertEqual(medialib.categories(self.root / "nope"), [])
        self.assertEqual(medialib.photos(self.root, "nope"), [])

    def test_summary_counts_each_category(self) -> None:
        self.assertEqual(medialib.summary(self.root), [("boudoir", 3), ("fullbody", 1)])


if __name__ == "__main__":
    unittest.main()
