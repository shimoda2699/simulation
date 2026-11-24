// 待ち行列シミュレーション工房
(() => {
const $=id=>document.getElementById(id);
const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),2200)};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- タブ切り替え ---------- */
const tabs=[[$('t1'),$('p1')],[$('t2'),$('p2')]];
function show(i){tabs.forEach(([t,p],j)=>{t.setAttribute('aria-selected',i===j);p.hidden=i!==j});store.set('qs_tab',i);if(i===1)$('code').focus()}
tabs.forEach(([t],i)=>t.addEventListener('click',()=>show(i)));
show(Number(store.get('qs_tab'))||0);

/* ---------- タブ1：設計 → プロンプト ---------- */
const F=['team','purpose','arrMode','arrVal','buy','servers','batch','service','startRule','duration','step','order','vars','waitdef','trials','improve','other'];
const v=id=>$(id).value.trim();
let edited=false;
function outs(){return [...document.querySelectorAll('#outs input:checked')].map(x=>x.value)}
function build(){
  const arr=v('arrMode')==='p'?`1分ごとに、確率 ${v('arrVal')||'（未記入）'} で1人来る（乱数で決める）`:v('arrMode')==='i'?`到着間隔を乱数で決める（平均 ${v('arrVal')||'（未記入）'}）`:'';
  const L=[];
  L.push('あなたは高校「情報Ⅰ」の学習を手伝うアシスタントです。次の設計にしたがって、待ち行列のシミュレーションを行う Python プログラムを作ってください。');
  const sec=(h,x)=>{if(x)L.push('',`【${h}】`,x)};
  sec('目的',v('purpose'));
  sec('お客さん（到着）',[arr&&'- 来方：'+arr,v('buy')&&'- 1人が買う量：'+v('buy')].filter(Boolean).join('\n'));
  sec('お店（サービス）',[v('servers')&&'- 窓口・鉄板の数：'+v('servers'),v('batch')&&'- 1回に処理できる人数：'+v('batch'),v('service')&&'- サービス時間：'+v('service'),v('startRule')&&'- サービスを始めるルール：'+v('startRule')].filter(Boolean).join('\n'));
  sec('時間',[v('duration')&&'- シミュレーションする時間：'+v('duration'),'- 時間の進め方：'+v('step')].filter(Boolean).join('\n'));
  sec('処理の順番（この順に1回ずつ繰り返す）',v('order'));
  sec('使う変数（この名前を使うこと）',v('vars'));
  sec('待ち時間の定義',v('waitdef'));
  const o=outs();sec('結果として表示するもの',o.map(x=>'- '+x).join('\n'));
  sec('試行回数',v('trials'));
  sec('比べたい改善案',v('improve'));
  sec('そのほかの条件',v('other'));
  L.push('','【プログラムの条件】',
  '- Python 3 で書く。使ってよいモジュールは random、math、statistics、matplotlib だけ（ブラウザ上の Python で動かすため）',
  '- input() は使わない',
  '- 変更しやすいように、パラメータ（数値）はプログラムの最初にまとめて書き、日本語のコメントで意味を書く',
  '- 処理のまとまりごとに日本語のコメントを入れる',
  '- 結果は print で、単位をつけて日本語で表示する',
  '- お客さんが1人も来なかったときに、0で割るエラーにならないようにする',
  '- グラフを描くときは matplotlib.pyplot を使い、最後に plt.show() を書く',
  '- 高校生が読んで理解できる、短くわかりやすいコードにする（クラスは使わない）',
  '- コードのあとに、設計のどの部分がコードのどこにあたるかを短く説明する');
  return L.join('\n');
}
function meter(){
  const req=[...document.querySelectorAll('[data-req]')];const done=req.filter(e=>e.value.trim());
  $('mtxt').textContent=`必須の記入 ${done.length} / ${req.length}`;$('mbar').style.width=(done.length/req.length*100)+'%';
  const miss=req.filter(e=>!e.value.trim()).map(e=>document.querySelector(`label[for=${e.id}]`).childNodes[0].textContent.trim());
  return miss;
}
function refresh(){
  if(!edited)$('prompt').value=build();
  const m=meter();const el=$('missing');el.hidden=!m.length;el.textContent=m.length?'まだ書いていない項目：'+m.join('、'):'';
  const d={};F.forEach(k=>d[k]=$(k).value);d.outs=outs();store.set('qs_design',JSON.stringify(d));
}
$('design').addEventListener('input',()=>{edited=false;refresh()});
$('design').addEventListener('change',()=>{edited=false;refresh()});
$('prompt').addEventListener('input',()=>{edited=true});
function fill(d){F.forEach(k=>{if(d[k]!==undefined)$(k).value=d[k]});if(d.outs)document.querySelectorAll('#outs input').forEach(x=>x.checked=d.outs.includes(x.value));edited=false;refresh()}
try{const s=JSON.parse(store.get('qs_design')||'null');if(s)fill(s)}catch(e){}
$('sample').addEventListener('click',()=>fill({purpose:'文化祭のたこ焼き屋「タコ丸」の行列で、お客さんがたこ焼きの焼き上がりまで待つ時間を調べ、鉄板の枚数や焼き時間を変えたときにどれだけ短くなるかを比べたい',arrMode:'p',arrVal:'0.67',buy:'1人1セット（1人分）',servers:'鉄板1枚',batch:'1回に3人分',service:'焼き時間5分（一定）',startRule:'待っている人がいて鉄板が空いていたら焼き始める。焼き上がったら来た順に渡し、余った分は次に来た人に渡す',duration:'180分（180分を過ぎたら新しいお客さんは来ないが、行列がなくなるまで続ける）',step:'1分ずつ進める',order:'1. 乱数でお客さんが来たら、行列に並んだ時刻を加える\n2. 焼いている途中なら残り時間を1減らし、0になったら余りを3増やす\n3. 余りがあって行列に人がいる間、先頭の人に渡して待ち時間を記録する\n4. 鉄板が空いていて行列に人がいれば焼き始める\n5. 行列の人数が最大の記録より多ければ記録を更新する\n6. 時刻を1分進める',vars:'eigyo：営業時間（分）\nkakuritsu：1分間に1人来る確率\nyaki_jikan：焼き時間（分）\nikkai_kazu：1回に焼ける数\ngyoretsu：並んだ時刻のリスト\nnokori：焼き上がりまでの残り時間\namari：焼き上がって、まだ渡していない数\nmachi：待ち時間のリスト\nsaidai：行列の最大人数',waitdef:'並んだ時刻から、焼き上がって受け取った時刻まで',trials:'1回',improve:'鉄板2枚（1回に6人分と同じ）、焼き時間4分',other:'',outs:['平均待ち時間','最長の待ち時間','行列の最大人数','売れた数（サービスした人数）','時刻ごとの行列の人数の折れ線グラフ']}));
$('reset').addEventListener('click',()=>{if($('reset').dataset.c){F.forEach(k=>$(k).value=k==='step'?'1分ずつ進める':'');document.querySelectorAll('#outs input').forEach((x,i)=>x.checked=i<3);edited=false;refresh();delete $('reset').dataset.c;$('reset').textContent='すべて消す'}else{$('reset').dataset.c=1;$('reset').textContent='もう一度押すと消えます';setTimeout(()=>{delete $('reset').dataset.c;$('reset').textContent='すべて消す'},3000)}});
async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}a.remove();return ok}}
$('copy').addEventListener('click',async()=>toast(await copyText($('prompt').value)?'コピーしました。Copilot に貼り付けよう':'コピーできませんでした。プロンプトを選択してコピーしてください'));
['openM365','openWeb'].forEach(id=>$(id).addEventListener('click',()=>{copyText($('prompt').value).then(ok=>toast(ok?'コピーしました。開いた Copilot に貼り付けよう':'コピーできませんでした'))}));
refresh();

