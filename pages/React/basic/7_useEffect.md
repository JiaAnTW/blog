---
path: '/react/useEffect/'
date: 1000-01-08T17:12:33.962Z
title: 'useEffect'
category: 'react'
subCategory: 'React基礎'
---

> ...如果有仔細看剛剛範例中的程式碼，你會發現 Menu 開關的功能並沒有被加進去。這是因為在 React 元件中，以內部控制元件必須要用特殊的 API。如果你直接用前面的原生 JS code 去實作，會發現有一些問題、或是不照你的預期。

正確來說，是如果我們在 React 中直接使用原生 DOM API，會有一些問題。這是因為當`state`被改變的時候，React 並不會馬上去改變 DOM。

**_那 React 這個時候到底在幹嘛 ?_**

> ...去比較「模擬好未來長怎樣的虛擬 DOM」和「當前 DOM」所有節點的差別。最後，React 就只會去修改「有不一樣的地方」，達到避免資源浪費的效果。

還記得我們在 Day.09 講過的這句話嗎? 更明確來說，React 從建立、到更新畫面的流程是這樣的:

1. 建立、呼叫 function component
2. 真正更新 DOM
3. 渲染畫面
4. 「某個時間點」，偵測到 state、props 被改變
5. 重新呼叫 function component
6. 在 virtual DOM 比較所有和原始 DOM 不一樣的地方
7. 真正更新 DOM
8. 渲染畫面
9. **如果在 5 中有修改 state 或 props，則所有修改後的值會延到 8 結束，再重回流程 4。**
10. 「某個時間點」，元件被移除

為了確保 6~8 的運作完全符合流程 4 中得到的 state 和 props 的值，所以`setState()`才會是非同步的。

也就是說因為第一次呼叫 function component 時，因為元素都還沒有建立到 DOM 上，所以你如果直接在 function component 定義域操作 DOM，會操作不到東西。

但是這樣我們到底要怎麼才能夠在操作到「更新 state 後」的 DOM 呢?

為了解決這個問題，React 在剛剛的流程中，插入了幾個階段:

1. 建立、呼叫 function component
2. 真正更新 DOM
3. **呼叫特殊函式(useEffect)**
4. 渲染畫面
5. 「某個時間點」，偵測到 state、props 被改變
6. 重新呼叫 function component
7. 在 virtual DOM 比較所有和原始 DOM 不一樣的地方
8. 真正更新 DOM
9. **呼叫特殊函式(useEffect)**
10. 渲染畫面
11. 如果在 6 中有修改 state 或 props，則所有修改後的值會延到 10 結束，再重回流程 5。
12. **呼叫特殊函式(useEffect)**
13. 「某個時間點」，元件被移除

## useEffect - 副作用控制

> side Effect，中文稱作副作用。在程式中指的是當前操作的對象會不會牽連到其他地方。

useEffect 也是一個函式、一個 React hook，他接收兩個參數，第一個參數是個函式，第二個參數是個 array。**useEffect 第二個 array 指的是「當哪些 state 和 props 被設定時」要觸發副作用。**

```javascript
import React, { useEffect } from 'react';
```

那我們要怎麼定義副作用的內容呢? **如果在剛剛的階段 3 和 9 與第二個 array 中的東西有關，React 會呼叫第一個參數函式**，我們可以把「state 和 props 被設定時要做的事情」定義在這個函式中。又因為副作用一般會包含初始化後的影響，所以任何 useEffect 都會在階段 3 被呼叫。

比較特別的是**第一個參數函式的「回傳值」也是一個函式，這個回傳函式只會在上述的階段 12 呼叫**。

```javascript
useEffect(() => {
    /* 建立 and 更新元件的副作用區 */
    return () => {
        /* 移除元件的副作用區 */
    };
}, []); /* 用來限制副作用要以哪些state和props作為觸發條件的array */
```

又因為第二個參數是在限制哪些 state 和 props 會觸發副作用，所以**如果你給了一個空 array，就代表只有在第一次更新 DOM 後(階段 3)會觸發副作用**。後面元件更新都不會觸發。

相反的，如果你第二個參數省略不給，React 會認為這代表這個副作用不需要被限制，所以除了「第一次更新 DOM 後」，之後元件中每個 state 和 props 被改變時都會觸發這個副作用。

## 把前面的程式碼加入 useEffect，改成用 DOM api 操作元素吧!

這裡就不逐一講解了，對照一下前幾天的程式碼就會知道在幹嘛。基本上就是設定當`isOpen`被改變時，我們要做什麼事情。

-   src/component/Menu.js

```jsx
// 引入useEffect
import React, { useState, useEffect } from 'react';

/* 省略上半 */

function Menu({ title, children }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.getElementsByClassName('menu-btn')[0].textContent = '^';
            document.getElementsByClassName('menu')[0].style.display = 'block';
        } else {
            document.getElementsByClassName('menu-btn')[0].textContent = 'V';
            document.getElementsByClassName('menu')[0].style.display = 'none';
        }
    }, [isOpen]);

    return (
        <div style={menuContainerStyle}>
            <p style={menuTitleStyle}>{title}</p>
            <button
                className="menu-btn"
                style={menuBtnStyle}
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
            >
                V
            </button>
            <ul className="menu">{children}</ul>
        </div>
    );
}

export default Menu;
```

## useEffect 的應用

useEffect 一般會在以下情景使用

-   操作 DOM、動畫
    > 上面已經解釋了。
-   addEventListenser、removeEventListenser
    > 為了避免重複監聽，所以只在建立元件後(階段 3)add，並在移除元件前(階段 12)remove。
-   setInterval、removeInterval
    > 為了避免重複 Interval，所以只在建立元件後(階段 3)add，並在移除元件前(階段 12)remove。
-   向後端呼叫 api
    > 因為通常只會呼叫一次，所以最常在建立元件的時候呼叫

## 使用 useEffect 要注意的事情

-   React 會希望 useEffect 的第一個參數中有使用到的 state 和 props 都有在第二個 array 中，明確指出副作用與誰有關。如果沒加，React 會跳 warning。
-   useEffect 為**非同步**的，React 不會等它做完才去渲染畫面。(主要是向後端呼叫 api 時要注意)。
-   「向後端呼叫 api」這件事情，官方希望未來某天改用 Suspense 這個 API 來做，詳請情參考[官方說明](https://zh-hant.reactjs.org/docs/concurrent-mode-suspense.html)。

## 更詳細的生命週期

useEffect 的前身是 class component 的生命週期。class component 的生命週期有更多可以控制效能的函數，不過一般也只會用到「建立後」、「更新後」、「移除前」。有興趣的可以參考我去年的參賽文章，或是[這個網站](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)。
![](https://i.imgur.com/cZ62PNz.png)
