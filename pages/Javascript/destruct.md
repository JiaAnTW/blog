---
path: '/javascript/'
date: 2017-07-12T17:12:33.962Z
title: '解構賦值'
category: 'javascript'
subCategory: 'ES6+'
---

## 解構賦值

簡單來說，本來當我們要把一個 array 的東西個別指定給其他變數時，必須要這樣:

```javascript
const arr = [1, 2];
const one = arr[0];
const two = arr[1];
```

而 Javascript 提供了這種寫法，讓我們可以一次做完「宣告變數」和「取得陣列中的值」。例如，以下的語法就是宣告`one`和`two`，並將其初始值分別指定給`arr[0]`和`arr[1]`。

```javascript
const arr = [1, 2];
const [one, two] = arr;

console.log(one); //印出 1
console.log(two); //印出 2
```

另外物件也支援這樣的語法:

```javascript
const obj = { one: 1, two: 2 };
const { one, two } = obj;

console.log(one); //印出 1
console.log(two); //印出 2
```
