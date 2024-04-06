---
path: '/react/setState/'
date: 1000-03-05T17:12:33.962Z
title: 'setState 的非同步原因'
category: 'react'
subCategory: 'React進階'
---

> 請注意，在 React 18 以後，所有的 setState 都會是非同步的。

## Part.1 - 認識 React batching

**首先，我們先假設 setState 絕對會是同步的(呼叫 setState 後 state 會馬上被改變)。**

在 React 中，我們很常都會透過 setState 去更新 state 和 props，藉此觸發 React 的更新機制(reconciliation)，比較 Virtual DOM 後，再去渲染畫面。然而 React 開發者在處理 setState 和判斷元件更新的關係時，一些效能問題出現了。我們來看看這個例子:

下方程式碼中，Parent 引入了 Child。當 Child 被點擊時，由於[event bubbling](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture)，其父層 Parent 中的 div 也會觸發`onClick`事件。

```jsx
import { Component } from 'react';

class Child extends Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
    }
    render() {
        return (
            <button onClick={() => this.setState({ count: this.state.count + 1 })}>
                Child clicked {this.state.count} times
            </button>
        );
    }
}

export default class Parent extends Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
    }
    render() {
        return (
            <div onClick={() => this.setState({ count: this.state.count + 1 })}>
                Parent clicked {this.state.count} times
                <Child />
            </div>
        );
    }
}
```

直覺上來說，假設 setState 當下 state 就會被改變，我們預期的更新流程應該如下:

1. 點擊行為一路向下補獲至 target(Child 的 button)
2. 呼叫綁定在 Child 的 button 的 onClick function，觸發 setState
3. setState 導致 Child 的 state 被改變
4. **Child 元件 re-render**
5. onClick 事件透過 event bubble 冒泡回 Parent 的 div
6. 呼叫綁定在 Parent 的 div 的 onClick function，觸發 setState
7. setState 導致 Parent 的 state 被改變
8. **Parent 元件 re-render**
9. **由於 Child 是 Parent 的子元素，當 Parent 元件 re-render 時，Child 元件也要 re-render**

觀察上述流程，我們會發現**階段 4 產生的 re-render 是不必要的**，因為在最後階段時 Child 又再 re-render 了一次。

#### 由於這樣的狀況會導致資源浪費，所以在 React 15(含)以前，React 團隊決定，當 setState 在 React 機制中被呼叫(例如: 生命週期、合成事件)，開始進行 reconciliation 時，實際上 React 會先等「該次 event 會觸發的所有 event handler」都執行完後，再去更新 state，並一次判斷哪些元件要被重新渲染。這個機制稱為「batching」。

也就是上述範例在 React 中實際的更新流程如下

1. 點擊行為一路向下補獲至 target(Child 的 button)
2. 呼叫綁定在 Child 的 button 的 onClick function，觸發 setState。(state 未被改變，而是將要執行的改變 push 進一 queue 裡)
3. onClick 事件透過 event bubble 冒泡回 Parent 的 div
4. 呼叫綁定在 Parent 的 div 的 onClick function，觸發 setState。(state 未被改變，而是將要執行的改變 push 進一 queue 裡)
5. React 從 setState queue 裡統一處理 state 的更新，判斷那些元件要 re-render
6. **Parent 元件 re-render**
7. **Child 元件 re-render**

