---
path: '/react/'
date: 1000-01-01T17:12:33.962Z
title: 'React簡介'
category: 'react'
subCategory: 'React基礎'
---

## 認識 React

React 是由 Facebook 推出的前端框架。由於使用了特殊的「JSX 語法」，React 最被人推崇的就是可以對元素進行 Javascript 的邏輯運算。我們會在後面的教學中深入理解這個部份。
![](https://i.imgur.com/aTQvF0s.png)

## 自製元件

在 React 中，我們可以讓自己製作的元件模組化，並以和過去使用網頁基礎元素一樣的方式使用。後來這項特性也被另外兩大框架 Vue、Angular 導入。

## 2019 年以前的 React - Class Component

在 2019 年以前，React 極度仰賴 ES6 的 class 語法。雖然 class 繼承的特性讓 React 擁有強大的各項功能，但也產生了以下兩個重要的問題:

### 1. 學習成本高，對新手不友善。

要會 React，你除了 JSX 要學、還要會 ES6 的 class、還要懂繼承、還要知道 class 當中的各個 scope 和作用域的關係......

如果你沒學過 ES6 的 class，看到下面這段程式碼一定很崩潰:

```jsx
import React, { Component } from 'react';
import './css/icon.css';

class Icon extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const outsideColor = this.props.isWhite ? 'white' : '#cc3d61';
        const insideColor = this.props.isWhite ? 'rgba(255,255,255,0.6)' : '#cc3d61';
        return (
            <div className="lds-css-ng-scope" style={this.props.style}>
                <div style={{ width: '100%', height: '100%' }} className="lds-ripple">
                    <div style={{ borderColor: outsideColor }}></div>
                    <div style={{ borderColor: insideColor }}></div>
                </div>
            </div>
        );
    }
}

export default Icon;
```

### 2. class component 很笨重

由於要用 class 的繼承特性去承接 React 寫好的功能，當要使用 React 的特有功能時，大部份的時候都要做一個元件出來。但有的時候我們並不是要創造元件，而只是要使用 React 的一兩個特性，卻沒辦法用更直覺、簡單的模組化方式。 又或著只是一個很簡單的元件，卻因為要 Follow ES6 class 的語法而讓架構看起來很複雜。

## 2019 年以後的 React 與 Hook - Function Component

為了解決這個問題，在 2019 年，React 推出了 React hook。其原理可以想像成是生出一個外部的邏輯處理中心，是把 React 的功能拉到裡面處理。當我們要在**函式產生的元件**使用 React component API 時，會在**創造元件的那一瞬間，依照順序給每一個使用的 React component API 一個編號，之後只要去比對在邏輯處理中心的編號，就知道現在要用的 component API 邏輯是屬於誰的了**。

這樣的概念就像是「元件用鉤子勾在邏輯中心的固定位置」，所以稱為 Hook。

React hook 推出後風靡了整個社群，它讓元件不再笨重，可以用簡易的函式來創造元件、更直覺的模組化 React 特性。 這樣的狀況甚至影響了 Vue。 2020 年 9 月 Vue 3.0 Release 正式推出，如果你在學習完本系列後跑去看 Vue 3.0，你會發現他看起來超像是「沒有 JSX 的 React」。

## 這個系列要教你什麼 ?

我們會講解在目前在業界工作一定會用到的 React hook 語法，以及為什麼會需要用這些 hook。class component 目前正在被社群慢慢拋棄中，有需求的朋友可以參考我去年的鐵人賽文章。
