import React, { useState, useEffect } from "react";

export default function App() {
    const [count, setCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

  return (
    <div>
      <div>count {count}</div>
      <button onClick={() => setCount((preCount)=> preCount +1)}>add</button>
      { mounted && <span>I will only be rendered in client side</span> }
    </div>
  );
}