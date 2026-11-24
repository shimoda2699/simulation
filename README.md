# 待ち行列シミュレーション工房

情報Ⅰ「モデル化とシミュレーション」（待ち行列・タコ丸）用の Web アプリです。

- ① 設計して Copilot へ：設計シートに記入すると Copilot 用のプロンプトができる
- ② Python で実行：Copilot が作ったプログラムをブラウザ上（Pyodide）で実行する。matplotlib のグラフも表示

## ファイル
- index.html … 画面
- style.css … デザイン
- script.js … 画面の動き
- py-worker.js … Python を動かす部分（Pyodide を CDN から読み込む）

4つを同じフォルダに置き、GitHub Pages で公開してください。
index.html をパソコンで直接開くと、Python の部分は動きません（ワーカーは Web サーバー上でのみ動くため）。
