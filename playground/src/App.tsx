import { effect, signal, For } from "@zephyr/core";

interface User {
  id: number;
  email: string;
  first_name: string;
  avatar: string;
}

export default function App() {
  const [count, setCount] = signal(0);
  const [users, setUsers] = signal<User[]>([]);
  const [loading, setLoading] = signal(true);

  effect(() => {
    fetch("https://reqres.in/api/users?page=2")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.data);
        setLoading(false);
      })
      .catch((err) => console.error("Lỗi fetch API:", err));
  });

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>Increase</button>

      <hr />

      <h2>Danh sách người dùng (API):</h2>
      
      {() => (loading() ? <p>Đang tải dữ liệu...</p> : null)}

      <ul>
        <For each={users}>
          {(user: any) => (
            <li>
              <img src={user.avatar} width="30" style={{ borderRadius: "50%", marginRight: "8px" }} />
              <strong>{user.first_name}</strong> - {user.email}
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}