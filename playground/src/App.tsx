// playground/src/App.tsx
import { effect, signal } from "@fluxonjs/core";

export default function App() {
  const [count, setCount] = signal(0);
  const [list, setList] = signal([]);

  effect(() => {
    fetch("https://reqres.in/api/users/")
    .then(res => res.json())
    .then(data => console.log(data.data))
  })

  const handleClick = () => {
    setCount(prev => prev + 1);
  };
  return (
    <div>
      <p>Số lần click {() => count()}</p>

      <button onClick={() => setCount(prev => prev + 1)}>
        Tăng số
      </button>
    </div>
  );
}