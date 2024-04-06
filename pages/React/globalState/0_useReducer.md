---
path: '/react/useReducer/'
date: 1000-02-01T17:12:33.962Z
title: 'useReducer'
category: 'react'
subCategory: 'React狀態管理'
---

通常當我們要設定 state 時，都是透過`setState(要指定的值)`。但這樣做有兩個問題:

-   使用`setState`的元件可以任意指定值給`state`
-   當`state`結構複雜、但我們又只有要修改其中部分值時，很容易出錯。

舉例來說，這次有個鐵人賽參賽者(我忘記在哪看到的了)提及他想要用這樣的方式來處理資料:

```javascript
const [data, setData] = useState({ A: a, B: b });
```

然後他想分別建立兩個單獨設定`A`和`B`的按鍵:

```jsx
<button onClick={()=>{ setData({A: newA} )}}></button>
<button onClick={()=>{ setData({B: newB} )}}></button>
```

**然而這樣的寫法是錯的。因為 useState 給出來的 setData 函式並不會自動去修改物件中的單一屬性，而是直接把你丟給 setData 的參數整個變成 data 新的值**。以 A 為例，按下設定 A 的按鍵後，新的 data 不會是`{ A: newA, B: b }`，而是`{ A: newA }`。

最後，那位參賽者用 ES6 的 spread operator 展開原始的`data`物件，解決這個問題。

```jsx
<button onClick={()=>{ setData({...data, A: newA} )}}></button>
<button onClick={()=>{ setData({...data, B: newB} )}}></button>
```

雖然這樣做的確解決了他的 case，但是如果物件資料變的很複雜呢?如果我們要修改的結構散佈在物件各層呢? 要如何才能確保 state 的修改不會被同事改錯呢?

## action | reducer | dispatch

