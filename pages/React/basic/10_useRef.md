---
path: '/react/useRef/'
date: 1000-01-11T17:12:33.962Z
title: '非控制組件與useRef'
category: 'react'
subCategory: 'React基礎'
---

reference，中文翻譯是「參考」。聽起來好像有點奇怪，但他在程式中一般是指「變數指向的記憶體位置上對應到的值」。

> 超級複雜的啦。

簡單來說可以想像成是房子跟地址的關係。記憶體就像是地址，變數就像是房子，「沿著地址找到房子」這個過程就是 reference。房子本身可能會有很多內部變動，但不管怎麼變，房子所在的地址是不變的。

> 在 Javascript 變數中，物件和 Array 一般會是以 reference 來傳遞，其他的變數通常會複製一份後，把複製出的那一份拿來傳遞。

更正確的原理可以參考 Huli 大大的文章:

-   [深入探討 JavaScript 中的參數傳遞：call by value 還是 reference？](https://blog.huli.tw/2018/06/23/javascript-call-by-value-or-reference/)

## reference 和非控制組件的關係

當程式大起來，網頁中的元素很多，當**想要用原始 DOM api 去操作元素**時，卻還要用`document.querySelector`或是`document.getElementById`去整個網頁找，就顯得很不直覺。

**_能不能直接在 JSX 中取得元素的 reference，直接操作元素本身呢 ?_**

也就是說，理想上我們希望做這種事情

> 用一個變數去綁在元素的 props 上，然後就能讓該變數等於綁定元素的 reference

大概是這樣(實際上當然不能直接這樣做):

```jsx
import React, { useRef } from 'react';

const InputForm = () => {
    let accountRef = {};
    let passwordRef = {};

    let refArr = [accountRef, passwordRef];

    return (
        <>
            <input type="text" name="account" ref={accountRef} />
            <input type="text" name="password" ref={passwordRef} />
            <button
                onClick={() => {
                    refArr.forEach(item => {
                        console.log(item.name + ' is ' + item.value);
                    });
                }}
            >
                提交
            </button>
        </>
    );
};
export default InputForm;
```

過去，React 在 class component 中的確有提供`React.createRef()`這個 API 來創造一個**可以讓你綁在`ref`這個 props 上**的 object 變數。讓你能直接拿到該元素本身、直接用原始 DOM 方式操作元素。

但是這個 API 如果直接拿到 function component 來用會有問題。原因是`React.createRef();`通常只會在 class component 的建構子呼叫一次，這樣就能確保這個創造出來的 reference 指向的是同一個地址。然而**function component 沒有建構子，每次都一定會重新呼叫 function component 的定義域，這樣等於每次都會重新創造一次這個 object 變數，指向的 reference 也會不一樣了**。

為了解決這個問題，React 提供了另一個 React hook - `useRef`。

## useRef

`useRef`是一個函式，跟`useState`一樣接收一個參數，作為變數初始值。差別是`useRef`回傳的是一個物件，裡面只有一個屬性`current`:

```javascript
const data = useRef('初始資料');
console.log(data);

// { current: "初始資料" }
```

**React 會確保`useRef`回傳出來的這個物件不會因為 React 元件更新而被重新創造**。也就是說在你初始化過後，這個物件會始終指向同一個 reference。(除非你重新 assign current 裡面的值，那 current 指向的東西就會不一樣)

也就是說剛剛的「理想」只要引入`useRef`後，只要先創造要綁在 input 的 props`ref`上的變數，綁定之後，`變數名稱.current`就會是該 input 元素本身，我們就能用直覺的方式操作 DOM 元素了!

```jsx
// 引入useRef
import React, { useRef } from 'react';

const InputForm = () => {
    // 建立用來綁定input的變數
    const accountRef = useRef(undefined);
    const passwordRef = useRef(undefined);

    // 為了方便操作，建立一個array來管理這些ref
    const refArr = useRef([accountRef, passwordRef]);

    return (
        // 將剛剛創立的變數綁在對應的位置
        <>
            <input type="text" name="account" ref={accountRef} />
            <input type="text" name="password" ref={passwordRef} />
            <button
                onClick={() => {
                    refArr.current.forEach(item => {
                        console.log(item.current.name + ' is ' + item.current.value);
                    });
                }}
            >
                提交
            </button>
        </>
    );
};
export default InputForm;
```

![](https://i.imgur.com/fZHqOni.gif)

## useRef 的應用

由於 useRef「不會因為 update 元件而被改變 reference」的特性，讓其常被用在這些地方:

-   以原生方式操作 DOM 元素
    > 上面講過了
-   counter 變數
    > 如果用一般變數來當 counter，元件被 update 的時候又會被重新初始化，就無法達到計數的效果。
-   setTimeout、setInterval、removeTimeout、removeInterval

    > 因為要 reference 一樣才能正常移除函式，但這個也可以用 useCallback 做(後面會講這個是啥)。雖然沒有特別規定，不過有人會認為 useCallback 在閱讀時會更直覺聯想到是函式。

-   **避免 useEffect 在建立元素時被執行**

```jsx
const mounted = useRef();
useEffect(() => {
    if (mounted.current === false) {
        mounted.current = true;
        /* 下面是 componentDidMount*/

        /* 上面是 componentDidMount */
    } else {
        /* 下面是componentDidUpdate */
        /* 上面是componentDidUpdate */
    }

    return () => {
        /* 下面是 componentWillUnmount */
        /* 上面是 componentWillUnmount */
    };
}, [dependencies參數]);
```
