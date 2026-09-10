import unittest

from scripts.verify_manual_reputation_collection import parse_collection


class ManualReputationCollectionTests(unittest.TestCase):
    def test_parses_rated_and_user_confirmed_closed_rows(self):
        rows = parse_collection(
            "pinnacle_building | 4.6 | 747 | https://www.google.com/maps/place/example | 09/09/26 | note\n"
            "golden_mile_galleria | permanently closed\n"
        )
        self.assertEqual(rows[0]["rating"], 4.6)
        self.assertEqual(rows[0]["review_count"], 747)
        self.assertEqual(rows[1]["status"], "user_confirmed_permanently_closed")

    def test_rejects_non_google_maps_url(self):
        with self.assertRaises(ValueError):
            parse_collection("pinnacle_building | 4.6 | 747 | https://example.com/place\n")


if __name__ == "__main__":
    unittest.main()
