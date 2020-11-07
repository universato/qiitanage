# Qiitanage

非公式のQiita管理コマンドです。  
個人用のQiita記事をローカルにダウンロードします。  
(余裕があれば、Qiita記事のアップも追加したいです。)

## 使い方

### 前提と注意

Qiitanageは、Qiitaの記事をZenn形式のディレクトリに、Zenn形式のファイル名・Markdownで保存します。

Zenn形式とは、`articles`ディレクトリに、slugというファイル名で、YAML Front Matterと呼ばれる設定が頭にあるマークダウン形式で、記事を保存します。`articles`ディレクトリは、複数形であることに注意して下さい。なお、Zenn形式のディレクトリの詳細な説明は、「[Zenn CLIで記事・本を管理する方法](https://zenn.dev/zenn/articles/zenn-cli-guide)」をご覧ください。

このZenn形式を用いることにより、Qiita記事を容易にZennで公開することができます。

### パッケージををインストール

Qiitanageは、Zenn形式のディレクトリである必要があり、`articles`ディレクトリ(複数形です)のあるディレクトリで下記のコマンドを実行して下さい。

```
npm i qiitanage
```

### Qiita発行のトークンを取得

Qiitanageは、Qiita記事を読み書きするために、Qiitaの発行するアクセストークンが必要となります。  
そのため、そのアクセストークンの取得方法を、以下に記載します。  

Qiitaの[アプリケーションページ](https://qiita.com/settings/applications)を開き、[新しくトークンの発行画面](https://qiita.com/settings/tokens/new)に行きます。

個人用のQiita記事をローカルにダウンロードします。  
スコープは`read_qiita`と`write_qiita`をチェックして下さい。  
(ただし、本Qiitanageは現在、読み込み権限のみ使用します。書き込みは将来的な話です。)  
アクセストークンは、複数発行できますし、削除も容易です。

生成されたアクセストークンをコピーして使用します。

### アクセストークンの設定方法

方法は大きく2つで、一時的な方法、設定ファイルに保存して使う半永続的な方法に分類できます。

- 一時的な方法
  - コマンド: `export QIITA_ACCESS_TOKEN=1234567890abcdefg`
  - Qiitanageのコマンドで`-t`オプションを用いて指定する。
- 半永続的な方法
  - `QIITA_ACCESS_TOKEN=1234567890abcdefg`と`.env`ファイルに記入します。`.env`ファイルは、人に見せてはならないものであるため`.gitignore`に必ず記入して下さい。

### 利用する

```sh
qiitanage -i 0123456789abcdefghij
```
IDが`0123456789abcdefghij`であるあなたのQiita記事を`articles`ディレクトリに保存します。ファイル名は、`作成年月日8桁-q-0123456789abcdefghij`となります。これは編集しないで下さい。

```sh
qiitanage -oi 0123456789abcdefghij
```
IDが`0123456789abcdefghij`であるあなたのQiita記事を`articles`ディレクトリに上書き保存します。

```sh
qiitanage -a
```
あなたの全てのqiita記事を`articles`ディレクトリに格納します。  
既に`articles`ディレクトリにある場合は、上書きしません。

```sh
qiitanage -oa
```

あなたの全てのqiita記事を`articles`ディレクトリに格納します。  
`o`オプションんがあるため、既に`articles`ディレクトリにある場合は、上書きします。

また、Qiita記事を`articles`ディレクトリに保存すると、同時に`qiita_items`ディレクトリに、タイトルの入った名称のシンボリックリンクを作成します。

## 依存package

- qiita-js-2
- commander
- dotenv

## License

MIT