因為剛剛的問題在大型網站上常常出現，Facebook 的開發者針對這點提出了[Flux 設計模式](https://facebook.github.io/flux/)。這裡我們不會詳述 Flux，不過簡而言之就是**當我們在做資料管理、流程設計時，不應該讓別人能夠隨意修改，而是我們要預先定義好修改的規則，並讓其他開發者透過這些規則來操作**。

在 Flux 觀念下，我們操作流程和資料的過程大概變成像這樣:

1. 管理者預先定義好有哪些規則(action)可以使用
2. 管理者預先定義好規則(action)對應到的邏輯運算(store/reducer)是什麼。
3. 操作者透過一個溝通用的函式(dispatch)，把他選擇的規則(action)和需要的參數(payload)丟給管理者
4. 流程/資料透過管理者規定好的方式更新

> 由於 React 最通用的狀態管理工具 Redux(下一篇會講它)是採用 Flux 結構，而在 Redux 中 reducer 跟 store 扮演的角色是一樣的，所以我們這裡放入說明的同一個地方。接下來的說明我們也會以 Redux 的架構為主

![](https://i.imgur.com/eTSByPQ.png)

上圖截自[Facebook 對於 flux 的說明影片](https://facebook.github.io/flux/docs/in-depth-overview)

## useReducer

useReducer 是 React 提供用來簡易實現 Flux 架構的 React hook，基本上它就是一個「能夠預先定義 state 設定規則」的 useState。

和 useState 不同的是，useReducer 必須要接收兩個參數。第一個是函式，要定義有哪些規則、規則對應的邏輯。第二個則是 state 的初始值。useReducer 的語法為下:

```javascript
const [state, dispatch] = useReducer(reducerFunc, initStateValue);
```

操作者可以透過 dispatch 函式傳送參數:

```javascript
dispatch({ type: 'ADD' });
```

當操作者呼叫 dispatch 後，reducerFunc 會被呼叫並接收到兩個參數。第一個是 state 先前的值，第二個則是操作者剛剛傳入 dispatch 的參數。**reducerFunc 必須要接收一個回傳值，這個回傳值會變成 state 新的值**:

```javascript
const reducerFunc = function (state, action) {
    // action get { type:"ADD" }
    switch (action.type) {
        case 'ADD':
            return state + 1; // new State
        case 'SUB':
            return state - 1; // new State
        default:
            throw new Error('Unknown action');
    }
};
```

以上面的那位參賽者的狀況來說，它可以改成這樣:

```javascript
const reducer = function (state, action) {
    // 由於JS物件類似call by ref，先複製一份避免直接修改造成非預期錯誤
    const stateCopy = Object.assign({}, state);

    switch (action.type) {
        case 'SET_A':
            stateCopy.A = action.A;
            return stateCopy; // new State
        case 'SET_B':
            stateCopy.B = action.B;
            return stateCopy; // new State
        default:
            throw new Error('Unknown action');
    }
};
```

之後只要這樣使用，程式碼就會更直觀，也能避免不小心在哪個地方寫錯導致 state 被覆蓋:

```jsx
<button onClick={()=>{ dispatch({type: "SET_A", A: newA}) }}></button>
<button onClick={()=>{ dispatch({type: "SET_B", B: newB}) }}></button>
```

## 加入 useReducer 到我們的程式中吧

現在，我們來試著讓先前的`isOpen`改成用 useReducer 改變。

在 src/page/MenuPage.js 中，先定義 reducer:

```javascript
const reducer = function (state, action) {
    switch (action.type) {
        case 'SWITCH':
            return !state; // 只有開/關
        default:
            throw new Error('Unknown action');
    }
};
```

接著引入 useReducer，並在元件中取得 state 和 dispatch

```javascript
import React, { useState, useReducer, useMemo, useEffect } from 'react';
```

```javascript
const reducer = function(state, action){
    switch(action.type){
        case "SWITCH":
            return !state;
        default:
            throw new Error("Unknown action");
    }
}

const MenuPage = () =>{
    const [isOpen, isOpenDispatch] = useReducer(reducer,true);
```

然後綁定在本來的 Context 的`setOpenContext`上

-   src/page/MenuPage.js

```jsx
import React, { useState, useReducer, useMemo } from 'react';
import useMouseY from '../util/useMouseY';

import MenuItem from '../component/MenuItem';
import Menu from '../component/Menu';
import { OpenContext } from '../context/ControlContext';

let menuItemWording = ['Like的發問', 'Like的回答', 'Like的文章', 'Like的留言'];

const reducer = function (state, action) {
    switch (action.type) {
        case 'SWITCH':
            return !state;
        default:
            throw new Error('Unknown action');
    }
};

const MenuPage = () => {
    const [isOpen, isOpenDispatch] = useReducer(reducer, true);
    const [menuItemData, setMenuItemData] = useState(menuItemWording);
    let menuItemArr = useMemo(
        () => menuItemData.map(wording => <MenuItem text={wording} key={wording} />),
        [menuItemData]
    );

    return (
        <OpenContext.Provider
            value={{
                openContext: isOpen,
                setOpenContext: isOpenDispatch,
            }}
        >
            <Menu title={'Andy Chang的like'}>{menuItemArr}</Menu>
            <button
                onClick={() => {
                    let menuDataCopy = ['測試資料'].concat(menuItemData);
                    setMenuItemData(menuDataCopy);
                }}
            >
                更改第一個menuItem
            </button>
        </OpenContext.Provider>
    );
};

export default MenuPage;
```

最後讓呼叫 dispatch 的 Menu 不是直接傳 isOpen 新的值，而是傳入要使用的`type:SWITCH`即可:

-   src/component/Menu.js

```jsx
import React, { useContext, useMemo } from 'react';
import { OpenContext } from '../context/ControlContext';

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
    const isOpenUtil = useContext(OpenContext);
    return (
        <div style={menuContainerStyle}>
            <p style={menuTitleStyle}>{props.title}</p>
            <button
                style={menuBtnStyle}
                onClick={() => {
                    isOpenUtil.setOpenContext({ type: 'SWITCH' });
                }}
            >
                {isOpenUtil.openContext ? '^' : 'V'}
            </button>
            <ul>{props.children}</ul>
        </div>
    );
}

export default Menu;
```

這樣我們就能保護`isOpen`，不會哪天出現`isOpen`被變成非布林值的狀況。
