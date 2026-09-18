"""Собирает игру в один файл index.html из src/."""
from pathlib import Path

root = Path(__file__).parent
src = root / "src"
shell = (src / "shell.html").read_text(encoding="utf-8")
js = (src / "cards.js").read_text(encoding="utf-8") + "\n" + (src / "engine.js").read_text(encoding="utf-8")
assert "/*SCRIPT*/" in shell, "В shell.html нет метки /*SCRIPT*/"
(root / "index.html").write_text(shell.replace("/*SCRIPT*/", js), encoding="utf-8")
print("index.html собран")
