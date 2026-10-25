# Styling

<sub><a href="./README.md">← Docs</a></sub>

---

Use `fill`, `stroke`, `strokeWidth`, and `styles` globally on `ToastivaProvider`, or per toast on any `toastiva.*` call.

## Global theme

```tsx
<ToastivaProvider
  fill="#171717"
  stroke="rgba(255,255,255,0.12)"
  strokeWidth={1}
  iosBlurTint="dark"
  styles={{
    title: { color: "#fff" },
    description: { color: "rgba(255,255,255,0.72)" },
    badge: { backgroundColor: "rgba(255,255,255,0.10)" },
    action: { backgroundColor: "rgba(255,255,255,0.10)" },
    actionText: { color: "#fff" },
  }}
>
  <RootNavigator />
</ToastivaProvider>
```

## Per toast

```tsx
toastiva.success("Saved", {
  fill: "#0f172a",
  bodyRadius: 24,
  expandedHeight: 128,
  disableIOSBlur: true,
  styles: {
    title: { color: "#f8fafc", fontWeight: "800" },
    description: { color: "rgba(248,250,252,0.72)" },
  },
});
```

## Blur on iOS

<table>
  <tr>
    <td><code>iosBlurTint</code></td>
    <td>Tint the header morph blur &mdash; <code>"light"</code>, <code>"dark"</code>, <code>"default"</code>, etc.</td>
  </tr>
  <tr>
    <td><code>disableIOSBlur</code></td>
    <td>Render a solid surface instead of the blurred header.</td>
  </tr>
</table>

Both options work globally on `ToastivaProvider` or per toast. iOS uses `expo-blur` under the hood.

## Blur on Android

Android uses the React Native `filter: [{ blur }]` style prop for the morph header.

> [!WARNING]
> `filter: [{ blur }]` only renders on **React Native 0.76+** with the **New Architecture (Fabric)** enabled. On RN &lt; 0.76 (or legacy Paper renderer), the prop is a no-op on Android &mdash; the toast renders correctly, but the blurred header layer will be flat. There is no JS-side fallback for older versions; upgrade RN if the blur is required on Android.

## Shadow on Android

Android draws the toast shadow as soft rings along the surface outline, so it follows the morph and the header tab. It is on by default and looks like `drop-shadow(0px 12px 28px rgba(21,43,59,0.45))`. iOS and web keep their native shadows.

```tsx
<ToastivaProvider androidShadow={{ color: "#000", opacity: 0.3 }}>
```

<table>
  <tr><td><code>color</code></td><td>Shadow color. Defaults to <code>"#152b3b"</code>.</td></tr>
  <tr><td><code>opacity</code></td><td>Opacity at the surface edge the shadow falls towards. Defaults to <code>0.36</code>.</td></tr>
  <tr><td><code>offsetX</code>, <code>offsetY</code></td><td>Offset in dp. Default to <code>0</code> and <code>12</code>. A downward offset also lightens the shadow above the surface.</td></tr>
  <tr><td><code>radius</code></td><td>Distance in dp over which the shadow fades out. Defaults to <code>28</code>.</td></tr>
  <tr><td><code>layers</code></td><td>Number of rings. More rings fade more smoothly but cost more per animation frame. Defaults to <code>20</code>.</td></tr>
  <tr><td><code>whileAnimating</code></td><td>Keep the shadow on while the shape morphs. By default the shadow hides as soon as a morph starts and fades back in once the shape is at rest, because redrawing the rings on every frame is slow on Android. Defaults to <code>false</code>.</td></tr>
</table>

Pass `androidShadow={false}` to turn it off. Works globally on `ToastivaProvider` or per toast. The shadow assumes an opaque `fill`: a translucent surface shows the inner half of the rings.

## Style slots

<table>
  <tr><td><code>title</code></td><td>Toast title text.</td></tr>
  <tr><td><code>description</code></td><td>Secondary line beneath the title.</td></tr>
  <tr><td><code>badge</code></td><td>Leading icon badge.</td></tr>
  <tr><td><code>action</code></td><td>Action button container.</td></tr>
  <tr><td><code>actionText</code></td><td>Action button label.</td></tr>
</table>

---

<sub>Next: <a href="./animations.md">Animations →</a></sub>
