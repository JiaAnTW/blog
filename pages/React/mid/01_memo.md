---
path: '/react/memo/'
date: 1000-03-01T17:12:33.962Z
title: 'memo'
category: 'react'
subCategory: 'React進階'
---

React 的 function component 在每次重新渲染時都會呼叫整個 Component 函式的定義域。有的時候我們的元件是根據 state 或 props 的資料加工製成的，這個時候還是要放在函式定義域內，這個時候該怎麼辦呢?

> 換句話說，我們現在可能需要一個「會幫我們檢查需不需要改變子元件」的中介層。

## HOC(High Order Component)

High Order Component 並不是一個元件的類別，它是一種特別的設計觀念:

**_「 用來加工 Component 的 function 」_**

意思是說，這類的函式的作用就是讓你把 Component 丟進去給它，它會幫你加工成一個新的 Component。

```javascript
const ComponentNew = HOCFunction(ComponentOld);
```

## React.memo

`memo`就是 React 提供的「會幫我們檢查元件需不需要重新渲染」的中介層的一個 HOC。

**被`memo`產生出的新元件會記憶住上一次元件的 props 值，當父元件被重新渲染，子元件沒有變動、但父元件又想要渲染它時，`memo`會去比較該子元件的 props 有沒有和前一次記憶的結果不同，如果有才重新渲染該子元件。**

現在，讓我們從 React 函式庫中引入`memo`。

-   src/component/MenuItem.js

```jsx
import React, { memo } from 'react';
```

並在檔案的最後，讓`export`出去的 Component 用`memo()`包起來

```jsx
import React, { memo } from 'react';

const menuItemStyle = {
    marginBottom: '7px',
    paddingLeft: '26px',
    listStyle: 'none',
};

function MenuItem(props) {
    return <li style={menuItemStyle}>{props.text}</li>;
}

export default memo(MenuItem);
```

現在我們再次用 React-dev-tool 去檢查我們的製作的元件:

![](https://i.imgur.com/ULE7pBo.gif)

![](https://i.imgur.com/7DCmoEX.png)

就會發現 MenuItem 的確沒有被渲染了。
