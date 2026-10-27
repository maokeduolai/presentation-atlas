import importlib.util
import json
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
import subprocess
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('atlas', ROOT / 'public/atlas.py')
atlas = importlib.util.module_from_spec(spec)
spec.loader.exec_module(atlas)


class QueryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = json.loads(subprocess.check_output(
            ['node', '--input-type=module', '-e', 'import {createCatalog} from "./src/ai-data.js"; process.stdout.write(JSON.stringify(createCatalog()))'],
            cwd=ROOT, text=True, encoding='utf-8'))
        cls.temp = tempfile.TemporaryDirectory(prefix='atlas-server-')
        cls.root = Path(cls.temp.name)
        (cls.root / 'index.html').write_text('<h1>offline</h1>', encoding='utf-8')
        (cls.root / 'api/v1').mkdir(parents=True)
        (cls.root / 'api/v1/catalog.json').write_text(json.dumps(cls.catalog, ensure_ascii=False), encoding='utf-8')
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(atlas.AtlasHandler, root=cls.root, catalog=cls.catalog))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = 'http://127.0.0.1:' + str(cls.server.server_port)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)
        cls.temp.cleanup()

    def test_scenario_filter_and_limit(self):
        for context, label in self.catalog['contexts'].items():
            expected = [s for s in self.catalog['styles'] if label in s['contexts'] and s['daily']]
            result = atlas.search(self.catalog, context=context, daily=True, limit=2)
            self.assertEqual(result['total'], len(expected))
            self.assertEqual(result['count'], min(2, len(expected)))
            self.assertTrue(all(label in s['contexts'] for s in result['styles']))
        self.assertEqual(atlas.search(self.catalog, q='技术单色')['styles'][0]['id'], 'technical')
        self.assertEqual(atlas.search(self.catalog, q='SWISS TYPOGRAPHIC')['styles'][0]['id'], 'swiss')
        self.assertEqual(atlas.search(self.catalog, q='no-such-style-in-catalog')['total'], 0)

    def test_all_selected_combinations(self):
        for style in self.catalog['styles']:
            for palette in style['palettes']:
                for chart in self.catalog['chart_modes']:
                    result = atlas.show(self.catalog, style['id'], palette['id'], chart)
                    self.assertEqual(result['complete_pack'], palette['variants'][chart]['complete_pack'])
                    self.assertEqual(result['palette']['roles'], palette['roles'])
                    self.assertEqual(result['style']['history'], style['history'])

    def test_errors_are_explicit(self):
        with self.assertRaises(KeyError):
            atlas.show(self.catalog, 'not-a-style')
        for kwargs in [{'context': 'medicine'}, {'kind': 'future'}, {'daily': 'true'}, {'limit': 0}, {'limit': 101}]:
            with self.assertRaises(ValueError):
                atlas.search(self.catalog, **kwargs)
        with self.assertRaises(ValueError):
            atlas.show(self.catalog, 'swiss', 'not-a-palette')

    def test_http_and_plaintext_match_cli_model(self):
        with urlopen(self.base + '/api/v1/styles?context=academic&daily=true&limit=2') as response:
            result = json.load(response)
            self.assertEqual(result, atlas.search(self.catalog, context='academic', daily=True, limit=2))
        path = '/api/v1/styles/swiss?palette=cobalt-grid&chart=diverging&format=pack'
        expected = atlas.show(self.catalog, 'swiss', 'cobalt-grid', 'diverging')['complete_pack']
        with urlopen(self.base + path) as response:
            self.assertEqual(response.read().decode(), expected)
            self.assertTrue(response.headers['Content-Type'].startswith('text/plain'))
        with urlopen(Request(self.base + path, method='HEAD')) as response:
            self.assertEqual(response.read(), b'')
            self.assertEqual(int(response.headers['Content-Length']), len(expected.encode()))
        with urlopen(self.base + '/api/v1/catalog.json') as response:
            self.assertEqual(json.load(response), self.catalog)

    def test_http_rejects_bad_parameters_and_paths(self):
        for path, code in [('/api/v1/styles?daily=yes', 400), ('/api/v1/styles?limit=no', 400),
                           ('/api/v1/styles?limit=1000', 400), ('/api/v1/styles?q=a&q=b', 400),
                           ('/api/v1/styles?unknown=true', 400), ('/api/v1/styles?context=', 400),
                           ('/api/v1/styles/swiss?palette=bad', 400), ('/api/v1/styles/bad', 404),
                           ('/api/v1/styles/swiss?chart=bad', 400), ('/api/v1/styles/swiss?format=bad', 400),
                           ('/api/', 404), ('/%2e%2e/private.txt', 403)]:
            with self.subTest(path=path), self.assertRaises(HTTPError) as error:
                urlopen(self.base + path)
            self.assertEqual(error.exception.code, code)
        with self.assertRaises(HTTPError) as error:
            urlopen(Request(self.base + '/api/v1/styles', headers={'Host': 'example.com'}))
        self.assertEqual(error.exception.code, 403)

    def test_portable_script_finds_data_relative_to_itself(self):
        script = self.root / 'atlas.py'
        script.write_bytes((ROOT / 'public/atlas.py').read_bytes())
        result = subprocess.run(['python3', '-B', str(script), 'show', 'swiss', '--palette', 'cobalt-grid', '--chart', 'diverging', '--format', 'pack'],
                                cwd='/', capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout, atlas.show(self.catalog, 'swiss', 'cobalt-grid', 'diverging')['complete_pack'])
        bad = subprocess.run(['python3', '-B', str(script), 'show', 'unknown'], capture_output=True, text=True)
        self.assertEqual(bad.returncode, 2)
        self.assertIn('error', json.loads(bad.stderr))


if __name__ == '__main__':
    unittest.main()
