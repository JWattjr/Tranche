import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const interpreter=resolve('.venv',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const result=spawnSync(interpreter,process.argv.slice(2),{stdio:'inherit',env:{...process.env,PYTHONIOENCODING:'utf-8',PYTHONDONTWRITEBYTECODE:'1'}});
if(result.error) console.error('Run uv venv --python 3.12 .venv, then uv pip install --python .venv -r requirements.txt.');
process.exit(result.status??1);
