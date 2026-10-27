"""Package a release; no filesystem metadata or dependency directories are included."""
import sys
import hashlib
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

source, destination = map(Path, sys.argv[1:])
files = sorted(p for p in source.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name not in ('.DS_Store', 'MANIFEST.sha256'))
(source / 'MANIFEST.sha256').write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(source).as_posix()}\n' for p in files), encoding='utf-8')
with ZipFile(destination, 'w', ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(source.rglob('*')):
        if path.is_file() and '__pycache__' not in path.parts and path.name != '.DS_Store':
            archive.write(path, (Path(source.name) / path.relative_to(source)).as_posix())
print(f'Portable ZIP: {destination} ({destination.stat().st_size:,} bytes)')
