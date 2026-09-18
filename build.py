"""Собирает игру в один файл index.html из src/."""
from pathlib import Path

root = Path(__file__).parent
src = root / "src"
shell = (src / "shell.html").read_text(encoding="utf-8")
parts = ["cards.js", "cards2.js", "engine.js"]
js = "\n".join((src / f).read_text(encoding="utf-8") for f in parts)
assert "/*SCRIPT*/" in shell, "В shell.html нет метки /*SCRIPT*/"
(root / "index.html").write_text(shell.replace("/*SCRIPT*/", js), encoding="utf-8")
print("index.html собран")
