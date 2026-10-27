"""Verify the built portable release without opening a browser."""
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'outputs'


class ResourceAudit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts = 0
        self.styles = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script':
            self.scripts += 1
            assert 'src' not in attrs, 'Script must be inline'
            assert attrs.get('type') != 'module', 'Portable page must use a classic script'
        if tag == 'style':
            self.styles += 1
        if tag == 'link':
            assert attrs.get('rel') not in ('stylesheet', 'modulepreload', 'preload'), 'External style/module asset'
        if tag in ('img', 'iframe', 'video', 'audio', 'source'):
            assert not attrs.get('src'), f'Unexpected runtime resource: {tag}'


def main():
    html = (OUTPUT / 'presentation-atlas-offline.html').read_text(encoding='utf-8')
    audit = ResourceAudit()
    audit.feed(html)
    assert audit.scripts == 1 and audit.styles == 1
    assert 'data-portable="true"' in html
    assert 'Permission is hereby granted, free of charge' in html, 'Standalone page must preserve the MIT notice'
    # Parse the actual inline classic script with the JS engine, without executing or opening it.
    subprocess.run(['node', '--input-type=module', '-e',
                    'import {Script} from "node:vm"; import {readFileSync} from "node:fs"; '
                    'const html=readFileSync(0,"utf8"); '
                    'const scripts=[...html.matchAll(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/g)]; '
                    'if(scripts.length!==1) throw Error("inline script count"); '
                    'new Script(scripts[0][1]);'], input=html, text=True, check=True)

    with ZipFile(OUTPUT / 'presentation-atlas-portable.zip') as archive:
        assert archive.testzip() is None, 'ZIP CRC error'
        names = archive.namelist()
        prefix = 'presentation-atlas-portable/'
        required = ['index.html', 'START-HERE.txt', 'README.md', 'AI-GUIDE.md', 'atlas.py', 'llms.txt',
                    'llms-full.txt', 'THIRD-PARTY-NOTICES.md', 'MANIFEST.sha256',
                    'api/v1/index.json', 'api/v1/catalog.json']
        assert all(prefix + name in names for name in required)
        assert all(n.startswith(prefix) and '..' not in Path(n).parts and not Path(n).is_absolute() for n in names)
        assert not any('node_modules' in n or '__pycache__' in n or '.DS_Store' in n for n in names)
        assert archive.read(prefix + 'index.html').decode('utf-8') == html
        catalog = json.loads(archive.read(prefix + 'api/v1/catalog.json'))
        assert catalog['count'] == 30
        assert len(catalog['styles']) == 30
        for s in catalog['styles']:
            detail = json.loads(archive.read(prefix + 'api/v1/styles/' + s['id'] + '.json'))
            assert detail == s
            default_pack = s['palettes'][0]['variants']['categorical']['complete_pack']
            assert archive.read(prefix + 'api/v1/packs/' + s['id'] + '.md').decode('utf-8') == default_pack
        manifest = archive.read(prefix + 'MANIFEST.sha256').decode('utf-8').splitlines()
        assert len(manifest) == len(names) - 1
        for line in manifest:
            digest, name = line.split('  ', 1)
            assert hashlib.sha256(archive.read(prefix + name)).hexdigest() == digest, name
        with tempfile.TemporaryDirectory(prefix='atlas-unzip-') as temp:
            archive.extractall(temp)
            release = Path(temp) / 'presentation-atlas-portable'
            result = subprocess.run([sys.executable, '-B', str(release / 'atlas.py'), 'search', '--context', 'academic', '--daily'],
                                    cwd=temp, capture_output=True, text=True, encoding='utf-8', check=True)
            assert json.loads(result.stdout)['total'] > 0
            pack = subprocess.run([sys.executable, '-B', str(release / 'atlas.py'), 'show', 'swiss', '--palette', 'cobalt-grid', '--chart', 'diverging', '--format', 'pack'],
                                  cwd=temp, capture_output=True, text=True, encoding='utf-8', check=True).stdout
            swiss = next(s for s in catalog['styles'] if s['id'] == 'swiss')
            cobalt = next(p for p in swiss['palettes'] if p['id'] == 'cobalt-grid')
            assert pack == cobalt['variants']['diverging']['complete_pack']
    print(f'Release verified: {len(names)} ZIP files, SHA-256/CRC, 30 complete entries, extracted CLI and inline classic-script syntax.')
    print('Browser rendering and actual file:// interaction are not part of this check.')


if __name__ == '__main__':
    main()
