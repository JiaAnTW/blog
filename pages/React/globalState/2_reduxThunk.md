---
path: '/react/redux/thunk/'
date: 1000-02-03T17:12:33.962Z
title: 'Redux thunk'
category: 'react'
subCategory: 'React狀態管理'
---

很多時候，我們的 state 必須要透過 HTTP Request 從後端取得。然而發送 Request 常用的 fetch 或是 axios 是非同步的。雖然我們可以透過以下方式把資料送進去 Redux:

```javascript
fetch('URL', {
    method: 'GET',
})
    .then(res => res.json())
    .then(data => {
        dispatch({ type: 'TYPE', payload: { data } });
    })
    .catch(e => {
        /*發生錯誤時要做的事情*/
    });
```

但最理想的狀況還是讓這個 fetch 的過程被模組、抽象化，也就是**不應該還要讓 UI 繪製程式還要自己去 call fectch API。我們希望 UI 繪製程式只需要呼叫一個函式，從 fetch 到更新 Redux 的這串過程都會完成**。

> 不論是在 Flux，還是傳統的 MVC、MVP、MVVM 觀念下，都希望把資料處理的程式抽離 UI 繪製的程式，而不是讓兩者混雜在一起

講白一點，我們的流程本來是:

1. 操作者呼叫 dispatch
2. Redux 判斷 action
3. Redux 根據 action 對 state 做出對應修改

現在我們希望流程改成這樣:

1. 操作者呼叫 dispatch
2. **一個遇到非同步事件，就會等到非同步事件結束才再次呼叫 dispatch、傳遞 action 的模組程式**
3. Redux 判斷 action
4. Redux 根據 action 對 state 做出對應修改

**一般會把 2 這種在本來行為之間(1 和 3)的加工過程稱為 middleware(中介層)。**

## Redux-Thunk

**Redux-Thunk 就是一個簡化 Redux 處理非同步事件的中介層套件**。它的運作流程是這樣的，基本上就跟我們剛剛說的差不多:

![](https://miro.medium.com/max/875/1*QERgzuzphdQz4e0fNs1CFQ.gif)
上圖[來源](http://slides.com/jenyaterpil/redux-from-twitter-hype-to-production)。

## Redux middleware 與 Redux-Thunk 的使用

接下來我們會實際操作一次 Redux-Thunk，試著把 MenuItem 的資料改成從後端取得。資料會用[我放在自己 github 的台灣的縣市列表 JSON 檔](https://raw.githubusercontent.com/JiaAnTW/mask/master/dist.json)。

```json
{
    "cityList":[
        "臺北市",
        "基隆市",
        "新北市",
        (略......)
    ]
}
```

### 1. 安裝

請打開 terminal，輸入:

```bash
npm install redux-thunk --save
```

### 2. 建立 src/model/action.js

一般會在這裡以變數統一管理 action 字串。不過這裡我們先拿來放等等要定義的 fetch
![](https://i.imgur.com/yjrM2OK.png)

在 src/model/action.js 中，定義一個函式，把 item 改成 fetch 函式得到的資料。**Redux-Thunk 會把 dispatch 函式當成函式的參數傳入。我們則要在非同步事件結束後再次呼叫 dispatch，給予對應的 action 和 payload**。

因為現在我們的 reducer 還沒有這種一次修改所有資料的 action，我們先加一個`SET_ITEM`，等等再加回 reducer 中。

-   src/model/action.js

```javascript
export const fetchCityItem = () => {
    return dispatch => {
        fetch('https://raw.githubusercontent.com/JiaAnTW/mask/master/dist.json', {
            method: 'GET',
        })
            .then(res => res.json())
            .then(data => {
                dispatch({
                    type: 'SET_ITEM',
                    payload: { itemNewArr: data['cityList'] },
                });
            })
            .catch(e => {
                console.log(e);
            });
    };
};
```

### 3. 加入 Redux-Thunk 到 Redux 中

Redux 提供了`applyMiddleware`這個函式來讓我們安裝 middleware 到 Redux 中。用法是將`applyMiddleware(中介層1,中介層2,...)`放在 createStore 的第二個參數中。

現在，請引入 Redux-Thunk 的`thunk`和 Redux 的`applyMiddleware`，並加入我們的 store 中:

-   src/model/store.js

```javascript
import { createStore, applyMiddleware } from 'redux';
import { itemReducer } from './reducer.js';
import thunk from 'redux-thunk';

const itemStore = createStore(itemReducer, applyMiddleware(thunk));

export { itemStore };
```

這樣使用 Redux-thunk 的架構就完成了。

### 4. 補回 reducer 處理 SET_ITEM 的 case

-   src/model/reducer.js

```javascript
const initState = {
    menuItemData: ['Like的發問', 'Like的回答', 'Like的文章', 'Like的留言'],
};

const itemReducer = (state = initState, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const menuItemCopy = state.menuItemData.slice();
            return { menuItemData: [action.payload.itemNew].concat(menuItemCopy) };
        }
        case 'SET_ITEM': {
            return { menuItemData: action.payload.itemNewArr };
        }
        case 'CLEAN_ITEM': {
            return { menuItemData: [] };
        }
        default:
            return state;
    }
};

export { itemReducer };
```

### 5. 在需要的地方，以 dispatch 呼叫 fetchCityItem

觸發 Redux-Thunk 的方式，是在需要的地方呼叫

```javascript
dispatch(剛剛定義的非同步函式());
```

也就是你可以在 src/page/MenuPage 新增一個按鈕:

```jsx
<button
    onClick={() => {
        dispatch(fetchCityItem());
    }}
>
    抓取並修改menuItem
</button>
```

按下去之後，Redux 就會**根據我們剛剛定義的內容，先執行發送 Http Request，等資料回來，才執行 dispatch**，把 action 和剛剛放入 payload 的縣市資料丟到 reducer 去更新。

-   src/page/MenuPage.js

```javascript
import React, { useState, useReducer, useMemo, useEffect } from 'react';
import useMouseY from '../util/useMouseY';

import MenuItem from '../component/MenuItem';
import Menu from '../component/Menu';
import { OpenContext } from '../context/ControlContext';

import { useSelector, useDispatch } from 'react-redux';
import { fetchCityItem } from '../model/action';

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

    const menuItemData = useSelector(state => state.menuItemData);
    const dispatch = useDispatch();

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
                    dispatch({
                        type: 'ADD_ITEM',
                        payload: { itemNew: '測試資料' },
                    });
                }}
            >
                更改第一個menuItem
            </button>
            <button
                onClick={() => {
                    dispatch(fetchCityItem());
                }}
            >
                抓取並修改menuItem
            </button>
        </OpenContext.Provider>
    );
};

export default MenuPage;
```

![](https://i.imgur.com/eVJzE1E.gif)

## 參考資料

[Thunks in Redux: The Basics](https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60)
