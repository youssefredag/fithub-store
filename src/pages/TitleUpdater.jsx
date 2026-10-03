import { useEffect, useState } from "react"

export default function TitleUpdater() {
  const [count , setCount] = useState(0)
  
  function incr(e) {
    setCount(count + 1)
  }

  function decr(e) {
    setCount(count - 1)
  }

  useEffect(()=> {
    document.title = `Count: ${count}`

  })

  return (
    <div>
      <h2 className="center-title" >Title Updater</h2>
      <div className="flex-center" >
        <button onClick={incr} > +1</button>
        <p>{count}</p>
        <button  onClick={decr} >-1</button>
      </div>
    </div>
  )
}
