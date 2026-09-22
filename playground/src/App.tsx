import { signal, effect, For } from "@fluxonjs/core";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function App() {
  // State danh sách Todo
  const [todos, setTodos] = signal<Todo[]>([]);

  // State ô nhập Todo
  const [input, setInput] = signal("");

  // State bộ lọc ('all' | 'active' | 'completed')
  const [filter, setFilter] = signal<"all" | "active" | "completed">("all");

  // State danh sách đã qua lọc
  const [filteredTodos, setFilteredTodos] = signal<Todo[]>([]);

  // Tự động cập nhật filteredTodos mỗi khi todos hoặc filter thay đổi
  effect(() => {
    const list = todos();
    const currentFilter = filter();

    if (currentFilter === "active") {
      setFilteredTodos(list.filter((t) => !t.completed));
    } else if (currentFilter === "completed") {
      setFilteredTodos(list.filter((t) => t.completed));
    } else {
      setFilteredTodos(list);
    }
  });

  // Action: Thêm mới
  const addTodo = (e: Event) => {
    e.preventDefault();
    const text = input().trim();
    if (!text) return;

    setTodos((prev) => [...prev, { id: Date.now(), text, completed: false }]);
    setInput("");
  };

  // Action: Đổi trạng thái Completed
  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Action: Xóa Todo
  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div style={{ maxWidth: "450px", margin: "50px auto", fontFamily: "system-ui, sans-serif" }}>
      <h2>⚡ fluxonjsJS TodoApp</h2>

      {/* Form nhập liệu */}
      <form onSubmit={addTodo} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Nhập việc cần làm..."
          value={input()}
          onInput={(e: Event) => setInput((e.target as HTMLInputElement).value)}
          style={{ flex: 1, padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "8px 16px", background: "#0066cc", color: "#fff", border: "none", borderRadius: "4px" }}>
          Thêm
        </button>
      </form>

      {/* Các nút Lọc */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button onClick={() => setFilter("all")} style={{ fontWeight: filter() === "all" ? "bold" : "normal" }}>Tất cả</button>
        <button onClick={() => setFilter("active")} style={{ fontWeight: filter() === "active" ? "bold" : "normal" }}>Chưa xong</button>
        <button onClick={() => setFilter("completed")} style={{ fontWeight: filter() === "completed" ? "bold" : "normal" }}>Đã xong</button>
      </div>

      {/* Danh sách Todos */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        <For each={filteredTodos}>
          {(todo: any) => (
            <li style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span style={{ textDecoration: todo.completed ? "line-through" : "none", color: todo.completed ? "#888" : "#000" }}>
                  {todo.text}
                </span>
              </label>
              <button onClick={() => deleteTodo(todo.id)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>
                Xóa
              </button>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}