---
path: '/react/useMemo/'
date: 1000-03-03T17:12:33.962Z
title: 'useMemo'
category: 'react'
subCategory: 'React進階'
---

初學者在使用 function component 時，每當遇到「需要加工計算 state」的狀況，經常會寫出像以下內容的程式碼:

乍看之下雖然沒有甚麼問題，然而當你實際操作這個 U I，你會發現一個奇怪的現象: 當你修改 data 的值時，即使 number 的值沒有被修改，console 面板上仍然印出了 calcSquareOfNumber 被重新執行的訊息。這是因為我們提到過「每一次當元件要重新渲染，React 都會重新呼叫整個 function component 的函式定義域」。由於 calcSquareOfNumber 需要用到 state，位於 Caculator 的定義域內，所以 calcSquareOfNumber 被重新執行了。
如果今天 calcSquareOfNumber 是一個需要耗費大量資源的函式，就會對我們的程式造成不必要的效能問題。這個時候我們就必須要使用 React 提供的效能處理 hook – useMemo 來解決。

## useMemo

## useMemo

`useMemo`是另一個 React hook，你可以把`useMemo`想像成是「用來記憶計算結果」的`useCallback`。它的語法和`useCallback`幾乎一模一樣。

```jsx
const calcRes = useMemo(函式, [相依變數]);
```

`useCallback`是用來避免函式被**重複定義**，而`useMemo`是用來避免函式一直被**重複執行**。

**`useMemo`會把上次函式的回傳值記憶起來，當元件被更新、但相依的變數沒有被改變時，`useMemo`就不會再執行一次函數，而是直接把上一次記憶的回傳值丟出去**。

> 也因為這個特性，如果你在`useMemo`回傳的是函式，它就會跟`useCallback`一樣。

利用 useMemo，

## 加入 useMemo 到先前的程式碼中

我們先把 MenuItem 的 memo 拔掉:

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

然後在 MenuPage 把加工 wording 成 MenuItem 的地方加入`useMemo`:

-   src/component/Menu.js

```jsx
import React, { useState, useRef, useCallback, useMemo } from 'react';

import MenuItem from '../component/MenuItem';
import Menu from '../component/Menu';
import { OpenContext } from '../context/ControlContext';

let menuItemWording = ['Like的發問', 'Like的回答', 'Like的文章', 'Like的留言'];

const MenuPage = () => {
    const [isOpen, setIsOpen] = useState(true);

    const renderCounter = useRef(0);
    renderCounter.current++;

    const handleClick = useCallback(() => {
        console.log('counter is ' + renderCounter.current);
    }, [renderCounter]);

    const menuItemArr = useMemo(() => {
        return menuItemWording.map(wording => <MenuItem text={wording} />);
    }, []);

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

此時 MenuItem 因為回傳的是第一次渲染時記憶的值，就不會在非必要的時候被重新渲染了
![](https://i.imgur.com/Ck1Iy0l.png)