/* ---------- タブ2：Python 実行環境（Pyodide を Web Worker で動かす） ---------- */
let worker=null,busy=false,readyFlag=false;
const out=$('out'),dot=$('dot'),stat=$('stat');
function setStat(cls,txt){dot.className='dot '+cls;stat.textContent=txt}
function print(s,cls){const sp=document.createElement('span');if(cls)sp.className=cls;sp.textContent=s.endsWith('\n')?s:s+'\n';out.appendChild(sp);out.scrollTop=out.scrollHeight}
function startWorker(){
  readyFlag=false;$('run').disabled=true;setStat('busy','Python を準備しています…（初回は少し時間がかかります）');
  try{worker=new Worker('py-worker.js')}catch(e){setStat('','Python を起動できませんでした。ファイルを直接開いた場合は、GitHub Pages など Web サーバー上で開いてください：'+e.message);return}
  worker.onmessage=({data:d})=>{
    if(d.t==='ready'){readyFlag=true;$('run').disabled=false;setStat('ok','準備OK（Python '+d.v.replace(/^0\./,'Pyodide 0.')+'）')}
    else if(d.t==='out')print(d.s);
    else if(d.t==='err')print(d.s,'e');
    else if(d.t==='sys')print(d.s,'s');
    else if(d.t==='error'){print(cleanErr(d.s),'e');showTip(d.s)}
    else if(d.t==='figs')d.figs.forEach((svg,i)=>{const f=document.createElement('figure');const im=new Image();im.alt='グラフ '+(i+1);im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);const c=document.createElement('figcaption');c.textContent='グラフ '+($('figs').children.length+1);f.append(im,c);$('figs').appendChild(f)});
    else if(d.t==='done'){busy=false;$('run').disabled=false;$('stop').disabled=true;setStat('ok',(d.err?'エラーで止まりました':'実行が終わりました')+'（'+(d.ms/1000).toFixed(2)+' 秒）');clearTimeout(longT)}
    else if(d.t==='fatal'){setStat('','Python を読み込めませんでした。ネットワークを確かめて、ページを読み込み直してください');print(d.s,'e')}
  };
  worker.onerror=e=>{setStat('','エラー：'+(e.message||'不明'))};
}
function cleanErr(s){const lines=s.split('\n');const i=lines.findIndex(l=>l.includes('<プログラム>'));return (i>=0?['エラーが出ました（Traceback）：'].concat(lines.slice(i)):lines).join('\n')}
const HINTS=[[/IndentationError/,'字下げ（インデント）がずれています。if や for や while の次の行は、同じ数のスペースで下げそろえよう。'],[/SyntaxError/,'書き方の間違いがあります。かっこ ( ) や : の付け忘れ、全角の文字（全角スペース・全角の記号）が混ざっていないか見てみよう。'],[/NameError/,'まだ作っていない変数や関数の名前を使っています。つづりの間違いや、使う前に値を入れているかを確かめよう。'],[/ZeroDivisionError/,'0で割り算をしています。お客さんが1人も来なかったときなど、人数が0の場合を考えよう。'],[/IndexError/,'リストの範囲の外を見ようとしています。空のリストから取り出していないか確かめよう。'],[/TypeError/,'型（数・文字列・リストなど）の組み合わせが合っていません。文字列と数を足していないか見てみよう。'],[/ModuleNotFoundError|No module named/,'この環境では使えないモジュールです。random・math・statistics・matplotlib だけで書き直すよう Copilot に頼もう。'],[/EOFError/,'input() で読む値がありません。「input() を使うプログラムのとき」の欄に値を書こう。'],[/KeyboardInterrupt/,'']];
function showTip(s){const h=HINTS.find(([r])=>r.test(s));const t=$('tip');if(h&&h[1]){t.hidden=false;t.textContent='ヒント：'+h[1]}else t.hidden=true}
let longT;
function run(){
  if(!readyFlag||busy)return;const code=$('code').value;if(!code.trim()){toast('コードがありません');return}
  busy=true;$('run').disabled=true;$('stop').disabled=false;$('tip').hidden=true;
  out.textContent='';$('figs').innerHTML='';setStat('busy','実行中…');
  longT=setTimeout(()=>{if(busy)setStat('busy','実行中…時間がかかっています。終わらないときは「止める」を押そう（無限ループかもしれません）')},10000);
  worker.postMessage({code,stdin:$('stdin').value});
}
$('run').addEventListener('click',run);
$('stop').addEventListener('click',()=>{if(!busy)return;worker.terminate();busy=false;$('stop').disabled=true;clearTimeout(longT);print('■ 実行を止めました','s');startWorker()});
$('clearOut').addEventListener('click',()=>{out.textContent='';$('figs').innerHTML='';$('tip').hidden=true});
/* エディタ */
const code=$('code'),gut=$('gutter');
function lines(){const n=code.value.split('\n').length;let s='';for(let i=1;i<=n;i++)s+=i+'\n';gut.textContent=s;gut.scrollTop=code.scrollTop;store.set('qs_code',code.value)}
code.addEventListener('input',lines);code.addEventListener('scroll',()=>gut.scrollTop=code.scrollTop);
code.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();run();return}
  if(e.key==='Tab'){e.preventDefault();const a=code.selectionStart,b=code.selectionEnd;
    if(e.shiftKey){const ls=code.value.lastIndexOf('\n',a-1)+1;if(code.value.slice(ls,ls+4)==='    '){code.setRangeText('',ls,ls+4,'preserve');code.selectionStart=code.selectionEnd=Math.max(ls,a-4)}}
    else code.setRangeText('    ',a,b,'end');lines()}
  if(e.key==='Enter'&&!e.isComposing){const a=code.selectionStart;const ls=code.value.lastIndexOf('\n',a-1)+1;const cur=code.value.slice(ls,a);let ind=cur.match(/^ */)[0];if(/:\s*$/.test(cur))ind+='    ';e.preventDefault();code.setRangeText('\n'+ind,a,code.selectionEnd,'end');lines()}
});
$('paste').addEventListener('click',async()=>{try{const t=await navigator.clipboard.readText();if(t){code.value=t;lines();toast('貼り付けました')}}catch(e){code.focus();toast('ここをクリックして Ctrl＋V で貼り付けてください')}});
$('copyCode').addEventListener('click',async()=>toast(await copyText(code.value)?'コードをコピーしました':'コピーできませんでした'));
$('clearCode').addEventListener('click',()=>{if($('clearCode').dataset.c){code.value='';lines();delete $('clearCode').dataset.c;$('clearCode').textContent='コードを消す'}else{$('clearCode').dataset.c=1;$('clearCode').textContent='もう一度押すと消えます';setTimeout(()=>{delete $('clearCode').dataset.c;$('clearCode').textContent='コードを消す'},3000)}});
const SAMPLE=`# タコ丸 行列シミュレーション（見本）
import random
import matplotlib.pyplot as plt

# ===== パラメータ =====
eigyo = 180         # 営業時間（分）
kakuritsu = 0.67    # 1分間にお客さんが1人来る確率
yaki_jikan = 5      # 1回の焼き時間（分）
ikkai_kazu = 3      # 1回に焼ける数（人分）

# ===== 状態 =====
jikoku = 0
gyoretsu = []       # 並んだ時刻のリスト
nokori = 0          # 焼き上がりまでの残り時間（0なら鉄板は空き）
amari = 0           # 焼き上がって、まだ渡していない数

# ===== 結果 =====
machi = []          # 一人ひとりの待ち時間
saidai = 0          # 行列の最大人数
kiroku = []         # 時刻ごとの行列の人数（グラフ用）

while jikoku < eigyo or len(gyoretsu) > 0:
    # お客さんが来る
    if jikoku < eigyo and random.random() < kakuritsu:
        gyoretsu.append(jikoku)
    # 焼き進める
    if nokori > 0:
        nokori = nokori - 1
        if nokori == 0:
            amari = amari + ikkai_kazu
    # 渡す
    while amari > 0 and len(gyoretsu) > 0:
        narabi = gyoretsu.pop(0)
        machi.append(jikoku - narabi)
        amari = amari - 1
    # 焼き始める
    if nokori == 0 and len(gyoretsu) > 0:
        nokori = yaki_jikan
    # 最大の行列を記録
    if len(gyoretsu) > saidai:
        saidai = len(gyoretsu)
    kiroku.append(len(gyoretsu))
    # 時刻を進める
    jikoku = jikoku + 1

print("売れた数:", len(machi), "人")
if len(machi) > 0:
    print("平均待ち時間:", round(sum(machi) / len(machi), 1), "分")
    print("最長の待ち時間:", max(machi), "分")
print("行列の最大人数:", saidai, "人")

plt.plot(kiroku)
plt.title("行列の人数の変化")
plt.xlabel("開店からの時間（分）")
plt.ylabel("行列の人数（人）")
plt.show()
`;
$('loadSample').addEventListener('click',()=>{if(code.value.trim()&&!$('loadSample').dataset.c){$('loadSample').dataset.c=1;$('loadSample').textContent='もう一度押すと今のコードと入れ替えます';setTimeout(()=>{delete $('loadSample').dataset.c;$('loadSample').textContent='見本プログラム'},3000);return}delete $('loadSample').dataset.c;$('loadSample').textContent='見本プログラム';code.value=SAMPLE;lines();toast('見本プログラムを入れました')});
code.value=store.get('qs_code')||'';lines();
startWorker();
})();
