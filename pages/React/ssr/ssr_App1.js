import React, { useState, useEffect } from "react";

export default function App() {
    const [count, setCount] = useState(0);
    return (
        <div>
        <div>count {count}</div>
        <button >add</button>
        </div>
    );
}