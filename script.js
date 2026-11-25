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
const form=$('design');
const MULTI=['purpose','outs','change','exclude'];
function data(){const fd=new FormData(form);const d={};for(const [k,val] of fd.entries()){if(MULTI.includes(k))(d[k]=d[k]||[]).push(val);else d[k]=String(val).trim()}MULTI.forEach(k=>d[k]=d[k]||[]);return d}
const num=x=>x===''||x===undefined?NaN:Number(x);
const r2=x=>Math.round(x*100)/100;
function calc(d){const T=num(d.recTime),N=num(d.recN),S=num(d.service),P=num(d.teppan),K=num(d.ikkai);
  return {kankaku:T>0&&N>0?r2(T/N):null,kuru:T>0&&N>=0&&!isNaN(N)?r2(N/T):null,tsukuru:S>0&&P>0&&K>0?r2(K*P/S):null}}
let edited=false;
const OUTS={cmp:'試行回数分の平均（来た人数・平均待ち時間・最長の待ち時間・行列の最大人数）と、去年の記録を並べた比較表',spread:'1回の平均待ち時間が、試行ごとにどのくらいばらつくか（下位1割〜上位1割の範囲）',t30:'1日分について、営業記録と同じ30分ごとの表（並んだ人数・平均待ち時間）',gq:'1日分の、行列の人数の変化のグラフ（横軸：開店からの時間、縦軸：行列の人数）',gh:'試行ごとの平均待ち時間のヒストグラム（去年の記録の位置に線を引く）'};
const CALC={each:'お客さん1人ずつ、到着時刻 → 焼き始める時刻 → 受け取る時刻 の順に計算する（教科書の待ち行列の表と同じ考え方）。1日分の計算は関数にまとめる',min:'時刻を1分ずつ進め、毎分「来る・焼く・渡す」を調べる'};
const DIST={exp:'到着間隔は指数分布の乱数にする（到着間隔 ＝ −平均の到着間隔 × log(1 − random.random())）。ばらばらにやってくる客を表すため',uni:'到着間隔は、0から平均の2倍までの一様な乱数にする（random.uniform(0, 2 × 平均の到着間隔)）',prob:'1分ごとに、確率 KAKURITSU（＝1 ÷ 平均の到着間隔）で1人来るとする（random.random() < KAKURITSU）'};
function isEmpty(d){return !Object.entries(d).some(([k,val])=>k!=='team'&&(Array.isArray(val)?val.length:val))}
function build(d){
  const c=calc(d);const L=[];const sec=(h,x)=>{if(x)L.push('',`【${h}】`,x)};
  const li=a=>a.filter(Boolean).join('\n');const has=x=>x!==undefined&&x!=='';
  L.push('あなたは高校「情報Ⅰ」の学習を手伝うアシスタントです。次の設計にしたがって、待ち行列のシミュレーションを行う Python プログラムを作ってください。');
  sec('目的',li([...d.purpose.map(x=>'- '+x),has(d.purposeOther)&&'- '+d.purposeOther]));
  sec('去年の記録（シミュレーションが去年を再現できているかの答え合わせに使う）',li([has(d.recTime)&&`- 営業時間：${d.recTime}分`,has(d.recN)&&`- 来た人数：${d.recN}人`,has(d.recAvg)&&`- 平均待ち時間：${d.recAvg}分`,has(d.recMax)&&`- 最長の待ち時間：${d.recMax}分`,has(d.recQ)&&`- 行列の最大人数：${d.recQ}人`]));
  sec('計算のしかた',CALC[d.calc]||'');
  sec('お客さん（到着）',li([c.kankaku!==null&&`- 平均の到着間隔：営業時間 ÷ 来た人数 ＝ ${d.recTime} ÷ ${d.recN} ≒ ${c.kankaku}分`,has(d.arrConst)&&`- 到着間隔は${d.arrConst}`,DIST[d.dist]&&'- '+DIST[d.dist],d.buy==='other'?(has(d.buyOther)&&'- 1人が買う量：'+d.buyOther):(has(d.buy)&&'- 1人が買う量：'+d.buy),c.kuru!==null&&`- 来る速さ：1分あたり約${c.kuru}人`]));
  sec('お店（サービス）',li([has(d.work)&&`- お客さんを待たせている作業（サービス）：${d.work}。この作業だけをモデルにする`,has(d.service)&&`- サービス時間：${d.service}分（一定）`,has(d.teppan)&&`- 同時に作業できる場所：鉄板${d.teppan}枚`,has(d.ikkai)&&`- 1回の作業で${d.ikkai}人分できる`,c.tsukuru!==null&&`- 作る速さ：1分あたり${c.tsukuru}人分`,has(d.startTime)&&`- 作業を始める時刻：「来た時刻」と「${d.startTime}」の大きいほう`,has(d.start)&&'- いつ焼き始めるか：'+d.start,d.give==='other'?(has(d.giveOther)&&'- 誰から渡すか：'+d.giveOther):(has(d.give)&&'- 誰から渡すか：'+d.give),has(d.close)&&'- 受付を締め切ったあと：'+d.close]));
  sec('処理の順番',d.order);
  const tr=d.trials==='other'?d.trialsOther:d.trials;
  const P=[];
  if(has(d.recTime))P.push(`EIGYO = ${d.recTime}          # 営業時間（分）`);
  if(has(d.recN))P.push(`KYAKU = ${d.recN}          # 去年来た人数（人）`);
  if(has(d.recTime)&&has(d.recN))P.push('HEIKIN_KANKAKU = EIGYO / KYAKU   # 平均の到着間隔（分）');
  if(d.dist==='prob')P.push('KAKURITSU = 1 / HEIKIN_KANKAKU    # 1分間に1人来る確率');
  if(has(d.service))P.push(`YAKI_JIKAN = ${d.service}      # サービス時間（焼き時間、分）`);
  if(has(d.ikkai))P.push(`IKKAI_KAZU = ${d.ikkai}      # 1回で焼ける人数分`);
  if(has(d.teppan))P.push(`TEPPAN = ${d.teppan}          # 鉄板の枚数`);
  if(has(tr))P.push(`SHIKOU = ${tr}          # 何回くり返して平均をとるか（試行回数）`);
  if(d.seed==='same')P.push('TANE = 1            # 乱数の種（random.seed(TANE) で毎回同じ乱数にする）');
  const KR=[has(d.recAvg)&&`平均待ち ${d.recAvg}分`,has(d.recMax)&&`最長待ち ${d.recMax}分`,has(d.recQ)&&`最大行列 ${d.recQ}人`].filter(Boolean);
  if(KR.length)P.push(`# 去年の記録（答え合わせ用）：${KR.join('、')} も変数にして先頭に書く`);
  sec('パラメータ（プログラムの先頭にこの名前でまとめて書く）',P.join('\n'));
  sec('ほかに使う変数',d.vars);
  sec('待ち時間の定義',d.waitdef);
  sec('試行回数と乱数',li([has(tr)&&`- ${tr}回くり返して平均をとる`,d.seed==='same'&&'- 最初に random.seed(TANE) を実行し、何度実行しても同じ結果になるようにする',d.seed==='change'&&'- 乱数の種は決めない（実行するたびに結果が変わる）']));
  sec('結果として表示するもの',d.outs.map(x=>'- '+OUTS[x]).join('\n'));
  const ch=[...d.change.filter(x=>x!=='other'),d.change.includes('other')&&d.changeOther].filter(Boolean);
  if(ch.length)sec('あとで値を変えて試したい条件',ch.join('、')+'\n（プログラムの先頭の値を書き換えるだけで試せるようにする。いろいろな値を比べる処理は入れなくてよい）');
  if(d.exclude.length)sec('モデルに入れない情報（プログラムには入れない）',d.exclude.join('、')+(has(d.reason)?'\n理由：'+d.reason:''));
  L.push('','【プログラムの条件】',
  '- Python 3 で書く。使ってよいモジュールは random、math、statistics、matplotlib だけ（ブラウザ上の Python で動かすため）',
  '- input() は使わない',
  '- パラメータと去年の記録の値はプログラムの最初にまとめ、日本語のコメントで「何の値か」を書く',
  '- 処理のまとまりごとに日本語のコメントを入れる。関数は使ってよいが、クラスは使わない',
  '- 結果は print で、単位をつけて日本語で表示する',
  '- お客さんが1人も来なかったときに、0で割るエラーにならないようにする',
  '- グラフを描くときは matplotlib.pyplot を使い、グラフごとに plt.show() を書く',
  '- 高校生が読んで理解できる、わかりやすいコードにする',
  '- コードのあとに、設計のどの部分がコードのどこにあたるかを短く説明する');
  return L.join('\n');
}
function missing(d){
  return [...form.querySelectorAll('[data-req]')].filter(el=>{
    if(el.matches('input,textarea,select'))return !el.value.trim();
    return !el.querySelector('input:checked');}).map(el=>el.dataset.l);
}
function refresh(){
  const d=data();const c=calc(d);
  $('oKankaku').textContent=c.kankaku??'';$('oKuru').textContent=c.kuru??'';$('oTsukuru').textContent=c.tsukuru??'';
  const req=form.querySelectorAll('[data-req]').length;const m=missing(d);
  $('mtxt').textContent=`必須の項目 ${req-m.length} / ${req}`;$('mbar').style.width=((req-m.length)/req*100)+'%';
  const empty=isEmpty(d);
  if(!edited)$('prompt').value=empty?'':build(d);
  const el=$('missing');el.hidden=empty||!m.length;el.textContent=m.length?'まだ入力していない項目：'+m.join('、'):'';
  store.set('qs_design3',JSON.stringify(d));
}
form.addEventListener('input',()=>{edited=false;refresh()});
form.addEventListener('change',()=>{edited=false;refresh()});
$('prompt').addEventListener('input',()=>{edited=true});
function fill(d){
  form.reset();
  for(const el of form.elements){if(!el.name)continue;const val=d[el.name];if(val===undefined)continue;
    if(el.type==='radio')el.checked=el.value===val;else if(el.type==='checkbox')el.checked=Array.isArray(val)&&val.includes(el.value);else el.value=val;}
  edited=false;refresh();
}
try{const s=JSON.parse(store.get('qs_design3')||'null');if(s)fill(s)}catch(e){}
$('sample').addEventListener('click',()=>fill({recTime:'180',recN:'121',arrConst:'不規則',work:'たこ焼きを焼く',service:'5',teppan:'1',ikkai:'3',startTime:'鉄板が空く時刻',waitEnd:'焼き上がって受け取る',recAvg:'18.7',recMax:'31.3',recQ:'20',
 purpose:['去年の行列をシミュレーションで再現する','そのあと、パラメータを変えて行列を短くする方法を試す'],calc:'each',dist:'exp',buy:'1人1セット',
 start:'待っている人がいて、鉄板が空いていたら焼き始める',give:'来た順に渡し、余った分は次に来た人に渡す',close:'並んでいる人には全員売る',
 waitdef:'並んでから、焼き上がって受け取るまで',trials:'200',seed:'same',outs:['cmp','t30','gq'],change:['鉄板の枚数','焼き時間','1回に焼ける人数分','平均の到着間隔'],
 exclude:['価格','材料','場所・隣の店','係の人数','会計・箱・仕上げ・渡しの時間','「人が足りない」という意見'],reason:'焼き上がりまでの待ち時間に影響しないから。焼き以外の作業は焼いている間に終わり、係の手が空いていた'}));
