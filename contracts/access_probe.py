# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
import json
from genlayer import *

class TrancheAccessProbe(gl.Contract):
    results: TreeMap[str, str]

    def __init__(self):
        pass

    @gl.public.write
    def probe(self, url: str) -> None:
        allowed = ('https://api.github.com/', 'https://raw.githubusercontent.com/', 'https://registry.npmjs.org/', 'https://web.archive.org/')
        if not url.startswith(allowed):
            raise gl.vm.UserError('allowlisted probes only')
        def fetch():
            try:
                r = gl.nondet.web.get(url)
                body = r.body.decode('utf-8', errors='replace')
                return {'status': r.status, 'reachable': r.status == 200, 'sample': body[:240]}
            except Exception:
                return {'status': 0, 'reachable': False, 'sample': 'validator fetch failed'}
        def verify(result):
            if not isinstance(result, gl.vm.Return):
                return False
            independent = fetch()
            return independent['status'] == result.calldata['status'] and independent['reachable'] == result.calldata['reachable']
        self.results[url] = json.dumps(gl.vm.run_nondet_unsafe(fetch, verify), sort_keys=True)

    @gl.public.view
    def result(self, url: str) -> str:
        return self.results.get(url, '')
