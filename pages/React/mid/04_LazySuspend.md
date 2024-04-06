---
path: '/react/Lazy_Suspend/'
date: 1000-03-03T17:12:33.962Z
title: 'Lazy與Suspend'
category: 'react'
subCategory: 'React進階'
---

在前面我們說，過去使用原生 JS 編寫有規模的專案時，因為要模組化，檔案越分越多，最後零散在各處。為了解決這個問題，後來**工程師使用打包工具，把所有的 JS 檔綁成一個`bundle.js`，在第一次執行網頁時就載入所有程式碼**。

但是這也造成了一個問題。

**_「當專案規模過大時，`bundle.js`會很大，導致第一次載入網頁的時間太久。」_**

這個時候我們就會希望把那些「使用者不會很常進去的頁面」從`bundle.js`拿出來。但是要怎麼做呢? 難道還要去`webpack.config.js`慢慢設定嗎?

## Code-Splitting by React.lazy

在先前，我們要引入 component 檔案時，是使用:

```javascript
import InputForm from '../component/InputForm';
```

而 React 提供了一個特殊的引入元件方法`lazy()`。React 會把用`lazy()`引入的元件**在打包時拆成一個獨立的 js 檔案，並且只有在第一次要渲染該元件的時候，才會引入該 js 檔**。它的用法是

```jsx
const 元件 = React.lazy(() => import('檔案相對路徑'));
```

但是元件載入要一段時間，我們要怎麼處理 lazy 元件還沒被載入的狀況呢?

## Suspense

Suspense 是 React 提供的特殊元件，語法如下:

```jsx
<Suspense fallback={讀取元件}>目標載入元件</Suspense>
```

當「目標載入元件」還沒載入完成時，React 會顯示`fallback`這個 props 綁定的「讀取元件」，一直到「目標載入元件」載入完成後再切換過來。

> 嗯?這樣我們是不是可以把它拿來處理 ajax 的狀況呢?

的確，**React 希望在未來的某一天全面讓大家捨棄在`useEffect`呼叫 http request，並且全面改成使用`Suspense`。但目前相關的 API 還在實驗開發階段**，詳請可以參考並關注[官方文件](https://zh-hant.reactjs.org/docs/concurrent-mode-suspense.html)。

## 加入 lazy 和 Suspense 到我們的程式碼中

我們來試著在 src/page/FormPage.js 使用 lazy 引入`<InputForm />`，並觀察程式碼的狀態:

### 1. 請先引入 lazy 和 Suspense

```jsx
import React, { lazy, Suspense } from 'react';
```

### 2. 用 lazy 引入 InputForm

```jsx
const InputForm = lazy(() => import('../component/InputForm'));
```

### 3. 用 Suspense 使用 lazy InputForm 元件

```jsx
import React, { lazy, Suspense } from 'react';

const InputForm = lazy(() => import('../component/InputForm'));

const FormPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InputForm />
        </Suspense>
    );
};

export default FormPage;
```

### 4. 執行`npm run build`

此時你會發現，build 資料夾出現了一個新的檔案
![](https://i.imgur.com/pk5ISs6.png)

我們去搜尋本來的`bundle.js`，會發現裡面沒有 InputForm 裡面的「提交」按鈕了
![](https://i.imgur.com/9vk7Orh.png)

而搜尋新的`1.bundle.js`，會發現 InputForm 裡面的「提交」按鈕在它裡面。
![](https://i.imgur.com/zD7aU36.png)

最後我們查看執行結果，會發現在第一次切換到 FormPage 的時候，React 去 get 了這一隻新的`1.bundle.js`。
![](https://i.imgur.com/IzeiZVd.gif)

這樣我們就實現了動態延遲載入元件。
