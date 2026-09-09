import json
import unittest
from pathlib import Path

from scripts.validate_branches import MANIFEST, SNAPSHOT, validate


class BranchSnapshotValidationTests(unittest.TestCase):
    def setUp(self):
        self.snapshot = json.loads(Path(SNAPSHOT).read_text(encoding="utf-8"))
        self.manifest = json.loads(Path(MANIFEST).read_text(encoding="utf-8"))

    def test_committed_snapshot_is_valid(self):
        self.assertEqual(validate(self.snapshot, self.manifest), [])

    def test_rejects_duplicate_branch_id(self):
        snapshot = json.loads(json.dumps(self.snapshot))
        snapshot["records"].append(dict(snapshot["records"][0]))
        self.assertIn("duplicate branch_id", validate(snapshot, self.manifest))

    def test_rejects_out_of_bounds_coordinates(self):
        snapshot = json.loads(json.dumps(self.snapshot))
        snapshot["records"][0]["latitude"] = 0.0
        snapshot["records"][0]["longitude"] = 0.0
        snapshot["records"][0]["coordinate_confidence"] = "open_geospatial_point"
        self.assertTrue(any("outside plausible UAE bounds" in error for error in validate(snapshot, self.manifest)))

    def test_rejects_missing_provenance(self):
        snapshot = json.loads(json.dumps(self.snapshot))
        snapshot["records"][0]["source_ids"] = []
        self.assertTrue(any("no provenance" in error for error in validate(snapshot, self.manifest)))
