// Python 実行用ワーカー（Pyodide）
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
let py=null;
const ready=(async()=>{py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'});postMessage({t:'ready',v:py.version});})().catch(e=>postMessage({t:'fatal',s:String(e)}));
const SETUP_MPL=`
import os, io, warnings
os.environ['MPLBACKEND']='Agg'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
warnings.filterwarnings('ignore')
plt.rcParams['svg.fonttype']='none'
plt.rcParams['font.family']=['sans-serif']
_qs_figs=[]
def _qs_show(*a, **k):
    for n in plt.get_fignums():
        f=plt.figure(n); b=io.StringIO(); f.savefig(b, format='svg', bbox_inches='tight'); _qs_figs.append(b.getvalue())
    plt.close('all')
plt.show=_qs_show
`;
onmessage=async(ev)=>{
  await ready; const {code,stdin}=ev.data; const t0=performance.now();
  py.setStdout({batched:s=>postMessage({t:'out',s})});
  py.setStderr({batched:s=>postMessage({t:'err',s})});
  try{
    await py.loadPackagesFromImports(code,{messageCallback:m=>{if(/Loading|Loaded/.test(m))postMessage({t:'sys',s:m.startsWith('Loaded')?'モジュールを読み込みました：'+m.replace('Loaded ',''):'モジュールを読み込んでいます…'})},errorCallback:()=>{}});
    const useMpl=/matplotlib/.test(code);
    if(useMpl) await py.runPythonAsync(SETUP_MPL);
    py.globals.set('_qs_stdin',stdin);
    await py.runPythonAsync(`
import builtins
_qs_lines=_qs_stdin.split('\\n') if _qs_stdin else []
def _qs_input(prompt=''):
    print(prompt, end='')
    if _qs_lines:
        v=_qs_lines.pop(0); print(v); return v
    raise EOFError('入力する値がありません（「input() を使うプログラムのとき」に値を書いてください）')
builtins.input=_qs_input
`);
    const g=py.globals.get('dict')();
    await py.runPythonAsync(code,{globals:g,filename:'<プログラム>'});
    g.destroy();
    if(useMpl){await py.runPythonAsync('_qs_show()');const figs=py.globals.get('_qs_figs').toJs();py.runPython('_qs_figs.clear()');if(figs.length)postMessage({t:'figs',figs});}
    postMessage({t:'done',ms:performance.now()-t0});
  }catch(e){postMessage({t:'error',s:String(e.message||e)});postMessage({t:'done',ms:performance.now()-t0,err:true});}
};
