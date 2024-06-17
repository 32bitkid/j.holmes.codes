export interface ExampleRenderer {
  render(): void;
  teardown?: () => void;
}
