---
path: '/react/styled-components/'
date: 1000-01-14T17:12:33.962Z
title: 'styled-components'
category: 'react'
subCategory: 'React基礎'
---

一般在做 SPA 的時候，通常是把所有 css 檔打包成一個或多個檔案，並在第一次載入網頁時就全部引入。**但這會讓開發者原本想要隸屬於個別元件的 css 程式碼同時生效，導致本來應該分開的 css 程式碼互相影響。** 如果想要最簡易的解決這個問題，除了把 style 寫在 JSX 的 props 上外，就要引用第三方套件。

> 除非你能保證，你自己、你的同事、你未來的接班人、你過去的古人(?) 都沒有使用同樣的 class、id 或是其他哩哩摳摳的選取器......

現在，我們就來介紹一款熱門的 React style 處理套件 - Styled-Components

## 安裝 Styled-Components

請打開 terminal，輸入:

```bash
npm install --save styled-components
```

## Styled-Component 基礎使用

Styled-Component 可以讓我們撰寫 css code 後，產生「專屬這組 css」的 React 元件。他的語法很特別:

```jsx
import styled from 'styled-components';

const 元件 = styled.你想使用的DOM元素`css程式碼`

//在JSX使用時
<元件></元件>
```

css 程式碼**要在.js 檔以字串的方式寫在最後面**。舉例來說，本來我們的 MenuItem 長這樣:

-   src/component/MenuItem.js

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

切換成 Styled-Components 後就會變這樣:

```jsx
import React, { memo } from 'react';
import styled from 'styled-components';

const MenuStyleItem = styled.li`
    margin-bottom: 7px;
    padding-left: 26px;
    list-style: none;
`;

function MenuItem(props) {
    return <MenuStyleItem>{props.text}</MenuStyleItem>;
}

export default memo(MenuItem);
```

實際觀看執行結果，你會發現顯示的雖然是一般的`<li>`，但它上面多了一組特別的 class，而且我們撰寫的 css 程式碼自動以這個 class 為選取器運作:

![](https://i.imgur.com/4U8K5SQ.png)

因為相同的 Styled-Components 元件會**產生同樣且不與其他元件重複的 class**，所以我們就能避免在不同地方使用到相同 css 選取器而互相影響。

另外，一般會習慣把定義 Styled-Components 的地方拉出來和本來的元件分開。就跟以前會把 css 跟 html 檔分開的感覺很像。只是現在你又能更方便的製造相同 style 的元素:

-   (新創建)src/component/MenuItemStyle.js

```javascript
import styled from 'styled-components';

const MenuStyleItem = styled.li`
    margin-bottom: 7px;
    padding-left: 26px;
    list-style: none;
`;

export { MenuStyleItem };
```

-   src/component/MenuItem.js

```jsx
import React, { memo } from 'react';
import { MenuStyleItem } from './MenuItemStyle';

function MenuItem(props) {
    return <MenuStyleItem>{props.text}</MenuStyleItem>;
}

export default memo(MenuItem);
```

## 傳遞參數給 Styled-Components

你可以在 Styled-Components 上直接綁定本來原生 DOM 元素就會運作的 props，例如`onClick`，該 props 會自動被給予 DOM 元素，不需要做任何而外的事情。

另外，**我們也能透過 ES6 的字串模板，讓 css 根據 props 的值而變動**。像是下面我們給了 MenuStyleItem 一個`color={"blue"}`:

-   src/component/MenuItem.js

```jsx
import React, { memo } from 'react';
import { MenuStyleItem } from './MenuItemStyle';

function MenuItem(props) {
    return <MenuStyleItem color={'blue'}>{props.text}</MenuStyleItem>;
}

export default memo(MenuItem);
```

我們就能把`props.color`設為`color`的值(如果沒有給`props.color`則把 color 設定為`"black"`)。

-   src/component/MenuItemStyle.js

```javascript
import styled from 'styled-components';

const MenuStyleItem = styled.li`
    margin-bottom: 7px;
    padding-left: 26px;
    list-style: none;
    color: ${props => (props.color ? props.color : 'black')};
`;

export { MenuStyleItem };
```

![](https://i.imgur.com/hiXpzWy.png)

## 以預設 props 設定 style 主題

你可以透過`Styled元件.defaultProps`來設定給參數預設值。藉此達到製作「主題」的效果。當使用元件的人沒有給對應的 style 的 props 時，Styled 元件就會以預設的參數造型顯示:

-   src/component/MenuItemStyle.js

```javascript
import styled from 'styled-components';

const MenuStyleItem = styled.li`
    margin-bottom: 7px;
    padding-left: 26px;
    list-style: none;
    color: ${props => props.theme.color};
`;

MenuStyleItem.defaultProps = {
    theme: {
        color: 'mediumseagreen',
    },
};

export { MenuStyleItem };
```

-   src/component/MenuItem.js

```jsx
import React, { memo } from 'react';
import { MenuStyleItem } from './MenuItemStyle';

function MenuItem(props) {
    return <MenuStyleItem>{props.text}</MenuStyleItem>;
}

export default memo(MenuItem);
```

![](https://i.imgur.com/Mogpg2K.png)

另外你也可以透過搭配 useContext 或是 Redux 達到製造相同主題的效果，這裡就不示範了。

## 比較好的分檔方式

最後，比較乾淨的分檔方式應該是為單一元件創立一個資料夾，在裡面放置專屬於它的元件程式和 style 程式。但這個就是不同人/團隊的習慣問題了。

![](https://i.imgur.com/Xh3PXTn.png)

-   src/component/MenuItem/index.js

```jsx
import React, { memo } from 'react';
import { MenuStyleItem } from './style';

function MenuItem(props) {
    return (
        <MenuStyleItem
            onClick={() => {
                console.log(props.handleClick);
            }}
        >
            {props.text}
        </MenuStyleItem>
    );
}

export default memo(MenuItem);
```

-   src/component/MenuItem/style.js

```jsx
import styled from 'styled-components';

const MenuStyleItem = styled.li`
    margin-bottom: 7px;
    padding-left: 26px;
    list-style: none;
    color: ${props => props.theme.color};
`;

MenuStyleItem.defaultProps = {
    theme: {
        color: 'mediumseagreen',
    },
};

export { MenuStyleIStyleItem };
```

另外，StyleComponent 中也能撰寫像是偽元素的語法，更多進階使用可以參考[官方文件](https://styled-components.com/docs/advanced#referring-to-other-components)
