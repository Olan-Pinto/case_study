from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main():
    app = (ROOT / "src/App.tsx").read_text()
    map_source = (ROOT / "src/NetworkMap.tsx").read_text()
    styles = (ROOT / "src/styles.css").read_text()
    main_source = (ROOT / "src/main.tsx").read_text()
    analyst = (ROOT / "src/AnalystPanel.tsx").read_text()
    review = (ROOT / "src/PortfolioReviewPanel.tsx").read_text()
    assert "aria-pressed=" in app
    assert ":focus-visible" in styles
    assert 'role="alert"' in map_source and "Basemap unavailable" in map_source
    assert "essential: false" in map_source
    assert "ApplicationErrorBoundary" in main_source and 'role="alert"' in main_source
    assert "aria-busy" in analyst and "aria-busy" in review
    print("VALID: keyboard, focus, basemap-error, and render-error contracts")


if __name__ == "__main__":
    main()
