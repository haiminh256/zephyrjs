import { signal } from "@fluxonjs/core"

export default function App() {
  const [count, setCount] = signal(0)

  return (
    <div>
      <p>
        {count()}
      </p>

      <button onClick={() => {
        setCount(count() + 1)
      }}>
        increase
      </button>
    </div>
  )
}