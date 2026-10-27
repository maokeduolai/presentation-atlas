#!/usr/bin/env python3
"""Presentation Atlas: dependency-free, read-only local catalog access (Python 3.9+)."""
import argparse
import json
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

ROOT = Path(__file__).resolve().parent


def load_catalog(root=ROOT):
    with (root / 'api/v1/catalog.json').open(encoding='utf-8') as source:
        return json.load(source)


def validate_choice(value, choices, name):
    if value is not None and value not in choices:
        raise ValueError(f'{name}: choose one of {", ".join(choices)}')


def search(catalog, q='', context=None, kind=None, daily=False, limit=30):
    context_choices = catalog['contexts']
    validate_choice(context, list(context_choices) + list(context_choices.values()), 'context')
    validate_choice(kind, catalog['kinds'], 'kind')
    if type(daily) is not bool:
        raise ValueError('daily: expected true or false')
    if not 1 <= limit <= 100:
        raise ValueError('limit: expected integer 1..100')
    context_label = context_choices.get(context, context)
    terms = q.casefold().split()
    matches = []
    for style in catalog['styles']:
        if context_label and context_label not in style['contexts']:
            continue
        if kind and kind != style['kind']:
            continue
        if daily and not style['daily']:
            continue
        haystack = ' '.join([style['id'], style['name'], style['en'], style['identity'],
                            style['era'], style['summary'], style['history'], style['dont'],
                            *style['aliases'], *style['visual']]).casefold()
        if not all(term in haystack for term in terms):
            continue
        matches.append(style)
    matches.sort(key=lambda s: {'高': 0, '中': 1, '低': 2}[s['fit']])
    fields = ('id', 'name', 'en', 'kind', 'identity', 'fit', 'contexts', 'summary', 'visual', 'dont')
    return {
        'schema_version': catalog['schema_version'],
        'query': {'q': q, 'context': context, 'kind': kind, 'daily': daily, 'limit': limit},
        'total': len(matches), 'count': min(len(matches), limit),
        'ordering': '日常适配：高、中、低；同级保持目录顺序。文字匹配，不是语义推荐。',
        'styles': [{**{k: s[k] for k in fields},
                    'palettes': [{'id': p['id'], 'name': p['name']} for p in s['palettes']],
                    'detail': f'api/v1/styles/{s["id"]}.json'} for s in matches[:limit]]
    }


def show(catalog, style_id, palette=None, chart='categorical'):
    style = next((s for s in catalog['styles'] if s['id'] == style_id), None)
    if style is None:
        raise KeyError(f'Unknown style: {style_id}')
    validate_choice(chart, catalog['chart_modes'], 'chart')
    palette = palette or style['palettes'][0]['id']
    validate_choice(palette, [p['id'] for p in style['palettes']], 'palette')
    selected = next(p for p in style['palettes'] if p['id'] == palette)
    return {
        'schema_version': catalog['schema_version'],
        'style': {k: v for k, v in style.items() if k != 'palettes'},
        'palette': {k: v for k, v in selected.items() if k != 'variants'},
        'chart': chart, **selected['variants'][chart],
        'common_rules': catalog['common_rules'], 'common_sources': catalog['common_sources']
    }


class AtlasHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, root, catalog, **kwargs):
        self.root = root.resolve()
        self.catalog = catalog
        super().__init__(*args, directory=str(root), **kwargs)

    def send_value(self, value, status=200, as_text=False, head=False):
        data = (value if as_text else json.dumps(value, ensure_ascii=False, indent=2)).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'text/plain; charset=utf-8' if as_text else 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        if not head:
            self.wfile.write(data)

    def handle_read(self, head=False):
        parsed = urlsplit(self.path)
        path = unquote(parsed.path)
        params = parse_qs(parsed.query, keep_blank_values=True)
        try:
            # Binding and Host checks keep this optional server local to this device.
            if self.headers.get('Host', '').split(':')[0].lower() not in ('127.0.0.1', 'localhost'):
                self.send_value({'error': 'Local host required'}, 403, head=head)
                return
            if path == '/api/v1/styles' or (path.startswith('/api/v1/styles/') and '.' not in path.rsplit('/', 1)[-1]):
                allowed = {'q', 'context', 'kind', 'daily', 'limit'} if path == '/api/v1/styles' else {'palette', 'chart', 'format'}
                if set(params) - allowed or any(len(v) != 1 for v in params.values()):
                    raise ValueError('Unknown or repeated query parameter')
                p = {k: v[0] for k, v in params.items()}
                if path == '/api/v1/styles':
                    validate_choice(p.get('daily'), ['true', 'false'], 'daily')
                    data = search(self.catalog, q=p.get('q', ''), context=p.get('context'), kind=p.get('kind'),
                                  daily=p.get('daily', 'false') == 'true', limit=int(p.get('limit', '30')))
                    self.send_value(data, head=head)
                else:
                    fmt = p.get('format', 'json')
                    validate_choice(fmt, ['json', 'pack'], 'format')
                    data = show(self.catalog, path.rsplit('/', 1)[-1], p.get('palette'), p.get('chart', 'categorical'))
                    self.send_value(data['complete_pack'] if fmt == 'pack' else data, as_text=fmt == 'pack', head=head)
                return
            # Serve packaged files only; do not expose directory listings or symlink targets outside the bundle.
            target = (self.root / path.lstrip('/')).resolve()
            if self.root not in (target, *target.parents):
                self.send_value({'error': 'Invalid path'}, 403, head=head)
                return
            if target.is_dir():
                target = (target / 'index.html').resolve()
                if self.root not in (target, *target.parents):
                    self.send_value({'error': 'Invalid path'}, 403, head=head)
                    return
                if not target.is_file():
                    self.send_value({'error': 'Not found'}, 404, head=head)
                    return
            if head:
                super().do_HEAD()
            else:
                super().do_GET()
        except KeyError as error:
            self.send_value({'error': str(error)}, 404, head=head)
        except (ValueError, OverflowError) as error:
            self.send_value({'error': str(error)}, 400, head=head)

    def do_GET(self):
        self.handle_read()

    def do_HEAD(self):
        self.handle_read(head=True)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    query = sub.add_parser('search', help='Filter styles; output JSON. q is literal text, not semantic search.')
    query.add_argument('--q', default='')
    query.add_argument('--context', help='academic, technical, teaching, history (or Chinese label)')
    query.add_argument('--kind', help='history, method, process, culture, interface, preset')
    query.add_argument('--daily', action='store_true')
    query.add_argument('--limit', type=int, default=30)
    detail = sub.add_parser('show', help='Read a style, palette and chart variant')
    detail.add_argument('id')
    detail.add_argument('--palette', help='Stable palette id from search results; defaults to first palette')
    detail.add_argument('--chart', default='categorical', choices=['categorical', 'sequential', 'diverging'])
    detail.add_argument('--format', default='json', choices=['json', 'pack'])
    server = sub.add_parser('serve', help='Serve the packaged website and optional read-only HTTP API on loopback')
    server.add_argument('--port', type=int, default=8765)
    args = parser.parse_args(argv)
    try:
        catalog = load_catalog()
        if args.command == 'search':
            value = search(catalog, args.q, args.context, args.kind, args.daily, args.limit)
        elif args.command == 'show':
            value = show(catalog, args.id, args.palette, args.chart)
            if args.format == 'pack':
                print(value['complete_pack'], end='')
                return 0
        else:
            if not 1 <= args.port <= 65535:
                raise ValueError('port: expected integer 1..65535')
            handler = partial(AtlasHandler, root=ROOT, catalog=catalog)
            with ThreadingHTTPServer(('127.0.0.1', args.port), handler) as httpd:
                print(f'Presentation Atlas: http://127.0.0.1:{args.port}/ (Ctrl+C to stop)', flush=True)
                try:
                    httpd.serve_forever()
                except KeyboardInterrupt:
                    pass
            return 0
        print(json.dumps(value, ensure_ascii=False, indent=2))
        return 0
    except (KeyError, ValueError, OSError) as error:
        print(json.dumps({'error': str(error)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    sys.exit(main())
