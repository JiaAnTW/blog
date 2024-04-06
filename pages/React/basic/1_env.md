---
path: '/react/env/'
date: 1000-01-02T17:12:33.962Z
title: '環境設定 - npm、Webpack、Babel'
category: 'react'
subCategory: 'React基礎'
---

## 環境設定 - 前言

前面說過，React 是 Facebook 開發的一套 Library。可是瀏覽器沒有那麼聰明，不會因為地球上每多一個人開發了框架就認得他，那怎麼辦呢?

這個時候我們就需要**打包工具**和**編譯器**。

打包工具可以幫我們把多個 Javascript 檔案合併成一個或多個檔案。這就解決了我們先前提過太多 Javascript 檔夾雜在 HTML 中的問題。

而編譯器的概念在其他非直譯語言很常見。以**C 語言舉例來說，本來一般電腦只認得 0 和 1，所以開發者只好做出一個「轉換器」，先把 C 語言先轉換成組合語言，再把組合語言對應到電腦認得的 0 和 1 序列組合**。這個轉換器就稱為「編譯器」。

Javascript 是屬於一種比較特別的直譯語言。因為本系列不是在上編譯器原理，所以我們不探討直譯語言和非直譯語言的差別，總而言之就是「瀏覽器認得它」。而現在我們之所以會需要編譯器，就是為了把 React 對應到 Libary 的程式碼抓出來，轉換成原生的 Javascript。

## 環境設定 - 安裝 npm

以前專案小的時候我們會習慣透過 script 使用 CDN 引入外部函式庫，但現在~~專案長大了~~外部套件很多的時候就不適合這樣使用。

npm 是「套件管理系統」。簡單來說，你可以用它下載、管理許多別人已經寫好的函式庫，所以現在就是要用 npm 來取得 Facebook 寫好的 React。

請到[這裡](https://nodejs.org/en/)進行下載 Node.js 並安裝，npm 會一起被安裝。
**安裝完請務必重新開機**。

![](https://i.imgur.com/lV2NkYy.png)

#### 接下來的環境安裝會比較複雜一點，如果你希望先熟悉 React.js，但看以下內容感到挫折、看不懂，可以先參考 [【React.js 入門 - 01】 前言 & 環境設置(上)](https://ithelp.ithome.com.tw/articles/10214942)的 create-react-app 作法，熟悉 React 後再來慢慢研究專案設定的意義。

## 環境設定 - 安裝、設定 webpack

webpack 是目前最通用的打包工具。現在我們要透過 npm 來取得它。npm 安裝套件的方式為

```bash
npm install 套件名稱
npm i 套件名稱
```

### 1. 請切換到你想要開發的專案目錄底下(切換目錄指令為 `cd 資料夾名稱`)，輸入:

```bash
npm init
```

此時專案資料夾底下會出現 package.json 這個檔案，這個檔案可以用來處理、紀錄安裝套件的相關設定。當今天我們換電腦時，只要在有 package.json 的專案目錄底下輸入 `npm i`或是`npm install`，專案用到的套件就會一次裝好。

### 2. 現在，請輸入:

```bash
npm install webpack webpack-cli --save-dev
```

webpack 就會被安裝完成。這裡使用 -g 代表安裝在整台電腦上，沒有使用的話則是只安裝在專案中。你會發現 package,json 裡面多了這幾行

```json
  "devDependencies": {
    "webpack": "^4.44.2",
    "webpack-cli": "^3.3.12"
}
```

這個 devDependencies 就是用來記錄專案有什麼套件、版本是什麼。

此外還會在專案看到 node_modules，這個資料夾就是用來放我們載下來的函式庫。如果**有使用 git 的朋友請記得把他加到`.gitignore`中，不然你會後悔**。

接著，就是來設定要如何打包了。

### 3. 在專案根目錄新增 webpack.config.js，並輸入以下內容:

-   webpack.config.js

```javascript
const path = require('path');
module.exports = {
    entry: {
        index: './src/index.js', // 從哪裡開始打包
    },
    output: {
        filename: 'bundle.js', // 要打包成什麼
        path: path.resolve('./build'), // 要打包在哪裡
    },
};
```

這樣就完成了打包工具的設定，做的事情是把`./src/index.js`和其引入的所有 js 檔案打包成一個`bundle.js`並放在`./build`資料夾中。

現在我們來測試是否打包成功。

### 4. 新增 src 資料夾，在裡面創建 index.js 並輸入以下內容:

-   src/index.js

```javascript
document.write('hello world!');
```

### 6. 新增 build 資料夾，在裡面新增 index.html，並輸入以下內容:

-   build/index.html

```html
<!DOCTYPE html>
<html lg="zh-tw">
    <head>
        <meta charset="utf-8" />
        <title>React 練習</title>
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="stylesheet" type="text/css" href="./css/index.css" />
    </head>
    <body>
        <div id="root"></div>
    </body>
    <script src="./bundle.js" type="text/javascript"></script>
</html>
```

````到這裡我們就完成打包的工作了。在終端機輸入`npx webpack -p`後，開啟`./build/index.html`，你會看到~~~ (2021/04/07更新webpack v4的新打包指令) 到這裡我們就完成打包的工作了。在終端機輸入`npx webpack --mode production`後，開啟`./build/index.html`，你會看到

![](https://i.imgur.com/xoeHivI.png)

另外，你也可以在 package.json 中新增以下內容

-   package.json

```json
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack --mode production" //加入這一行
  },
```

之後輸入以下指令，就會做等同`webpack -p`的動作。

```bash
npm run build
```

## 環境設定 - 安裝 React 與對應的 Babel

Babel 就是我們要使用的編譯器名稱，請依序輸入以下指令

```bash
npm install react react-dom --save
npm install babel-loader --save-dev
npm install @babel/core --save-dev
```

React 和 Babel 就會被裝好。但因為 Babel 不只可以編譯 React，所以 Babel 把支援的編譯 Libary 個別拉出來變成獨立套件了。請繼續輸入:

```bash
npm install @babel/preset-react --save-dev
npm install @babel/preset-env --save-dev
```

`@babel/preset-react`是編譯 React 的套件，`@babel/preset-env`是編譯 ES6+的套件。

最後，我們要告訴打包工具，把所有的 js 檔都用 Babel 編譯過:

-   webpack.config.js

```javascript
const path = require('path');
module.exports = {
    entry: {
        index: './src/index.js',
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve('./build'),
    },
    // --------- 新增以下內容 -----------
    module: {
        rules: [
            {
                test: /.js$/,
                exclude: /node_modules/, //不編譯的檔案
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react', '@babel/preset-env'],
                    },
                },
            },
        ],
    },
};
```

到這裡，開發 React 必備的環境就都準備完成了。

## 小結 - 最難的永遠是環境設定

環境設定永遠是做起來最難，又最沒有成就感的事情。如果這裡有遇到無法解決的地方，可以改用去年我的文章中使用官方模板`create-react-app`的方式，等熟悉 React 之後再回過頭來研究這個。

