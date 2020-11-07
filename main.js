#!/usr/bin/env node

const fs = require('fs');
const program = require('commander')
require('dotenv').config();

// Node.js
const { Qiita } = require('qiita-js-2');

const emojis = ['😄','😁','😆','😊','🙂','💪','💪🏻','💪🏼','💪🏽','💪🏾','🦾','✍🏻','✍🏼','✍🏽','✍🏾','🌈','⭐️','🌟','✨','⚡️']
function randomEmoji(){
  const randomIndex = Math.floor(emojis.length * Math.random());
  return emojis[randomIndex];
}

const usage_text = `
Qiita記事を管理します。今は取得のみに対応しています。`

program
  .version('0.0.3')
  .usage(usage_text)
  .option('-a, --all-qiita', '全てのQiita記事をarticlesディレクトリに格納します。')
  .option('-i, --import-qiita <id>', '1つのQiita記事をarticlesディレクトリに格納します。')
  .option('-o, --overwrite', 'Qiita記事が既にarticlesディレクトリにあるとき上書きします')
  // .option('-n, --new [slug]', 'qiitaに記事をアップします')
  .option('-p, --public', 'Qiita記事をローカルに格納するときに指定します')
  .option('-t, --token [token]', '一時的にQIITA_ACCESS_TOKENを使用します.')
  .parse(process.argv)

const publicOption = program.public
const overwriteOption = program.overwrite
const qiitaItemId = program.importQiita

if (program.token &&
     (process.env.QIITA_ACCESS_TOKEN 
   || process.env.QIITA_ACCESS_TOKEN_FOR_QIITANAGE)) {
  console.log('[INFO] 既存のトークンが存在しますが、コマンドで入力されたトークンを使用します');
}
if(program.token) {
  token = program.token;
} else if(process.env.QIITA_ACCESS_TOKEN_FOR_QIITANAGE) {
  token = process.env.QIITA_ACCESS_TOKEN_FOR_QIITANAGE;
} else if(process.env.QIITA_ACCESS_TOKEN) {
  token = process.env.QIITA_ACCESS_TOKEN;
} else {
  alert = "[ALERT] -t または --token のあとにQiitaのトークンを入力するか(一時的)、\n"
        + "export QIITA_ACCESS_TOKEN=[実際のトークン]\n"
        + "などで環境変数を設定して下さい。";
  console.log(alert);
  exit
}

if (!qiitaItemId && !program.allQiita) {
  console.log("iかaのオプションの指定が必要です。");
  console.log("hオプションで、helpが見れます。");
  process.exit(0)
}

const client = new Qiita({token: token});

client.fetchAuthenticatedUser().then((user) => {
  console.log(`[INFO] QiitaユーザーID: ${user.id} の記事を管理を始めます`);
  if (qiitaItemId) {
    fetchAndSaveQiitaItem(qiitaItemId)
  } else if (program.allQiita) {
    fetchAndSaveQiitaItems();
  } else {
    console.log("iかaのオプションの指定が必要です。(Qiitanageのバグ)")
  }
}, (reason) => {
  if(reason.name === "QiitaUnauthorizedError"){
    console.log(`[ERROR] ${reason}: 認証、通らず。トークン誤っている可能性などあり。`);
  } else {
    console.log(`[ERROR] ${reason}: エラーです。`);
  }
})

async function fetchAndSaveQiitaItems() {
  let itemPages = client.fetchAuthenticatedUserItems();
  for await (const items of itemPages) {
    items.forEach((item) => { saveItemAsArticle(item) })
  }
  console.log("Qiitaの記事を全て取得し、ローカルに保存しました。")
}

async function fetchAndSaveQiitaItem(id) {
  let item = client.fetchItem(id).then((item) => {
    saveItemAsArticle(item);
  }, (reason) => {
    console.log(`[ERROR] ${reason}: Qiitaの記事を取得できませんでした。idが間違っているかも。\n         取れる記事は自分の記事のみです。また、設定したACCESS_TOKENに読み取り設定が必要です。`)
  }) 
}

function saveItemAsArticle(item) {
  // "/" is special character for path
  let title = ""
  title = item.title.split("/").join("／")
  title = title.replace(/\\/g, "＼")
  title = title.replace(/\"/g, "\\\"")

  // fs.writeFileSync(`qiita-raw/${item.title}.json`, JSON.stringify(item))

  let created_on = item.created_at.replace(/[-:]/g, "").slice(0, 8)
  article_slug = `${created_on}-q-${item.id}`

  if (!overwriteOption && fs.existsSync(`articles/${article_slug}.md`)) {
    console.log(`[INFO] ${article_slug}「${item.title}」は、既にariticlesディレクトリにありました。\n       上書きしたい場合はoオプションを指定して下さい。`)
    return
  }

  let topics = item.tags.map((tag) => {return `"${tag.name}"`;})
  let published = publicOption ? (!item.private) : false

  article_body =  "---\n"
  article_body += `title: "${title}"\n`
  article_body += `emoji: "${randomEmoji()}"\n`
  article_body += `type: "tech"\n`
  article_body += `topics: [${topics}]\n`
  article_body += `published: ${published}\n`
  article_body += `from-qiita: true\n`
  article_body += `qiita-id: "${item.id}"\n`
  article_body += `qiita-updated-at: "${item.updated_at}"\n`
  article_body += "---\n\n"
  article_body += item.body

  let article_path = `articles/${article_slug}.md`;
  fs.writeFileSync(article_path, article_body);

  console.log("次のQiitaの記事を取得し、ローカルに保存しました。")
  console.log(`  タイトル: ${item.title}`)

  if (!fs.existsSync('qiita_items') && !fs.existsSync('qiita-items')) {
    fs.mkdirSync('qiita_items')
  }
  let qiitaDir = fs.existsSync('qiita_items') ? 'qiita_items' : 'qiita-items'
  let link_path = `${qiitaDir}/${created_on}_${title}.md`;
  if (!fs.existsSync(link_path)) {
    fs.linkSync(article_path, link_path);
  }  
}
