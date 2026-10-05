import { useEffect, useState } from 'react';

export default function TitleUpdater() {
  const [count, setCount] = useState(0);

  function incr() {
    setCount((currentCount) => currentCount + 1);
  }

  function decr() {
    setCount((currentCount) => currentCount - 1);
  }

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <div>
      <h2 className="center-title">Title Updater</h2>
      <div className="flex-center">
        <button type="button" onClick={incr}> +1</button>
        <p>{count}</p>
        <button type="button" onClick={decr}>-1</button>
      </div>
    </div>
  );
}
