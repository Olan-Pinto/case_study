from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main():
    vite = (ROOT / "vite.config.ts").read_text()
    server = (ROOT / "server/analyst-server.mjs").read_text()
    gitignore = (ROOT / ".gitignore").read_text().splitlines()
    env_example = (ROOT / ".env.example").read_text()
    assert "'/api': 'http://localhost:8787'" in vite
    environment_keys = [line.split("=", 1)[0] for line in env_example.splitlines() if line and not line.startswith("#") and "=" in line]
    assert "OPENAI_API_KEY" in environment_keys
    assert all(not key.startswith("VITE_") for key in environment_keys)
    assert ".env" in gitignore and "!.env.example" in gitignore
    assert "store: false" in server
    assert "detail:" not in server
    assert "maxToolCalls" in server and "parallel_tool_calls: false" in server
    print("VALID: reviewer proxy, server-only secret, safe errors, and bounded AI runtime")


if __name__ == "__main__":
    main()
