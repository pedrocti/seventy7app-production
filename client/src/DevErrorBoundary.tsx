import { Component, ReactNode } from "react";

export default class DevErrorBoundary extends Component<
  { children: ReactNode },
  { error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(err: any, info: any) {
    console.error("🔥 RENDER ERROR:", err, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: "red" }}>
          <h1>🔥 A component crashed</h1>
          <pre>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