> ### 註: 什麼是 SyntheticEvent(合成事件)?
>
> 在 React 中，我們幾乎都會透過以 JSX 或是 React.createElement 呈現的 html element 上的 onClick、onChange 這些屬性進行事件處理、讓使用者的行為觸發呼叫 setState 函式、更新元件。**而這些屬性和原生利用`addEventListener`、`onclick`做事件處理不同的地方在，React 針對自己的需求，在事件發生、呼叫 handler 到更新元件的過程中，多進行了某些加工**。一個很明顯的例子是在使用[ReactDOM.createPortal](https://zh-hant.reactjs.org/docs/portals.html)時，雖然實際渲染在 DOM 上的元素和原本 JSX 中的巢狀結構不再有父子關係，但 React 仍然會將[event bubbling](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture)實作回 JSX 中引入其引入的父層元素中。
>
> **這種在 React 中的事件處理稱為 SyntheticEvent(合成事件)。**
>
> ```jsx
> import { createPortal } from 'react-dom';
>
> function Child() {
>     return createPortal(<button>ChildReact</button>, document.getElementById('portal-react'));
> }
>
> export default function Parent() {
>     return (
>         <div onClick={() => console.log('Parent被點擊了')}>
>             <Child />
>         </div>
>     );
> }
> ```
>
> 參考資料: https://zh-hant.reactjs.org/docs/events.html

batching 機制也**同時避免了在同一次事件中大量呼叫 setState 所造成的資源浪費**。例如，在下方的程式碼中，我們定義當 Child 中 button 被點擊時，在 Parent 中觸發三次 setState。觀察實際執行結果，會發現 React 並不會在呼叫一次 setState 後就馬上去根據 state 新的值去更新 DOM，而是根據所有 setState 依序執行後的 state 值去更新一次元件，所以「我被更新了」只會印出一次。

```jsx
import { Component } from 'react';

class Child extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <p>parent count is {this.props.count}</p>
                <button onClick={this.props.handleClick}>add Count</button>
            </div>
        );
    }
}

export default class Parent extends Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
    }

    addCount = () => {
        let currentCount = this.state.count;
        for (let i = 0; i < 3; ++i) {
            currentCount++;
            this.setState({ count: currentCount });
        }
    };

    render() {
        console.log('我被更新了');
        return (
            <div>
                <Child handleClick={this.addCount} />
            </div>
        );
    }
}
```

參考資料: https://overreacted.io/react-as-a-ui-runtime/#batching

## Part.2 - 確保 Internal Consistency

雖然 batching 可能是個讓 setState 需要具有非同步特性的原因，然而其實只要不讓元件 re-render，立即更新 state 也可以做到 batching。我們試著來把剛剛的流程改這樣:

1. 點擊行為一路向下補獲至 target(Child 的 button)
2. 呼叫綁定在 Child 的 button 的 onClick function，觸發 setState
3. setState 導致 Child 的 state 被改變，**並在某個地方記住此元件要更新**。
4. onClick 事件透過 event bubble 冒泡回 Parent 的 div
5. 呼叫綁定在 Parent 的 div 的 onClick function，觸發 setState
6. setState 導致 Parent 的 state 被改變，**並在某個地方記住此元件要更新**。
7. React 統一處理元件的更新
8. **Parent 元件 re-render**
9. **Child 元件 re-render**

> 看起來很完美，對吧?

然而這個時候，另一個問題又出現了: **props**。

由於**React 只有在父元件被 re-render 後，子元件才能知道其父元件賦予自己的 props 值**，所以如果 props 也要隨著 state 的改變而同時被改變，那 state 改變後該元件就應該要馬上被 re-render，卻也導致沒辦法進行 batching 了。這會帶來相當大的資源浪費，所以，**無論如何，props 的改變仍然是非同步的。**

那麼這會帶來什麼問題呢? 來看看以下這個範例，Child 負責顯示 Parent 的 count 數量，也能在 Child 連續兩次增加 Parent 中的 count 值:

```jsx
import { Component } from 'react';

class Child extends Component {
    constructor(props) {
        super(props);
    }

    handleClick = () => {
        this.props.handleClick();
        console.log(this.props.count);
        this.props.handleClick();
        console.log(this.props.count);
    };

    render() {
        return (
            <div>
                <p>parent count is {this.props.count}</p>
                <button onClick={this.handleClick}>add Count 2 times</button>
            </div>
        );
    }
}

export default class Parent extends Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
    }

    addCount = () => {
        this.setState({ count: count + 1 });
        console.log(this.state.count);
    };

    render() {
        console.log('更新了');
        return (
            <div>
                <Child props={this.count} handleClick={this.addCount} />
            </div>
        );
    }
}
```

依照我們剛剛制定**state 更新是同步、props 更新是非同步**的規則，當點擊 Child 中的 button 時，會產生的流程如下:

1. child 呼叫 this.handleClick
2. child 的 this.handleClick 第一次呼叫 Parent 綁定在 this.props.handleClick 上的 addCount
3. Parent 中的 addCount 呼叫 setState
4. **Parent 印出 1(state.count 的值)**
5. **Child 印出 0(props.count 的值)**
6. child 的 this.handleClick 第二次呼叫 Parent 綁定在 this.props.handleClick 上的 addCount
7. Parent 中的 addCount 呼叫 setState
8. **Parent 印出 2(state.count 的值)**
9. **Child 印出 0(props.count 的值)**
10. React 統一處理元件的更新
11. 渲染 Parent
12. 渲染 Child

**注意到了嗎? 明明 Child 的 props.count 綁定了 Parent 的 state.count，但是在這個範例中，同一時間點得到的值會是不同的。由於這樣的不一致性容易造成開發者的困擾，所以，React 團隊決定 batching 機制下，藉由讓 setState 具有非同步特性，得以使被綁定的 state 和 props 之間能保持一致。**

到這邊，我們可以知道 React setState 之所以要是非同步的原因之一是 batching 和其延伸問題。**另外還有一個原因是如果 setState 是非同步，React 團隊會更方便實現在 React 16 後推出的 React Fiber(非同步渲染機制)**。和本文中提及一次處理所有元件的更新不同，雖然 batching 機制依然存在，但 React Fiber 將更新流程拆個多個片段，這樣「將原本一大包的更新拆成片段」的做法能夠讓瀏覽器在片段之間處理其他工作，解決了過去 React 在更新時偶而會發生的掉偵、卡頓問題。

而**如果 setState 是非同步的，在呼叫 setState 後，React 就能先透過[一套演算法](https://github.com/facebook/react/blob/16.8.4/packages/react-reconciler/src/ReactFiberScheduler.js#L1595)重新算出該更新任務的優先權，根據優先權再去決定該更新任務適合在哪個片段中執行**。這部份細節自己暫時沒時間研究，就不多做介紹了。

## Part.3 - setState 是同步還是非同步的?

### 在 React 17 以前的 class component 中（setState）

藉由上一篇，我們可以知道為了透過實作 batching 進行效能優化，**透過 React 機制所呼叫的 setState 都是非同步的**，也就是當呼叫 setState 的當下 state 並不會馬上被改變。

> 這裡的 React 機制指的是包含生命週期函數、SyntheticEvent handler 等 (如: 以 React.createElement 或 JSX 呈現的 html element 上的 onClick、onChange)，[詳細 SyntheticEvent 列表請參考官方文件](https://zh-hant.reactjs.org/docs/events.html)。

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

### 在在 React 17 以前的 function component 中(useState, useReducer)

**在 function component 中的 React hook 也是一樣的，透過 React 機制所呼叫的 setState 都是非同步**，也就是當呼叫 setState 的當下 state 並不會馬上被改變。可以試著執行、比較下列程式碼的執行結果

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
