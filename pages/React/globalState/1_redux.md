---
path: '/react/redux/'
date: 1000-02-02T17:12:33.962Z
title: 'Redux'
category: 'react'
subCategory: 'React狀態管理'
---

當專案中的階層變複雜，state 和 props 變的很多，資料在多層 component 之間的傳遞也越來越多。產生了一堆純粹用來傳遞用的 props 和父 component。

> 工程師心想: 「有沒有一個全局的 state 和 setState 可以讓所有的元件共同操作呢?」
>
> 於是 Global State 的概念就誕生了。
>
> Global State 的概念就像是住宅大廈的公共設施，它不單獨屬於任何一個人，也能夠被任何人取用。

在[【Day.17】React 入門 - 利用 useContext 進行多層 component 溝通](https://ithelp.ithome.com.tw/articles/10248080)中，我們提及了 React 本身提供的狀態管理 API。但是我們也在後續的文章中講到了 Context API 本身並不是設計拿來做大型專案的狀態管理，因而存在麻煩的效能問題。

現在，就讓我們來認識最被廣為使用的狀態管理套件 - Redux。

## Redux 的由來

Redux 在 2015 年誕生。他不只是一個普通的全局 state 和 setState 工具而已，Redux 受到了 Facebook 提出的設計概念 Flux 啟發。有關 Flux 誕生的原因，我們在[【Day.27】React 進階 - 用 useReducer 定義 state 的更動原則](https://ithelp.ithome.com.tw/articles/10252408) 有說明。

> 總之，我們不應該讓別人能夠隨意修改 state，而是要預先定義好修改的規則，並讓其他開發者透過這些規則來操作。

同時，我們也說過在 Flux 觀念下，我們操作 state 的過程大概變成像這樣:

1. 管理者預先定義好有哪些規則(action)可以使用
2. 管理者預先定義好規則(action)對應到的邏輯運算(store)是什麼。
3. 操作者透過一個溝通用的函式(dispatch)，把他選擇的規則(action)和需要的參數(payload)丟給管理者
4. 流程/資料透過管理者規定好的方式更新

![](https://i.imgur.com/eTSByPQ.png)

上圖截自[Facebook 對於 flux 的說明影片](https://facebook.github.io/flux/docs/in-depth-overview)

## Redux 的運作流程

Redux 基於上述 Flux 的架構外，又做了一些補充和修改

1. 管理者預先定義好有哪些 state 可以使用，並採用 Single source，讓所有人拿到的 state 是一樣、共用的。
1. 管理者預先定義好有哪些修改規則(action)可以使用
1. 管理者預先定義好規則(action)對應到的邏輯運算(reducer)是什麼。
1. Redux 把所有 state 和對應的 reducer 包成一起，稱為 store
1. 透過一個 Provider 把 store 提供給專案中所有的元件

而操作者可以有兩種操作選擇:

1. 操作者可以透過一個**selector**，從 store 裡面取出想要的 state
2. 操作者可以透過一個**溝通用的函式(dispatch)**，把他選擇的規則(**action**)和需要的參數(payload)丟給管理者

依據上述流程，我們就能在任何地方取得 state，同時 state 也會透過管理者規定好的方式更新。

![](https://redux.js.org/assets/images/ReduxDataFlowDiagram-49fa8c3968371d9ef6f2a1486bd40a26.gif)
上圖引用自[Redux 官方文件](https://redux.js.org/tutorials/essentials/part-1-overview-concepts)

## Redux 使用

### 1. 安裝

首先，請先打開 terminal，輸入

```bash
npm install --save redux react-redux
```

Redux 和專為 React 打造的 react-redux 就會被安裝。

### 2. 設定 action 和定義 reducer

請在 src 底下新增 model 資料夾，並在裡面建立`reducer.js`
![](https://i.imgur.com/Czj92J1.png)

和`useReducer`一樣，當操作者呼叫 dispatch 後，Redux 會呼叫 Reducer 函式。Reducer 函式的語法是:

-   接收兩個參數
    -   第一個是 state 之前的值
    -   第二個則是操作者傳入 dispatch 函式的參數。
-   Reducer 必須要有一個回傳值，該值會變成 state 新的值。

請注意第一次執行的時候，reducer 的第一個參數(state)如果有給 default value，該 default value 就會變成 state 的初始值。

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
        case 'CLEAN_ITEM': {
            return { menuItemData: [] };
        }
        default:
            return state;
    }
};

export { itemReducer };
```

而雖然我們這裡是直接把 action 字串定義在 reducer 中，但比較好的方式應該是讓 action 字串也用變數來管理，並用該變數來判斷 action:

```javascript
const ADD_ITEM = 'ADD_ITEM';
const CLEAN_ITEM = 'CLEAN_ITEM';
```

### 3. 用 store 包覆 action 和 reducer

在 src/model 底下新增`store.js`
![](https://i.imgur.com/wW93r96.png)

要創立 store 的話，必須要使用 redux 提供的 API`createStore`

```javascript
import { createStore } from 'redux';
```

接著引入剛剛定義好的 reducer，丟給 createStore 就能產生 store 了

-   src/model/store.js

```javascript
import { createStore } from 'redux';
import { itemReducer } from './reducer.js';

const itemStore = createStore(itemReducer);

export { itemStore };
```

> `createStore`還可以吃一些 middleware 參數，幫 redux 多加一些功能，下一篇我們會提。

如果你有多個 reducer 要包起來，可以使用`combineReducers`這個 API

```javascript
import { createStore } from 'redux';
import { itemReducer, otherReducer } from './reducer.js';

const store = createStore(combineReducers(itemReducer, otherReducer));

export { itemStore };
```

### 4. 使用 Provider 包覆所有元件

Provider 是 react-redux 提供的特殊 React 元件，被`<Provider></Provider>`包住的元件都能恣意取用 store 裡面的 state。它的語法是

```jsx
<Provider store={store}></Provider>
```

現在，我們回到所有 React 程式的起點，引入`Provider`和剛剛建立的`itemStore`，用它包住所有程式。

-   src/index.js

```jsx
import { Provider } from 'react-redux';
import { store } from './model/store.js';

root.render(
    <Provider store={store}>
        <App />
    </Provider>
);
```

> 我個人會習慣把 Provider 放在 App 內的最外層，但這裡我覺得這樣示意對新手比較好理解。

接著就能在裡面的元件取用 state 了。但**在 function component 使用 Redux 的方式會比較特別，必須要使用 Redux 提供的 hook**。

## 使用 useSelector 取得 state

React-Redux 提供了一個 hook`useSelector`，能讓我們在 React function component 中選取想要從 Redux 取得的 state。

```javascript
import { useSelector } from 'react-redux';
```

useSelector 本身需要一個參數，此參數為函式，定義了你要如何從所有 state 中挑選你需要的 state。

例如，由於剛剛我們定義的 state 結構為:

```javascript
{
    menuItemData: [
        "Like的發問",
        "Like的回答",
        "Like的文章",
        "Like的留言"
    ],
};
```

useSelector 會把所有的 state 丟入我們定義的函式參數中，我們取得 menuItemData 的方式就是從參數函式把它單獨取出並回傳:

```javascript
const menuItemData = useSelector(state => state.menuItemData);
```

`menuItemData`變數就會是我們需要的 state。

## 使用 useDispatch 取得 dispatch

React-Redux 提供的另一個 hook`useDispatch`，能讓我們在 React function component 中呼叫`dispatch`函式。

```javascript
import { useDispatch } from 'react-redux';
```

使用上很簡單很單純，先把這個函式取出來:

```javascript
const dispatch = useDispatch();
```

然後想要更動 state 時直接呼叫它就可以。**呼叫 dispatch 時記得要傳「想要選擇的更動規則、想要傳的參數」**。 詳細你可以回頭去看剛剛的 reducer 是怎麼定義的

-   新增 item

```javascript
dispatch({
    type: 'ADD_ITEM',
    payload: { itemNew: '測試資料' },
});
```

-   清空 item

```javascript
dispatch({ type: 'CLEAN_ITEM' });
```

## 加入 Redux 到我們的程式碼吧

store、reducer 那些的實作跟上面的範例完全一樣，我就不再寫一次了。這裡我只有實作把先前的 menuItemData 搬到 Redux 後，如何在 MenuPage 引入的作法，你可以自己試試看如何把`isOpen`搬進 Redux。

-   src/page/MenuPage.js

```jsx
import React, { useReducer, useMemo, useEffect } from 'react';

import MenuItem from '../component/MenuItem';
import Menu from '../component/Menu';
import { OpenContext } from '../context/ControlContext';

import { useSelector, useDispatch } from 'react-redux';

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
        </OpenContext.Provider>
    );
};

export default MenuPage;
```

## Redux 家族

因為 Redux 本身還不夠用，近年來又衍伸出了各式各樣的 Redux 版本和 middleware，例如:

-   Redux-Actions
    > 把 redux 的流程封裝簡化
-   Redux-Saga
    > 著重於 redux 的非同步處理
-   Redux-Thunk
    > 把 redux 的非同步處理再更簡化
-   Redux-Observable
    > 以 functional-programming 的方式處理資料流

下一篇我們就會來聊如何使用 Redux-Thunk。
