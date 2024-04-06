---
path: '/react/devTool/'
date: 1000-01-15T17:12:33.962Z
title: 'React Dev tool'
category: 'react'
subCategory: 'React基礎'
---

由於我們在執行 React 程式前，都要透過 webpack 和 Babel 打包編譯成瀏覽器看的懂的 ES5，實際跑在瀏覽器的程式碼就會和本來 React 裡面長的樣子差很多，Debug 時就要直接去改原始 code 才會比較方便，很麻煩。

這個時候，我們就會需要 React Dev tool 的協助。

## 安裝

請在 Chrome/Firefox 插件商店搜尋 React 並安裝 React Dev tool
![](https://i.imgur.com/EydNABy.png)
重新開啟瀏覽器後，打開我們的程式，如果有看到右上方有 React Icon 就代表安裝成功了
![](https://i.imgur.com/xadIfzk.png)

## 監控/修改 Component

點擊 F12 後，點選右邊選單中的 Component
![](https://i.imgur.com/Od64Ko3.png)

你就會看到剛剛我們寫的程式的架構
![](https://i.imgur.com/jZYvAxl.png)

點擊其中一個元件，你就能從右邊的面板看到這個元件的 state、props、hook、context 的現在的值
![](https://i.imgur.com/zaloplx.png)

你也可以在這裡直接修改 props 或 state，修改後的結果會直接顯示在畫面上:
![](https://i.imgur.com/o50cx1w.gif)

## 尋找 Component 對應在 DOM 的元素

點選元件後點右上方的眼睛，React-dev-tool 就會在 Element 頁籤上顯示元件對應在 DOM 的原始元素。
![](https://i.imgur.com/o8CQWoS.png)

## 印出元件相關資訊

點選旁邊的蟲，元件的相關資訊就會印在 console
![](https://i.imgur.com/qClNt2h.png)
![](https://i.imgur.com/7FKa5X3.png)

## 尋找元件打包後的程式碼

在旁邊的按鈕可以幫我們找到 React 元件對應到打包後 JS 檔的位置
![](https://i.imgur.com/7spQzjO.png)
![](https://i.imgur.com/XgZLpxV.png)

## 效能監控

點擊 F12 後，點選右邊選單中的 Profiler
![](https://i.imgur.com/Od64Ko3.png)

Profiler 可以幫我們監控每一次的操作中，哪些元件被重新 render、render 花了多久，操作方法如下:
![](https://i.imgur.com/IFOeLsP.gifhttps://i.imgur.com/IFOeLsP.gif)

然而如果每次都要按錄製再去看到底誰被 re-render 是一件很麻煩的事情。所以你也可以點開右邊的齒輪，設定讓 React-dev-tool 用顏色標記重新被渲染的元素。設定方法如下:
![](https://i.imgur.com/HD2F8qn.gif)

另外，在齒輪中，你也能夠設定讓它記憶每個 component 被 re-render 的原因，方便你 Debug。
![](https://i.imgur.com/fSkvb5R.png)

## 奇怪的事情發生了 - useContext 的問題

如果你有注意到的話，會發現我們點擊剛剛製作的元件時，明明在上一篇中我們把` isOpen`從控制 MenuItem 的開關拔掉了，但是當`isOpen`被改變時，MenuItem 還是被重新渲染了。而當你去看 Profiler 記憶的過程，會發現上面寫著「父元件被重新渲染」。

> 所以只要父元件被重新渲染，即使只是一小部份，所有子元件都會被重新渲染嗎?

不，並不是，React 沒有這麼爛。理論上的確是只應該渲染「跟那一小部份有關的地方」，以上面的例子而言是 button。

會造成這個問題是**因為`useContext`原始的實作方法，不是去檢查該 context 更動會不會改變子元件。而是當 context 被更新時，直接讓所有在`<Context.Provider>`中的子元件都被重新渲染**。

這個問題在專案小的時候還能夠忽視，但當專案大起來，這件事就很讓人頭痛了。

當然，因應這個問題，有非常多開發者提供了第三方函式庫來加入一個檢查是否真的要渲染的篩選器。但是有沒有用原生 React API 就能解決的方法呢? 難道官方沒有提出任何解決方法~~放它爛~~嗎?

接下來的這幾篇，我們會來討論如何用原生 React API 處理的各種效能問題(包含這件事)。
