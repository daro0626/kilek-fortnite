"""Lokalny podgląd pod tym samym prefiksem co GitHub Pages.

Uruchom z dowolnego miejsca:
    python3 testy/podglad.py            # port 8010
    python3 testy/podglad.py 8123

Strona: http://127.0.0.1:8010/kilek-fortnite/
Ścieżki spoza /kilek-fortnite/ zwracają 404, tak jak na Pages, więc błędne
ścieżki bezwzględne (np. /assets/...) od razu wychodzą w konsoli.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys

REPO = Path(__file__).resolve().parents[1]
PREFIKS = '/kilek-fortnite'


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        czysta = path.split('?', 1)[0].split('#', 1)[0]
        if czysta != PREFIKS and not czysta.startswith(PREFIKS + '/'):
            return str(REPO / '__brak__')
        return super().translate_path(czysta[len(PREFIKS):] or '/')

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *args):
        if '--cicho' not in sys.argv:
            super().log_message(fmt, *args)


if __name__ == '__main__':
    liczby = [a for a in sys.argv[1:] if a.isdigit()]
    port = int(liczby[0]) if liczby else 8010
    serwer = ThreadingHTTPServer(('127.0.0.1', port), partial(Handler, directory=str(REPO)))
    print(f'Podgląd: http://127.0.0.1:{port}{PREFIKS}/', flush=True)
    serwer.serve_forever()
