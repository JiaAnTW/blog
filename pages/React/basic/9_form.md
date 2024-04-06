---
path: '/react/form/'
date: 1000-01-10T17:12:33.962Z
title: '輸入元素與控制組件'
category: 'react'
subCategory: 'React基礎'
---

React 在輸入元素的處理上有一些比較特別的地方，先前我們已經使用過`onClick()`，這篇我們來一次講全部輸入元素。

## 事件處理

### onClick

之前都用過。總之輸入事件都是用原生 DOM API 傳入的 event 去處理。`event.target`是被點擊的對象，`event.target.value`則是被點擊的對象的 value。

```jsx
<button
    value={123}
    onClick={event => {
        console.log(event.target.value);
    }}
></button>
```

### onChange - input/text、textarea、select

每當輸入值一被改變，就會呼叫`onChange`裡的函式，剩下都跟 onClick 一樣。

```jsx
<select
    onChange={e => {
        console.log(e.target.value);
    }}
>
    <option value="123">123</option>
    <option value="456">456</option>
</select>
```

### onSubmit - form

```jsx
<form onSubmit={handleSubmit}>
    <input type="submit" value="Submit" />
</form>
```

## 初始值

在過去，我們如果要給輸入元素初始值，要用`value`。但在 React 的輸入元素中`value`有別的用途，那我們要怎麼給初始值呢?

### defaultValue

初始值改成了用`defaultValue`這個屬性。你可以用下面這個範例來測試:

```jsx
import React, { useState } from 'react';

const InputForm = () => {
    const [word, setWord] = useState('初始文字');
    return (
        <>
            <input
                type="text"
                defaultValue={word}
                onChange={e => {
                    setWord(e.target.value);
                }}
            />
            <div>word的值:{word}</div>
        </>
    );
};
export default InputForm;
```

## 用 state 綁定輸入元素 - 控制組件

那麼`value`被改成了什麼呢? 答案是「input 中目前的值」。舉例來說，如果你照剛剛一樣給 defaultValue，然後用`<input/>`來設定 word 這個 state:

```jsx
import React, { useState } from 'react';

const InputForm = () => {
    const [word, setWord] = useState('初始文字');
    return (
        <>
            <button
                onClick={e => {
                    setWord('');
                }}
            >
                清除word
            </button>
            <input
                type="text"
                defaultValue={word}
                onChange={e => {
                    setWord(e.target.value);
                }}
            />
            <div>word的值:{word}</div>
        </>
    );
};
export default InputForm;
```

你會發現當你按下第一個按鍵時，input 中的值並沒有跟隨著 word 而改變，這是因為 defaultValue 只和第一次渲染元素時有關。接著我們改把 word 綁在`value`上:

```jsx
import React, { useState } from 'react';

const InputForm = () => {
    const [word, setWord] = useState('初始文字');
    return (
        <>
            <button
                onClick={e => {
                    setWord('');
                }}
            ></button>
            <input
                type="text"
                value={word}
                onChange={e => {
                    setWord(e.target.value);
                }}
            />
            <div>word的值:{word}</div>
        </>
    );
};
export default InputForm;
```

此時 input 中的值就會始終跟隨著 word。這樣用 state 綁定輸入元素的方式我們稱為控制組件。

> 當你想用 Http Request 取得的值去設定 input 初始值時，你應該要使用 value 而不是 defaultValue。因為非同步特性，第一次渲染時你幾乎不可能拿到 Http Request 的 Response，所以 defaultValue 就不可能變成 Response data。

## 關閉輸入元素 - disabled

請注意因為當我們只寫名稱、不給 props 值時，React 會預設認定該 props 為`true`，所以以下兩者是一樣的:

```jsx
<input type="text" disabled />
```

```jsx
<input type="text" disabled={true} />
```

### selected - option

select 元素的初始選取選項可以透過`<option>`上的`selected`來控制

```jsx
<select
    onChange={e => {
        setSelect(e.target.value);
    }}
>
    <option value="123">123</option>
    <option selected={true} value="456">
        456
    </option>
</select>
```

### checked - input/radio

核取和選取的 input 都是用`check`這個 props 來控制是否被選取

```jsx
const [check, setCheck] = useState(false);
```

```jsx
<input type="radio" checked={check} value="123" onChange={(e)=>{setCheck(true)}} />123<br/>
<input type="radio" checked={!check} value="456" onChange={(e)=>{setCheck(false)}} />456
```

## 很多輸入元素的事件處理

當今天輸入的元素很多， 就可能變成元件中有一大堆的`setState`。這樣不僅可讀性差，處理起來也很麻煩。

除了第三方插件外，[React 官方推薦的做法](https://zh-hant.reactjs.org/docs/forms.html#handling-multiple-inputs)是給每個元素`name`屬性。把所有元素綁定單一函式，並在函式中以`event.target.name`來分流處理。

你會發現官方文件中 class component 的 state 是統一用`this.setState`設定，所以可以用[computed property name 語法](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Operators/Object_initializer#Computed_property_names)。但 funtion component 不行。

你可能會寫出類似這樣的架構:

```jsx
import React from 'react';

const handleMulInput = e => {
    if (e.target.name === 'account') {
        console.log('account is ' + e.target.value);
    } else if (e.target.name === 'password') {
        console.log('password is ' + e.target.value);
    }
};

const InputForm = () => {
    return (
        <div>
            <input type="text" name="account" onChange={handleMulInput} />
            <input type="text" name="password" onChange={handleMulInput} />
        </div>
    );
};
export default InputForm;
```

但這樣做是一個比較不好的作法，因為函式定義在非 React function component 內，這樣就不能使用 React hook 了。

**_那我們要把函式直接定義在 function component 內嗎? 怎麼樣取得元素內的值會比較好呢?_**

在接下來的這幾天，我們會依序提到 React 處理非控制組件的 api、以及 React 效能處理的討論。到時候再回來談要如何處理這個 case。
