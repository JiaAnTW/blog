---
path: '/react/useCallback/'
date: 1000-03-02T17:12:33.962Z
title: 'useCallback'
category: 'react'
subCategory: 'React進階'
---

Javascript 是一個比較特殊的語言，在函式這類物件型態時，是使用 reference 做為比較的基準，而不是定義的內容。
因此，當我們在父元件定義函式、傳遞給 memo 後的子元件，在父元件被重新渲染時，即使函式的定義內容不變，但因為「建立函式」的這個過程被重新執行，函式 reference 被改變，memo 在比較 props 的階段會認定該函式被更新，所以 memo 子元件仍然會產生不必要的渲染。

### 當我們有需要綁定和 state、props 或 React hook 有關的東西時候。

舉例來說，我們前面有提過可以用 useRef 當作 counter，這個時候如果我們希望透過 MenuItem 被點擊的時候，印出 counter 的值，就要這樣寫:

-   src/component/MenuPage.js

```jsx
import React, { useState, useRef } from 'react';

import MenuItem from '../component/MenuItem';
import Menu from '../component/Menu';
import { OpenContext } from '../context/ControlContext';

let menuItemWording = ['Like的發問', 'Like的回答', 'Like的文章', 'Like的留言'];

const MenuPage = () => {
    const [isOpen, setIsOpen] = useState(true);

    /* 定義counter */
    const renderCounter = useRef(0);
    renderCounter.current++;

    /* 定義列印函式 */
    const handleClick = () => {
        console.log('counter is ' + renderCounter.current);
    };

    /* 綁定函式到元素上 */
    let menuItemArr = menuItemWording.map(wording => {
        return <MenuItem text={wording} handleClick={handleClick} />;
    });

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

-   src/component/MenuItem.js

```jsx
import React, { memo, useContext } from 'react';
import { OpenContext } from '../context/ControlContext';

const menuItemStyle = {
    marginBottom: '7px',
    paddingLeft: '26px',
    listStyle: 'none',
};

function MenuItem(props) {
    //const isOpenUtil = useContext(OpenContext);
    //const func = isOpenUtil;

    /* 綁定handleClick */
    return (
        <li
            style={menuItemStyle}
            onClick={() => {
                props.handleClick();
            }}
        >
            {props.text}
        </li>
    );
}

export default memo(MenuItem);
```

理論上因為我們的 props 中 wording 沒有變，handleClick 也因為牽涉的變數使用了`useRef`，定義也沒有變。根據上一篇我們對於`memo`的解說，此時`memo`會幫助我們不重新渲染元件。

然而你打開 profiler，卻會看到以下結果:
![](https://i.imgur.com/mXl7Quv.png)

> 為什麼會這樣?

這是因為**memo 在比較 props 的時候，當遇到物件類別，會去比較它的 reference，而不是一一比對物件當中的屬性**。前面提過，當 function component 被重新渲染時會呼叫整個元件函式的定義域。由於函式也是物件的一種，這裡 MenuPage 的`handleClick`在重新渲染時也被重新宣告了一次，導致 reference 改變，MenuItem 的 memo 就會覺得 props 被改變了。

## useCallback

useCallback 就是能夠用來解決這件事情的 React hook。它很像是「專為函式定義用的 useRef」，可以幫我們確保函式在第二個參數相依 state/props 沒有被改變時不會被重新定義，也就是 reference 不變。

```javascript
const func = useCallback(定義函式, [相依變數]);
```

舉例來說，剛剛的 MenuPage 只要改成這樣，MenuItem 就不會被重新渲染:

```jsx
import React, { useState, useRef, useCallback } from 'react';

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

    let menuItemArr = menuItemWording.map(wording => (
        <MenuItem text={wording} handleClick={handleClick} />
    ));

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

**但是這樣`useCallback`和`useRef`的差別在哪裡呢?**

還記得剛剛介紹語法時的第二個參數「相依變數」嗎? **`useCallback`可以讓我們用這個第二個參數，來設定哪些東西被改變時，要去重新定義函式**。

以下面的例子來說，如果我們把 handleClick 改成印出`isOpen`的值:

```jsx
const handleClick = useRef(() => {
    console.log('isOpen is ' + isOpen);
});
```

你會發現上面這個函式**永遠只會印出`isOpen`在第一次渲染的初始值**。這是因為 isOpen 的值在定義函式時，原始值就被填進去了，之後由於我們沒有去特別更新 useRef 的 ref.current，所以定義始終沒有被改變。

這個時候改成使用 useCallback 就會像這樣:

```jsx
const handleClick = useCallback(() => {
    console.log('isOpen is ' + isOpen);
}, [isOpen]);
```

此時你就會發現函式印出來的值跟 isOpen 一樣了。不過也因為定義被改變了，這個時候 MenuItem 的重新渲染就不可避免。

## 使用 useCallback 也要注意定義中的 side Effect

和 useEffect 一樣，React 會希望**useCallback 中定義的內容只和第二個參數中有被定義的東西有關**。當你在 useCallback 中使用了 state、props、React hook 相關的東西而又沒有定義在第二個參數時，React 也會跳 warning。
