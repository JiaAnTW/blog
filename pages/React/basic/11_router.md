---
path: '/react/router/'
date: 1000-01-12T17:12:33.962Z
title: 'React router DOM'
category: 'react'
subCategory: 'React基礎'
---

在過去，當我們要製作「分頁」時，多半是新增一個靜態 HTML 檔，讓 web server 根據檔案路徑去尋找，或是透過後端程式碼去定義什麼 url 要對應到哪個 HTML 檔。這種方式我們稱為伺服器渲染(SSR)

然而這卻也產生了一個問題。

> 即使頁面中大多是固定的 Layout，但換頁的時候，因為是拜訪新檔案，整個頁面都要刷新。

為了解決這個問題，工程師決定也用 Javascript 從去創造前端路由控制器。換頁的時候，只用 JS 去改變不一樣的地方。這樣的網頁程式換頁時不需要整頁都刷新，使用起來跟 APP 很像，因此又稱為 Single Page Application(SPA，單頁式網頁應用)。也因為大多改在瀏覽器製造頁面，這樣的方式也稱為客戶端渲染(CSR)。

React-router-dom 就是在 React 達成前端路由的插件之一。

## 前置作業 - 製作分頁

這裡我們的`Menu.js`、`MenuItem.js` 會依照 Day.12 的程式，`InputForm.js`會依照 Day.15 的程式。然後我們要新增 src/page 資料夾，並在裡面製作兩個用來當作分頁的頁面:
![](https://i.imgur.com/iw23fU4.png)

-   src/page/MenuPage.js

```jsx
import React from 'react';

import MenuItem from '../component/MenuItem';
import Menu from '../component/Menu';

let menuItemWording = ['Like的發問', 'Like的回答', 'Like的文章', 'Like的留言'];

const MenuPage = () => {
    let menuItemArr = menuItemWording.map(wording => <MenuItem text={wording} />);

    return <Menu title={'Andy Chang的like'}>{menuItemArr}</Menu>;
};

export default MenuPage;
```

-   src/page/FormPage.js

```jsx
import React from 'react';
import InputForm from '../component/InputForm';

const FormPage = () => {
    return <InputForm />;
};

export default FormPage;
```

接下來，我們會嘗試在 src/index.js 來控制並創造控制分頁的路由。

## 環境設定

請打開 terminal，並輸入

```bash
 npm i react-router-dom --save
```

安裝完畢後，進入 src/index.js，在開頭引入

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

import MenuPage from './page/MenuPage';
import FormPage from './page/FormPage';

import { HashRouter, Routes, Route, Link } from 'react-router-dom';
```

其中這一行會是所有我們要用到的元件

```javascript
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
```

## HashRouter

路由器的英文是 Router，但為甚麼這裡要加一個 Hash 呢? 這是因為如果我們要從前端去判斷當前的 url 是什麼，必須要在根路徑最後方加入一個`#`。JS 才能從`#`後方的字串去判斷。

當然，React-router-dom 也有提供不會有`#`的`BrowserRouter`。但這個會需要後端的配合，我們目前只有純前端檔案就先用 HashRouter。

現在，請在 src/index.js 創造一個元件`App`，讓 React 程式統一從這個元件渲染。並在裡面先加入`<HashRouter></HashRouter>`。

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';

import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import MenuPage from './page/MenuPage';
import FormPage from './page/FormPage';

const App = () => {
    return <HashRouter></HashRouter>;
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

## Routes

Routes 這個元件是用來正確地判斷路由應該對應到誰。我們一樣在 src/index.js 裡面加入`<Routes></Routes>`。

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';

import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import MenuPage from './page/MenuPage';
import FormPage from './page/FormPage';

const App = () => {
    return (
        <HashRouter>
            <Routes></Routes>
        </HashRouter>
    );
};
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

## Route

Route 就是用來設定分頁的元件，用`path`這個 props 來設定 url 字串:


```jsx
<Route path="/form" element={<FormPage/>} />
```

現在，把我們的分頁元件用 Route 加進 App 中:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';

import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import MenuPage from './page/MenuPage';
import FormPage from './page/FormPage';

const App = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<MenuPage/>} />
                <Route path="/form" element={<FormPage/>} />
            </Routes>
        </HashRouter>
    );
};
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

這樣就完成了分頁。
![](https://i.imgur.com/mJ19sv9.gif)

## 固定 Layout

然而這樣並沒有顯示出 SPA 的感覺。所以現在我們來做一個固定的導覽列。請在 src/index.js 上方新增一個 Layout 元件:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';

import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import MenuPage from "./page/MenuPage";
import FormPage from "./page/FormPage";

const Layout = () => {
    return(

    )
}

const App = () =>{
/* 省略 */
```

然後在 App 中使用 Layout 把所有 Route 包起來:

```jsx
const App = () => {
    return (
        <HashRouter>
            <Routes>
                <Layout>
                    <Route path="/" element={<MenuPage/>} />
                    <Route path="/form" element={<FormPage/>} />
                </Layout>
            </Routes>
        </HashRouter>
    );
};
```

然後我們就能在 Layout 中以 props.children 來顯示對應的 Route

```jsx
const Layout = props => {
    return <>{props.children}</>;
};
```

但是目前我們還缺少了前往分頁的導覽列，請在 Layout 中新增`<nav>`

```jsx
const Layout = props => {
    return (
        <>
            <nav></nav>
            {props.children}
        </>
    );
};
```

接下來就是要加入超連結了。

## Link

一般講到超連結，我們會聯想到`<a href="/路徑">`，但這裡我們要使用的是 React-router-dom 提供的原件`<Link>`。

> 為什麼要特別多弄一個元件呢?

這是因為`<a href="/路徑">`是預設導向`主domain/路徑`，當我們今天使用的是 subdomain 或是像 hash router 這種東西時，就要自己把 subdomain 或是`#`補進去，像是`<a href="/#/路徑">`。這樣當我們今天專案部屬環境不同時就很麻煩。

Link 這個元件就會方便我們導向/統一管理要導向的路徑。它的語法是

```jsx
<Link to="路徑">
```

現在，我們在開頭引入 Link 這個元素，並使用在`<nav></nav>`中。

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';

import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import MenuPage from './page/MenuPage';
import FormPage from './page/FormPage';

const Layout = props => {
    return (
        <>
            <nav>
                <Link to="/">點我連到第一頁</Link>
                <Link to="/form" style={{ marginLeft: '20px' }}>
                    點我連到第二頁
                </Link>
            </nav>
            {props.children}
        </>
    );
};
```

所有的程式碼:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';

import { HashRouter, Route, Switch, Link } from 'react-router-dom';
import MenuPage from './page/MenuPage';
import FormPage from './page/FormPage';

const Layout = props => {
    return (
        <>
            <nav>
                <Link to="/">點我連到第一頁</Link>
                <Link to="/form" style={{ marginLeft: '20px' }}>
                    點我連到第二頁
                </Link>
            </nav>
            {props.children}
        </>
    );
};

const App = () => {
    return (
        <HashRouter>
            <Routes>
                <Layout>
                    <Route path="/" element={<MenuPage/>} />
                    <Route path="/form" element={<FormPage/>} />
                </Layout>
            </Routes>
        </HashRouter>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

執行結果:
![](https://i.imgur.com/YUAcLub.gif)

Link 還能透過 location api 傳資料。詳請請參考[官方文件](https://reactrouter.com/web/guides/quick-start)
