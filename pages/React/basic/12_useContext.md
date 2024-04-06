---
path: '/react/useContext/'
date: 1000-01-13T17:12:33.962Z
title: 'useContext'
category: 'react'
subCategory: 'React基礎'
---

我們完成了分頁，完成了用 React 製作的一個 Menu 和 MenuItem，看似一切都大功告成了。

然而不幸的是，這個時候客戶打來了一通電話:

> 欸!我想讓 MenuItem 被點擊的時候，Menu 會自動關起來，這應該不難吧!

因為 BD 覺得不難、PM 覺得不難，所以你看著目前的架構，開始說服自己這個不難:

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

-   src/component/MenuItem.js

```jsx
import React from 'react';

const menuItemStyle = {
    marginBottom: '7px',
    paddingLeft: '26px',
    listStyle: 'none',
};

function MenuItem(props) {
    return <li style={menuItemStyle}>{props.text}</li>;
}

export default MenuItem;
```

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

function Menu(props) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={menuContainerStyle}>
            <p style={menuTitleStyle}>{props.title}</p>
            <button
                style={menuBtnStyle}
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
            >
                {isOpen ? '^' : 'V'}
            </button>
            {isOpen && <ul>{props.children}</ul>}
        </div>
    );
}
```

想了很久，你得出了這個結論:

**_所以就是把 Menu 的 setIsOpen 傳到 MenuPage 再傳進去 MenuItem 裡面嘛!_**

於是你又開始思考要怎麼把 Menu 的 setIsOpen 傳到父元件 MenuPage 中...

> 難道沒有更好的做法嗎?

這個「把 Menu 的 setIsOpen 傳到 MenuPage 再傳進去 MenuItem 裡面」的作法雖然的確可行，但是可讀性超差，而且有太多要考量的事情。當專案一大起來，我們更不可能這樣做，不然程式碼就全部都會被沒有用的傳遞函式和 props 給占滿了。

**_「有沒有一個全局的 state 和 setState 可以讓所有的元件共同操作呢?」_**

於是 Global State 的概念就誕生了。

## Context API - React 的 Global State

Global State 的概念就像是住宅大廈的公共設施，它不單獨屬於任何一個人，也能夠被任何人取用。

React 內建提供了一個實作 Global State 的方法，稱作 Context API。使用方法是使用

```javascript
React.createContext(Context初始值);
```

現在，請創建`src/context`資料夾，並創立一個檔案`ControlContext.js`，在其中定義 OpenContext，其初始值為一個物件，裡面一次包好等等要用的`openContext`和`setOpenContext`。

```javascript
import React from 'react';

export const OpenContext = React.createContext({
    openContext: true,
    setOpenContext: () => {},
});
```

## Provider - 提供 Context

那麼 React 要如何把 Context 隔空提供給各個元件使用呢?答案是用一個叫做`<Provider>`的元件把所有需要這個 Context 的元件包起來。Provider 會內建於 Context 中，所以使用方式就是`<xxxContext.Provider>`

現在，請在`src/page/MenuPage`引入 OpenContext，並用`<OpenContext.Provider>`把所有的東西包起來。

```jsx
import React from 'react';

import MenuItem from '../component/MenuItem';
import Menu from '../component/Menu';
import { OpenContext } from '../context/ControlContext';

let menuItemWording = ['Like的發問', 'Like的回答', 'Like的文章', 'Like的留言'];

const MenuPage = () => {
    let menuItemArr = menuItemWording.map(wording => <MenuItem text={wording} />);

    return (
        <OpenContext.Provider>
            <Menu title={'Andy Chang的like'}>{menuItemArr}</Menu>
        </OpenContext.Provider>
    );
};

export default MenuPage;
```

但是現在 Context 裡面的資料只是普通變數而已，並不是 State。所以現在我們要在 MenuPage 中創造`isOpen`和`setIsOpen`。並把他丟給 OpenContext。

綁給 OpenContext 的方式是利用 OpenContext.Provider 的一個 props - ` value`:

```jsx
<OpenContext.Provider value={綁定值}></OpenContext.Provider>
```

實際加入程式碼中:

```jsx
import React, { useState } from 'react';

import MenuItem from '../component/MenuItem';
import Menu from '../component/Menu';
import { OpenContext } from '../context/ControlContext';

let menuItemWording = ['Like的發問', 'Like的回答', 'Like的文章', 'Like的留言'];

const MenuPage = () => {
    const [isOpen, setIsOpen] = useState(true);

    let menuItemArr = menuItemWording.map(wording => <MenuItem text={wording} />);

    return (
        <OpenContext.Provider
            value={{
                openContext: isOpen,
                setOpenContext: setIsOpen,
            }}
        >
            <Menu title={'Andy Chang的like'}>{menuItemArr}</Menu>
        </OpenContext.Provider>
    );
};

export default MenuPage;
```

## useContext - 在 function Component 中使用 Context

在 function component 中，取用 Context 的方式是先引入`useContext`和目標 context 後，透過

```javascript
const data = useContext(xxxContext);
```

data 就會是剛剛存好的那個物件。

現在請在 Menu 中，先把`isOpen`和`setIsOpen`拿掉，然後用`useContext`引入`OpenContext`。

```jsx
import React, { useContext, useMemo } from 'react';
import { OpenContext } from '../context/ControlContext';
```

```jsx
function Menu(props){
    const isOpenUtil = useContext(OpenContext);
```

這個 isOpenUtil 就會是剛剛存好的

```javascript
isOpenUtil = {
    openContext: isOpen,
    setOpenContext: setIsOpen,
};
```

所以現在，我們先把 Menu 本來綁定`isOpen`的 button 改成用`isOpenUtil`裡面的東西看看能不能運作(**先不管 ul 要不要顯示**)

```jsx
function Menu(props) {
    const isOpenUtil = useContext(OpenContext);
    return (
        <div style={menuContainerStyle}>
            <p style={menuTitleStyle}>{props.title}</p>
            <button
                style={menuBtnStyle}
                onClick={() => {
                    isOpenUtil.setOpenContext(!isOpenUtil.openContext);
                }}
            >
                {isOpenUtil.openContext ? '^' : 'V'}
            </button>
            <ul>{props.children}</ul>
        </div>
    );
}
```

![](https://i.imgur.com/sirb7Rt.gif)

> 恩，看起來能跟本來一樣的方法運作!

由於在`<OpenContext.Provider></OpenContext.Provider>`裡面的元件不管隔幾層、在哪裡都能取用`OpenContext`，我們就能用這種方式達成多層子父元件的溝通。

現在，你應該有能力可以在 MenuItem 中實作剛剛前面講的功能了!
