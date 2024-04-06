---
path: '/react/useState/'
date: 1000-01-07T17:12:33.962Z
title: 'useState'
category: 'react'
subCategory: 'React基礎'
---

# useState

###### tags: `第12屆鐵人賽`

還記得在 Day.03 我們實作的觀察者模式嗎? 由於這種「當某個 JS 變數改變時，有很多 DOM 元素需要被改變」的功能很常被使用，React 將其拉了出來做成獨立的 API，稱為 state。

## 使用 state 會發生什麼事呢?

你可以把**state 想像成是一種特別的變數**。當 state 被改變時，React 會去檢查 Virtual DOM 中與所有其相關的地方，並**根據 state 改變後的結果去重新渲染 DOM**。

另外，**當 props 被改變時，React 也會做一樣的事情**。也就是在 React 元件中，我們是分別以外部的 props 和內部的 state 來控制元件的渲染。

## function component 的 state 製造機 - useState

過去，由於 ES6 的 class 有提供繼承功能，我們可以藉由繼承 React 寫好的 class 來使用 state。但是 function component 就不行。

在 React hook 推出後，我們可以藉由引入 React hook 函式庫來使用 state。React hook 會把 React 的相關特性拉到一個集中的邏輯處理器，並**依照呼叫的順序執行**。

useState 就是在 function component 中使用 state 的 API。

## useState 用法

我們可以從 React 函式庫中取得 useState。

```javascript
import React, { useState } from 'react';
```

useState 是一個函式，他接收一個參數，這個參數會是 state 的初始值。

```javascript
useState(false);
```

還記得我們在 Day.03 實作的程式碼中，**為了要讓變數被改變後可以讓程式去改變其他對應的元素，而限定只能用`setIsOpen()`來改變`isOpen`嗎**?

**_useState 也是一樣的。_**

useState 這個函式的回傳值是一個 Array。Array 的第一個值是 state 變數，第二個值就是「用來改變 state」的函式。

```javascript
console.log(useState(false));
```

![](https://i.imgur.com/5hCPF2Y.png)

但是難道我們之後在 React 元件中使用時，都要用`arr[0]`、`arr[1]`這種方式來呼叫嗎?

**_這也太不直覺了吧。_**

這個時候就能運用 Javascript 中的「解構賦值」語法。

## 把 state 引入前面的程式碼中吧!

接下來的程式碼都在 `src/component/Menu.js`中實作。

### 1. 引入 useState

```javascript
// 這裡其實也是解構賦值歐
import React, { useState } from 'react';
```

### 2. 在 Menu 中接收 useState 的回傳值

請注意一般會使用`set變數名稱`來做為第二個回傳值的函數名稱(用來設定 state 的函式)。

```jsx
function Menu(props){
    const [isOpen,setIsOpen] = useState(false);
    return (
        <div style={menuContainerStyle}>
```

### 3. 把`setIsOpen`綁在 button 上，讓`isOpen`按完變成`!isOpen`

把函式綁在 jsx 元素的方式有兩種:

-   `{ ()=>{函式定義} }`
-   `{ 函式名稱 }`，**不是`{ 函式名稱() }`**。

第一種實際上就是在創造一個新的函式，缺點是每次渲染時都會重新創造這個函式，優點是可讀性相對高(因為不會需要去找綁的函式到底是啥、在哪)。

> 新手建議先以第一種為主。因為第二種方式如果在 function component 中直接定義函式、使用，可能會有效能問題，我們會在後面講到 useCallback 的時候再來討論。

```jsx
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
                V
            </button>
            <ul>{props.children}</ul>
        </div>
    );
}
```

### 4. 用 JSX 讓其他元素根據`isOpen`變成對應的樣子

-   按鈕要對應`isOpen`顯示「^」「V」
-   要對應`isOpen`決定要不要顯示`<ul>`

```jsx
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

這樣就完全把前五天的程式碼移植過來了
![](https://i.imgur.com/V9VbcMY.gif)
所有的程式碼:

-   src/component/Menu.js

```jsx
import React, { useState } from 'react';

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

export default Menu;
```

## React hook 的其他使用規定

-   只能在 function component 和 custom hook 中使用。
    > 意思是你不能在 class component 或是一般 JS 檔用。至於 custom hook 我們後面會提到。
-   只能在 function component 的最外層 scope 呼叫`useXXX`( 也就是不能在迴圈、if-else、在 function scope 中宣告的 function 被定義使用。)

第二點是因為當**每次元件重新渲染時，React 都會呼叫 function component 的整個定義函式**。而前面提過，React hook 是用順序來記憶你使用的 React hook 對應的是在邏輯處理中心的哪個地方。如果今天你寫了:

```javascript
const [isOpen,setIsOpen] = useState(true);
if(isOpen)
    const [data,setData] = useState(123);
const [str,setStr] = useState("");
```

假設某次`isOpen`變成`false`，因為順序 2 的`const [data,setData] = useState(123)`沒有被呼叫到，在那一次渲染時`const [str,setStr] = useState("")`在元件中的順序會從 3 變成 2，React 就會以為`const [str,setStr]`要接收的是`const [data,setData]`要接收到的值。導致程式錯誤。

## 解構賦值與 props

**_還記得我們之前說 props 是一個物件嗎?_**

解構賦值除了可以用在取得`useState`的回傳值，目前也被提倡對 props 使用。其好處除了**可以讓你的同事知道到底傳了什麼東西進 props**外，未來當你導入 Typescript 到 React 中時，也能更快速的知道要怎麼定義 interface。

剛剛的程式碼用解構賦值來接收 props 就會變這樣:

```jsx
function Menu({ title, children }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={menuContainerStyle}>
            <p style={menuTitleStyle}>{title}</p>
            <button
                style={menuBtnStyle}
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
            >
                {isOpen ? '^' : 'V'}
            </button>
            {isOpen && <ul>{children}</ul>}
        </div>
    );
}
```

## setState 是非同步的

如果你試了一下，會發現我們在呼叫`setState`函式時，`state`並不會被改變。但是有的時候我們就是希望在`state`被改變後做一些事情，這個時候要怎麼處理呢?

我們會在下一篇來講解如何解決這個問題。
