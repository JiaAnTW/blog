---
path: '/react/props/'
date: 1000-01-06T17:12:33.962Z
title: 'props'
category: 'react'
subCategory: 'React基礎'
---

## props - 以外部參數控制元件

看到這裡，你應該會有個想法:

> 不對啊，你這裡 menuItem 裡的文字是鑲死的，但我需要動態符合 array 裡的內容啊?

當初 React 的設計者也有想到這點。他們想到，在過去使用原生 HTML 元素的時候，我們常常會用 **像 id、onclick 這些 attribute(屬性)** 來設定元素，例如以下就是在設定 button 被點擊後在幹嘛:

```html
<button onclick="doSomething()">按我啊</button>
```

**_如果我們自製的元件也能夠這樣該有多好啊 !_**

於是，React 的設計者就讓所有寫在自製元件標籤上的「屬性」，和其他從外部控制元件的參數包成一個物件、傳入元件中，並稱為 props。

props 要怎麼用呢? 以我們的 menuItem 為例，我們在 menuItem 上把 wording 綁在一個稱為`text`的屬性上:

-   src/index.js

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import MenuItem from './component/MenuItem';

const root = createRoot(document.getElementById('root'));

let menuItemWording = ['Like的發問', 'Like的回答', 'Like的文章', 'Like的留言'];
let menuItemArr = menuItemWording.map(wording => <MenuItem text={wording} />);

root.render(<div>{menuItemArr}</div>, document.getElementById('root'));
```

此時，React 會把這些屬性整理成物件，傳入 function component 的參數中。也就是 function component 會收到:

```javascript
props = {
    text: 'wording對應的文字',
};
```

所以，我們如果要在 menuItem 中使用，就會是這樣:

-   src/component/MenuItem.js

```jsx
import React from 'react';

const menuItemStyle = {
    marginBottom: '7px',
    paddingLeft: '26px',
    listStyle: 'none',
};

function MenuItem(props) {
    //加入props到參數
    // 使用props中的text
    return <li style={menuItemStyle}>{props.text}</li>;
}

export default MenuItem;
```

執行結果:
![](https://i.imgur.com/E8Z8SOK.png)

接著，我們就能來試試看把 Menu 也改成 React 的樣子囉!

-   src/component/Menu.js

```jsx
import React from 'react';

const menuContainerStyle = {
    position: 'relative',
    width: '300px',
    padding: '14px',
    fontFamily: 'Microsoft JhengHei',
    paddingBottom: '7px',
    backgroundColor: 'white',
    border: '1px solid #E5E5E5',
};

const menuTitleStyle = {
    marginBottom: '7px',
    fontWeight: 'bold',
    color: '#00a0e9',
    cursor: 'pointer',
};

const menuBtnStyle = {
    position: 'absolute',
    right: '7px',
    top: '33px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#00a0e9',
    outline: 'none',
};

const menuStyle = {
    display: 'block', //這裡先讓它顯示
};

function Menu(props) {
    return (
        <div style={menuContainerStyle}>
            <p style={menuTitleStyle}>{props.title}</p>
            <button style={menuBtnStyle}>V</button>
            <ul style={menuStyle}>{props.menuItems}</ul>
        </div>
    );
}

export default Menu;
```

-   src/index.js

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import MenuItem from './component/MenuItem';

// 引入新的Menu
import Menu from './component/Menu';


const root = createRoot(document.getElementById('root'));

let menuItemWording = ['Like的發問', 'Like的回答', 'Like的文章', 'Like的留言'];
let menuItemArr = menuItemWording.map(wording => <MenuItem text={wording} />);

root.render(
    <Menu title={'Andy Chang的Like'} menuItems={menuItemArr} />
);
```

但是這樣還是不夠直覺，因為明明我們最後的結構是
![](https://i.imgur.com/dLGUGM3.png)

但是現在卻是讓 menuItem 變成一個 attribute 的感覺，有沒有辦法能讓 menuItem 在視覺上夾在 menu 中間呢?

## children - 夾在中間的 props

設計 React 的工程師也想到了這點，於是，他們把「夾在標籤中間」的內容也全部包成一個物件，**稱為 children，然後再丟進 props 裡面**。

也就是剛剛的程式碼可以改成這樣:

-   src/index.js

```jsx
//上方省略
let menuItemArr = menuItemWording.map(wording => <MenuItem text={wording} />);

root.render(
    <Menu title={'Andy Chang的Like'}>{menuItemArr}</Menu>
);
```

在 Menu 中，中間的東西會在 props 的「children 屬性」中

-   src/component/Menu.js

```jsx
//上方省略

function Menu(props) {
    //修改ul中的內容
    return (
        <div style={menuContainerStyle}>
            <p style={menuTitleStyle}>{props.title}</p>
            <button style={menuBtnStyle}>V</button>
            <ul style={menuStyle}>{props.children}</ul>
        </div>
    );
}

// 下方省略
```

![](https://i.imgur.com/uzrPVUF.png)
是不是直覺多了呢?

## 重構尚未完成，同志仍須努力

如果有仔細看剛剛範例中的程式碼，你會發現 Menu 開關的功能並沒有被加進去。這是因為在 React 元件中，**以內部控制元件必須要用特殊的 API**。如果你直接用前面的原生 JS code 去實作，會發現有一些問題、或是不照你的預期。我們會在下一篇來講解如何在 function component 使用這個 API。
