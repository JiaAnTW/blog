---
path: '/react/setState/detail/'
date: 1000-01-09T17:12:33.962Z
title: 'setState的細節使用'
category: 'react'
subCategory: 'React基礎'
---

## Part.3 - setState 是同步還是非同步的?

### 在在 React 17 以前的 function component 中(useState, useReducer)

**在 function component 中的 React hook，透過 React 機制所呼叫的 setState 都是非同步**，也就是當呼叫 setState 的當下 state 並不會馬上被改變。可以試著執行、比較下列程式碼的執行結果

> 這裡的 React 機制指的是包含生命週期函數、SyntheticEvent handler 等 (如: 以 React.createElement 或 JSX 呈現的 html element 上的 onClick、onChange)，[詳細 SyntheticEvent 列表請參考官方文件](https://zh-hant.reactjs.org/docs/events.html)。

-   非同步版本 - 透過 SyntheticEvent handler 觸發 handleClick

```jsx
import { useState, useCallback } from 'react';

export default function Apple() {
    const [price, setPrice] = useState(0);

    // 透過JSX button的onClick觸發
    const handleClick = useCallback(e => {
        setPrice(Number(e.target.value) + 10);
        console.log(e.target.value);
    }, []);

    return (
        <div>
            <p> Apple is ${price}</p>
            <button id="price-control" value={price} onClick={handleClick}>
                Add Apple's price
            </button>
        </div>
    );
}
```

-   同步版本 - 透過原生 addEventListener callback function 觸發 handleClick，呼叫 setState 的當下 state 馬上會被改變

```jsx
import { useState, useEffect, useCallback } from 'react';

export default function Apple() {
    const [price, setPrice] = useState(0);

    // 透過原生event listener觸發
    const handleClick = useCallback(e => {
        // "e.target.value" is "price"
        setPrice(Number(e.target.value) + 10);
        console.log(e.target.value);
    }, []);

    useEffect(() => {
        document.getElementById('price-control').addEventListener('click', handleClick);
        return () => {
            document.getElementById('price-control').removeEventListener('click', handleClick);
        };
    }, [handleClick]);

    return (
        <div>
            <p> Apple is ${price}</p>
            <button id="price-control" value={price}>
                Add Apple's price
            </button>
        </div>
    );
}
```

### 在 React 17 以前的 class component 中（setState）

藉由上一篇，我們可以知道為了透過實作 batching 進行效能優化，**透過 React 機制所呼叫的 setState 都是非同步的**，也就是當呼叫 setState 的當下 state 並不會馬上被改變。

所以，在下方的程式碼中，我們會發現在 handleClick 後的 console.log 印出的都是 state 修改前的值。(下方有 function component 版本)

```jsx
export default class Apple extends Component {
    constructor(props) {
        super(props);
        this.state = { price: 0 };
    }

    handleClick = e => {
        // "e.target.value" is "this.state.price"
        this.setState({ price: Number(e.target.value) + 10 });
        console.log(`price is ${e.target.value}`);
    };

    render() {
        return (
            <div>
                <p> Apple is ${this.state.price}</p>
                <button id="price-control" value={this.state.price} onClick={this.handleClick}>
                    Add Apple's price
                </button>
            </div>
        );
    }
}
```

![](https://i.imgur.com/L2z1sJr.gif)

**但是當我們不是使用 React 機制呼叫 setState 時，由於 batching 機制不存在，setState 就會是同步的**。例如: 原生 addEvent listener 的 callback function、setTimoout 的 callback function.....等。在下方的範例中，我們會發現 setState 後馬上印出的值會是新 state 值。

```jsx
export default class Apple extends Component {
    constructor(props) {
        super(props);
        this.state = { price: 0 };
    }

    handleClick = e => {
        // "e.target.value" is "this.state.price"
        this.setState({ price: Number(e.target.value) + 10 });
        console.log(`price is ${e.target.value}`);
    };

    componentDidMount() {
        document.getElementById('price-control').addEventListener('click', this.handleClick);
    }

    componentWillUnmount() {
        document.getElementById('price-control').removeEventListener('click', this.handleClick);
    }

    render() {
        return (
            <div>
                <p> Apple is ${this.state.price}</p>
                <button id="price-control" value={this.state.price}>
                    Add Apple's price
                </button>
            </div>
        );
    }
}
```

![](https://i.imgur.com/d7Tq3s4.gif)

### React 18 之後(2021/10/08 補充更新)

在 2021 年中公布的 React 18 alpha 版中，釋出了新的 ReactDOM api `ReactDOM.createRoot`。同時也公布了新的 auto batching 機制。在 auto batching 下，無論是透過 SyntheticEvent、原生 event 還是 setTimeout 等，任何呼叫 setState 的方式都會實作 batching 機制。

#### 「也就是說，React 18 後，所有的 setState 都會是非同步的。」

## 懶人包: 所以，setState 是同步還是非同步的?

-   **React 18(含)以後**: 所有的 setState 都會是非同步的
-   **React 17(含)以前**
    粗略來說，我們可以根據「是誰呼叫了 setState」分成這兩種狀況：

    -   **非同步(async)**: 在 React 機制中直接或間接呼叫。
        -   常見情境:
            -   生命週期函數
            -   useEffect, useLayoutEffect
            -   [SyntheticEvent](https://zh-hant.reactjs.org/docs/events.html)，如：以 React.createElement 或 JSX 呈現的 html element 上的 onClick、onChange handler。可參考在上篇中的介紹。
    -   **同步(sync)**: 不是在 React 機制中直接或間接呼叫。
        -   常見情境:
            -   原生 Event listener 的 callback function
            -   setTimoout 的 callback function

    > 註: setState 的非同步執行機制不同於 event loop，event loop 是透過 WEB API 執行 callback，而 React 是將更新 state 的行為在 React 更新流程中延遲執行，但依然是在主線程(Thread)內。

參考資料:
https://reactjs.org/docs/state-and-lifecycle.html#state-updates-may-be-asynchronous
https://zhuanlan.zhihu.com/p/54919571

## Part.4 - 如何正確的取得 setState 後的新 state 值?

既然大多數的時候，setState 都是非同步的，那麼該如何取得 state 被更新後的值呢? 以下我們會分別針對 function component 和 class component 討論。

### 在 function component 中 (React hook)

在 function component 中，如果我們想要拿到某個 state 被 setState 後的值，**應該要為這個 state 多建立一個 useEffect**，並把該 state 被改變後要做的事情(副作用)放在這個新 useEffect 內。

下方是在建立元件後初始化 state 值，再檢視新的 state 值的作法:

```jsx
import { useState, useEffect } from 'react';

export default function Apple() {
    const [price, setPrice] = useState(0);

    // ---正確的作法---
    useEffect(() => {
        setPrice(10);
    }, []);

    useEffect(() => {
        console.log(price);
    }, [price]);

    //----------------

    /* ---錯誤的方法一---
    useEffect(() => {
        setPrice(10);
        console.log(price);
    }, []);
    ----------------*/

    /* ---錯誤的方法二---
    useEffect(() => {
        setPrice(10);
        console.log(price);
    }, [price]);
    ----------------*/

    return (
        <div>
            <p> Apple is ${price}</p>
        </div>
    );
}
```

另外，**useState 給予的 setState function 接收的參數原本其實也是函式，有的時候我們會想在設定某個 state 後，馬上根據同個 state 更新後的值去做下一次同個 state 的更新，此時我們可以改用「函式回傳值」的方式傳入新的值**。React 會把更新後的 state 值傳入此 function 參數中，所以我們能在函式中用更新後的 state 值去做下一次同個 state 的更新。這樣的做法也能避免使用 useEffect 時需要思考是否會出現無限遞迴的情形。

在下方的範例中，即使都是在建立元件後連續加 10 加 3 次，以非函式參數作法，price 會變成 10，且為了只在建立元件後執行，沒有把 price 放在 useEffect 的 dependence 參數中，嚴格模式下 React 會報錯:

```jsx
import { useState } from 'react';

export default function Apple() {
    const [price, setPrice] = useState(0);

    useEffect(() => {
        setPrice(price + 10);
        setPrice(price + 10);
        setPrice(price + 10);
    }, []);

    return (
        <div>
            <p> Apple is ${price}</p>
        </div>
    );
}
```

而改傳入函式時，price 會在建立元件後變成 30。也因為運算的是 React 傳入函式的參數，而不是引入 state 本身，沒有違反嚴格模式的問題:

```jsx
import { useState } from 'react';

export default function Apple() {
    const [price, setPrice] = useState(0);

    useEffect(() => {
        setPrice(prePrice => prePrice + 10);
        setPrice(prePrice => prePrice + 10);
        setPrice(prePrice => prePrice + 10);
    }, []);

    return (
        <div>
            <p> Apple is ${price}</p>
        </div>
    );
}
```

同時，使用 useReducer，藉由 reducer function 封裝處理 state 的邏輯也是可行的方法，也沒有違反嚴格模式的問題：

```jsx
import { useReducer } from 'react';

function priceRedcuer(prevState, action) {
    switch (action.type) {
        case 'ADD':
            return prevState + 10;
        default:
            return prevState;
    }
}

export default function Apple() {
    const [price, priceDispatch] = useReducer(priceRedcuer, 0);

    useEffect(() => {
        priceDispatch({ type: 'ADD' });
        priceDispatch({ type: 'ADD' });
        priceDispatch({ type: 'ADD' });
    }, []);

    return (
        <div>
            <p> Apple is ${price}</p>
        </div>
    );
}
```

### 在 class component 中(setState)

在 class component 中取得修改 state 後的值有兩種作法。**第一種是利用 setState 函式本身提供的第二個參數**，這個參數接收一個 function，React 會在 state 被更新後呼叫這個 callback function。我們就能在這個 function 參數中定義獲得新 state 後要做的事情。

```jsx
export default class Apple extends Component {
    constructor(props) {
        super(props);
        this.state = { price: 0 };
    }

    componentDidMount() {
        this.setState({ price: 10 }, () => {
            console.log(this.state.price);
        });
    }

    render() {
        return (
            <div>
                <p> Apple is ${this.state.price}</p>
            </div>
        );
    }
}
```

**第二種方法則是利用生命週期函數中的 componentDidUpdate**。但需要特別注意的是，當該元件中任何 state 被 setState 設定時，componentDidUpdate 都會被重新呼叫。所以必須特別注意目前的邏輯是否有出現無限遞迴的可能。

```jsx
export default class Apple extends Component {
    constructor(props) {
        super(props);
        this.state = { price: 0 };
    }

    componentDidMount() {
        this.setState({ price: 10 });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // 這個if是為了避免之後新增其他邏輯時出現非預期錯誤
        if (prevState.price !== this.state.price) {
            console.log(this.state.price);
        }
    }

    render() {
        return (
            <div>
                <p> Apple is ${this.state.price}</p>
            </div>
        );
    }
}
```

另外，setState 接收的第一個參數原本其實也是函式。**如果想在某次設定 state 後，根據前次 state 更新後的值去做下一次的 state 更新，React 會把更新後的 state、props 值傳入此 function 參數中，所以我們能在此 function 用更新後的 state 值去做下一次的 state 更新。**

在下方的範例中，即使都是連續加 10 加 3 次，錯誤的作法下，price 會在建立元件後變成 10；正確的作法下，price 會在建立元件後變成 30。

```jsx
export default class Apple extends Component {
    constructor(props) {
        super(props);
        this.state = { price: 0 };
    }

    componentDidMount() {
        // 錯誤的作法
        /*  
        this.setState({ price: this.state.price + 10 });
        this.setState({ price: this.state.price + 10 });
        this.setState({ price: this.state.price + 10 });
        */

        // 正確的作法
        for (let i = 0; i < 3; ++i) {
            this.setState((state, props) => {
                return { price: state.price + 10 };
            });
        }
    }

    render() {
        return (
            <div>
                <p> Apple is ${this.state.price}</p>
            </div>
        );
    }
}
```

參考資料:　https://zh-hant.reactjs.org/docs/react-component.html#setstate

## 心得與總結

關於 React 中`setState`的同步/非同步一直以來都是一個很容易遇到、也很容易犯錯的問題。無論對剛入門或是對有一定的程度的開發者來說都是很值得研究。剛好趁自己有最近有時間去了解他的機制和原因，利用這兩篇紀錄一下，如果有想法或是有錯誤都歡迎留言與我討論:)

最後偷偷廣告一下，自己在 11 屆和 12 屆鐵人賽的 React.js 系列文修訂後和深智數位合作，最近在天瓏開始預購了，想學 React 的朋友可以參考看看:
https://www.tenlong.com.tw/products/9789860776188?list_name=srh
![](https://i.imgur.com/kq2dIga.png)
