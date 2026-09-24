# Bklit UI linear gauge adaptation

`LinearGauge.jsx` vendors the linear uniform-notch geometry and Motion path
rendering from [Bklit UI Gauge](https://github.com/bklit/bklit-ui/blob/main/packages/ui/src/charts/gauge.tsx),
retrieved September 24, 2026. Copyright uixmat; MIT license retained alongside.

Local changes: JavaScript instead of TypeScript; responsive SVG viewBox instead
of ParentSize; scoped CSS instead of Tailwind utility classes; only the linear
uniform variant; external labels; value clamping; no delayed animation under
reduced motion. Arc/gradient/studio/number-flow features are not included.

This is a source adaptation of the actual component, not an installed registry
package or a claim that the entire Bklit design system is installed.
