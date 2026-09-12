import hashlib
import shutil
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = (
    "https://data.worldpop.org/GIS/Population/Global_2015_2030/R2025A/"
    "2025/ARE/v1/100m/constrained/are_pop_2025_CN_100m_R2025A_v1.tif"
)
TARGET = ROOT / "data/raw/worldpop/are_pop_2025_CN_100m_R2025A_v1.tif"
EXPECTED_SHA256 = "8cf781de6e1031425dc645c743f932cf778af10a93a890a51255f76c34f2e5b9"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify(path: Path) -> None:
    observed = sha256(path)
    if observed != EXPECTED_SHA256:
        raise ValueError(
            f"WorldPop checksum mismatch for {path}: expected {EXPECTED_SHA256}, got {observed}"
        )


def main() -> None:
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    if TARGET.exists():
        verify(TARGET)
        print(f"VALID: existing WorldPop raster {TARGET.name}")
        return

    temporary = TARGET.with_suffix(".tif.download")
    try:
        with urllib.request.urlopen(SOURCE_URL, timeout=120) as response, temporary.open("wb") as sink:
            shutil.copyfileobj(response, sink)
        verify(temporary)
        temporary.replace(TARGET)
    finally:
        if temporary.exists():
            temporary.unlink()
    print(f"Wrote verified WorldPop raster {TARGET.name}")


if __name__ == "__main__":
    main()