$('reset').addEventListener('click',()=>{if($('reset').dataset.c){fill({});delete $('reset').dataset.c;$('reset').textContent='すべて消す'}else{$('reset').dataset.c=1;$('reset').textContent='もう一度押すと消えます';setTimeout(()=>{delete $('reset').dataset.c;$('reset').textContent='すべて消す'},3000)}});
async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}a.remove();return ok}}
$('copy').addEventListener('click',async()=>{if(!$('prompt').value){toast('まだ何も入力されていません');return}toast(await copyText($('prompt').value)?'コピーしました。Copilot に貼り付けよう':'コピーできませんでした。プロンプトを選択してコピーしてください')});
['openM365','openWeb'].forEach(id=>$(id).addEventListener('click',()=>{if($('prompt').value)copyText($('prompt').value).then(ok=>toast(ok?'コピーしました。開いた Copilot に貼り付けよう':'コピーできませんでした'))}));
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
const SAMPLE=`# ============================================================
# タコ丸 行列シミュレーション（去年の営業記録を再現する版）
#   教科書 Theory 39 の表２と同じく「到着時刻・開始時刻・終了時刻」を
#   お客さん1人ずつ計算していく方式で作っています。
# ============================================================
import random
import math
import statistics
import matplotlib.pyplot as plt

# ===== パラメータ（去年の営業記録から決めた値）=====
# ここの数値を変えると、いろいろな条件で試せます
EIGYO = 180            # 営業時間（分）　　　記録：10:00〜13:00
KYAKU = 121            # 去年来た人数（人）　記録：時間帯別の記録の合計
HEIKIN_KANKAKU = EIGYO / KYAKU   # 平均の到着間隔 ≒ 1.49分
YAKI_JIKAN = 5         # 焼き時間（分）　　　記録：空いている時に来た人の待ちがちょうど5分
IKKAI_KAZU = 3         # 1回に焼ける人数分　記録：鉄板1枚で24個＝3パック
TEPPAN = 1             # 鉄板の枚数
SHIKOU = 200           # 何回試して平均をとるか

# 去年の記録（答え合わせ用）
KIROKU = {"人数": 121, "平均待ち": 18.7, "最長待ち": 31.3, "最大行列": 20}


def tochaku_kankaku(heikin):
    """次のお客さんが来るまでの時間を乱数で決める。
    ばらばらにやってくるお客さんの到着間隔は「指数分布」という形になる。
    -平均 × log(1 − 乱数) で、平均が heikin になるばらつきを作れる。"""
    return -heikin * math.log(1 - random.random())


def simulate(heikin=HEIKIN_KANKAKU, yaki=YAKI_JIKAN, ikkai=IKKAI_KAZU, teppan=TEPPAN):
    """1日分の営業をシミュレーションして、結果をまとめて返す"""
    # --- お客さんの到着時刻を決める（教科書の「到着時刻＝前の到着時刻＋到着間隔」）---
    tochaku = []
    jikoku = 0
    while True:
        jikoku = jikoku + tochaku_kankaku(heikin)
        if jikoku >= EIGYO:          # 営業時間を過ぎたら受付終了
            break
        tochaku.append(jikoku)

    # --- 一人ずつ、受け取る時刻を決める ---
    aki = [0.0] * teppan             # それぞれの鉄板が空く時刻
    amari = []                       # 焼き上がった（焼いている）分の、受け取れる時刻
    uketori = []
    for t in tochaku:
        if len(amari) == 0:
            # 余りがないので、新しく焼く。一番早く空く鉄板を使う
            k = aki.index(min(aki))
            hajime = max(t, aki[k])  # 教科書と同じ：「来た時刻」と「鉄板が空く時刻」の大きいほう
            aki[k] = hajime + yaki   # 焼き上がり時刻
            amari = [aki[k]] * ikkai # 1回で ikkai 人分できる
        # 余りの先頭を受け取る（焼き上がる前なら、焼き上がりまで待つ）
        uketori.append(max(t, amari.pop(0)))

    machi = [u - t for t, u in zip(tochaku, uketori)]

    # --- 行列の最大人数：来たら+1、受け取ったら-1 を時刻の順にたどる ---
    dekigoto = [(t, 1) for t in tochaku] + [(u, -1) for u in uketori]
    dekigoto.sort(key=lambda x: (x[0], x[1]))   # 同じ時刻なら、先に受け取りを数える
    ninzu = 0
    saidai = 0
    jikan = [0]
    gyoretsu = [0]
    for toki, zougen in dekigoto:
        ninzu = ninzu + zougen
        saidai = max(saidai, ninzu)
        jikan.append(toki)          # グラフ用に、人数が変わった時刻と人数を記録
        gyoretsu.append(ninzu)

    return {
        "人数": len(tochaku),
        "平均待ち": statistics.mean(machi) if machi else 0,
        "最長待ち": max(machi) if machi else 0,
        "最大行列": saidai,
        "到着": tochaku, "待ち": machi, "時刻": jikan, "行列": gyoretsu,
    }


def kurikaesu(kaisu=SHIKOU, tane=2025, **settei):
    """同じ設定で何回も試して、平均をとる。
    tane（乱数の種）をそろえると、パラメータを変えても同じお客さんの来方で比べられる"""
    random.seed(tane)
    kekka = [simulate(**settei) for _ in range(kaisu)]
    heikin = {}
    for k in ["人数", "平均待ち", "最長待ち", "最大行列"]:
        heikin[k] = statistics.mean(r[k] for r in kekka)
    return heikin, kekka


# ============================================================
# 1. 去年の状況を再現できているか（答え合わせ）
# ============================================================
heikin, kekka = kurikaesu()
print(f"■ 今の設定で {SHIKOU} 回試した平均と、去年の記録の比較")
print(f"{'':8}{'シミュレーション':>12}{'去年の記録':>10}")
for k, tani in [("人数", "人"), ("平均待ち", "分"), ("最長待ち", "分"), ("最大行列", "人")]:
    print(f"{k:8}{heikin[k]:>10.1f}{tani}{KIROKU[k]:>9}{tani}")

machi_list = sorted(r["平均待ち"] for r in kekka)
shita = machi_list[int(len(machi_list) * 0.1)]
ue = machi_list[int(len(machi_list) * 0.9)]
print(f"※ 平均待ちは1回ごとにばらつく（{SHIKOU}回のうち8割が {shita:.1f}〜{ue:.1f} 分）")

# ============================================================
# 2. 1日分の様子を、営業記録と同じ30分ごとの表にする
# ============================================================
ichinichi = kekka[0]
print("\\n■ 1回分の時間帯別の様子（営業記録の表と同じ形）")
print("時間帯        並んだ人数  平均待ち")
for s in range(0, EIGYO, 30):
    machi_s = [w for t, w in zip(ichinichi["到着"], ichinichi["待ち"]) if s <= t < s + 30]
    hm = lambda x: f"{10 + x // 60}:{x % 60:02d}"
    hw = statistics.mean(machi_s) if machi_s else 0
    print(f"{hm(s)}〜{hm(s + 30)}  {len(machi_s):>6} 人  {hw:>6.1f} 分")

# ============================================================
# 3. グラフ
# ============================================================
# (1) 1日分の行列の人数の変化
plt.figure(figsize=(7, 3.5))
plt.step(ichinichi["時刻"], ichinichi["行列"], where="post")
plt.axhline(KIROKU["最大行列"], color="gray", linestyle="--", label="去年の最大行列")
plt.title("1日分の行列の人数の変化（今の設定）")
plt.xlabel("開店からの時間（分）")
plt.ylabel("行列の人数（人）")
plt.legend()
plt.show()
`;
$('loadSample').addEventListener('click',()=>{if(code.value.trim()&&!$('loadSample').dataset.c){$('loadSample').dataset.c=1;$('loadSample').textContent='もう一度押すと今のコードと入れ替えます';setTimeout(()=>{delete $('loadSample').dataset.c;$('loadSample').textContent='見本プログラム'},3000);return}delete $('loadSample').dataset.c;$('loadSample').textContent='見本プログラム';code.value=SAMPLE;lines();toast('見本プログラムを入れました')});
code.value=store.get('qs_code')||'';lines();
startWorker();
})();
